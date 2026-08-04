'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { get } from '../../../lib/api';

function StatCard({ label, value, color, href }) {
  const content = (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>
        {value ?? '—'}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function formatDateTime(d) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentHolders, setRecentHolders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      get('/admin/stats'),
      get('/admin/holders?pageSize=5'),
      get('/admin/audit?pageSize=8'),
    ])
      .then(([statsRes, holdersRes, auditRes]) => {
        setStats(statsRes.data);
        setRecentHolders(holdersRes.data || []);
        setRecentActivity(auditRes.data || []);
      })
      .catch((err) => setError(err.message || 'Failed to load dashboard data'))
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

  const platform = stats?.platform || {};
  const pending = platform.pending_verifications || {};
  const byAction = stats?.by_action || [];
  const byResourceType = stats?.by_resource_type || [];

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Platform-wide statistics and health overview</p>

      {/* Top stats */}
      <div className="stats-grid">
        <StatCard label="Total Holders" value={platform.total_holders} color="var(--color-primary)" />
        <StatCard label="Total Credentials" value={platform.total_credentials} />
        <StatCard label="Active Credentials" value={platform.active_credentials} color="var(--color-success)" />
        <StatCard
          label="Pending Verifications"
          value={pending.total}
          color={pending.total > 0 ? 'var(--color-pending)' : undefined}
          href="/admin/verifications"
        />
        <StatCard label="Total Organisations" value={platform.total_organizations} />
        <StatCard label="Verified Organisations" value={platform.verified_organizations} color="var(--color-success)" />
        <StatCard label="Total Jurisdictions" value={platform.total_jurisdictions} />
      </div>

      {/* Pending verifications breakdown */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Pending Verifications</h2>
          <Link href="/admin/verifications" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
            Review all
          </Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Education</td>
                <td style={{ fontWeight: 600 }}>{pending.education ?? 0}</td>
              </tr>
              <tr>
                <td>Work Experience</td>
                <td style={{ fontWeight: 600 }}>{pending.work_experience ?? 0}</td>
              </tr>
              <tr>
                <td>Credentials</td>
                <td style={{ fontWeight: 600 }}>{pending.credentials ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        {/* Recent holders */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Holders</h2>
            <Link href="/admin/holders" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
              View all
            </Link>
          </div>
          {recentHolders.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No holders yet</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHolders.map((holder) => (
                    <tr key={holder._id || holder.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{holder.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{holder.email}</div>
                      </td>
                      <td>
                        <span className={`pill ${holder.role === 'platform_admin' ? 'pill-active' : 'pill-pending'}`}>
                          {holder.role}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {formatDateTime(holder.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <Link href="/admin/audit" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
              View all
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No activity yet</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((event) => (
                    <tr key={event._id || event.id}>
                      <td style={{ fontSize: 13 }}>{event.action}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {formatDateTime(event.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        {/* Activity by action */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Activity by Action</h2>
          </div>
          {byAction.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No data</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byAction.map(({ action, count }) => (
                    <tr key={action}>
                      <td>{action}</td>
                      <td style={{ fontWeight: 600 }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity by resource type */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Activity by Resource</h2>
          </div>
          {byResourceType.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No data</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byResourceType.map(({ resource_type, count }) => (
                    <tr key={resource_type}>
                      <td style={{ textTransform: 'capitalize' }}>{resource_type?.replace(/_/g, ' ')}</td>
                      <td style={{ fontWeight: 600 }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
