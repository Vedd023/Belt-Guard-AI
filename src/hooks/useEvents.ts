// ============================================================
// useEvents — Event and notification management hook
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { ConveyorEvent, Notification, EventSeverity } from '../types/events';
import type { RiskAnalysis } from '../services/riskEngine';
import type { TelemetrySnapshot } from '../types/telemetry';
import { nanoid } from '../utils/nanoid';

// Seed with some historical events for the demo
function makeSeedEvents(): ConveyorEvent[] {
  const now = new Date();
  const h = (hrs: number) => new Date(now.getTime() - hrs * 3600000);
  const m = (mins: number) => new Date(now.getTime() - mins * 60000);

  return [
    {
      id: 'evt-001',
      timestamp: m(2),
      conveyorId: 'conv-01',
      conveyorName: 'Conveyor #01',
      eventType: 'normal_restored',
      title: 'Normal Operation Restored',
      description: 'Conveyor returned to normal operating parameters after previous warning.',
      severity: 'normal',
      riskScore: 91,
      evidence: [],
      status: 'resolved',
      resolvedAt: m(2),
      recommendedAction: 'Continue monitoring.',
      sources: ['System'],
    },
    {
      id: 'evt-002',
      timestamp: h(2),
      conveyorId: 'conv-01',
      conveyorName: 'Conveyor #01',
      eventType: 'belt_misalignment',
      title: 'Belt Misalignment',
      description: 'Belt lateral offset exceeded threshold. Vibration and motor current elevated.',
      severity: 'warning',
      riskScore: 72,
      evidence: [
        { sensor: 'beltOffset', label: 'Belt Offset', value: '+13 px', isAbnormal: true },
        { sensor: 'vibration', label: 'Vibration', value: '0.31 RMS', isAbnormal: true },
        { sensor: 'current', label: 'Motor Current', value: '1.8 A', isAbnormal: true },
        { sensor: 'rpm', label: 'RPM', value: '116 RPM', isAbnormal: false },
      ],
      status: 'resolved',
      resolvedAt: m(2),
      acknowledgedAt: h(1.9),
      acknowledgedBy: 'Operator',
      recommendedAction: 'Inspect belt alignment and roller positioning.',
      sources: ['Camera', 'MPU6050', 'Current Sensor'],
    },
    {
      id: 'evt-003',
      timestamp: h(5),
      conveyorId: 'conv-01',
      conveyorName: 'Conveyor #01',
      eventType: 'high_vibration',
      title: 'High Vibration Detected',
      description: 'Vibration RMS above baseline. Possible bearing or roller anomaly.',
      severity: 'warning',
      riskScore: 66,
      evidence: [
        { sensor: 'vibration', label: 'Vibration', value: '0.29 RMS', isAbnormal: true },
        { sensor: 'current', label: 'Motor Current', value: '1.6 A', isAbnormal: false },
      ],
      status: 'acknowledged',
      acknowledgedAt: h(4.8),
      acknowledgedBy: 'Operator',
      recommendedAction: 'Inspect rollers and bearings for wear.',
      sources: ['MPU6050'],
    },
    {
      id: 'evt-004',
      timestamp: h(8),
      conveyorId: 'conv-01',
      conveyorName: 'Conveyor #01',
      eventType: 'temperature_rise',
      title: 'Temperature Rise',
      description: 'DS18B20 temperature approaching upper threshold.',
      severity: 'info',
      riskScore: 78,
      evidence: [
        { sensor: 'temperature', label: 'Temperature', value: '41.2 °C', isAbnormal: true },
      ],
      status: 'resolved',
      resolvedAt: h(7.2),
      recommendedAction: 'Check ambient temperature and conveyor cooling.',
      sources: ['DS18B20'],
    },
    {
      id: 'evt-005',
      timestamp: h(24),
      conveyorId: 'conv-01',
      conveyorName: 'Conveyor #01',
      eventType: 'maintenance_complete',
      title: 'Maintenance Complete',
      description: 'Scheduled inspection completed. Belt tension adjusted and rollers lubricated.',
      severity: 'info',
      riskScore: 95,
      evidence: [],
      status: 'resolved',
      resolvedAt: h(23.5),
      recommendedAction: 'Next inspection due in 7 days.',
      sources: ['Manual'],
    },
  ];
}

