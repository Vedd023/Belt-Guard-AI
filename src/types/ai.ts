// ============================================================
// AI & ML MODEL TYPES
// Types for AI model outputs — Isolation Forest, fault classification,
// sensor fusion, and pipeline stages.
// All outputs are labeled DEMO MODEL OUTPUT until a real model is connected.
// ============================================================

import type { SensorKey } from './telemetry';

export type AnomalyState = 'normal' | 'anomalous' | 'unknown';
export type FaultClass = 'normal' | 'belt_misalignment' | 'overload' | 'bearing_wear' | 'roller_slip' | 'speed_variation' | 'unknown';

export interface AnomalyDetectionResult {
  state: AnomalyState;
  anomalyScore: number;   // 0–1, higher = more anomalous
  modelName: string;
  modelVersion: string;
  lastInference: Date;
  featureContributions: Partial<Record<SensorKey, number>>;
  isDemo: boolean;
}

export interface FaultClassificationResult {
  predictedClass: FaultClass;
  label: string;
  confidence: number | null;  // null = not available yet (awaiting validated dataset)
  modelName: string;
  modelVersion: string;
  lastInference: Date;
  isDemo: boolean;
}

export interface SensorFusionWeight {
  sensor: SensorKey | 'camera';
  label: string;
  weight: number;         // 0–1 normalized
  currentState: 'normal' | 'elevated' | 'high' | 'critical';
  currentValue: string;
}

export interface SensorFusionResult {
  weights: SensorFusionWeight[];
  overallRisk: 'normal' | 'warning' | 'critical';
  primaryContributor: string;
  evidence: string[];
  isDemo: boolean;
  note: string;
}

export type PipelineStageStatus = 'idle' | 'running' | 'completed' | 'error';

export interface PipelineStage {
  id: string;
  order: number;
  name: string;
  shortName: string;
  description: string;
  details: string;
  icon: string;
  status: PipelineStageStatus;
  latencyMs?: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'sensor_data',
    order: 1,
    name: 'Sensor Data Ingestion',
    shortName: 'Sensor Data',
    description: 'Raw data from ESP32 sensors via MQTT',
    details: 'ESP32 collects readings from MPU6050 (vibration), current sensor, optical encoder (RPM), HX711/load cell, DS18B20 (temperature), and camera. Data is transmitted via MQTT over Wi-Fi at ~2Hz.',
    icon: 'cpu',
    status: 'completed',
  },
  {
    id: 'validation',
    order: 2,
    name: 'Data Validation',
    shortName: 'Validation',
    description: 'Range checks, timestamp validation, sensor heartbeat',
    details: 'Python backend validates each reading: range checks against physical limits, sensor heartbeat timeout detection, NaN/null handling, duplicate packet filtering. Invalid readings are flagged but not silently dropped.',
    icon: 'shield-check',
    status: 'completed',
  },
  {
    id: 'filtering',
    order: 3,
    name: 'Signal Filtering',
    shortName: 'Filtering',
    description: 'Noise reduction using moving average and Butterworth filter',
    details: 'A 5-sample moving average smooths rapid noise transients. A Butterworth low-pass filter removes high-frequency electrical noise on current readings. Vibration raw data is kept for RMS computation.',
    icon: 'filter',
    status: 'completed',
  },
  {
    id: 'features',
    order: 4,
    name: 'Feature Extraction',
    shortName: 'Features',
    description: 'Statistical features: mean, RMS, std deviation, trend slopes',
    details: 'Features computed over a sliding window: RMS vibration, current deviation from baseline, RPM trend slope, load change rate, temperature gradient, belt offset magnitude, and delta from last known normal state.',
    icon: 'layers',
    status: 'completed',
  },
  {
    id: 'anomaly',
    order: 5,
    name: 'Anomaly Detection',
    shortName: 'Anomaly',
    description: 'Isolation Forest unsupervised anomaly scoring',
    details: 'An Isolation Forest model trained on normal operation data scores each feature vector. Scores below the threshold (configurable, demo: -0.15) are flagged as anomalous. The model does not require fault labels for training.',
    icon: 'search',
    status: 'completed',
  },
  {
    id: 'classification',
    order: 6,
    name: 'Fault Classification',
    shortName: 'Classification',
    description: 'Random Forest / XGBoost multi-class fault identification',
    details: 'A supervised classifier predicts the most likely fault class: Belt Misalignment, Overload, Bearing Wear, Roller Slip, Speed Variation, or Normal. Confidence scores require a validated labeled dataset — not fabricated in demo mode.',
    icon: 'tag',
    status: 'completed',
  },
  {
    id: 'fusion',
    order: 7,
    name: 'Sensor Fusion',
    shortName: 'Fusion',
    description: 'Weighted multi-sensor evidence aggregation',
    details: 'Configurable weights combine evidence from vibration, current, RPM, load, temperature, and camera belt tracking. Disconnected sensors reduce relevant fault confidence rather than triggering false alarms.',
    icon: 'git-merge',
    status: 'completed',
  },
  {
    id: 'risk',
    order: 8,
    name: 'Risk Scoring',
    shortName: 'Risk Score',
    description: 'Explainable composite health index (0–100)',
    details: 'The risk score aggregates anomaly score, fault class confidence, and sensor fusion weights into a 0–100 index (100 = healthy). Thresholds: ≥70 = Normal, 40–69 = Warning, <40 = Critical. Values are configurable prototype parameters.',
    icon: 'bar-chart',
    status: 'completed',
  },
  {
    id: 'alert',
    order: 9,
    name: 'Alert Dispatch',
    shortName: 'Alert',
    description: 'Event logging, buzzer control, dashboard notification',
    details: 'Alerts are generated when risk transitions cross thresholds. Events are persisted to SQLite (prototype). The buzzer on the ESP32 is controlled via MQTT command-back channel. Dashboard receives alerts via WebSocket.',
    icon: 'bell',
    status: 'completed',
  },
];

export const FAULT_CLASS_LABELS: Record<FaultClass, string> = {
  normal:            'Normal Operation',
  belt_misalignment: 'Belt Misalignment',
  overload:          'Overload Condition',
  bearing_wear:      'Bearing Wear',
  roller_slip:       'Roller Slip',
  speed_variation:   'Speed Variation',
  unknown:           'Unknown',
};
