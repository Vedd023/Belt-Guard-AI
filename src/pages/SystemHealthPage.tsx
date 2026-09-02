import React from 'react';
import type { TelemetryState } from '../hooks/useTelemetry';
import { DEVICE_DEFINITIONS } from '../types/system';
import type { DeviceStatus } from '../types/system';
import { formatRelativeTime } from '../utils/format';
import { Cpu, Radio, Wifi, Camera, Activity, Zap, Gauge, Weight, Thermometer, Monitor, Volume2, AlertTriangle } from 'lucide-react';

interface SystemHealthPageProps {
  telemetry: TelemetryState;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  cpu:          <Cpu size={18} />,
  radio:        <Radio size={18} />,
  wifi:         <Wifi size={18} />,
  camera:       <Camera size={18} />,
  activity:     <Activity size={18} />,
  zap:          <Zap size={18} />,
  gauge:        <Gauge size={18} />,
  weight:       <Weight size={18} />,
  thermometer:  <Thermometer size={18} />,
  'monitor':    <Monitor size={18} />,
  'volume-2':   <Volume2 size={18} />,
};

export default function SystemHealthPage({ telemetry }: SystemHealthPageProps) {
  const { isCommsLost, isVibOffline, current } = telemetry;

  // Build live device statuses
  function getDeviceStatus(id: string): { status: DeviceStatus; lastSeen: Date | null; detail?: string } {
    if (isCommsLost) {
      if (['esp32', 'mqtt', 'wifi'].includes(id)) return { status: 'offline', lastSeen: null, detail: 'Communication lost' };
      return { status: 'unknown', lastSeen: null, detail: 'No data — comms lost' };
    }
    if (id === 'mpu6050' && isVibOffline) return { status: 'offline', lastSeen: null, detail: 'Sensor disconnected (demo)' };
    if (id === 'esp32')          return { status: 'online',  lastSeen: new Date(), detail: 'Heartbeat: 1.2s ago' };
    if (id === 'mqtt')           return { status: 'online',  lastSeen: new Date(), detail: 'Connected to broker' };
    if (id === 'wifi')           return { status: 'online',  lastSeen: new Date(), detail: 'RSSI: -52 dBm' };
    if (id === 'camera')         return { status: 'online',  lastSeen: new Date(), detail: 'Frame rate: 24 FPS' };
    if (id === 'oled')           return { status: 'online',  lastSeen: new Date(), detail: 'Displaying status' };
    if (id === 'buzzer')         return { status: 'online',  lastSeen: new Date(), detail: 'Standby' };
    return { status: 'online', lastSeen: new Date() };
  }

  const statusColor: Record<DeviceStatus, string> = {
    online:       'var(--color-status-normal)',
    offline:      'var(--color-status-critical)',
    degraded:     'var(--color-status-warning)',
    unknown:      'var(--color-status-offline)',
    disconnected: 'var(--color-status-critical)',
  };

  const statusDotClass: Record<DeviceStatus, string> = {
    online:       'online',
    offline:      'critical',
    degraded:     'warning',
    unknown:      'offline',
    disconnected: 'critical',
  };

  const statusLabel: Record<DeviceStatus, string> = {
    online:       'ONLINE',
    offline:      'OFFLINE',
    degraded:     'DEGRADED',
    unknown:      'UNKNOWN',
    disconnected: 'DISCONNECTED',
  };

  const allDevices = DEVICE_DEFINITIONS.map(def => ({
    ...def,
    ...getDeviceStatus(def.id),
  }));

  const onlineCount = allDevices.filter(d => d.status === 'online').length;
  const totalCount  = allDevices.length;

  const overallHealth = isCommsLost ? 'critical' : isVibOffline ? 'warning' : 'normal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>System Health</h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Hardware device connectivity and sensor status
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge badge-${overallHealth}`}>
            <span className={`status-dot ${overallHealth === 'normal' ? 'online' : overallHealth === 'warning' ? 'warning' : 'critical'}`} />
            {overallHealth === 'normal' ? 'ALL SYSTEMS ONLINE' : overallHealth === 'warning' ? 'PARTIAL FAULT' : 'SYSTEM FAULT'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {onlineCount}/{totalCount} devices
          </span>
        </div>
      </div>

      {/* Sensor disconnect warning */}
      {isVibOffline && !isCommsLost && (
        <div className="fade-in" style={{
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 8,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--color-status-warning)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-status-warning)', marginBottom: 4 }}>
              MPU6050 DISCONNECTED — Vibration data unavailable
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Mechanical fault detection confidence is <strong>reduced</strong> due to missing vibration sensor data.
              The system will not generate a false belt-damage alarm solely because this sensor is offline.
              Other sensors (Current, RPM, Camera) continue to provide fault evidence.
            </div>
          </div>
        </div>
      )}

      {isCommsLost && (
        <div className="fade-in glow-critical" style={{
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-status-critical)', marginBottom: 4 }}>
            🔴 COMMUNICATION LOSS — ESP32 / MQTT OFFLINE
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            All sensor data is stale. The dashboard shows last known values. Verify ESP32 power, Wi-Fi network connectivity, and MQTT broker status.
          </div>
        </div>
      )}

      {/* Device Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {allDevices.map(device => (
          <div
            key={device.id}
            className="card"
            style={{
              padding: '14px 16px',
              borderColor: device.status === 'offline' || device.status === 'disconnected'
                ? 'rgba(239,68,68,0.3)'
                : device.status === 'degraded'
                  ? 'rgba(245,158,11,0.25)'
                  : 'var(--color-border)',
              transition: 'border-color 0.4s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Icon */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: device.status === 'online'
                  ? 'rgba(16,185,129,0.1)'
                  : device.status === 'degraded'
                    ? 'rgba(245,158,11,0.1)'
                    : 'rgba(239,68,68,0.1)',
                color: statusColor[device.status],
                flexShrink: 0,
              }}>
                {ICON_MAP[device.icon] ?? <Cpu size={18} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  {device.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span className={`status-dot ${statusDotClass[device.status]}`} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[device.status], letterSpacing: '0.04em' }}>
                    {statusLabel[device.status]}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {device.detail ?? device.detail}
                </div>
                {device.lastSeen && (
                  <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4 }}>
                    Last seen: {formatRelativeTime(device.lastSeen)}
                  </div>
                )}
              </div>
            </div>

            {/* Type badge */}
            <div style={{ marginTop: 10, fontSize: 9, color: 'var(--color-text-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {device.type}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'ONLINE', cls: 'online', text: 'Operating normally' },
          { label: 'DEGRADED', cls: 'warning', text: 'Reduced performance' },
          { label: 'OFFLINE', cls: 'critical', text: 'Not communicating' },
          { label: 'UNKNOWN', cls: 'offline', text: 'Status not available' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`status-dot ${l.cls}`} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>{l.label}</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>— {l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
