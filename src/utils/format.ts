// ============================================================
// Format utilities
// ============================================================

import type { RiskLevel } from '../types/telemetry';
import type { EventSeverity } from '../types/events';

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000)  return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}

export function formatSensorValue(value: number, decimals: number, unit: string): string {
  if (value === -1) return '—';
  const sign = (unit === 'px' && value > 0) ? '+' : '';
  return `${sign}${value.toFixed(decimals)}`;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'normal':   return 'var(--color-status-normal)';
    case 'warning':  return 'var(--color-status-warning)';
    case 'critical': return 'var(--color-status-critical)';
    default: return 'var(--color-status-offline)';
  }
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'normal':   return 'badge-normal';
    case 'warning':  return 'badge-warning';
    case 'critical': return 'badge-critical';
    default: return 'badge-offline';
  }
}

export function getSeverityBadgeClass(severity: EventSeverity): string {
  switch (severity) {
    case 'normal':   return 'badge-normal';
    case 'warning':  return 'badge-warning';
    case 'critical': return 'badge-critical';
    case 'info':     return 'badge-info';
    default: return 'badge-offline';
  }
}

export function getStatusColorVar(status: string): string {
  switch (status) {
    case 'online':       return 'var(--color-status-normal)';
    case 'connected':    return 'var(--color-status-normal)';
    case 'offline':      return 'var(--color-status-critical)';
    case 'disconnected': return 'var(--color-status-critical)';
    case 'degraded':     return 'var(--color-status-warning)';
    default:             return 'var(--color-status-offline)';
  }
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function percentFill(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

export function secsSinceUpdate(lastUpdateMs: number): string {
  const diff = (Date.now() - lastUpdateMs) / 1000;
  return diff < 10 ? `${diff.toFixed(1)} sec ago` : `${Math.round(diff)} sec ago`;
}

export function sensorStateClass(isAbnormal: boolean): string {
  return isAbnormal ? 'text-warning' : 'text-normal';
}
