import React from 'react';
import Modal from '../common/Modal';
import type { RiskAnalysis } from '../../services/riskEngine';
import { getRiskColor } from '../../utils/format';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskAnalysis: RiskAnalysis | null;
}

export default function ExplainabilityModal({ isOpen, onClose, riskAnalysis }: ExplainabilityModalProps) {
  if (!riskAnalysis) return null;

  const { score, level, primaryFault, contributors, evidence, recommendation, anomalyScore, fusionWeights } = riskAnalysis;

  const color = getRiskColor(level);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Why is the conveyor at risk?"
      subtitle="Explainable AI — Risk score breakdown and contributing factors"
      width={680}
    >
      {/* Health Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '12px 16px',
        background: level === 'critical' ? 'rgba(239,68,68,0.07)' : level === 'warning' ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.07)',
        borderRadius: 8,
        border: `1px solid ${level === 'critical' ? 'rgba(239,68,68,0.25)' : level === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
        marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {score}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-muted)' }}>/100</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4, letterSpacing: '0.04em' }}>HEALTH SCORE</div>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--color-border)' }} />
        <div>
          <span className={`badge badge-${level}`} style={{ fontSize: 12 }}>{level.toUpperCase()}</span>
          <div style={{ fontSize: 12, color, marginTop: 6, fontWeight: 600 }}>{primaryFault}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>ANOMALY SCORE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {(anomalyScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Primary Contributor */}
      {contributors.length > 0 && contributors[0].isAbnormal && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>PRIMARY CONTRIBUTOR</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 8,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              ⚠
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-status-warning)' }}>
                {contributors[0].label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Current: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{contributors[0].deviation}</span>
                {' — '}largest contributor to risk score
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--color-status-warning)' }}>
              {contributors[0].contribution}%
            </div>
          </div>
        </div>
      )}

      {/* Risk Contributors */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>RISK CONTRIBUTORS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contributors.map(c => (
            <div key={c.sensor} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, color: c.isAbnormal ? 'var(--color-text-primary)' : 'var(--color-text-muted)', width: 100, flexShrink: 0 }}>
                {c.label}
              </div>
              <div style={{ flex: 1, height: 6, background: 'var(--color-industrial-500)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${c.contribution}%`,
                  background: c.isAbnormal
                    ? 'linear-gradient(90deg, var(--color-status-warning), rgba(245,158,11,0.6))'
                    : 'var(--color-industrial-300)',
                  borderRadius: 3,
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: c.isAbnormal ? 'var(--color-status-warning)' : 'var(--color-text-muted)',
                width: 32,
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {c.contribution}%
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', width: 80, textAlign: 'right', flexShrink: 0 }}>
                {c.deviation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence */}
      {evidence.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>EVIDENCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {evidence.map((e, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}>
                <span style={{ color: 'var(--color-status-warning)', flexShrink: 0, marginTop: 1 }}>▸</span>
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensor Fusion Weights */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>SENSOR FUSION WEIGHTS <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-dim)' }}>(configurable prototype parameters)</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {fusionWeights.map(fw => (
            <div key={fw.sensor} style={{
              padding: '8px 10px',
              background: 'var(--color-industrial-800)',
              borderRadius: 6,
              border: `1px solid ${fw.currentState === 'high' ? 'rgba(245,158,11,0.25)' : 'var(--color-border)'}`,
            }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>{fw.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: fw.currentState === 'high' ? 'var(--color-status-warning)' : 'var(--color-text-primary)', marginTop: 2 }}>
                {fw.currentValue}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 2 }}>
                Weight: {(fw.weight * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div style={{
        padding: '12px 16px',
        background: level === 'critical' ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)',
        border: `1px solid ${level === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
        borderRadius: 8,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-status-info)', letterSpacing: '0.08em', marginBottom: 6 }}>
          RECOMMENDED ACTION
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
          {recommendation}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--color-text-dim)' }}>
        ⚗ DEMO MODEL OUTPUT — Risk scores use configurable prototype thresholds, not scientifically validated models.
      </div>
    </Modal>
  );
}
