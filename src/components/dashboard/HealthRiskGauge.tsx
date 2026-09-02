import React from 'react';
import type { RiskAnalysis } from '../../services/riskEngine';
import { getRiskColor } from '../../utils/format';

interface HealthRiskGaugeProps {
  riskAnalysis: RiskAnalysis | null;
  onClick?: () => void;
}

export default function HealthRiskGauge({ riskAnalysis, onClick }: HealthRiskGaugeProps) {
  const score = riskAnalysis?.score ?? 100;
  const level = riskAnalysis?.level ?? 'normal';
  const label = riskAnalysis?.label ?? 'NORMAL';
  const primaryFault = riskAnalysis?.primaryFault ?? '—';

  const color = getRiskColor(level);

  // SVG arc parameters scaled so the arc fits cleanly inside the SVG canvas
  const R = 64;
  const cx = 110;
  const cy = 76;
  const strokeWidth = 12;
  const startAngle = 135; // degrees
  const sweepAngle = 270;

  // Convert to SVG arc
  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const start = polarToCartesian(cx, cy, r, startDeg);
    const end   = polarToCartesian(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  const bgArcEnd   = startAngle + sweepAngle;
  const fillEnd    = startAngle + (score / 100) * sweepAngle;
  const bgPath     = describeArc(cx, cy, R, startAngle, bgArcEnd);
  const fillPath   = describeArc(cx, cy, R, startAngle, fillEnd);

  const startPt = polarToCartesian(cx, cy, R + 14, startAngle);
  const endPt   = polarToCartesian(cx, cy, R + 14, bgArcEnd);

  return (
    <div
      className={`card ${level === 'critical' ? 'glow-critical' : level === 'warning' ? 'glow-warning' : ''}`}
      onClick={onClick}
      style={{
        padding: '20px 16px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        borderColor: level === 'critical' ? 'rgba(239,68,68,0.4)' : level === 'warning' ? 'rgba(245,158,11,0.3)' : 'var(--color-border)',
        transition: 'all 0.5s ease',
        userSelect: 'none',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Health score ${score}. Click for details.` : undefined}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
        CONVEYOR HEALTH
      </div>

      {/* SVG Gauge */}
      <svg width={220} height={140} style={{ overflow: 'visible' }}>
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="var(--color-industrial-500)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill arc */}
        <path
          d={fillPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'stroke 0.6s ease, d 0.6s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, fill: color, transition: 'fill 0.5s' }}>
          {score}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 600 }}>
          / 100
        </text>
        {/* Min/Max labels */}
        <text x={startPt.x} y={startPt.y + 2} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--color-text-dim)', fontWeight: 600 }}>0</text>
        <text x={endPt.x} y={endPt.y + 2} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--color-text-dim)', fontWeight: 600 }}>100</text>
      </svg>

      {/* Risk level badge & Fault label neatly spaced below SVG */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span className={`badge badge-${level}`} style={{ fontSize: 11, padding: '4px 12px' }}>
          <span className={`status-dot ${level === 'normal' ? 'online' : level === 'warning' ? 'warning' : 'critical'}`} />
          {label}
        </span>
        {primaryFault !== '—' && primaryFault !== 'No fault detected' && (
          <div style={{ fontSize: 11, color, textAlign: 'center', fontWeight: 700, maxWidth: 220, letterSpacing: '0.01em', lineHeight: 1.3 }}>
            {primaryFault}
          </div>
        )}
        {primaryFault === 'No fault detected' && (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            All parameters within normal range
          </div>
        )}
      </div>

      {onClick && (
        <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 4, fontWeight: 600, letterSpacing: '0.04em' }}>
          Click for explainability analysis →
        </div>
      )}
    </div>
  );
}
