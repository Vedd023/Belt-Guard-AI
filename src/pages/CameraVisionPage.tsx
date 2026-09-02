import React from 'react';
import type { TelemetryState } from '../hooks/useTelemetry';
import VisionCanvasFeed from '../components/vision/VisionCanvasFeed';
import { DEFAULT_BASELINE } from '../types/telemetry';
import { Camera, Eye, Crosshair, Layers, Cpu } from 'lucide-react';

interface CameraVisionPageProps {
  telemetry: TelemetryState;
}

export default function CameraVisionPage({ telemetry }: CameraVisionPageProps) {
  const { current, isCommsLost } = telemetry;
  const beltOffset = current?.beltOffset ?? 0;
  const baseline   = DEFAULT_BASELINE.beltOffset;
  const isWarning  = Math.abs(beltOffset) > baseline.max;
  const isCritical = Math.abs(beltOffset) > baseline.max * 2.5;
  const alignState = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'ALIGNED';
  const alignColor = isCritical ? 'var(--color-status-critical)' : isWarning ? 'var(--color-status-warning)' : 'var(--color-status-normal)';
  const confidence = isCommsLost ? 0 : Math.max(0.75, 1 - Math.abs(beltOffset) / 60);

  // Ruler: map offset to pixels for ruler
  const MAX_OFFSET_PX   = 30;
  const RULER_W         = 400;
  const rulerCenter     = RULER_W / 2;
  const rulerFillOffset = Math.min(Math.abs(beltOffset) / MAX_OFFSET_PX, 1) * (RULER_W / 2 - 20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Camera Vision & Belt Tracking
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Computer vision belt alignment monitoring — demo simulated feed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge badge-${alignState === 'ALIGNED' ? 'normal' : alignState === 'WARNING' ? 'warning' : 'critical'}`}>
            <span className={`status-dot ${alignState === 'ALIGNED' ? 'online' : alignState === 'WARNING' ? 'warning' : 'critical'}`} />
            {alignState}
          </span>
          <span className="badge badge-demo">⚗ SIMULATED FEED</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Camera Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={14} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>Live Camera Feed</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Future: RTSP / MJPEG / WebSocket stream
              </div>
            </div>
            <VisionCanvasFeed
              beltOffset={beltOffset}
              isOffline={isCommsLost}
              confidence={confidence}
            />
          </div>

          {/* Alignment Ruler */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Crosshair size={14} style={{ color: 'var(--color-accent)' }} />
              <span className="section-title">BELT ALIGNMENT MEASUREMENT</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-muted)' }}>
                <span>← LEFT</span>
                <span style={{ color: 'var(--color-status-normal)', fontWeight: 700 }}>EXPECTED CENTER</span>
                <span>RIGHT →</span>
              </div>

              {/* Ruler track */}
              <div style={{ position: 'relative', height: 40, background: 'var(--color-industrial-800)', borderRadius: 6, border: '1px solid var(--color-border)', overflow: 'visible' }}>
                {/* Tick marks */}
                {[-3, -2, -1, 0, 1, 2, 3].map(n => (
                  <div key={n} style={{
                    position: 'absolute',
                    left: `${50 + n * (100/6)}%`,
                    top: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    <div style={{ width: 1, height: n === 0 ? 40 : 10, background: n === 0 ? 'rgba(16,185,129,0.7)' : 'var(--color-border)', marginBottom: 0 }} />
                  </div>
                ))}

                {/* Fill bar showing offset */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: beltOffset >= 0 ? '50%' : `calc(50% - ${rulerFillOffset}px)`,
                  width: rulerFillOffset,
                  height: 6,
                  background: alignColor,
                  borderRadius: 3,
                  opacity: 0.7,
                  transition: 'all 0.5s ease',
                }} />

                {/* Indicator dot */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: `calc(50% + ${Math.sign(beltOffset) * rulerFillOffset}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: alignColor,
                  border: '2px solid var(--color-surface-card)',
                  boxShadow: `0 0 8px ${alignColor}`,
                  transition: 'all 0.5s ease',
                }} />
              </div>

              {/* Tick labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)', padding: '0 2px' }}>
                {['-30', '-20', '-10', '0', '+10', '+20', '+30'].map(l => (
                  <span key={l} style={{ color: l === '0' ? 'var(--color-status-normal)' : undefined }}>{l}</span>
                ))}
              </div>

              {/* Current offset readout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 4 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>DETECTED OFFSET</div>
                  <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', fontWeight: 800, color: alignColor, marginTop: 2 }}>
                    {beltOffset > 0 ? '+' : ''}{beltOffset.toFixed(0)} px
                  </div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--color-border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>ALIGNMENT STATUS</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: alignColor, letterSpacing: '0.06em', marginTop: 4 }}>
                    {alignState}
                  </div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--color-border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>THRESHOLD</div>
                  <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    ±{DEFAULT_BASELINE.beltOffset.max} px
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Vision Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Detection Status */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-title" style={{ marginBottom: 12 }}>DETECTION STATUS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Camera', value: isCommsLost ? 'Offline' : 'Online', status: isCommsLost ? 'offline' : 'online' },
                { label: 'Belt Tracking', value: isCommsLost ? 'Inactive' : 'Active', status: isCommsLost ? 'offline' : 'online' },
                { label: 'Alignment', value: alignState, status: alignState === 'ALIGNED' ? 'online' : alignState === 'WARNING' ? 'warning' : 'critical' },
                { label: 'Confidence', value: `${(confidence * 100).toFixed(0)}%`, status: confidence > 0.8 ? 'online' : 'warning' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className={`status-dot ${item.status}`} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      color: item.status === 'offline' ? 'var(--color-status-offline)' :
                             item.status === 'warning'  ? 'var(--color-status-warning)'  :
                             item.status === 'critical' ? 'var(--color-status-critical)' : 'var(--color-status-normal)',
                    }}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vision Metrics */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Eye size={13} style={{ color: 'var(--color-accent)' }} />
              <span className="section-title">VISION METRICS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Frame Rate', value: isCommsLost ? '—' : '24 FPS' },
                { label: 'Resolution', value: '640 × 360' },
                { label: 'Latency', value: isCommsLost ? '—' : '~42 ms' },
                { label: 'ROI', value: '320 × 200 px' },
                { label: 'Edge Model', value: 'OpenCV Canny' },
                { label: 'Tracking', value: 'Centroid' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alignment Zones */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-title" style={{ marginBottom: 12 }}>ALIGNMENT ZONES</div>
            {[
              { label: 'Normal', range: '±5 px', color: 'var(--color-status-normal)', badgeClass: 'badge-normal' },
              { label: 'Warning', range: '±5–12 px', color: 'var(--color-status-warning)', badgeClass: 'badge-warning' },
              { label: 'Critical', range: '>±12 px', color: 'var(--color-status-critical)', badgeClass: 'badge-critical' },
            ].map(z => (
              <div key={z.label} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 8px',
                marginBottom: 6,
                background: 'var(--color-industrial-800)',
                borderRadius: 5,
                border: `1px solid ${Math.abs(beltOffset) > 12 && z.label === 'Critical' ? z.color + '40' : Math.abs(beltOffset) > 5 && z.label === 'Warning' ? z.color + '30' : 'var(--color-border)'}`,
              }}>
                <span className={`badge ${z.badgeClass}`} style={{ fontSize: 9 }}>{z.label}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{z.range}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4 }}>
              Thresholds are configurable prototype parameters.
            </div>
          </div>

          {/* Architecture note */}
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Cpu size={12} style={{ color: 'var(--color-text-muted)' }} />
              <span className="section-title">PIPELINE</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', lineHeight: 1.6 }}>
              ESP32 Camera → MQTT → Python Backend → OpenCV → Belt Edge Detection → Offset Calculation → WebSocket → Dashboard
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['OpenCV', 'Canny Edge', 'Contour Tracking', 'Centroid Calc.'].map(t => (
                <span key={t} style={{ fontSize: 9, padding: '2px 6px', background: 'var(--color-industrial-700)', borderRadius: 4, color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
