// ============================================================
// EXPORT SERVICE
// Exports sensor history, events, and alerts to CSV format.
// ============================================================

import type { TelemetrySnapshot } from '../types/telemetry';
import type { ConveyorEvent } from '../types/events';

function csvEscape(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: string[][]): string {
  const headerRow = headers.map(csvEscape).join(',');
  const dataRows  = rows.map(row => row.map(csvEscape).join(','));
  return [headerRow, ...dataRows].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTelemetryCSV(history: TelemetrySnapshot[]): void {
  const headers = ['Timestamp', 'RPM', 'Current (A)', 'Load (kg)', 'Vibration (RMS)', 'Temperature (°C)', 'Belt Offset (px)', 'Data Source'];
  const rows = history.map(s => [
    s.timestamp.toISOString(),
    s.rpm < 0 ? 'N/A' : s.rpm.toString(),
    s.current < 0 ? 'N/A' : s.current.toString(),
    s.load < 0 ? 'N/A' : s.load.toString(),
    s.vibration < 0 ? 'N/A' : s.vibration.toString(),
    s.temperature < 0 ? 'N/A' : s.temperature.toString(),
    s.beltOffset < 0 && s.beltOffset === -1 ? 'N/A' : s.beltOffset.toString(),
    s.dataSource,
  ]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadFile(buildCsv(headers, rows), `conveyor-telemetry-${timestamp}.csv`, 'text/csv');
}

export function exportEventsCSV(events: ConveyorEvent[]): void {
  const headers = ['ID', 'Timestamp', 'Conveyor', 'Event Type', 'Severity', 'Risk Score', 'Status', 'Sources', 'Recommended Action'];
  const rows = events.map(e => [
    e.id,
    e.timestamp.toISOString(),
    e.conveyorName,
    e.title,
    e.severity,
    e.riskScore.toString(),
    e.status,
    e.sources.join(' + '),
    e.recommendedAction,
  ]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadFile(buildCsv(headers, rows), `conveyor-events-${timestamp}.csv`, 'text/csv');
}
