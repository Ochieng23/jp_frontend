'use client';

import { useEffect, useState } from 'react';
import { get } from '../../../lib/api';

function StatCard({ label, value, color, sublabel }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>
        {value ?? '—'}
      </div>
      {sublabel && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/admin/stats')
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-center">
          <span className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const credByType = stats?.credentials_by_type || {};
  const orgsByJurisdiction = stats?.orgs_by_jurisdiction || {};

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Platform-wide statistics and health overview</p>

      {/* Top stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Holders"
          value={stats?.total_holders}
          color="var(--color-primary)"
        />
        <StatCard
          label="Total Credentials"
          value={stats?.total_credentials}
        />
        <StatCard
          label="Active Credentials"
          value={stats?.active_credentials}
          color="var(--color-success)"
        />
        <StatCard
          label="Verified Organisations"
          value={stats?.verified_organisations}
          color="var(--color-success)"
        />
        <StatCard
          label="Total Organisations"
          value={stats?.total_organisations}
        />
        <StatCard
          label="Total Jurisdictions"
          value={stats?.total_jurisdictions}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8 }}>
        {/* Credentials by type */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Credentials by Type</h2>
          </div>
          {Object.keys(credByType).length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No data</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(credByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <tr key={type}>
                        <td style={{ textTransform: 'capitalize' }}>
                          {type.replace(/_/g, ' ')}
                        </td>
                        <td style={{ fontWeight: 600 }}>{count}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>
                          {stats?.total_credentials
                            ? `${((count / stats.total_credentials) * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orgs by jurisdiction */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Organisations by Jurisdiction</h2>
          </div>
          {Object.keys(orgsByJurisdiction).length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No data</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Jurisdiction</th>
                    <th>Organisations</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(orgsByJurisdiction)
                    .sort((a, b) => b[1] - a[1])
                    .map(([jurisdiction, count]) => (
                      <tr key={jurisdiction}>
                        <td>{jurisdiction}</td>
                        <td style={{ fontWeight: 600 }}>{count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity quick view */}
      {stats?.recent_events && stats.recent_events.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h2 className="card-title">Recent Platform Activity</h2>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor Type</th>
                  <th>Resource</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_events.slice(0, 10).map((event, i) => (
                  <tr key={event._id || event.id || i}>
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {new Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(event.created_at || event.timestamp))}
                    </td>
                    <td>{event.action}</td>
                    <td>
                      <span
                        className="pill"
                        style={{
                          background:
                            event.actor_type === 'admin'
                              ? '#ede9fe'
                              : event.actor_type === 'org'
                              ? '#e0f2fe'
                              : 'var(--color-pending-bg)',
                          color:
                            event.actor_type === 'admin'
                              ? '#5b21b6'
                              : event.actor_type === 'org'
                              ? '#0369a1'
                              : 'var(--color-pending)',
                        }}
                      >
                        {event.actor_type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{event.resource_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