export function useEvents(riskAnalysis: RiskAnalysis | null, snapshot: TelemetrySnapshot | null) {
  const [events, setEvents] = useState<ConveyorEvent[]>(makeSeedEvents());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastRiskLevel, setLastRiskLevel] = useState<string>('normal');

  // Auto-generate events when risk level changes
  useEffect(() => {
    if (!riskAnalysis || !snapshot) return;
    const newLevel = riskAnalysis.level;
    if (newLevel === lastRiskLevel) return;

    setLastRiskLevel(newLevel);

    if (newLevel === 'normal' && lastRiskLevel !== 'normal') {
      addSystemEvent('normal_restored', 'Normal Operation Restored', 'normal', riskAnalysis.score, [], 'Continue monitoring.', ['System']);
      return;
    }

    if (newLevel === 'warning' || newLevel === 'critical') {
      const severity: EventSeverity = newLevel === 'critical' ? 'critical' : 'warning';

      if (riskAnalysis.primaryFault.includes('MISALIGNMENT')) {
        addSystemEvent('belt_misalignment', 'Belt Misalignment', severity, riskAnalysis.score,
          riskAnalysis.contributors.filter(c => c.isAbnormal).map(c => ({
            sensor: c.sensor as any, label: c.label, value: c.deviation, isAbnormal: true,
          })),
          riskAnalysis.recommendation,
          ['Camera', 'MPU6050']
        );
      } else if (riskAnalysis.primaryFault.includes('MECHANICAL')) {
        addSystemEvent('high_vibration', 'High Vibration Detected', severity, riskAnalysis.score,
          riskAnalysis.contributors.filter(c => c.isAbnormal).map(c => ({
            sensor: c.sensor as any, label: c.label, value: c.deviation, isAbnormal: true,
          })),
          riskAnalysis.recommendation,
          ['MPU6050']
        );
      } else if (riskAnalysis.primaryFault.includes('OVERLOAD')) {
        addSystemEvent('overload', 'Excessive Load', severity, riskAnalysis.score,
          riskAnalysis.contributors.filter(c => c.isAbnormal).map(c => ({
            sensor: c.sensor as any, label: c.label, value: c.deviation, isAbnormal: true,
          })),
          riskAnalysis.recommendation,
          ['Load Cell', 'Current Sensor']
        );
      } else if (riskAnalysis.primaryFault.includes('MOTOR')) {
        addSystemEvent('high_current', 'High Motor Current', severity, riskAnalysis.score,
          riskAnalysis.contributors.filter(c => c.isAbnormal).map(c => ({
            sensor: c.sensor as any, label: c.label, value: c.deviation, isAbnormal: true,
          })),
          riskAnalysis.recommendation,
          ['Current Sensor']
        );
      } else if (riskAnalysis.primaryFault.includes('Communication')) {
        addSystemEvent('communication_loss', 'Communication Lost', 'critical', 0, [],
          riskAnalysis.recommendation,
          ['ESP32', 'MQTT']
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskAnalysis?.level]);

  function addSystemEvent(
    type: ConveyorEvent['eventType'],
    title: string,
    severity: EventSeverity,
    riskScore: number,
    evidence: ConveyorEvent['evidence'],
    recommendedAction: string,
    sources: string[],
  ) {
    const newEvent: ConveyorEvent = {
      id: `evt-${nanoid()}`,
      timestamp: new Date(),
      conveyorId: 'conv-01',
      conveyorName: 'Conveyor #01',
      eventType: type,
      title,
      description: title,
      severity,
      riskScore,
      evidence,
      status: 'active',
      recommendedAction,
      sources,
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 200));

    const notification: Notification = {
      id: `notif-${nanoid()}`,
      timestamp: new Date(),
      severity,
      title,
      message: `Risk score: ${riskScore}/100. ${recommendedAction.slice(0, 80)}`,
      eventId: newEvent.id,
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  }

  const acknowledgeEvent = useCallback((id: string) => {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'acknowledged', acknowledgedAt: new Date(), acknowledgedBy: 'Operator' } : e
    ));
  }, []);

  const resolveEvent = useCallback((id: string) => {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'resolved', resolvedAt: new Date() } : e
    ));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    events,
    notifications,
    unreadCount,
    acknowledgeEvent,
    resolveEvent,
    markNotificationRead,
    markAllRead,
  };
}
