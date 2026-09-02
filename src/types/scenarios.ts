// ============================================================
// SCENARIO TYPES
// Demo scenarios for the SIH judge demonstration.
// ============================================================

export type ScenarioId =
  | 'normal'
  | 'misalignment'
  | 'overload'
  | 'speed_variation'
  | 'high_vibration'
  | 'sensor_disconnect'
  | 'communication_loss';

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  icon: string;
  riskLevel: 'normal' | 'warning' | 'critical';
  effects: string[];
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'normal',
    label: 'Normal Operation',
    description: 'All sensors within baseline. Belt running smoothly.',
    icon: 'check-circle',
    riskLevel: 'normal',
    effects: ['RPM: 120', 'Current: 1.3A', 'Vibration: 0.14 RMS', 'Belt Offset: ±2px'],
  },
  {
    id: 'misalignment',
    label: 'Belt Misalignment',
    description: 'Belt drifting laterally. Vibration and current elevated.',
    icon: 'alert-triangle',
    riskLevel: 'warning',
    effects: ['Belt Offset: +13px', 'Vibration elevated', 'Current rises', 'RPM slightly drops'],
  },
  {
    id: 'overload',
    label: 'Overload Condition',
    description: 'Excessive load. Motor drawing high current.',
    icon: 'alert-octagon',
    riskLevel: 'critical',
    effects: ['Load: ~6.2kg', 'Current: ~2.4A', 'RPM decelerates', 'Vibration rises'],
  },
  {
    id: 'speed_variation',
    label: 'Speed Variation / Slip',
    description: 'Belt slipping intermittently. RPM oscillates.',
    icon: 'refresh-cw',
    riskLevel: 'warning',
    effects: ['RPM oscillates ±15', 'Belt offset unstable', 'Vibration elevated'],
  },
  {
    id: 'high_vibration',
    label: 'High Vibration',
    description: 'Bearing or roller eccentricity signature detected.',
    icon: 'activity',
    riskLevel: 'warning',
    effects: ['Vibration: ~0.38 RMS', 'Current slightly elevated', 'RPM steady'],
  },
  {
    id: 'sensor_disconnect',
    label: 'Sensor Disconnect',
    description: 'MPU6050 goes offline. System gracefully reduces fault confidence.',
    icon: 'wifi-off',
    riskLevel: 'warning',
    effects: ['MPU6050: OFFLINE', 'Vibration data unavailable', 'AI confidence reduced', 'No false alarm'],
  },
  {
    id: 'communication_loss',
    label: 'Communication Loss',
    description: 'ESP32/MQTT connection lost. Dashboard shows stale data.',
    icon: 'signal-zero',
    riskLevel: 'warning',
    effects: ['ESP32: OFFLINE', 'All sensor data stale', 'MQTT: DISCONNECTED', 'Last known values shown'],
  },
];
