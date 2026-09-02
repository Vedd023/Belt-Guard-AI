import React from 'react';
import type { TelemetryState } from '../hooks/useTelemetry';
import type { ConveyorEvent } from '../types/events';
import { Wrench, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { formatRelativeTime } from '../utils/format';

interface MaintenancePageProps {
  telemetry: TelemetryState;
  events: ConveyorEvent[];
}

const INSPECTION_CHECKLIST = [
  { item: 'Inspect belt alignment and lateral tracking', priority: 'high' },
  { item: 'Check roller and pulley condition for wear', priority: 'high' },
  { item: 'Verify belt tension and adjust if required', priority: 'medium' },
  { item: 'Lubricate bearings and drive chain', priority: 'medium' },
  { item: 'Check motor brushes and electrical connections', priority: 'medium' },
  { item: 'Inspect frame and structure for corrosion', priority: 'low' },
  { item: 'Clean camera lens and verify tracking calibration', priority: 'low' },
  { item: 'Test emergency stop and buzzer alarm', priority: 'high' },
];

export default function MaintenancePage({ telemetry, events }: MaintenancePageProps) {
  const { riskAnalysis } = telemetry;
  const score = riskAnalysis?.score ?? 100;
  const level = riskAnalysis?.level ?? 'normal';

  const lastAlert = events.find(e => e.severity !== 'normal' && e.severity !== 'info');
  const mostFrequent = 'Belt Misalignment'; // Could be computed from events

  // Build timeline from events
  const timeline = events.slice(0, 8);

  const scoreColor = level === 'critical' ? 'var(--color-status-critical)' :
                     level === 'warning'  ? 'var(--color-status-warning)'  : 'var(--color-status-normal)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
          Maintenance Center
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          Predictive maintenance tracking, inspection history, and recommended actions
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Conveyor Health', value: `${score}/100`, color: scoreColor, sub: level.toUpperCase() },
          { label: 'Current Risk',    value: level === 'normal' ? 'LOW' : level === 'warning' ? 'MEDIUM' : 'HIGH', color: scoreColor, sub: 'Overall risk level' },
          { label: 'Last Alert',      value: lastAlert ? formatRelativeTime(lastAlert.timestamp) : 'None', color: 'var(--color-text-secondary)', sub: lastAlert?.title ?? '—' },
          { label: 'Common Issue',    value: mostFrequent, color: 'var(--color-text-secondary)', sub: 'Most frequent fault type' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color, fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
              {c.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Inspection Checklist */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Wrench size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">RECOMMENDED INSPECTION CHECKLIST</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {INSPECTION_CHECKLIST.map((task, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'var(--color-industrial-800)',
                borderRadius: 5,
                border: `1px solid ${task.priority === 'high' ? 'rgba(245,158,11,0.15)' : 'var(--color-border)'}`,
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: task.priority === 'high' ? 'var(--color-status-warning)' :
                               task.priority === 'medium' ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flex: 1 }}>{task.item}</span>
                <span className={`badge ${task.priority === 'high' ? 'badge-warning' : task.priority === 'medium' ? 'badge-info' : 'badge-offline'}`} style={{ fontSize: 8 }}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: 'var(--color-text-dim)' }}>
            Inspection items are standard conveyor maintenance procedures — not AI-generated.
          </div>
        </div>

        {/* Maintenance Timeline */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Calendar size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">MAINTENANCE HISTORY TIMELINE</span>
          </div>
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: 7,
              top: 8,
              bottom: 8,
              width: 1,
              background: 'var(--color-border)',
            }} />

            {timeline.map((evt, i) => {
              const dotColor = evt.severity === 'critical' ? 'var(--color-status-critical)' :
                               evt.severity === 'warning'  ? 'var(--color-status-warning)'  :
                               evt.severity === 'info'     ? 'var(--color-status-info)'      : 'var(--color-status-normal)';
              return (
                <div key={evt.id} style={{ display: 'flex', gap: 12, marginBottom: i < timeline.length - 1 ? 14 : 0, position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: dotColor,
                    border: '2px solid var(--color-surface-card)',
                    flexShrink: 0,
                    marginLeft: -20,
                    marginTop: 2,
                    boxShadow: `0 0 4px ${dotColor}60`,
                  }} />
                  <div style={{ flex: 1, paddingBottom: 4, borderBottom: i < timeline.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                      {evt.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                      <span className={`badge ${evt.severity === 'normal' ? 'badge-normal' : evt.severity === 'warning' ? 'badge-warning' : evt.severity === 'critical' ? 'badge-critical' : 'badge-info'}`} style={{ fontSize: 8 }}>
                        {evt.severity}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>
                        {formatRelativeTime(evt.timestamp)}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>
                        · {evt.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {timeline.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No maintenance history
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: 8,
        fontSize: 11,
        color: 'var(--color-text-muted)',
        lineHeight: 1.5,
      }}>
        ℹ Remaining Useful Life (RUL) prediction requires a validated degradation model trained on historical sensor data. 
        RUL is not displayed in this prototype to avoid presenting unvalidated estimates. 
        Future versions will implement physics-informed degradation modeling.
      </div>
    </div>
  );
}
