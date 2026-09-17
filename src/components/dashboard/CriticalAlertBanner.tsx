import React, { useState } from 'react';
import type { RiskAnalysis } from '../../services/riskEngine';
import { AlertTriangle, AlertOctagon, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CriticalAlertBannerProps {
  riskAnalysis: RiskAnalysis | null;
  onAcknowledge?: () => void;
}

export default function CriticalAlertBanner({ riskAnalysis, onAcknowledge }: CriticalAlertBannerProps) {
  const [showErrorModal, setShowErrorModal] = useState(false);

  if (!riskAnalysis || riskAnalysis.level === 'normal') return null;

  const isCritical  = riskAnalysis.level === 'critical';
  const color       = isCritical ? 'var(--color-status-critical)' : 'var(--color-status-warning)';
  const bgColor     = isCritical ? 'rgba(239,68,68,0.08)'         : 'rgba(245,158,11,0.06)';
  const borderColor = isCritical ? 'rgba(239,68,68,0.35)'         : 'rgba(245,158,11,0.3)';
  const accentRgb   = isCritical ? '239,68,68'                    : '245,158,11';

  const abnormalContributors = riskAnalysis.contributors.filter(c => c.isAbnormal);

  function handleAcknowledgeClick() {
    setShowErrorModal(true);
  }

  function handleClose() {
    setShowErrorModal(false);
    onAcknowledge?.();
  }

  return (
    <>
      {/* ── Banner ── */}
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
              onClick={handleAcknowledgeClick}
              aria-label="Acknowledge alert"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>

      {/* ── Error Modal Overlay ── */}
      {showErrorModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Alert Error Details"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(15,20,30,0.98) 0%, rgba(20,28,40,0.98) 100%)',
              border: `1px solid rgba(${accentRgb},0.4)`,
              borderRadius: 14,
              padding: '28px 28px 24px',
              width: 'min(520px, 90vw)',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: `0 0 0 1px rgba(${accentRgb},0.15), 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(${accentRgb},0.15)`,
              animation: 'bgAlertSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* ── Close button — top right ── */}
            <button
              onClick={handleClose}
              aria-label="Close error details"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `rgba(${accentRgb},0.18)`;
                (e.currentTarget as HTMLButtonElement).style.color = color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
              }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingRight: 40 }}>
              <div style={{
                background: `rgba(${accentRgb},0.15)`,
                border: `1px solid rgba(${accentRgb},0.3)`,
                borderRadius: 8,
                padding: 8,
                color,
                display: 'flex',
              }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color, letterSpacing: '0.04em' }}>
                  {isCritical ? 'Critical Alert Details' : 'Warning Alert Details'}
                </div>
                <div style={{ fontSize: 11, color: '#9aa8bb', marginTop: 2 }}>
                  Risk Score:{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', color, fontWeight: 700 }}>
                    {riskAnalysis.score}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Fault */}
            <div style={{
              background: `rgba(${accentRgb},0.07)`,
              border: `1px solid rgba(${accentRgb},0.2)`,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 18,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Primary Fault
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                {riskAnalysis.primaryFault}
              </div>
            </div>

            {/* All Errors / Evidence */}
            {riskAnalysis.evidence.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9aa8bb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Detected Errors ({riskAnalysis.evidence.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {riskAnalysis.evidence.map((err, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid rgba(${accentRgb},0.15)`,
                      borderLeft: `3px solid rgba(${accentRgb},0.7)`,
                      borderRadius: 6,
                      padding: '8px 12px',
                    }}>
                      <span style={{
                        flexShrink: 0,
                        marginTop: 1,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: `rgba(${accentRgb},0.18)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 800,
                        color,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 12, color: '#f0f0f0', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                        {err}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abnormal Sensor Contributors */}
            {abnormalContributors.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9aa8bb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Abnormal Sensors ({abnormalContributors.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {abnormalContributors.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 6,
                      padding: '8px 12px',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: '#c8d0dc', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{c.deviation}</div>
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color,
                        background: `rgba(${accentRgb},0.12)`,
                        border: `1px solid rgba(${accentRgb},0.25)`,
                        borderRadius: 4,
                        padding: '2px 7px',
                        whiteSpace: 'nowrap',
                      }}>
                        {c.contribution.toFixed(0)}% risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 22,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9aa8bb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Recommended Action
              </div>
              <div style={{ fontSize: 12, color: '#d0d8e8', lineHeight: 1.6 }}>
                {riskAnalysis.recommendation}
              </div>
            </div>

            {/* Confirm Acknowledge button */}
            <button
              onClick={handleClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '11px 20px',
                background: `linear-gradient(135deg, rgba(${accentRgb},0.25), rgba(${accentRgb},0.12))`,
                border: `1px solid rgba(${accentRgb},0.45)`,
                borderRadius: 8,
                color,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, rgba(${accentRgb},0.38), rgba(${accentRgb},0.22))`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, rgba(${accentRgb},0.25), rgba(${accentRgb},0.12))`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <CheckCircle2 size={15} />
              Confirm Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes bgAlertSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
}
