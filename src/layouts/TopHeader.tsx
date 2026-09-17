import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  Bell,
  Download,
  FlaskConical,
  Power,
  Play,
  Square,
  Gauge,
  Loader2,
  CheckCircle,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import type { RiskAnalysis } from '../services/riskEngine';
import type { Notification } from '../types/events';
import type {
  ConveyorId,
  SystemPower,
  ConveyorState,
  AccelerationRate,
} from '../types/telemetry';
import { CONVEYOR_PROFILES, getAlignmentInfo } from '../types/telemetry';
import { secsSinceUpdate } from '../utils/format';
import NotificationPanel from '../components/common/NotificationPanel';
import DemoModePanel from '../components/common/DemoModePanel';
import type { ScenarioId } from '../types/scenarios';

interface TopHeaderProps {
  pageTitle: string;
  riskAnalysis: RiskAnalysis | null;
  lastUpdateMs: number;
  notifications: Notification[];
  unreadCount: number;
  scenario: ScenarioId;
  onScenarioChange: (id: ScenarioId) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onExportTelemetry: () => void;

  // Control Props
  systemPower: SystemPower;
  startingStep: string;
  conveyorState: ConveyorState;
  selectedConveyorId: ConveyorId;
  acceleration: AccelerationRate;
  beltOffset: number;
  onConveyorChange: (id: ConveyorId) => void;
  onPowerToggle: (power: SystemPower) => void;
  onConveyorStateChange: (state: ConveyorState) => void;
  onAccelerationChange: (acc: AccelerationRate) => void;

  // Theme
  theme: Theme;
  onThemeToggle: () => void;
}

