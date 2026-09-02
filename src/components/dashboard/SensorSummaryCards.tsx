import React, { useMemo } from 'react';
import type { TelemetrySnapshot } from '../../types/telemetry';
import { DEFAULT_BASELINE, SENSOR_META, type SensorKey } from '../../types/telemetry';
import { formatSensorValue } from '../../utils/format';

// We'll use a simple SVG sparkline since react-sparklines might not be installed
// Drawing our own minimal sparkline

function MiniSparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const w = 80;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = pts.join(' ');
  // Area fill
  const area = `0,${h} ${polyline} ${w},${h}`;

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface SensorCardProps {
  sensorKey: SensorKey;
  snapshot: TelemetrySnapshot | null;
  history: TelemetrySnapshot[];
  isOffline?: boolean;
}

function SensorCard({ sensorKey, snapshot, history, isOffline }: SensorCardProps) {
  const meta     = SENSOR_META[sensorKey];
  const baseline = DEFAULT_BASELINE[sensorKey];
  const value    = snapshot ? snapshot[sensorKey] : null;
  const isNA     = value === null || value === -1 || isOffline;

  const sparkData = useMemo(() => {
    const last60 = history.slice(-50);
    return last60
      .map(s => s[sensorKey] as number)
      .filter(v => v >= 0);
  }, [history, sensorKey]);

  const isAbnormal = !isNA && value !== null && (
    (value < baseline.min || value > baseline.max)
  );
  const isWarning = isAbnormal && !isNA;

  const color = isNA
    ? 'var(--color-status-offline)'
    : isWarning
      ? 'var(--color-status-warning)'
      : 'var(--color-status-normal)';

  const displayVal = isNA
    ? '—'
    : formatSensorValue(value as number, meta.decimals, meta.unit);

  const statusLabel = isNA
    ? 'OFFLINE'
    : isWarning
      ? 'ABOVE BASELINE'
      : 'NORMAL';

  const statusClass = isNA ? 'badge-offline' : isWarning ? 'badge-warning' : 'badge-normal';

  const deviationPct = isNA || value === null ? null : (
    value < baseline.min
      ? ((baseline.min - value) / baseline.min * 100)
      : value > baseline.max
        ? ((value - baseline.max) / baseline.max * 100)
        : 0
  );

  return (
    <div
      className="card"
      style={{
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderColor: isWarning ? 'rgba(245,158,11,0.25)' : isNA ? 'rgba(107,114,128,0.2)' : 'var(--color-border)',
        transition: 'border-color 0.4s ease',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {meta.label}
        </span>
        <span className={`badge ${statusClass}`} style={{ fontSize: 9 }}>
          {statusLabel}
        </span>
      </div>

      {/* Value + Sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div className="metric-value" style={{ fontSize: 26, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
            {displayVal}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
            {isNA ? 'No data' : meta.unit}
            {isWarning && deviationPct !== null && deviationPct > 0 && (
              <span style={{ color: 'var(--color-status-warning)', marginLeft: 4 }}>
                +{deviationPct.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        {sparkData.length > 2 && (
          <MiniSparkline data={sparkData} color={color} height={32} />
        )}
      </div>

      {/* Baseline */}
      <div style={{ fontSize: 10, color: 'var(--color-text-dim)', display: 'flex', gap: 4, alignItems: 'center' }}>
        <span>Baseline:</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          {sensorKey === 'beltOffset'
            ? `±${baseline.max} ${meta.unit}`
            : `${baseline.min}–${baseline.max} ${meta.unit}`
          }
        </span>
      </div>
    </div>
  );
}

interface SensorSummaryCardsProps {
  snapshot: TelemetrySnapshot | null;
  history: TelemetrySnapshot[];
  isVibOffline: boolean;
}

const SENSOR_ORDER: SensorKey[] = ['rpm', 'current', 'load', 'temperature', 'vibration', 'beltOffset'];

export default function SensorSummaryCards({ snapshot, history, isVibOffline }: SensorSummaryCardsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 12,
    }}>
      {SENSOR_ORDER.map(key => (
        <SensorCard
          key={key}
          sensorKey={key}
          snapshot={snapshot}
          history={history}
          isOffline={key === 'vibration' && isVibOffline}
        />
      ))}
    </div>
  );
}
