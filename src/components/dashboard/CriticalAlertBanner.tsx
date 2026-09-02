import React from 'react';
import type { RiskAnalysis } from '../../services/riskEngine';
import { AlertTriangle, AlertOctagon, X } from 'lucide-react';

interface CriticalAlertBannerProps {
  riskAnalysis: RiskAnalysis | null;
  onAcknowledge?: () => void;
}

export default function CriticalAlertBanner({ riskAnalysis, onAcknowledge }: CriticalAlertBannerProps) {
  if (!riskAnalysis || riskAnalysis.level === 'normal') return null;

  const isCritical = riskAnalysis.level === 'critical';
  const color   = isCritical ? 'var(--color-status-critical)' : 'var(--color-status-warning)';
  const bgColor = isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.06)';
  const borderColor = isCritical ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.3)';

  return (
    <div
      className="fade-in"
      role="alert"
      aria-live="assertive"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 4,
        boxShadow: isCritical ? 'var(--shadow-glow-critical)' : 'var(--shadow-glow-warning)',
      }}
    >
      <div style={{ flexShrink: 0, color, marginTop: 1 }}>
        {isCritical
          ? <AlertOctagon size={18} aria-hidden />
          : <AlertTriangle size={18} aria-hidden />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {isCritical ? '🔴 CRITICAL CONDITION DETECTED' : '⚠ WARNING CONDITION DETECTED'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-primary)', marginTop: 4, fontWeight: 600 }}>
          {riskAnalysis.primaryFault}
        </div>
        {riskAnalysis.evidence.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {riskAnalysis.evidence.slice(0, 3).map((e, i) => (
              <span key={i} style={{
                fontSize: 10,
                color: 'var(--color-text-secondary)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '2px 6px',
                fontFamily: 'var(--font-mono)',
              }}>
                {e}
              </span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--color-text-secondary)' }}>Recommended: </strong>
          {riskAnalysis.recommendation}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color, background: `${color}20`, padding: '3px 8px', borderRadius: 4, border: `1px solid ${color}40` }}>
          {riskAnalysis.score}/100
        </span>
        {onAcknowledge && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onAcknowledge}
            aria-label="Acknowledge alert"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
