// ============================================================
// RISK SCORE ENGINE
// Computes conveyor health score (0-100) based on sensor readings.
// All thresholds are configurable prototype parameters.
// ============================================================

import type { TelemetrySnapshot, RiskLevel } from '../types/telemetry';
import type { SensorFusionWeight } from '../types/ai';
import { DEFAULT_BASELINE } from '../types/telemetry';

export interface RiskContributor {
  sensor: string;
  label:  string;
  contribution: number;  // 0–100 (percentage contribution to risk)
  deviation:    string;  // human-readable deviation description
  isAbnormal:   boolean;
}

export interface RiskAnalysis {
  score:            number;        // 0–100 (health score, 100 = fully healthy)
  level:            RiskLevel;
  label:            string;
  primaryFault:     string;
  contributors:     RiskContributor[];
  evidence:         string[];
  recommendation:   string;
  anomalyScore:     number;       // 0–1 Isolation Forest proxy
  fusionWeights:    SensorFusionWeight[];
}

// Sensor fusion weights (configurable demo parameters)
const FUSION_WEIGHTS = {
  beltOffset:  0.28,
  vibration:   0.22,
  current:     0.18,
  rpm:         0.14,
  load:        0.10,
  temperature: 0.08,
};

function deviationScore(value: number, min: number, max: number, weight: number): number {
  if (value < 0) return 0; // offline sensor — contributes 0 risk
  const range = max - min;
  const center = (min + max) / 2;
  const distance = Math.max(0, Math.abs(value - center) - range / 2);
  // Divide by range*0.25 (was range*0.5) — 2× more sensitive to out-of-range deviations
  const normalizedDev = distance / (range * 0.25);
  return clamp(normalizedDev * weight, 0, weight);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function computeRiskAnalysis(
  snapshot: TelemetrySnapshot,
  isCommsLost: boolean,
  isVibrationOffline: boolean,
): RiskAnalysis {
  const b = DEFAULT_BASELINE;

  if (isCommsLost) {
    return {
      score:          0,
      level:          'critical',
      label:          'CRITICAL',
      primaryFault:   'Communication Loss',
      contributors:   [],
      evidence:       ['ESP32 communication lost', 'MQTT disconnected', 'All sensor data stale'],
      recommendation: 'Check ESP32 power and Wi-Fi connection. Verify MQTT broker status.',
      anomalyScore:   1,
      fusionWeights:  [],
    };
  }

  // Compute individual deviation scores
  const rpmDev      = deviationScore(snapshot.rpm,         b.rpm.min,         b.rpm.max,         FUSION_WEIGHTS.rpm);
  const currentDev  = deviationScore(snapshot.current,     b.current.min,     b.current.max,     FUSION_WEIGHTS.current);
  const loadDev     = deviationScore(snapshot.load,        b.load.min,        b.load.max,        FUSION_WEIGHTS.load);
  const vibDev      = isVibrationOffline ? 0 : deviationScore(snapshot.vibration, b.vibration.min, b.vibration.max, FUSION_WEIGHTS.vibration);
  const tempDev     = deviationScore(snapshot.temperature, b.temperature.min, b.temperature.max, FUSION_WEIGHTS.temperature);
  const offsetDev   = deviationScore(Math.abs(snapshot.beltOffset), 0, b.beltOffset.max, FUSION_WEIGHTS.beltOffset);

  const totalRisk   = clamp(rpmDev + currentDev + loadDev + vibDev + tempDev + offsetDev, 0, 1);
  const healthScore = Math.round((1 - totalRisk) * 100);
  const anomalyScore = parseFloat(totalRisk.toFixed(3));

  let level: RiskLevel = 'normal';
  let label = 'NORMAL';
  // Thresholds: critical < 60, warning < 80 — covers realistic demo scenario ranges
  if (healthScore < 60) { level = 'critical'; label = 'CRITICAL'; }
  else if (healthScore < 80) { level = 'warning'; label = 'WARNING'; }

  // Rank contributors
  const rawContributors: { key: string; label: string; raw: number; weight: number; deviation: string; isAbnormal: boolean }[] = [
    {
      key: 'beltOffset',  label: 'Belt Offset',    raw: offsetDev,  weight: FUSION_WEIGHTS.beltOffset,
      deviation: snapshot.beltOffset !== -1 ? `${snapshot.beltOffset > 0 ? '+' : ''}${snapshot.beltOffset.toFixed(0)} px` : 'N/A',
      isAbnormal: Math.abs(snapshot.beltOffset) > b.beltOffset.max,
    },
    {
      key: 'vibration',   label: 'Vibration',      raw: vibDev,     weight: FUSION_WEIGHTS.vibration,
      deviation: isVibrationOffline ? 'Sensor offline' : `${snapshot.vibration.toFixed(3)} RMS`,
      isAbnormal: !isVibrationOffline && snapshot.vibration > b.vibration.max,
    },
    {
      key: 'current',     label: 'Motor Current',  raw: currentDev, weight: FUSION_WEIGHTS.current,
      deviation: `${snapshot.current.toFixed(2)} A`,
      isAbnormal: snapshot.current > b.current.max,
    },
    {
      key: 'rpm',         label: 'RPM',            raw: rpmDev,     weight: FUSION_WEIGHTS.rpm,
      deviation: `${snapshot.rpm.toFixed(0)} RPM`,
      isAbnormal: snapshot.rpm < b.rpm.min || snapshot.rpm > b.rpm.max,
    },
    {
      key: 'load',        label: 'Load',           raw: loadDev,    weight: FUSION_WEIGHTS.load,
      deviation: `${snapshot.load.toFixed(1)} kg`,
      isAbnormal: snapshot.load > b.load.max,
    },
    {
      key: 'temperature', label: 'Temperature',    raw: tempDev,    weight: FUSION_WEIGHTS.temperature,
      deviation: `${snapshot.temperature.toFixed(1)} °C`,
      isAbnormal: snapshot.temperature > b.temperature.max,
    },
  ];

  rawContributors.sort((a, b) => b.raw - a.raw);

  const contributors: RiskContributor[] = rawContributors.map(c => ({
    sensor:       c.key,
    label:        c.label,
    contribution: Math.round((c.raw / Math.max(totalRisk, 0.001)) * 100),
    deviation:    c.deviation,
    isAbnormal:   c.isAbnormal,
  }));

  // Determine primary fault
  const topContributor = rawContributors[0];
  let primaryFault = 'No fault detected';
  const evidence: string[] = [];

  if (level !== 'normal') {
    if (topContributor.key === 'beltOffset') {
      primaryFault = 'BELT MISALIGNMENT SUSPECTED';
      if (Math.abs(snapshot.beltOffset) > b.beltOffset.max) evidence.push(`Belt offset: ${snapshot.beltOffset > 0 ? '+' : ''}${snapshot.beltOffset.toFixed(0)} px (above ±${b.beltOffset.max} px threshold)`);
    } else if (topContributor.key === 'vibration') {
      primaryFault = 'MECHANICAL ANOMALY SUSPECTED';
      if (!isVibrationOffline && snapshot.vibration > b.vibration.max) evidence.push(`Vibration: ${snapshot.vibration.toFixed(3)} RMS (above ${b.vibration.max} baseline)`);
    } else if (topContributor.key === 'current') {
      primaryFault = 'MOTOR OVERLOAD SUSPECTED';
      if (snapshot.current > b.current.max) evidence.push(`Motor current: ${snapshot.current.toFixed(2)} A (above ${b.current.max} A threshold)`);
    } else if (topContributor.key === 'load') {
      primaryFault = 'OVERLOAD CONDITION';
      evidence.push(`Load: ${snapshot.load.toFixed(1)} kg (above ${b.load.max} kg limit)`);
    } else if (topContributor.key === 'rpm') {
      primaryFault = 'SPEED ANOMALY DETECTED';
      evidence.push(`RPM: ${snapshot.rpm.toFixed(0)} (outside ${b.rpm.min}–${b.rpm.max} RPM baseline)`);
    }
  }

  if (!isVibrationOffline && snapshot.vibration > b.vibration.max && topContributor.key !== 'vibration') {
    evidence.push(`Vibration above baseline: ${snapshot.vibration.toFixed(3)} RMS`);
  }
  if (snapshot.current > b.current.max && topContributor.key !== 'current') {
    evidence.push(`Motor current elevated: ${snapshot.current.toFixed(2)} A`);
  }
  if (isVibrationOffline) {
    evidence.push('MPU6050 offline — vibration fault confidence reduced');
  }

  let recommendation = 'Continue normal operation. Monitor sensor trends.';
  if (level === 'warning') {
    if (primaryFault.includes('MISALIGNMENT')) recommendation = 'Inspect belt alignment and roller positioning. Check belt tension.';
    else if (primaryFault.includes('MECHANICAL')) recommendation = 'Inspect rollers and bearings for wear. Check belt for damage.';
    else if (primaryFault.includes('MOTOR')) recommendation = 'Reduce conveyor load. Inspect motor and drive coupling.';
    else recommendation = 'Monitor closely. Schedule inspection within next maintenance window.';
  }
  if (level === 'critical') {
    recommendation = 'STOP conveyor and inspect system according to the safety procedure. Do not restart until fault is cleared.';
  }

  const fusionWeights: SensorFusionWeight[] = [
    { sensor: 'beltOffset',  label: 'Belt Offset',   weight: FUSION_WEIGHTS.beltOffset,  currentState: offsetDev > 0.15 ? 'high' : offsetDev > 0.05 ? 'elevated' : 'normal', currentValue: `${snapshot.beltOffset.toFixed(0)} px` },
    { sensor: 'vibration',   label: 'Vibration',     weight: FUSION_WEIGHTS.vibration,   currentState: isVibrationOffline ? 'normal' : vibDev > 0.12 ? 'high' : vibDev > 0.04 ? 'elevated' : 'normal', currentValue: isVibrationOffline ? 'Offline' : `${snapshot.vibration.toFixed(3)} RMS` },
    { sensor: 'current',     label: 'Motor Current', weight: FUSION_WEIGHTS.current,     currentState: currentDev > 0.1 ? 'high' : currentDev > 0.03 ? 'elevated' : 'normal', currentValue: `${snapshot.current.toFixed(2)} A` },
    { sensor: 'rpm',         label: 'RPM',           weight: FUSION_WEIGHTS.rpm,         currentState: rpmDev > 0.07 ? 'elevated' : 'normal', currentValue: `${snapshot.rpm.toFixed(0)} RPM` },
    { sensor: 'load',        label: 'Load',          weight: FUSION_WEIGHTS.load,        currentState: loadDev > 0.06 ? 'high' : 'normal', currentValue: `${snapshot.load.toFixed(1)} kg` },
    { sensor: 'temperature', label: 'Temperature',   weight: FUSION_WEIGHTS.temperature, currentState: tempDev > 0.05 ? 'elevated' : 'normal', currentValue: `${snapshot.temperature.toFixed(1)} °C` },
  ];

  return { score: healthScore, level, label, primaryFault, contributors, evidence, recommendation, anomalyScore, fusionWeights };
}
