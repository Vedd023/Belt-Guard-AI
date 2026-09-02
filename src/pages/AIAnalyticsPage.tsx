import React, { useState } from 'react';
import type { TelemetryState } from '../hooks/useTelemetry';
import { PIPELINE_STAGES, FAULT_CLASS_LABELS } from '../types/ai';
import type { RiskAnalysis } from '../services/riskEngine';
import Modal from '../components/common/Modal';
import { BarChart2, GitMerge, Tag, Search, ArrowDown } from 'lucide-react';

interface AIAnalyticsPageProps {
  telemetry: TelemetryState;
}

export default function AIAnalyticsPage({ telemetry }: AIAnalyticsPageProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const { riskAnalysis, current, isVibOffline, isCommsLost } = telemetry;

  const ra = riskAnalysis;
  const anomalyScore = ra?.anomalyScore ?? 0;
  const isAnomalous = anomalyScore > 0.25;

  // Derive fault class from primary fault
  const faultClass = ra?.primaryFault.includes('MISALIGNMENT') ? 'belt_misalignment'
                   : ra?.primaryFault.includes('MOTOR')        ? 'overload'
                   : ra?.primaryFault.includes('MECHANICAL')   ? 'bearing_wear'
                   : ra?.primaryFault.includes('SPEED')        ? 'speed_variation'
                   : ra?.primaryFault.includes('OVERLOAD')     ? 'overload'
                   : 'normal';

  const selectedStageData = PIPELINE_STAGES.find(s => s.id === selectedStage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>AI Analytics</h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          Anomaly detection, fault classification, pipeline visualization, and sensor fusion
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Anomaly Detection */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Search size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">ANOMALY DETECTION</span>
            <span className="badge badge-demo" style={{ marginLeft: 'auto', fontSize: 9 }}>DEMO MODEL OUTPUT</span>
          </div>

          {/* Score Meter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <div style={{
                fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)',
                color: isAnomalous ? 'var(--color-status-warning)' : 'var(--color-status-normal)',
              }}>
                {(anomalyScore * 100).toFixed(0)}
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>/100</div>
              <span className={`badge ${isAnomalous ? 'badge-warning' : 'badge-normal'}`} style={{ marginLeft: 8 }}>
                {isAnomalous ? 'ANOMALY DETECTED' : 'NORMAL'}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${anomalyScore * 100}%`,
                background: isAnomalous
                  ? 'linear-gradient(90deg, var(--color-status-warning), #ef4444)'
                  : 'var(--color-status-normal)',
              }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4 }}>
              Anomaly score — threshold: &gt;25 = anomalous (configurable)
            </div>
          </div>

          {/* Model info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Model',          value: 'Isolation Forest' },
              { label: 'Version',        value: 'Demo v1' },
              { label: 'Status',         value: 'Active' },
              { label: 'Last Trained',   value: 'Demo — N/A' },
              { label: 'Features',       value: 'Vibration, Current, RPM, Load, Temp, Offset' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--color-text-muted)', width: 110, flexShrink: 0 }}>{item.label}:</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Feature contributions */}
          <div style={{ marginTop: 14 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>FEATURE CONTRIBUTIONS</div>
            {ra?.fusionWeights.map(fw => (
              <div key={fw.sensor} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 90, flexShrink: 0 }}>{fw.label}</div>
                <div style={{ flex: 1, height: 4, background: 'var(--color-industrial-500)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${fw.weight * 100}%`,
                    background: fw.currentState === 'high' ? 'var(--color-status-warning)' : fw.currentState === 'elevated' ? 'var(--color-accent)' : 'var(--color-industrial-300)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  width: 48,
                  textAlign: 'right',
                  color: fw.currentState === 'high' ? 'var(--color-status-warning)' : 'var(--color-text-muted)',
                  flexShrink: 0,
                }}>
                  {fw.currentValue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fault Classification */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Tag size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">FAULT CLASSIFICATION</span>
            <span className="badge badge-demo" style={{ marginLeft: 'auto', fontSize: 9 }}>DEMO MODEL OUTPUT</span>
          </div>

          {/* Predicted class */}
          <div style={{
            padding: '14px',
            background: faultClass !== 'normal' ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.07)',
            border: `1px solid ${faultClass !== 'normal' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
            borderRadius: 8,
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>PREDICTED CONDITION</div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: faultClass !== 'normal' ? 'var(--color-status-warning)' : 'var(--color-status-normal)',
              letterSpacing: '0.02em',
            }}>
              {FAULT_CLASS_LABELS[faultClass as keyof typeof FAULT_CLASS_LABELS] ?? 'Normal Operation'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
              Model: Random Forest / XGBoost (planned)
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4 }}>
              Confidence: <em>Awaiting validated dataset</em>
            </div>
          </div>

          {/* Class probabilities */}
          <div className="section-title" style={{ marginBottom: 10 }}>CLASS DISTRIBUTION</div>
          {[
            { cls: 'Normal Operation',    score: faultClass === 'normal' ? 0.85 : 0.15 },
            { cls: 'Belt Misalignment',   score: faultClass === 'belt_misalignment' ? 0.78 : 0.08 },
            { cls: 'Overload',            score: faultClass === 'overload' ? 0.72 : 0.05 },
            { cls: 'Bearing Wear',        score: faultClass === 'bearing_wear' ? 0.65 : 0.04 },
            { cls: 'Speed Variation',     score: faultClass === 'speed_variation' ? 0.60 : 0.03 },
          ].map(c => (
            <div key={c.cls} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 120, flexShrink: 0 }}>{c.cls}</div>
              <div style={{ flex: 1, height: 4, background: 'var(--color-industrial-500)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${c.score * 100}%`,
                  background: c.score > 0.5 ? 'var(--color-accent)' : 'var(--color-industrial-300)',
                  transition: 'width 0.6s',
                }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)', width: 30, textAlign: 'right' }}>
                —
              </span>
            </div>
          ))}
          <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 8 }}>
            Probability values: Awaiting validated labeled dataset. Not fabricated.
          </div>

          {/* Model performance placeholder */}
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--color-industrial-800)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
            <div className="section-title" style={{ marginBottom: 8 }}>MODEL PERFORMANCE</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Precision', 'Recall', 'F1 Score', 'False Alarm Rate'].map(m => (
                <div key={m} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{m}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 2 }}>
                    Awaiting data
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Pipeline */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart2 size={14} style={{ color: 'var(--color-accent)' }} />
          <span className="section-title">AI PROCESSING PIPELINE</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-dim)', marginLeft: 8 }}>Click any stage for details</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {PIPELINE_STAGES.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <button
                className={`pipeline-node ${selectedStage === stage.id ? 'active' : ''}`}
                onClick={() => setSelectedStage(stage.id === selectedStage ? null : stage.id)}
                aria-pressed={selectedStage === stage.id}
                style={{ flexShrink: 0 }}
              >
                <span style={{ fontSize: 18 }}>
                  {stage.icon === 'cpu'          ? '💻' :
                   stage.icon === 'shield-check' ? '🛡' :
                   stage.icon === 'filter'       ? '🔽' :
                   stage.icon === 'layers'       ? '📐' :
                   stage.icon === 'search'       ? '🔍' :
                   stage.icon === 'tag'          ? '🏷' :
                   stage.icon === 'git-merge'    ? '🔀' :
                   stage.icon === 'bar-chart'    ? '📊' :
                   stage.icon === 'bell'         ? '🔔' : '⚙'}
                </span>
                <span style={{ fontSize: 9, fontWeight: 600, color: selectedStage === stage.id ? 'var(--color-accent)' : 'var(--color-text-muted)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  {stage.shortName}
                </span>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--color-status-normal)',
                  boxShadow: '0 0 4px rgba(16,185,129,0.6)',
                }} />
              </button>
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ flexShrink: 0, padding: '0 2px', color: 'var(--color-text-dim)', fontSize: 14 }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Stage detail */}
        {selectedStageData && (
          <div className="fade-in" style={{
            marginTop: 14,
            padding: '12px 14px',
            background: 'rgba(6,182,212,0.05)',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6 }}>
              Stage {selectedStageData.order}: {selectedStageData.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {selectedStageData.details}
            </div>
          </div>
        )}
      </div>

      {/* Sensor Fusion */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <GitMerge size={14} style={{ color: 'var(--color-accent)' }} />
          <span className="section-title">SENSOR FUSION</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-dim)', marginLeft: 8 }}>Configurable demo weights — not scientifically validated</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Weight bars */}
          <div>
            <div className="section-title" style={{ marginBottom: 10, fontSize: 9 }}>SIGNAL WEIGHTS</div>
            {ra?.fusionWeights.map(fw => (
              <div key={fw.sensor} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 100, flexShrink: 0 }}>{fw.label}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--color-industrial-500)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${fw.weight * 100}%`,
                    background: 'linear-gradient(90deg, var(--color-accent), rgba(6,182,212,0.5))',
                    borderRadius: 4,
                  }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', width: 28, textAlign: 'right' }}>
                  {(fw.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* Evidence table */}
          <div>
            <div className="section-title" style={{ marginBottom: 10, fontSize: 9 }}>CURRENT EVIDENCE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ra?.fusionWeights.map(fw => (
                <div key={fw.sensor} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  background: 'var(--color-industrial-800)',
                  borderRadius: 5,
                  border: `1px solid ${fw.currentState === 'high' ? 'rgba(245,158,11,0.25)' : 'var(--color-border)'}`,
                }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{fw.label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                      {fw.currentValue}
                    </span>
                    <span className={`badge ${fw.currentState === 'high' ? 'badge-warning' : fw.currentState === 'elevated' ? 'badge-info' : 'badge-normal'}`} style={{ fontSize: 8 }}>
                      {fw.currentState.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(6,182,212,0.06)', borderRadius: 6, border: '1px solid rgba(6,182,212,0.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>OVERALL RISK</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: ra?.level === 'normal' ? 'var(--color-status-normal)' : ra?.level === 'warning' ? 'var(--color-status-warning)' : 'var(--color-status-critical)', marginTop: 2 }}>
                {ra?.label ?? 'NORMAL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
