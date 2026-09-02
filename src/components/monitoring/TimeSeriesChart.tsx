import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { TelemetrySnapshot, SensorKey } from '../../types/telemetry';
import { DEFAULT_BASELINE, SENSOR_META } from '../../types/telemetry';
import { formatTimestamp } from '../../utils/format';

interface TimeSeriesChartProps {
  sensorKey: SensorKey;
  data: TelemetrySnapshot[];
  color?: string;
  height?: number;
  showBaseline?: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label, unit }: TooltipProps & { unit: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div style={{
      background: 'var(--popover-bg)',
      border: '1px solid var(--popover-border)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 6,
      padding: '6px 10px',
      fontSize: 11,
    }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {value?.toFixed(3)} {unit}
      </div>
    </div>
  );
}

export default function TimeSeriesChart({ sensorKey, data, color, height = 200, showBaseline = true }: TimeSeriesChartProps) {
  const meta     = SENSOR_META[sensorKey];
  const baseline = DEFAULT_BASELINE[sensorKey];
  const chartColor = color ?? (
    sensorKey === 'rpm'         ? '#0891B2' :
    sensorKey === 'current'     ? '#D97706' :
    sensorKey === 'load'        ? '#8B5CF6' :
    sensorKey === 'vibration'   ? '#DC2626' :
    sensorKey === 'temperature' ? '#EA580C' :
    '#10B981'
  );

  const chartData = useMemo(() => {
    return data
      .filter(s => (s[sensorKey] as number) >= 0)
      .map(s => ({
        time: formatTimestamp(s.timestamp).split(' ')[0], // HH:MM:SS
        value: parseFloat((s[sensorKey] as number).toFixed(4)),
      }));
  }, [data, sensorKey]);

  const values = chartData.map(d => d.value);
  const min = values.length ? Math.min(...values) : baseline.min;
  const max = values.length ? Math.max(...values) : baseline.max;
  const domain: [number, number] = [
    Math.min(min, baseline.min) * 0.95,
    Math.max(max, baseline.max) * 1.05,
  ];

  if (chartData.length < 2) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 12,
        background: 'var(--color-industrial-800)',
        borderRadius: 6,
      }}>
        Waiting for data…
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={chartColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--grid-line-color)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 9, fill: 'var(--color-text-dim)' }}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <YAxis
          domain={domain}
          tick={{ fontSize: 9, fill: 'var(--color-text-dim)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(meta.decimals > 2 ? 2 : meta.decimals)}
        />
        <Tooltip content={<CustomTooltip unit={meta.unit} />} />

        {/* Normal operating band */}
        {showBaseline && (
          <>
            <ReferenceLine
              y={baseline.max}
              stroke="rgba(217,119,6,0.4)"
              strokeDasharray="4 3"
              label={{ value: `Max ${baseline.max}`, fill: 'var(--color-status-warning)', fontSize: 9, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={baseline.min}
              stroke="rgba(217,119,6,0.3)"
              strokeDasharray="4 3"
              label={{ value: `Min ${baseline.min}`, fill: 'var(--color-status-warning)', fontSize: 9, position: 'insideBottomRight' }}
            />
          </>
        )}

        <Area
          type="monotoneX"
          dataKey="value"
          stroke={chartColor}
          strokeWidth={1.5}
          fill={`url(#grad-${sensorKey})`}
          dot={false}
          activeDot={{ r: 3, fill: chartColor, stroke: 'var(--color-surface-card)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
