'use client';

import { useState } from 'react';
import { useAuditLog } from '../../../lib/hooks';
import AuditTimeline from '../../../components/AuditTimeline';
import Pagination from '../../../components/Pagination';

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actor_type: '',
    action_prefix: '',
    date_from: '',
    date_to: '',
  });

  const { events, total, hasNext, isLoading, error } = useAuditLog(page);

  // Client-side filtering (ideally would be server-side but hooks use fixed endpoint)
  const filtered = events.filter((e) => {
    if (filters.actor_type && e.actor_type !== filters.actor_type) return false;
    if (
      filters.action_prefix &&
      !e.action?.toLowerCase().startsWith(filters.action_prefix.toLowerCase())
    )
      return false;
    if (filters.date_from && new Date(e.created_at) < new Date(filters.date_from)) return false;
    if (filters.date_to && new Date(e.created_at) > new Date(filters.date_to + 'T23:59:59'))
      return false;
    return true;
  });

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  const hasFilters =
    filters.actor_type || filters.action_prefix || filters.date_from || filters.date_to;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Complete platform activity log for compliance and auditing</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Actor Type</label>
          <select
            className="form-input"
            style={{ width: 150 }}
            value={filters.actor_type}
            onChange={(e) => setFilter('actor_type', e.target.value)}
          >
            <option value="">All actors</option>
            <option value="holder">Holder</option>
            <option value="org">Organisation</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Action starts with</label>
          <input
            className="form-input"
            style={{ width: 180 }}
            value={filters.action_prefix}
            onChange={(e) => setFilter('action_prefix', e.target.value)}
            placeholder="e.g. credential."
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">From date</label>
          <input
            type="date"
            className="form-input"
            style={{ width: 150 }}
            value={filters.date_from}
            onChange={(e) => setFilter('date_from', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">To date</label>
          <input
            type="date"
            className="form-input"
            style={{ width: 150 }}
            value={filters.date_to}
            onChange={(e) => setFilter('date_to', e.target.value)}
          />
        </div>

        {hasFilters && (
          <button
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'flex-end' }}
            onClick={() =>
              setFilters({ actor_type: '', action_prefix: '', date_from: '', date_to: '' })
            }
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results summary */}
      {!isLoading && !error && (
        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Showing {filtered.length} of {events.length} events on page {page}
          {total > 0 ? ` (${total} total)` : ''}
        </div>
      )}

      {isLoading && (
        <div className="loading-center">
          <span className="spinner spinner-lg" />
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          Failed to load audit log: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No audit events found</div>
          <p>
            {hasFilters
              ? 'Try adjusting your filters.'
              : 'No audit events have been recorded yet.'}
          </p>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <>
          {/* Table view */}
          <div className="table-wrapper" style={{ marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, i) => {
                  const id = event._id || event.id || i;
                  return (
                    <tr key={id}>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                        {new Intl.DateTimeFormat('en-GB', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        }).format(new Date(event.created_at || event.timestamp))}
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background:
                              event.actor_type === 'admin'
                                ? '#ede9fe'
                                : event.actor_type === 'org'
                                ? '#e0f2fe'
                                : event.actor_type === 'system'
                                ? '#f3f4f6'
                                : 'var(--color-success-bg)',
                            color:
                              event.actor_type === 'admin'
                                ? '#5b21b6'
                                : event.actor_type === 'org'
                                ? '#0369a1'
                                : event.actor_type === 'system'
                                ? '#4b5563'
                                : 'var(--color-success)',
                          }}
                        >
                          {event.actor_type}
                        </span>
                        {event.actor_name && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 12,
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {event.actor_name}
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{event.action}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {event.resource_type}
                        {event.resource_id && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: 11,
                              fontFamily: 'monospace',
                              opacity: 0.7,
                            }}
                          >
                            {event.resource_id}
                          </span>
                        )}
                      </td>
                      <td>
                        {event.metadata && Object.keys(event.metadata).length > 0 ? (
                          <details>
                            <summary style={{ fontSize: 12 }}>
                              {Object.keys(event.metadata).length} field(s)
                            </summary>
                            <div
                              className="json-viewer"
                              style={{ marginTop: 6, maxHeight: 100, fontSize: 11 }}
                            >
                              {JSON.stringify(event.metadata, null, 2)}
                            </div>
                          </details>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Timeline view toggle */}
          <details>
            <summary style={{ marginBottom: 12 }}>Show timeline view</summary>
            <AuditTimeline events={filtered} />
          </details>

          {total > 50 && (
            <Pagination
              page={page}
              pageSize={50}
              total={total}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
