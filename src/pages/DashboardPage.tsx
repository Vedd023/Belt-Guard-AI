import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TelemetryState } from '../hooks/useTelemetry';
import { CONVEYOR_PROFILES, getAlignmentInfo } from '../types/telemetry';
import SensorSummaryCards from '../components/dashboard/SensorSummaryCards';
import HealthRiskGauge from '../components/dashboard/HealthRiskGauge';
import ExplainabilityModal from '../components/dashboard/ExplainabilityModal';
import CriticalAlertBanner from '../components/dashboard/CriticalAlertBanner';
import VisionCanvasFeed from '../components/vision/VisionCanvasFeed';
import { formatTimestamp } from '../utils/format';
import { Camera, Activity, AlertTriangle, CheckCircle, Database, Loader2 } from 'lucide-react';
import type { ConveyorEvent } from '../types/events';

interface DashboardPageProps {
  telemetry: TelemetryState;
  events: ConveyorEvent[];
  onAcknowledge?: () => void;
  alertDismissed?: boolean;
}

export default function DashboardPage({ telemetry, events, onAcknowledge, alertDismissed }: DashboardPageProps) {
  const [showExplain, setShowExplain] = useState(false);
  const navigate = useNavigate();
  const {
    current,
    history,
    riskAnalysis,
    isVibOffline,
    isCommsLost,
    systemPower,
    startingStep,
    conveyorState,
    selectedConveyorId,
    alignmentInfo,
  } = telemetry;

  const activeConveyor = CONVEYOR_PROFILES[selectedConveyorId];
  const recentEvents = events.slice(0, 4);
  const activeEvents = events.filter(e => e.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {activeConveyor.name} â€” Health Overview
            </h2>
            <span className={alignmentInfo.badgeClass} style={{ fontSize: 10 }}>
              {alignmentInfo.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Real-time predictive maintenance monitoring control center
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Running / System Power Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--color-industrial-700)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
            {systemPower === 'OFF' ? (
              <>
                <span className="status-dot offline" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-offline)', letterSpacing: '0.04em' }}>
                  SYSTEM OFF
                </span>
              </>
            ) : systemPower === 'STARTING' ? (
              <>
                <Loader2 size={12} className="animate-spin" style={{ color: 'var(--color-status-warning)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-warning)', letterSpacing: '0.04em' }}>
                  STARTING...
                </span>
              </>
            ) : conveyorState === 'RUNNING' ? (
              <>
                <span className="status-dot online" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-normal)', letterSpacing: '0.04em' }}>
                  RUNNING
                </span>
              </>
            ) : conveyorState === 'STARTING' || conveyorState === 'STOPPING' ? (
              <>
                <Loader2 size={12} className="animate-spin" style={{ color: 'var(--color-status-warning)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-warning)', letterSpacing: '0.04em' }}>
                  {conveyorState}
                </span>
              </>
            ) : (
              <>
                <span className="status-dot warning" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-warning)', letterSpacing: '0.04em' }}>
                  STOPPED
                </span>
              </>
            )}
          </div>

          <span className="badge badge-demo" style={{ fontSize: 10 }}>
            âš— DEMO DATA
          </span>

          {current && systemPower !== 'OFF' && (
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatTimestamp(current.timestamp)}
            </span>
          )}
        </div>
      </div>

      {/* Starting / Buffering Banner */}
      {systemPower === 'STARTING' && (
        <div className="fade-in glow-warning" style={{
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-status-warning)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-status-warning)' }}>
              INITIALIZING MONITORING SYSTEM...
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              {startingStep}
            </div>
          </div>
        </div>
      )}

      {/* System OFF Banner */}
      {systemPower === 'OFF' && (
        <div className="fade-in" style={{
          padding: '12px 16px',
          background: 'var(--color-industrial-800)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            âšª System is currently <strong>OFF</strong>. Turn System ON in top header to start monitoring.
          </div>
        </div>
      )}

      {/* Critical Alert Banner */}
      {systemPower !== 'OFF' && !alertDismissed && (riskAnalysis?.level === 'warning' || riskAnalysis?.level === 'critical') && (
        <CriticalAlertBanner riskAnalysis={riskAnalysis} onAcknowledge={onAcknowledge} />
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
        {/* Left: Sensor Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="section-title">LIVE SENSOR READINGS â€” {activeConveyor.name}</div>
          <SensorSummaryCards snapshot={current} history={history} isVibOffline={isVibOffline} />

          {/* Mini Camera Widget */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={14} style={{ color: 'var(--color-accent)' }} />
                <span className="section-title">CAMERA VISION â€” {activeConveyor.name}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/camera')}
                aria-label="Open full camera view"
              >
                Full View â†’
              </button>
            </div>
            <VisionCanvasFeed
              beltOffset={current?.beltOffset ?? 0}
              isOffline={isCommsLost || systemPower === 'OFF'}
              confidence={systemPower === 'OFF' ? 0 : 0.91}
            />
          </div>
        </div>

        {/* Right: Health Gauge + Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 260 }}>
          {/* Health Gauge */}
          <HealthRiskGauge
            riskAnalysis={riskAnalysis}
            onClick={() => setShowExplain(true)}
          />

          {/* Quick stats */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-title" style={{ marginBottom: 12 }}>QUICK STATS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Active Alerts', value: activeEvents.toString(), icon: <AlertTriangle size={12} />, color: activeEvents > 0 ? 'var(--color-status-warning)' : 'var(--color-text-muted)' },
                { label: 'Sensor Health', value: systemPower === 'OFF' ? '0/9' : isVibOffline ? '8/9' : isCommsLost ? '0/9' : '9/9', icon: <Activity size={12} />, color: isVibOffline || isCommsLost || systemPower === 'OFF' ? 'var(--color-status-warning)' : 'var(--color-status-normal)' },
                { label: 'AI Status', value: systemPower === 'ONLINE' ? 'Active' : 'Standby', icon: <Database size={12} />, color: systemPower === 'ONLINE' ? 'var(--color-status-normal)' : 'var(--color-text-muted)' },
                { label: 'Uptime', value: systemPower === 'ONLINE' ? '99.8%' : 'â€”', icon: <CheckCircle size={12} />, color: 'var(--color-text-secondary)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                    {item.label}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="section-title">RECENT EVENTS</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>
                All â†’
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentEvents.length === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '8px 0' }}>
                  No events
                </div>
              ) : recentEvents.map(evt => (
                <div key={evt.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '7px 8px',
                  background: 'var(--color-industrial-800)',
                  borderRadius: 5,
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: evt.severity === 'critical' ? 'var(--color-status-critical)' :
                                evt.severity === 'warning'  ? 'var(--color-status-warning)'  :
                                evt.severity === 'info'     ? 'var(--color-status-info)'     : 'var(--color-status-normal)',
                    marginTop: 4,
                    flexShrink: 0,
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 2 }}>
                      {evt.timestamp.toLocaleTimeString()} Â· {evt.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Modal */}
      <ExplainabilityModal
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
        riskAnalysis={riskAnalysis}
      />
    </div>
  );
}


