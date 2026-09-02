import React, { useState } from 'react';
import type { ConveyorEvent } from '../types/events';
import Modal from '../components/common/Modal';
import { formatTimestamp, formatRelativeTime, getSeverityBadgeClass } from '../utils/format';
import { Filter, Download, Eye, Check, X as XIcon, AlertTriangle, Camera, Activity } from 'lucide-react';
import { exportEventsCSV } from '../services/exportService';
import { useNavigate } from 'react-router-dom';

interface EventsAlertsPageProps {
  events: ConveyorEvent[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

type SeverityFilter = 'all' | 'critical' | 'warning' | 'info' | 'normal';
type StatusFilter   = 'all' | 'active' | 'acknowledged' | 'resolved';

export default function EventsAlertsPage({ events, onAcknowledge, onResolve }: EventsAlertsPageProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('all');
  const [selectedEvent,  setSelectedEvent]  = useState<ConveyorEvent | null>(null);
  const navigate = useNavigate();

  const filtered = events.filter(e => {
    const sev = severityFilter === 'all' || e.severity === severityFilter;
    const sta = statusFilter   === 'all' || e.status   === statusFilter;
    return sev && sta;
  });

  const counts = {
    all:      events.length,
    active:   events.filter(e => e.status === 'active').length,
    critical: events.filter(e => e.severity === 'critical').length,
    warning:  events.filter(e => e.severity === 'warning').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Events & Alerts</h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Event log, alert management, and corrective action tracking
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => exportEventsCSV(events)}
          aria-label="Export events as CSV"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Events', value: counts.all, color: 'var(--color-text-primary)', bg: 'var(--color-surface-card)' },
          { label: 'Active',       value: counts.active, color: 'var(--color-status-warning)', bg: 'rgba(245,158,11,0.07)' },
          { label: 'Critical',     value: counts.critical, color: 'var(--color-status-critical)', bg: 'rgba(239,68,68,0.07)' },
          { label: 'Warning',      value: counts.warning, color: 'var(--color-status-warning)', bg: 'rgba(245,158,11,0.07)' },
        ].map(c => (
          <div key={c.label} style={{
            padding: '12px 14px',
            background: c.bg,
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <Filter size={12} /> Severity:
        </div>
        <div style={{ display: 'flex', background: 'var(--color-industrial-800)', border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden' }}>
          {(['all', 'critical', 'warning', 'info', 'normal'] as SeverityFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setSeverityFilter(f)}
              aria-pressed={severityFilter === f}
              style={{
                padding: '5px 10px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: severityFilter === f ? 'var(--color-industrial-500)' : 'transparent',
                color: severityFilter === f ? 'var(--color-text-primary)' :
                  f === 'critical' ? 'var(--color-status-critical)' :
                  f === 'warning'  ? 'var(--color-status-warning)'  : 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 8 }}>
          Status:
        </div>
        <div style={{ display: 'flex', background: 'var(--color-industrial-800)', border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden' }}>
          {(['all', 'active', 'acknowledged', 'resolved'] as StatusFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              aria-pressed={statusFilter === f}
              style={{
                padding: '5px 10px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: statusFilter === f ? 'var(--color-industrial-500)' : 'transparent',
                color: statusFilter === f ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {filtered.length} of {events.length} events
        </span>
      </div>

      {/* Event Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: 960 }}>
            <thead>
              <tr>
                <th style={{ width: '15%', minWidth: 140 }}>Timestamp</th>
                <th style={{ width: '13%', minWidth: 120 }}>Conveyor</th>
                <th style={{ width: '25%', minWidth: 200 }}>Event</th>
                <th style={{ width: '10%', minWidth: 90 }}>Severity</th>
                <th style={{ width: '15%', minWidth: 140 }}>Source</th>
                <th style={{ width: '9%',  minWidth: 85 }}>Risk Score</th>
                <th style={{ width: '8%',  minWidth: 95 }}>Status</th>
                <th style={{ width: '5%',  minWidth: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No events match the current filters
                  </td>
                </tr>
              ) : filtered.map(evt => (
                <tr
                  key={evt.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedEvent(evt)}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', paddingRight: 16 }}>
                    {formatTimestamp(evt.timestamp)}
                    <div style={{ fontSize: 9, color: 'var(--color-text-dim)', marginTop: 1 }}>
                      {formatRelativeTime(evt.timestamp)}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', paddingRight: 16 }}>{evt.conveyorName}</td>
                  <td style={{ color: 'var(--color-text-primary)', fontWeight: 600, paddingRight: 16 }}>
                    {evt.title}
                    {evt.evidence.length > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                        {evt.evidence.length} evidence items
                      </div>
                    )}
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <span className={`badge ${getSeverityBadgeClass(evt.severity)}`}>
                      {evt.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--color-text-muted)', paddingRight: 16 }}>
                    {evt.sources.join(', ')}
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: evt.riskScore < 50 ? 'var(--color-status-critical)' : evt.riskScore < 70 ? 'var(--color-status-warning)' : 'var(--color-status-normal)',
                    }}>
                      {evt.riskScore}/100
                    </span>
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <span className={`badge ${evt.status === 'active' ? 'badge-warning' : evt.status === 'acknowledged' ? 'badge-info' : 'badge-normal'}`}>
                      {evt.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedEvent(evt)}
                        aria-label={`View details for ${evt.title}`}
                        title="View details"
                      >
                        <Eye size={10} />
                      </button>
                      {evt.status === 'active' && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => onAcknowledge(evt.id)}
                          aria-label={`Acknowledge ${evt.title}`}
                          title="Acknowledge"
                        >
                          <Check size={10} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Event: ${selectedEvent.title}`}
          subtitle={`${selectedEvent.conveyorName} · ${formatTimestamp(selectedEvent.timestamp)}`}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header info */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>SEVERITY</div>
                <span className={`badge ${getSeverityBadgeClass(selectedEvent.severity)}`} style={{ fontSize: 12 }}>
                  {selectedEvent.severity.toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>RISK SCORE</div>
                <div style={{
                  fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)',
                  color: selectedEvent.riskScore < 50 ? 'var(--color-status-critical)' : selectedEvent.riskScore < 70 ? 'var(--color-status-warning)' : 'var(--color-status-normal)',
                }}>
                  {selectedEvent.riskScore}/100
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>STATUS</div>
                <span className={`badge ${selectedEvent.status === 'active' ? 'badge-warning' : selectedEvent.status === 'acknowledged' ? 'badge-info' : 'badge-normal'}`}>
                  {selectedEvent.status.toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>TIME</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                  {formatTimestamp(selectedEvent.timestamp)}
                </div>
              </div>
            </div>

            {/* Evidence */}
            {selectedEvent.evidence.length > 0 && (
              <div>
                <div className="section-title" style={{ marginBottom: 10 }}>EVIDENCE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedEvent.evidence.map((ev, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: ev.isAbnormal ? 'rgba(245,158,11,0.06)' : 'var(--color-industrial-800)',
                      border: `1px solid ${ev.isAbnormal ? 'rgba(245,158,11,0.2)' : 'var(--color-border)'}`,
                      borderRadius: 6,
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{ev.label}</span>
                      <span style={{
                        fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: ev.isAbnormal ? 'var(--color-status-warning)' : 'var(--color-text-muted)',
                      }}>
                        {ev.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Action */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-status-info)', letterSpacing: '0.08em', marginBottom: 6 }}>
                RECOMMENDED ACTION
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                {selectedEvent.recommendedAction}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedEvent.status === 'active' && (
                <button
                  className="btn btn-warning"
                  onClick={() => { onAcknowledge(selectedEvent.id); setSelectedEvent(null); }}
                  aria-label="Acknowledge this alert"
                >
                  <Check size={12} /> Acknowledge
                </button>
              )}
              <button
                className="btn btn-ghost"
                onClick={() => { setSelectedEvent(null); navigate('/camera'); }}
                aria-label="View camera feed"
              >
                <Camera size={12} /> View Camera
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => { setSelectedEvent(null); navigate('/monitoring'); }}
                aria-label="View sensor trends"
              >
                <Activity size={12} /> Sensor Trends
              </button>
              {selectedEvent.status !== 'resolved' && (
                <button
                  className="btn btn-ghost"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => { onResolve(selectedEvent.id); setSelectedEvent(null); }}
                  aria-label="Mark as resolved"
                >
                  <XIcon size={12} /> Mark Resolved
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
