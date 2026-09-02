import React from 'react';
import type { RiskLevel } from '../../types/telemetry';

interface StatusBadgeProps {
  level: RiskLevel | 'offline' | 'info' | 'unknown';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export default function StatusBadge({ level, label, size = 'md', pulse = false }: StatusBadgeProps) {
  const cls = `badge badge-${level}`;
  const dotClass = `status-dot ${
    level === 'normal'   ? 'online'  :
    level === 'warning'  ? 'warning' :
    level === 'critical' ? 'critical' : 'offline'
  }`;

  const displayLabel = label ?? level.toUpperCase();

  return (
    <span
      className={cls}
      style={{ fontSize: size === 'sm' ? 10 : 11 }}
      aria-label={`Status: ${displayLabel}`}
    >
      <span className={dotClass} style={{ width: size === 'sm' ? 6 : 7, height: size === 'sm' ? 6 : 7 }} />
      {displayLabel}
    </span>
  );
}
