import { useState, useMemo } from 'react';
import type { TelemetryState } from '../hooks/useTelemetry';
import TimeSeriesChart from '../components/monitoring/TimeSeriesChart';
import { DEFAULT_BASELINE, SENSOR_META, type SensorKey } from '../types/telemetry';
import { formatSensorValue } from '../utils/format';
import { Play, Pause } from 'lucide-react';

interface LiveMonitoringPageProps {
  telemetry: TelemetryState;
  togglePause?: () => void;
}

type TimeRange = 60 | 300 | 1800 | 3600;

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 60,   label: '1m'  },
  { value: 300,  label: '5m'  },
  { value: 1800, label: '30m' },
  { value: 3600, label: '1h'  },
];

const SENSOR_KEYS: SensorKey[] = ['rpm', 'current', 'load', 'vibration', 'temperature', 'beltOffset'];

export default function LiveMonitoringPage({ telemetry, togglePause }: LiveMonitoringPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(300);
  const { current, history, isPaused, isVibOffline, isCommsLost } = telemetry;

  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - timeRange * 1000;
    return history.filter(s => s.timestamp.getTime() >= cutoff);
  }, [history, timeRange]);

  function getSensorStats(key: SensorKey) {
    const vals = filteredHistory
      .map(s => s[key] as number)
      .filter(v => v >= 0);
    if (vals.length === 0) return null;
    return {
      min: Math.min(...vals).toFixed(SENSOR_META[key].decimals),
      max: Math.max(...vals).toFixed(SENSOR_META[key].decimals),
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(SENSOR_META[key].decimals),
      current: current ? formatSensorValue(current[key] as number, SENSOR_META[key].decimals, SENSOR_META[key].unit) : '—',
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Live Sensor Monitoring
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Real-time time-series data with normal operating baseline reference
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Time range selector */}
          <div style={{ display: 'flex', background: 'var(--color-industrial-800)', border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden' }}>
            {TIME_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setTimeRange(r.value)}
                style={{
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: timeRange === r.value ? 'var(--color-accent)' : 'transparent',
                  color: timeRange === r.value ? '#000' : 'var(--color-text-muted)',
                  transition: 'all 0.15s',
                }}
                aria-pressed={timeRange === r.value}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            className={`btn btn-ghost btn-sm`}
            onClick={togglePause}
            aria-label={isPaused ? 'Resume data stream' : 'Pause data stream'}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {isPaused && (
            <span className="badge badge-warning">PAUSED</span>
          )}
          <span className="badge badge-demo">⚗ DEMO DATA</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 16 }}>
        {SENSOR_KEYS.map(key => {
          const meta  = SENSOR_META[key];
          const bl    = DEFAULT_BASELINE[key];
          const stats = getSensorStats(key);
          const isOff = (key === 'vibration' && isVibOffline) || isCommsLost;

          return (
            <div key={key} className="card" style={{ padding: '14px 16px' }}>
              {/* Chart header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{meta.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {isOff ? 'Sensor offline' : `Baseline: ${key === 'beltOffset' ? `±${bl.max}` : `${bl.min}–${bl.max}`} ${meta.unit}`}
                  </div>
                </div>
                {/* Current value */}
                <div style={{ textAlign: 'right' }}>
                  <div className="metric-value" style={{
                    fontSize: 20,
                    color: isOff ? 'var(--color-text-dim)' : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {stats?.current ?? '—'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {isOff ? 'OFFLINE' : meta.unit}
                  </div>
                </div>
              </div>

              {/* Chart */}
              {isOff ? (
                <div style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-industrial-800)',
                  borderRadius: 6,
                  color: 'var(--color-text-muted)',
                  fontSize: 12,
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <span style={{ fontSize: 20 }}>⊘</span>
                  Sensor offline — data unavailable
                </div>
              ) : (
                <TimeSeriesChart
                  sensorKey={key}
                  data={filteredHistory}
                  height={160}
                  showBaseline
                />
              )}

              {/* Stats bar */}
              {stats && !isOff && (
                <div style={{
                  display: 'flex',
                  gap: 0,
                  marginTop: 10,
                  background: 'var(--color-industrial-800)',
                  borderRadius: 5,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}>
                  {[
                    { label: 'MIN',  value: stats.min  },
                    { label: 'MAX',  value: stats.max  },
                    { label: 'AVG',  value: stats.avg  },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div style={{ fontSize: 9, color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Baseline Comparison Table */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>NORMAL OPERATING BASELINE — Current vs. Baseline</div>
        <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginBottom: 12 }}>
          Baseline values are configurable prototype parameters, not scientifically validated.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Sensor</th>
                <th style={{ width: '18%' }}>Current</th>
                <th style={{ width: '24%' }}>Baseline Range</th>
                <th style={{ width: '16%' }}>Deviation</th>
                <th style={{ width: '20%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {SENSOR_KEYS.map(key => {
                const meta  = SENSOR_META[key];
                const bl    = DEFAULT_BASELINE[key];
                const val   = current ? current[key] as number : null;
                const isOff = (key === 'vibration' && isVibOffline) || isCommsLost || val === -1;
                const above = !isOff && val !== null && val > bl.max;
                const below = !isOff && val !== null && val < bl.min;
                const isAb  = above || below;

                return (
                  <tr key={key}>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 600, paddingRight: 16 }}>{meta.label}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: isOff ? 'var(--color-text-dim)' : isAb ? 'var(--color-status-warning)' : 'var(--color-text-secondary)', paddingRight: 16 }}>
                      {isOff ? '—' : val !== null ? formatSensorValue(val, meta.decimals, meta.unit) : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', paddingRight: 16 }}>
                      {key === 'beltOffset' ? `±${bl.max} ${meta.unit}` : `${bl.min}–${bl.max} ${meta.unit}`}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: isOff ? 'var(--color-text-dim)' : isAb ? 'var(--color-status-warning)' : 'var(--color-text-muted)', paddingRight: 16 }}>
                      {isOff ? 'N/A' : isAb
                        ? `${above ? '+' : ''}${val !== null ? ((above ? (val - bl.max) : (bl.min - val)) / bl.max * 100).toFixed(1) : 0}%`
                        : '0%'
                      }
                    </td>
                    <td>
                      <span className={`badge ${isOff ? 'badge-offline' : isAb ? 'badge-warning' : 'badge-normal'}`}>
                        {isOff ? 'OFFLINE' : isAb ? (above ? 'ABOVE BASELINE' : 'BELOW BASELINE') : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
