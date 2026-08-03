'use client';

import { useEffect, useState, useCallback } from 'react';
import { get, patch } from '../../../lib/api';

const TABS = [
  { key: 'education', label: 'Education', icon: '🎓', endpoint: '/admin/education/pending' },
  { key: 'work-experience', label: 'Work Experience', icon: '💼', endpoint: '/admin/work-experience/pending' },
  { key: 'credentials', label: 'Credentials', icon: '📜', endpoint: '/admin/credentials/pending' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(d));
}

function entryLabel(tabKey, entry) {
  if (tabKey === 'education') return `${entry.qualification} — ${entry.institution_name}`;
  if (tabKey === 'work-experience') return `${entry.job_title} — ${entry.employer_name}`;
  return entry.title;
}

function entrySubtext(tabKey, entry) {
  if (tabKey === 'credentials') {
    return entry.issuer?.name || entry.issuer_name || 'No issuer listed';
  }
  return entry.location || '—';
}

export default function AdminVerificationsPage() {
  const [activeTab, setActiveTab] = useState('education');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const tab = TABS.find((t) => t.key === activeTab);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await get(tab.endpoint);
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [tab.endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVerify(id) {
    setVerifyingId(id);
    try {
      await patch(`/admin/${activeTab}/${id}/verify`, {});
      setRows((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert('Failed to verify: ' + (err.message || 'Unknown error'));
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Verifications</h1>
        <p className="page-subtitle">
          Review and verify holder-submitted education, work experience, and credential entries
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="btn"
            style={{
              border: 'none',
              borderBottom: t.key === activeTab ? '2px solid var(--color-primary)' : '2px solid transparent',
              borderRadius: 0,
              background: 'none',
              color: t.key === activeTab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: t.key === activeTab ? 600 : 400,
              paddingBottom: 10,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="loading-center">
          <span className="spinner spinner-lg" />
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          Failed to load pending entries: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">Nothing pending</div>
          <p>All {tab.label.toLowerCase()} entries have been verified.</p>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Holder</th>
                <th>Entry</th>
                <th>{activeTab === 'credentials' ? 'Issuer' : 'Location'}</th>
                <th>Submitted</th>
                {activeTab === 'credentials' && <th>Requested</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => {
                const id = entry._id || entry.id;
                return (
                  <tr key={id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{entry.holder_id?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {entry.holder_id?.email || ''}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{entryLabel(activeTab, entry)}</td>
                    <td style={{ fontSize: 13 }}>{entrySubtext(activeTab, entry)}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {formatDate(entry.created_at)}
                    </td>
                    {activeTab === 'credentials' && (
                      <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {entry.verification_requested_at ? formatDate(entry.verification_requested_at) : '—'}
                      </td>
                    )}
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-success)' }}
                        onClick={() => handleVerify(id)}
                        disabled={verifyingId === id}
                      >
                        {verifyingId === id ? 'Verifying…' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > rows.length && (
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
          Showing {rows.length} of {total} pending entries.
        </p>
      )}
    </div>
  );
}