export default function TopHeader({
  pageTitle,
  riskAnalysis,
  lastUpdateMs,
  notifications,
  unreadCount,
  scenario,
  onScenarioChange,
  onMarkAllRead,
  onMarkRead,
  onExportTelemetry,

  systemPower,
  startingStep,
  conveyorState,
  selectedConveyorId,
  acceleration,
  beltOffset,
  onConveyorChange,
  onPowerToggle,
  onConveyorStateChange,
  onAccelerationChange,

  theme,
  onThemeToggle,
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showConveyorDropdown, setShowConveyorDropdown] = useState(false);
  const [showAccDropdown, setShowAccDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [ageSecs, setAgeSecs] = useState('—');

  useEffect(() => {
    if (!lastUpdateMs) return;
    const interval = setInterval(() => {
      setAgeSecs(secsSinceUpdate(lastUpdateMs));
    }, 500);
    return () => clearInterval(interval);
  }, [lastUpdateMs]);

  const alignInfo = getAlignmentInfo(systemPower === 'OFF' ? 0 : beltOffset);
  const activeConveyor = CONVEYOR_PROFILES[selectedConveyorId];

  return (
    <header
      style={{
        height: 60,
        background: 'var(--color-industrial-850)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Page Title */}
      <h1 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.01em', flexShrink: 0 }}>
        {pageTitle}
      </h1>

      <div style={{ flex: 1 }} />

      {/* 1. Conveyor Selector Dropdown */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => {
            setShowConveyorDropdown(!showConveyorDropdown);
            setShowAccDropdown(false);
            setShowNotifications(false);
            setShowDemo(false);
            setShowAccountDropdown(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-industrial-750)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '5px 10px',
            color: 'var(--color-text-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Select active conveyor"
          aria-label={`Selected: ${activeConveyor.name}`}
        >
          {activeConveyor.name}
          <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
        </button>

        {showConveyorDropdown && (
          <div
            className="fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              width: 175,
              background: 'var(--popover-bg)',
              border: '1px solid var(--popover-border)',
              borderRadius: 8,
              boxShadow: 'var(--popover-shadow)',
              zIndex: 1000,
              padding: 4,
            }}
          >
            {(Object.keys(CONVEYOR_PROFILES) as ConveyorId[]).map(id => {
              const isSelected = selectedConveyorId === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    onConveyorChange(id);
                    setShowConveyorDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: isSelected ? 'var(--color-accent-dim)' : 'transparent',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {CONVEYOR_PROFILES[id].name}
                  {isSelected && <CheckCircle size={13} style={{ color: 'var(--color-accent)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. System ON / OFF Power Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {systemPower === 'OFF' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onPowerToggle('ONLINE')}
            style={{
              background: 'rgba(239,68,68,0.1)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: 'var(--color-status-critical)',
            }}
            title="Initialize the monitoring system"
            aria-label="Turn System ON"
          >
            <Power size={13} />
            SYSTEM OFF
          </button>
        )}

        {systemPower === 'STARTING' && (
          <div
            className="badge badge-warning"
            style={{ fontSize: 11, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
            title={startingStep}
          >
            <Loader2 size={13} className="animate-spin" />
            STARTING...
          </div>
        )}

        {systemPower === 'ONLINE' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onPowerToggle('OFF')}
            style={{
              background: 'rgba(16,185,129,0.12)',
              borderColor: 'rgba(16,185,129,0.3)',
              color: 'var(--color-status-normal)',
            }}
            title="Click to turn System OFF"
            aria-label="System is ON. Click to turn OFF."
          >
            <Power size={13} />
            SYSTEM ON
          </button>
        )}
      </div>

      {/* 3. ▶ START / ■ STOP Button */}
      <div style={{ flexShrink: 0 }}>
        {conveyorState === 'RUNNING' ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onConveyorStateChange('STOPPED')}
            disabled={systemPower !== 'ONLINE'}
            title="Stop selected conveyor"
            aria-label="Stop conveyor"
          >
            <Square size={12} fill="currentColor" />
            STOP
          </button>
        ) : conveyorState === 'STARTING' ? (
          <button className="btn btn-warning btn-sm" disabled>
            <Loader2 size={12} className="animate-spin" />
            STARTING...
          </button>
        ) : conveyorState === 'STOPPING' ? (
          <button className="btn btn-warning btn-sm" disabled>
            <Loader2 size={12} className="animate-spin" />
            STOPPING...
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onConveyorStateChange('RUNNING')}
            disabled={systemPower !== 'ONLINE'}
            style={{
              opacity: systemPower !== 'ONLINE' ? 0.4 : 1,
              cursor: systemPower !== 'ONLINE' ? 'not-allowed' : 'pointer',
            }}
            title={systemPower !== 'ONLINE' ? 'Turn System ON first' : 'Start selected conveyor'}
            aria-label="Start conveyor"
          >
            <Play size={12} fill="currentColor" />
            START
          </button>
        )}
      </div>

      {/* 4. Dynamic Running Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {systemPower === 'OFF' ? (
          <span className="badge badge-offline" style={{ fontSize: 10 }}>⚪ OFF</span>
        ) : systemPower === 'STARTING' ? (
          <span className="badge badge-warning" style={{ fontSize: 10 }}>🟡 CONNECTING</span>
        ) : conveyorState === 'RUNNING' ? (
          <span className="badge badge-normal" style={{ fontSize: 10 }}>🟢 RUNNING</span>
        ) : conveyorState === 'STARTING' || conveyorState === 'STOPPING' ? (
          <span className="badge badge-warning" style={{ fontSize: 10 }}>🟡 TRANSITION</span>
        ) : (
          <span className="badge badge-critical" style={{ fontSize: 10 }}>🔴 STOPPED</span>
        )}
      </div>

      {/* 5. Belt Alignment Status */}
      <div style={{ flexShrink: 0 }}>
        <span className={alignInfo.badgeClass} style={{ fontSize: 10 }}>
          {alignInfo.label}
        </span>
      </div>

      {/* 6. ACC (Acceleration) Control */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => {
            setShowAccDropdown(!showAccDropdown);
            setShowConveyorDropdown(false);
            setShowNotifications(false);
            setShowDemo(false);
            setShowAccountDropdown(false);
          }}
          className="btn btn-ghost btn-sm"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
          title="Controls simulation acceleration rate"
          aria-label={`Acceleration: ${acceleration}x`}
        >
          <Gauge size={12} />
          ACC: {acceleration}x
          <ChevronDown size={11} />
        </button>

        {showAccDropdown && (
          <div
            className="fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              width: 155,
              background: 'var(--popover-bg)',
              border: '1px solid var(--popover-border)',
              borderRadius: 8,
              boxShadow: 'var(--popover-shadow)',
              zIndex: 1000,
              padding: 4,
            }}
          >
            <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, padding: '4px 8px 6px', letterSpacing: '0.06em' }}>
              ACCELERATION RATE
            </div>
            {([0.5, 1, 1.5, 2] as AccelerationRate[]).map(acc => {
              const isSelected = acceleration === acc;
              return (
                <button
                  key={acc}
                  onClick={() => {
                    onAccelerationChange(acc);
                    setShowAccDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 5,
                    background: isSelected ? 'var(--color-accent-dim)' : 'transparent',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    border: 'none',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {acc}x {acc === 1 ? '(Normal)' : acc === 0.5 ? '(Slower)' : '(Faster)'}
                  {isSelected && <CheckCircle size={12} style={{ color: 'var(--color-accent)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Last Update */}
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>
        <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {systemPower === 'OFF' ? '—' : ageSecs}
        </span>
      </div>

      {/* Demo Mode Button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setShowDemo(!showDemo);
            setShowNotifications(false);
            setShowConveyorDropdown(false);
            setShowAccDropdown(false);
            setShowAccountDropdown(false);
          }}
          style={{ borderColor: showDemo ? 'var(--color-accent)' : undefined, color: showDemo ? 'var(--color-accent)' : undefined }}
          aria-label="Open demo mode"
        >
          <FlaskConical size={12} />
          DEMO MODE
          {scenario !== 'normal' && (
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', marginLeft: 2 }} />
          )}
        </button>
        {showDemo && (
          <DemoModePanel
            current={scenario}
            onSelect={(id) => { onScenarioChange(id); setShowDemo(false); }}
            onClose={() => setShowDemo(false)}
          />
        )}
      </div>

      {/* Export */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={onExportTelemetry}
        title="Export telemetry as CSV"
        aria-label="Export telemetry CSV"
      >
        <Download size={12} />
      </button>

      {/* Dark / Light Mode Toggle */}
      <button
        onClick={onThemeToggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 20,
          border: '1px solid var(--color-border)',
          background: theme === 'dark'
            ? 'rgba(6,182,212,0.1)'
            : 'rgba(234,179,8,0.12)',
          color: theme === 'dark' ? 'var(--color-accent)' : '#B45309',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.03em',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        {theme === 'dark'
          ? <><Sun size={13} /> LIGHT</>
          : <><Moon size={13} /> DARK</>
        }
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowDemo(false);
            setShowConveyorDropdown(false);
            setShowAccDropdown(false);
            setShowAccountDropdown(false);
          }}
          style={{ position: 'relative', borderColor: showNotifications ? 'var(--color-accent)' : undefined }}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: 'var(--color-status-warning)',
                color: '#FFFFFF',
                borderRadius: 999,
                fontSize: 9,
                fontWeight: 700,
                padding: '1px 4px',
                minWidth: 14,
                textAlign: 'center',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </div>

      {/* Account Button & Isolated Portal Popover */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setShowAccountDropdown(!showAccountDropdown);
            setShowNotifications(false);
            setShowDemo(false);
            setShowConveyorDropdown(false);
            setShowAccDropdown(false);
          }}
          style={{
            gap: 8,
            borderColor: showAccountDropdown ? 'var(--color-accent)' : undefined,
            color: showAccountDropdown ? 'var(--color-accent)' : undefined,
          }}
          aria-label="Account profile menu"
          title="Account & User Settings"
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0891B2, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            OP
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>Account</span>
          <ChevronDown size={11} style={{ color: 'var(--color-text-muted)' }} />
        </button>

        {showAccountDropdown && createPortal(
          <>
            {/* Backdrop to capture outside clicks */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: 'rgba(0, 0, 0, 0.3)',
              }}
              onClick={() => setShowAccountDropdown(false)}
              aria-hidden="true"
            />

            {/* Top-Right Fixed Account Panel with Theme CSS Variables */}
            <div
              className="fade-in"
              role="dialog"
              aria-label="Account details"
              style={{
                position: 'fixed',
                top: 64,
                right: 20,
                width: 250,
                background: 'var(--popover-bg)',
                border: '1px solid var(--popover-border)',
                borderRadius: 14,
                boxShadow: 'var(--popover-shadow)',
                zIndex: 10000,
                overflow: 'hidden',
                color: 'var(--color-text-primary)',
              }}
            >
              {/* Account Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--popover-header-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0891B2, #2563EB)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}>
                    OP
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Operator #42</div>
                    <div style={{ fontSize: 10, color: 'var(--color-accent)', fontWeight: 600, marginTop: 1 }}>Plant Maintenance Eng.</div>
                  </div>
                </div>
              </div>

              {/* Account Info Details */}
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid var(--color-border)', background: 'var(--popover-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Project:</span>
                  <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>SIH26008</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>Control Center #1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Session:</span>
                  <span className="badge badge-normal" style={{ fontSize: 8, padding: '1px 6px' }}>
                    ● ACTIVE
                  </span>
                </div>
              </div>

              {/* Account Actions */}
              <div style={{ padding: 6, background: 'var(--popover-bg)' }}>
                <div style={{ fontSize: 9, color: 'var(--color-text-dim)', fontWeight: 700, padding: '4px 8px', letterSpacing: '0.06em' }}>
                  QUICK ACCESS
                </div>
                <button
                  onClick={() => setShowAccountDropdown(false)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--color-industrial-800)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    color: 'var(--color-text-primary)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <User size={13} style={{ color: 'var(--color-accent)' }} /> View Profile
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </header>
  );
}
