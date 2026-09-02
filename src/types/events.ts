// ============================================================
// EVENT & ALERT TYPES
// Database-ready structure for conveyor events and alerts.
// ============================================================

import type { SensorKey } from './telemetry';

export type EventSeverity = 'info' | 'warning' | 'critical' | 'normal';
export type EventStatus = 'active' | 'acknowledged' | 'resolved';

export type EventType =
  | 'belt_misalignment'
  | 'high_vibration'
  | 'high_current'
  | 'overload'
  | 'temperature_rise'
  | 'speed_variation'
  | 'sensor_disconnect'
  | 'communication_loss'
  | 'system_online'
  | 'system_offline'
  | 'normal_restored'
  | 'inspection_due'
  | 'maintenance_complete';

export interface EventEvidence {
  sensor: SensorKey | 'camera' | 'system';
  label: string;
  value: string;
  isAbnormal: boolean;
}

export interface ConveyorEvent {
  id: string;
  timestamp: Date;
  conveyorId: string;
  conveyorName: string;
  eventType: EventType;
  title: string;
  description: string;
  severity: EventSeverity;
  riskScore: number;
  evidence: EventEvidence[];
  status: EventStatus;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  recommendedAction: string;
  sources: string[];
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  belt_misalignment:   'Belt Misalignment',
  high_vibration:      'High Vibration',
  high_current:        'High Motor Current',
  overload:            'Excessive Load',
  temperature_rise:    'Temperature Rise',
  speed_variation:     'Speed Variation',
  sensor_disconnect:   'Sensor Disconnected',
  communication_loss:  'Communication Lost',
  system_online:       'System Online',
  system_offline:      'System Offline',
  normal_restored:     'Normal Operation Restored',
  inspection_due:      'Inspection Due',
  maintenance_complete:'Maintenance Complete',
};

export const SEVERITY_ORDER: Record<EventSeverity, number> = {
  critical: 0,
  warning:  1,
  info:     2,
  normal:   3,
};

export interface Notification {
  id: string;
  timestamp: Date;
  severity: EventSeverity;
  title: string;
  message: string;
  eventId?: string;
  read: boolean;
}
