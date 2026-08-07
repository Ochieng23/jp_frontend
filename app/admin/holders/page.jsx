'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { get, patch } from '../../../lib/api';
import { INDUSTRIES } from '../../../lib/industries';
import { SENIORITY_LEVELS, SENIORITY_LABELS } from '../../../lib/talentClassification';

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
  const [industry, setIndustry] = useState('');
  const [seniority, setSeniority] = useState('');
  const [expertiseArea, setExpertiseArea] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);

  const load = useCallback(async (filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.seniority) params.set('seniority_level', filters.seniority);
      if (filters.expertiseArea) params.set('expertise_area', filters.expertiseArea);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await get(`/admin/holders${query}`);
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Seeded from the URL (not useSearchParams, to keep this page's static
  // shell simple) so links in from /admin/talent-pool land pre-filtered.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = {
      search: params.get('search') || '',
      industry: params.get('industry') || '',
      seniority: params.get('seniority_level') || '',
      expertiseArea: params.get('expertise_area') || '',
    };
    setSearch(initial.search);
    setIndustry(initial.industry);
    setSeniority(initial.seniority);
    setExpertiseArea(initial.expertiseArea);
    load(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load({ search, industry, seniority, expertiseArea });
  }

  function handleFilterChange(setter, field, value) {
    setter(value);
    load({ search, industry, seniority, expertiseArea, [field]: value });
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

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ maxWidth: 220 }}
          value={industry}
          onChange={(e) => handleFilterChange(setIndustry, 'industry', e.target.value)}
        >
          <option value="">All industries (AI)</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select
          className="form-input"
          style={{ maxWidth: 180 }}
          value={seniority}
          onChange={(e) => handleFilterChange(setSeniority, 'seniority', e.target.value)}
        >
          <option value="">All seniority</option>
          {SENIORITY_LEVELS.map((s) => <option key={s} value={s}>{SENIORITY_LABELS[s]}</option>)}
        </select>
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {expertiseArea && (
        <div style={{ marginBottom: 16 }}>
          <span className="pill pill-active">
            Expertise: {expertiseArea}
            <button
              type="button"
              onClick={() => handleFilterChange(setExpertiseArea, 'expertiseArea', '')}
              style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
            >
              ×
            </button>
          </span>
        </div>
      )}

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
                <th>AI Classification</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((holder) => {
                const id = holder._id || holder.id;
                const tc = holder.talent_classification;
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600 }}>{holder.full_name}</td>
                    <td style={{ fontSize: 13 }}>{holder.email}</td>
                    <td>
                      <span className={`pill ${holder.role === 'platform_admin' ? 'pill-active' : 'pill-pending'}`}>
                        {holder.role}
                      </span>
                    </td>
                    <td>
                      {tc ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{tc.primary_industry}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{SENIORITY_LABELS[tc.seniority_level] || tc.seniority_level}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Not classified</span>
                      )}
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
