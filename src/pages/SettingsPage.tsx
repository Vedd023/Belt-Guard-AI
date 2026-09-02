import React, { useState } from 'react';
import { DEFAULT_BASELINE } from '../types/telemetry';
import { Settings, Sliders, Bell, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [thresholds, setThresholds] = useState({
    vibration:   DEFAULT_BASELINE.vibration.max,
    current:     DEFAULT_BASELINE.current.max,
    temperature: DEFAULT_BASELINE.temperature.max,
    beltOffset:  DEFAULT_BASELINE.beltOffset.max,
    load:        DEFAULT_BASELINE.load.max,
  });
  const [apiUrl,      setApiUrl]      = useState('http://localhost:8000');
  const [wsUrl,       setWsUrl]       = useState('ws://localhost:8000/ws/telemetry');
  const [refreshMs,   setRefreshMs]   = useState('1200');
  const [conveyorName, setConveyorName] = useState('Conveyor #01');
  const [conveyorId,   setConveyorId]   = useState('conv-01');
  const [motorType,    setMotorType]    = useState('DC Geared Motor');
  const [rpmRange,     setRpmRange]     = useState('115–125 RPM');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function labeledInput(label: string, value: string, onChange: (v: string) => void, hint?: string) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>{label}</label>
        <input className="input-field" value={value} onChange={e => onChange(e.target.value)} />
        {hint && <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{hint}</span>}
      </div>
    );
  }

  function thresholdRow(label: string, key: keyof typeof thresholds, unit: string, min: number, max: number) {
    return (
      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>{label}</label>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent)' }}>
            {thresholds[key]} {unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={(max - min) / 100}
          value={thresholds[key]}
          onChange={e => setThresholds(t => ({ ...t, [key]: parseFloat(e.target.value) }))}
          style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
          aria-label={`${label} threshold`}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--color-text-dim)' }}>
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Settings</h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Configure thresholds, appearance theme, conveyor parameters, notifications, and connectivity
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          aria-label="Save settings"
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Appearance / Theme */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sun size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">APPEARANCE & THEME</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 14 }}>
            Select your preferred visual dashboard theme. Default is Light Mode.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                borderRadius: 8,
                background: theme === 'light' ? 'rgba(8,145,178,0.12)' : 'var(--color-industrial-800)',
                border: `2px solid ${theme === 'light' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                color: theme === 'light' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sun size={16} />
              ☀ Light Mode
            </button>

            <button
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                borderRadius: 8,
                background: theme === 'dark' ? 'rgba(6,182,212,0.15)' : 'var(--color-industrial-800)',
                border: `2px solid ${theme === 'dark' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                color: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Moon size={16} />
              🌙 Dark Mode
            </button>
          </div>
        </div>

        {/* Conveyor Config */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Settings size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">CONVEYOR CONFIGURATION</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {labeledInput('Conveyor Name', conveyorName, setConveyorName)}
            {labeledInput('Conveyor ID', conveyorId, setConveyorId)}
            {labeledInput('Motor Type', motorType, setMotorType)}
            {labeledInput('RPM Range', rpmRange, setRpmRange, 'e.g. 115–125 RPM')}
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sliders size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">ALERT THRESHOLDS</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginBottom: 14 }}>
            These are configurable prototype parameters. Adjust based on your conveyor specifications.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {thresholdRow('Vibration Max',    'vibration',   'RMS',  0.10, 1.0)}
            {thresholdRow('Current Max',      'current',     'A',    1.0,  5.0)}
            {thresholdRow('Temperature Max',  'temperature', '°C',   35,   90)}
            {thresholdRow('Belt Offset Max',  'beltOffset',  'px',   2,    30)}
            {thresholdRow('Load Max',         'load',        'kg',   1,    15)}
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bell size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">NOTIFICATION SETTINGS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Browser Notifications', id: 'browser-notif', defaultChecked: true },
              { label: 'Buzzer Control (via MQTT command)', id: 'buzzer-ctrl', defaultChecked: false },
              { label: 'Critical Alert Sound', id: 'critical-sound', defaultChecked: true },
              { label: 'Warning Alert Sound', id: 'warning-sound', defaultChecked: false },
            ].map(opt => (
              <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor={opt.id} style={{ fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  {opt.label}
                </label>
                <input
                  type="checkbox"
                  id={opt.id}
                  defaultChecked={opt.defaultChecked}
                  style={{ accentColor: 'var(--color-accent)', width: 16, height: 16, cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 10, color: 'var(--color-text-dim)' }}>
            ⚗ Buzzer control via MQTT requires backend connectivity.
          </div>
        </div>

        {/* System / Connectivity */}
        <div className="card" style={{ padding: '16px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Globe size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="section-title">SYSTEM & CONNECTIVITY</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {labeledInput('Backend API URL', apiUrl, setApiUrl, 'GET /api/conveyor/status, /telemetry')}
            {labeledInput('WebSocket URL',   wsUrl,  setWsUrl,  '/ws/telemetry — real-time feed')}
            {labeledInput('Update Interval (ms)', refreshMs, setRefreshMs, 'Current: 1200ms')}
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 14px', background: 'var(--color-accent-dim)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
        ⚗ Theme preference is saved locally in your browser. Connected backend saves settings to PostgreSQL.
      </div>
    </div>
  );
}
