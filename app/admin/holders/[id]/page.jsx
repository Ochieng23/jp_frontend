'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { get, patch, del } from '../../../../lib/api';
import { INDUSTRIES } from '../../../../lib/industries';

function formatDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(d));
}

const ROLES = ['holder', 'org_admin', 'platform_admin'];

function EditProfileModal({ holder, onClose, onSuccess }) {
  const [form, setForm] = useState({
    full_name: holder.full_name || '',
    phone: holder.phone || '',
    nationality: holder.nationality || '',
    date_of_birth: holder.date_of_birth ? holder.date_of_birth.split('T')[0] : '',
    bio: holder.bio || '',
    industries: holder.industries || [],
    open_to_any_industry: holder.open_to_any_industry || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleIndustry(industry) {
    setForm((prev) => {
      const current = prev.industries || [];
      const next = current.includes(industry)
        ? current.filter((i) => i !== industry)
        : [...current, industry];
      return { ...prev, industries: next, open_to_any_industry: next.length > 0 ? false : prev.open_to_any_industry };
    });
  }

  function toggleOpenToAny() {
    setForm((prev) => ({
      ...prev,
      open_to_any_industry: !prev.open_to_any_industry,
      industries: !prev.open_to_any_industry ? [] : prev.industries,
    }));
  }

  async function handleSave() {
    setError('');
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim(),
        open_to_any_industry: form.open_to_any_industry,
        industries: form.open_to_any_industry ? [] : form.industries,
      };
      if (form.nationality) payload.nationality = form.nationality;
      if (form.date_of_birth) payload.date_of_birth = form.date_of_birth;
      await patch(`/admin/holders/${holder._id || holder.id}`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box" style={{ maxWidth: 640 }}>
        <h2 className="modal-title">Edit Profile — {holder.full_name}</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" name="full_name" value={form.full_name} onChange={handleChange} disabled={loading} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} disabled={loading} />
          </div>
          <div className="form-group">
            <label className="form-label">Date of birth</label>
            <input className="form-input" type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nationality</label>
          <input className="form-input" name="nationality" value={form.nationality} onChange={handleChange} disabled={loading} />
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-input" name="bio" rows={3} value={form.bio} onChange={handleChange} disabled={loading} />
        </div>

        <div className="form-group">
          <label className="form-label">Industries</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13 }}>
            <input type="checkbox" checked={form.open_to_any_industry} onChange={toggleOpenToAny} disabled={loading} />
            Open to any industry
          </label>
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              opacity: form.open_to_any_industry ? 0.4 : 1,
              pointerEvents: form.open_to_any_industry ? 'none' : 'auto',
            }}
          >
            {INDUSTRIES.map((industry) => {
              const selected = form.industries.includes(industry);
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => toggleIndustry(industry)}
                  disabled={loading}
                  className="btn btn-sm"
                  style={{
                    background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: selected ? '#fff' : 'var(--color-text)',
                    border: '1px solid ' + (selected ? 'var(--color-primary)' : 'var(--color-border)'),
                  }}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <h2 className="modal-title">Change Role</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading || role === holder.role}>
            {loading ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteHolderModal({ holder, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box">
        <h2 className="modal-title">Delete Holder Account</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Are you sure you want to permanently delete <strong>{holder.full_name}</strong> ({holder.email})?
          This will also delete all of their credentials, education, work experience, and share links.
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="btn" style={{ background: 'var(--color-danger)', color: '#fff' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHolderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await get(`/admin/holders/${id}`);
      setProfile(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVerify(type, entryId) {
    setBusyId(entryId);
    setActionError('');
    try {
      await patch(`/admin/${type}/${entryId}/verify`, {});
      load();
    } catch (err) {
      setActionError(err.message || 'Failed to verify');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteEntry(endpoint, entryId) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    setBusyId(entryId);
    setActionError('');
    try {
      await del(`/${endpoint}/${entryId}`);
      load();
    } catch (err) {
      setActionError(err.message || 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteHolder() {
    setDeleteLoading(true);
    try {
      await del(`/admin/holders/${id}`);
      router.push('/admin/holders');
    } catch (err) {
      setActionError(err.message || 'Failed to delete holder');
      setDeleteLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Failed to load holder: {error?.message || 'Not found'}</div>
      </div>
    );
  }

  const { holder, credentials, education, work_experience } = profile;

  return (
    <div className="page-container">
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={() => router.push('/admin/holders')}>
        ← Back to Holders
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{holder.full_name}</h1>
          <p className="page-subtitle" style={{ marginBottom: 8 }}>{holder.email}</p>
          <span className={`pill ${holder.role === 'platform_admin' ? 'pill-active' : 'pill-pending'}`}>{holder.role}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setEditOpen(true)}>Edit Profile</button>
          <button className="btn btn-secondary" onClick={() => setRoleOpen(true)}>Change Role</button>
          <button className="btn" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }} onClick={() => setDeleteOpen(true)}>
            Delete Holder
          </button>
        </div>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2 className="card-title">Profile</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Phone</div>
            <div style={{ fontSize: 14 }}>{holder.phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Nationality</div>
            <div style={{ fontSize: 14 }}>{holder.nationality || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Date of Birth</div>
            <div style={{ fontSize: 14 }}>{formatDate(holder.date_of_birth)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Registered</div>
            <div style={{ fontSize: 14 }}>{formatDate(holder.created_at)}</div>
          </div>
        </div>
        {holder.bio && (
          <p style={{ fontSize: 14, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>{holder.bio}</p>
        )}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Industries</div>
          {holder.open_to_any_industry ? (
            <span className="pill pill-active">Open to any industry</span>
          ) : holder.industries?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {holder.industries.map((i) => <span key={i} className="pill pill-pending">{i}</span>)}
            </div>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Not specified</span>
          )}
        </div>
      </div>

      {/* Credentials */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2 className="card-title">Credentials ({credentials.length})</h2></div>
        {credentials.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No credentials</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Status</th><th>Verified</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {credentials.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td style={{ fontSize: 13 }}>{c.type}</td>
                    <td><span className={`pill pill-${c.status}`}>{c.status}</span></td>
                    <td>{c.verified ? <span className="pill pill-active">✓</span> : <span className="pill pill-pending">Pending</span>}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {!c.verified && (
                        <button className="btn btn-secondary btn-sm" disabled={busyId === c._id} onClick={() => handleVerify('credentials', c._id)}>
                          Verify
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }} disabled={busyId === c._id} onClick={() => handleDeleteEntry('credentials', c._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2 className="card-title">Education ({education.length})</h2></div>
        {education.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No education records</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Institution</th><th>Qualification</th><th>Dates</th><th>Verified</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {education.map((e) => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600 }}>{e.institution_name}</td>
                    <td style={{ fontSize: 13 }}>{e.qualification}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {formatDate(e.start_date)} — {e.is_current ? 'Present' : formatDate(e.end_date)}
                    </td>
                    <td>{e.verified ? <span className="pill pill-active">✓</span> : <span className="pill pill-pending">Pending</span>}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {!e.verified && (
                        <button className="btn btn-secondary btn-sm" disabled={busyId === e._id} onClick={() => handleVerify('education', e._id)}>
                          Verify
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }} disabled={busyId === e._id} onClick={() => handleDeleteEntry('education', e._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Work Experience */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">Work Experience ({work_experience.length})</h2></div>
        {work_experience.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No work experience records</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Employer</th><th>Job Title</th><th>Dates</th><th>Verified</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {work_experience.map((w) => (
                  <tr key={w._id}>
                    <td style={{ fontWeight: 600 }}>{w.employer_name}</td>
                    <td style={{ fontSize: 13 }}>{w.job_title}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {formatDate(w.start_date)} — {w.is_current ? 'Present' : formatDate(w.end_date)}
                    </td>
                    <td>{w.verified ? <span className="pill pill-active">✓</span> : <span className="pill pill-pending">Pending</span>}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {!w.verified && (
                        <button className="btn btn-secondary btn-sm" disabled={busyId === w._id} onClick={() => handleVerify('work-experience', w._id)}>
                          Verify
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }} disabled={busyId === w._id} onClick={() => handleDeleteEntry('work-experience', w._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editOpen && (
        <EditProfileModal holder={holder} onClose={() => setEditOpen(false)} onSuccess={load} />
      )}
      {roleOpen && (
        <ChangeRoleModal holder={holder} onClose={() => setRoleOpen(false)} onSuccess={load} />
      )}
      {deleteOpen && (
        <DeleteHolderModal
          holder={holder}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteHolder}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
