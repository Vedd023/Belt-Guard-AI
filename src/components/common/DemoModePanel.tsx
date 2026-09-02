import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ScenarioId } from '../../types/scenarios';
import { SCENARIO_DEFINITIONS } from '../../types/scenarios';
import {
  CheckCircle, AlertTriangle, AlertOctagon, RefreshCw,
  Activity, WifiOff, SignalZero, X, FlaskConical, Check
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  'check-circle':   <CheckCircle   size={16} />,
  'alert-triangle': <AlertTriangle size={16} />,
  'alert-octagon':  <AlertOctagon  size={16} />,
  'refresh-cw':    <RefreshCw     size={16} />,
  'activity':      <Activity      size={16} />,
  'wifi-off':      <WifiOff       size={16} />,
  'signal-zero':   <SignalZero    size={16} />,
};

interface DemoModePanelProps {
  current: ScenarioId;
  onSelect: (id: ScenarioId) => void;
  onClose: () => void;
}

export default function DemoModePanel({ current, onSelect, onClose }: DemoModePanelProps) {
  // Lock background body scrolling while Demo Mode modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <>
      {/* Full-screen backdrop covering entire viewport with blur */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Overlay Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Simulation Demo Mode"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        {/* Modal Dialog Box */}
        <div
          className="fade-in"
          style={{
            pointerEvents: 'auto',
            width: 'min(560px, 92vw)',
            maxHeight: '85vh',
            background: 'var(--popover-bg)',
            border: '1px solid var(--popover-border)',
            borderRadius: 14,
            boxShadow: 'var(--popover-shadow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: 'var(--color-text-primary)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--popover-header-bg)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
                flexShrink: 0,
              }}>
                <FlaskConical size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.04em' }}>
                  SIMULATION / DEMO MODE
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Select a scenario to simulate real-time telemetry across the dashboard
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close demo mode modal"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Scenarios List */}
          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: 'var(--popover-bg)',
            }}
          >
            {SCENARIO_DEFINITIONS.map(scenario => {
              const isActive = current === scenario.id;
              const statusColor =
                scenario.riskLevel === 'critical' ? 'var(--color-status-critical)' :
                scenario.riskLevel === 'warning'  ? 'var(--color-status-warning)'  : 'var(--color-status-normal)';

              return (
                <button
                  key={scenario.id}
                  onClick={() => onSelect(scenario.id as ScenarioId)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: isActive ? 'var(--color-accent-dim)' : 'var(--color-industrial-800)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top Row: Icon + Title + Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: statusColor, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {ICONS[scenario.icon] ?? <CheckCircle size={16} />}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                        {scenario.label}
                      </span>
                    </div>

                    {isActive && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'var(--color-accent-dim)',
                          color: 'var(--color-accent)',
                          border: '1px solid var(--color-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check size={11} /> ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.45 }}>
                    {scenario.description}
                  </div>

                  {/* Telemetry Effect Tags */}
                  {scenario.effects.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {scenario.effects.map((effect, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            background: isActive ? 'var(--color-accent-dim)' : 'var(--color-industrial-750)',
                            border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            borderRadius: 4,
                            padding: '2px 7px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--popover-header-bg)',
              fontSize: 10,
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            ⚗ DEMO MODE — Data is simulated in-browser. All thresholds and risk scores update dynamically.
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
