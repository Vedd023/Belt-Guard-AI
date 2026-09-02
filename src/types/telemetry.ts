// ============================================================
// TELEMETRY TYPES
// These types define the structure of all sensor readings
// from the ESP32-based conveyor monitoring system.
// Future backend API responses must conform to these types.
// ============================================================

export type SensorStatus = 'online' | 'offline' | 'degraded' | 'unknown';
export type RiskLevel = 'normal' | 'warning' | 'critical';
export type DataSource = 'demo' | 'live' | 'api';

export type ConveyorId = 'conv-01' | 'conv-02' | 'conv-03' | 'conv-04';
export type SystemPower = 'OFF' | 'STARTING' | 'ONLINE';
export type ConveyorState = 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING';
export type AccelerationRate = 0.5 | 1 | 1.5 | 2;

export interface ConveyorProfile {
  id: ConveyorId;
  name: string;
  rpm: number;
  current: number;
  load: number;
  temperature: number;
  vibration: number;
  beltOffset: number;
}

export const CONVEYOR_PROFILES: Record<ConveyorId, ConveyorProfile> = {
  'conv-01': { id: 'conv-01', name: 'Conveyor #01', rpm: 120, current: 1.3, load: 2.0, temperature: 35, vibration: 0.14, beltOffset: 0 },
  'conv-02': { id: 'conv-02', name: 'Conveyor #02', rpm: 125, current: 1.5, load: 2.5, temperature: 36, vibration: 0.16, beltOffset: 2 },
  'conv-03': { id: 'conv-03', name: 'Conveyor #03', rpm: 118, current: 1.7, load: 3.0, temperature: 38, vibration: 0.19, beltOffset: 6 },
  'conv-04': { id: 'conv-04', name: 'Conveyor #04', rpm: 122, current: 1.4, load: 2.2, temperature: 35, vibration: 0.15, beltOffset: -2 },
};

export function getAlignmentInfo(beltOffset: number): {
  status: 'ALIGNED' | 'MISALIGNED' | 'SEVERE MISALIGNMENT';
  label: string;
  level: 'normal' | 'warning' | 'critical';
  color: string;
  badgeClass: string;
} {
  if (beltOffset === -1) {
    return {
      status: 'ALIGNED',
      label: '⚪ UNKNOWN',
      level: 'normal',
      color: 'var(--color-text-dim)',
      badgeClass: 'badge-offline',
    };
  }
  const absOffset = Math.abs(beltOffset);
  if (absOffset <= 5) {
    return {
      status: 'ALIGNED',
      label: '🟢 ALIGNED',
      level: 'normal',
      color: 'var(--color-status-normal)',
      badgeClass: 'badge-normal',
    };
  } else if (absOffset <= 10) {
    return {
      status: 'MISALIGNED',
      label: '🟡 MISALIGNED',
      level: 'warning',
      color: 'var(--color-status-warning)',
      badgeClass: 'badge-warning',
    };
  } else {
    return {
      status: 'SEVERE MISALIGNMENT',
      label: '🔴 SEVERE MISALIGNMENT',
      level: 'critical',
      color: 'var(--color-status-critical)',
      badgeClass: 'badge-critical',
    };
  }
}

export interface SensorReading {
  value: number;
  unit: string;
  timestamp: Date;
  status: SensorStatus;
}

export interface TelemetrySnapshot {
  timestamp: Date;
  rpm: number;
  current: number;        // Amps
  load: number;           // kg
  vibration: number;      // RMS g
  temperature: number;    // °C
  beltOffset: number;     // px (+ = right, - = left)
  dataSource: DataSource;
}

export interface SensorBaseline {
  rpm: { min: number; max: number };
  current: { min: number; max: number };
  load: { min: number; max: number };
  vibration: { min: number; max: number };
  temperature: { min: number; max: number };
  beltOffset: { min: number; max: number };
}

export const DEFAULT_BASELINE: SensorBaseline = {
  rpm:         { min: 115,   max: 125 },
  current:     { min: 1.1,   max: 1.5 },
  load:        { min: 0.5,   max: 3.5 },
  vibration:   { min: 0.10,  max: 0.18 },
  temperature: { min: 30,    max: 40 },
  beltOffset:  { min: -5,    max: 5 },
};

export interface HealthScore {
  score: number;        // 0-100
  level: RiskLevel;
  label: string;        // NORMAL / WARNING / CRITICAL
  primaryFault: string;
  timestamp: Date;
}

export interface ConveyorStatus {
  id: string;
  name: string;
  isRunning: boolean;
  healthScore: HealthScore;
  dataSource: DataSource;
  lastUpdate: Date;
}

export type SensorKey = 'rpm' | 'current' | 'load' | 'vibration' | 'temperature' | 'beltOffset';

export interface SensorMeta {
  key: SensorKey;
  label: string;
  unit: string;
  icon: string;
  decimals: number;
  description: string;
}

export const SENSOR_META: Record<SensorKey, SensorMeta> = {
  rpm:         { key: 'rpm',         label: 'RPM',           unit: 'RPM',  icon: 'gauge',            decimals: 0, description: 'Motor / encoder speed' },
  current:     { key: 'current',     label: 'Motor Current', unit: 'A',    icon: 'zap',              decimals: 2, description: 'Motor drive current' },
  load:        { key: 'load',        label: 'Load',          unit: 'kg',   icon: 'weight',           decimals: 1, description: 'Load cell reading' },
  vibration:   { key: 'vibration',   label: 'Vibration',     unit: 'RMS',  icon: 'activity',         decimals: 3, description: 'MPU6050 vibration RMS' },
  temperature: { key: 'temperature', label: 'Temperature',   unit: '°C',   icon: 'thermometer',      decimals: 1, description: 'DS18B20 temperature' },
  beltOffset:  { key: 'beltOffset',  label: 'Belt Offset',   unit: 'px',   icon: 'align-center',     decimals: 0, description: 'Camera belt tracking offset' },
};
