'use client';

import { useState } from 'react';

const ACTOR_STYLES = {
  holder: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', dot: '#057a55' },
  org: { bg: '#e0f2fe', color: '#0369a1', dot: '#0284c7' },
  admin: { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed' },
  system: { bg: 'var(--color-pending-bg)', color: 'var(--color-pending)', dot: '#9ca3af' },
};

function formatTimestamp(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

function EventItem({ event }) {
  const [expanded, setExpanded] = useState(false);
  const actorStyle = ACTOR_STYLES[event.actor_type] || ACTOR_STYLES.system;

  return (
    <div className="timeline-item">
      <div
        className="timeline-dot"
        style={{ background: actorStyle.dot }}
      />
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              className="pill"
              style={{ background: actorStyle.bg, color: actorStyle.color, fontSize: 11 }}
            >
              {event.actor_type}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              {event.action}
            </span>
            {event.resource_type && (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-bg)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {event.resource_type}
              </span>
            )}
          </div>
          <span
            style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {formatTimestamp(event.created_at || event.timestamp)}
          </span>
        </div>

        {event.actor_name && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Actor: <span style={{ fontWeight: 500 }}>{event.actor_name}</span>
          </div>
        )}

        {event.resource_id && (
          <div
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'var(--color-text-muted)',
              marginBottom: 8,
              wordBreak: 'break-all',
            }}
          >
            ID: {event.resource_id}
          </div>
        )}

        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div>
            <button
              onClick={() => setExpanded((p) => !p)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 12,
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              {expanded ? 'Hide' : 'Show'} metadata ({Object.keys(event.metadata).length} fields)
            </button>
            {expanded && (
              <div className="json-viewer" style={{ marginTop: 8, maxHeight: 150 }}>
                {JSON.stringify(event.metadata, null, 2)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No events to display</div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, i) => (
        <EventItem key={event._id || event.id || i} event={event} />
      ))}
    </div>
  );
}
