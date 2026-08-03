'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { get, patch } from '../../../lib/api';

const ROLES = ['holder', 'org_admin', 'platform_admin'];

function ChangeRoleModal({ holder, onClose, onSuccess }) {
  const [role, setRole] = useState(holder.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    setLoading(true);
    try {
      await patch(`/admin/holders/${holder._id || holder.id}/role`, { role });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to change role');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box">
        <h2 className="modal-title">Change Role — {holder.full_name}</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          {holder.email}
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {role !== holder.role && (
          <div className="alert alert-error" style={{ background: '#fef3cd', borderColor: '#fde68a', color: '#92400e' }}>
            Changing this holder&apos;s role from <strong>{holder.role}</strong> to <strong>{role}</strong> takes effect
            the next time they log in or refresh their session.
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading || role === holder.role}
          >
            {loading ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHoldersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);

  const load = useCallback(async (searchTerm) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await get(`/admin/holders${query}`);
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load(search);
  }

  return (
    <div className="page-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title">Holders</h1>
          <p className="page-subtitle">Search jobseekers and manage account roles</p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {isLoading && (
        <div className="loading-center">
          <span className="spinner spinner-lg" />
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          Failed to load holders: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🧑‍💻</div>
          <div className="empty-state-title">No holders found</div>
          <p>Try a different search term.</p>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((holder) => {
                const id = holder._id || holder.id;
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600 }}>{holder.full_name}</td>
                    <td style={{ fontSize: 13 }}>{holder.email}</td>
                    <td>
                      <span className={`pill ${holder.role === 'platform_admin' ? 'pill-active' : 'pill-pending'}`}>
                        {holder.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(holder.created_at))}
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/admin/holders/${id}`)}>
                        View
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setRoleTarget(holder)}>
                        Change Role
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
          Showing {rows.length} of {total} holders.
        </p>
      )}

      {roleTarget && (
        <ChangeRoleModal
          holder={roleTarget}
          onClose={() => setRoleTarget(null)}
          onSuccess={() => load(search)}
        />
      )}
    </div>
  );
}
