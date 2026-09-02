import React from 'react';
import { createPortal } from 'react-dom';
import type { Notification } from '../../types/events';
import { Bell, Check, X } from 'lucide-react';
import { formatRelativeTime } from '../../utils/format';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose }: NotificationPanelProps) {
  const severityColor = (s: string) =>
    s === 'critical' ? 'var(--color-status-critical)' :
    s === 'warning'  ? 'var(--color-status-warning)'  :
    s === 'info'     ? 'var(--color-status-info)'      : 'var(--color-status-normal)';

  return createPortal(
    <>
      {/* Backdrop to capture outside clicks */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.3)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Top-right Fixed Notification Drawer Panel with Theme Variables */}
      <div
        className="fade-in"
        role="dialog"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: 64,
          right: 20,
          zIndex: 10000,
          width: 'min(380px, 92vw)',
          maxHeight: '72vh',
          background: 'var(--popover-bg)',
          border: '1px solid var(--popover-border)',
          borderRadius: 14,
          boxShadow: 'var(--popover-shadow)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--popover-header-bg)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--color-status-warning)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                {notifications.filter(n => !n.read).length} UNREAD
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {notifications.some(n => !n.read) && (
              <button
                onClick={onMarkAllRead}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '4px 9px',
                  background: 'var(--color-industrial-800)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                aria-label="Mark all notifications as read"
              >
                <Check size={11} /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notification panel"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Notification List */}
        <div style={{ overflowY: 'auto', flex: 1, background: 'var(--popover-bg)' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
              No notifications
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : 'var(--color-accent-dim)',
                  transition: 'background 0.15s',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: n.read ? 'transparent' : severityColor(n.severity),
                    marginTop: 5,
                    flexShrink: 0,
                    boxShadow: n.read ? 'none' : `0 0 6px ${severityColor(n.severity)}`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: n.read ? 500 : 700,
                      color: n.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                      lineHeight: 1.35,
                    }}
                  >
                    {n.severity === 'critical' && '🔴 '}
                    {n.severity === 'warning'  && '⚠ '}
                    {n.severity === 'info'     && 'ℹ '}
                    {n.severity === 'normal'   && '✓ '}
                    {n.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, lineHeight: 1.45 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {formatRelativeTime(n.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
