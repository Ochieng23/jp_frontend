'use client';

import { useState } from 'react';
import { useOrganizations, useJurisdictions } from '../../../lib/hooks';
import { post, patch } from '../../../lib/api';

function RegisterOrgModal({ isOpen, onClose, onSuccess }) {
  const { jurisdictions } = useJurisdictions();
  const [form, setForm] = useState({
    name: '',
    type: 'employer',
    jurisdiction_id: '',
    website: '',
    description: '',
    contact_email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Organisation name is required');
      return;
    }
    if (!form.jurisdiction_id) {
      setError('Jurisdiction is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        jurisdiction_id: form.jurisdiction_id,
      };
      if (form.website.trim()) payload.website = form.website.trim();
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.contact_email.trim()) payload.contact_email = form.contact_email.trim();
      await post('/organizations', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register organisation');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h2 className="modal-title">Register Organisation</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Organisation Name *</label>
            <input
              name="name"
              className="form-input"
              value={form.name}
              onChange={handleChange}
              placeholder="Full legal name"
              disabled={loading}
            />
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-input"
                value={form.type}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="employer">Employer</option>
                <option value="educational">Educational</option>
                <option value="government">Government</option>
                <option value="ngo">NGO</option>
                <option value="certification_body">Certification Body</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Jurisdiction *</label>
              <select
                name="jurisdiction_id"
                className="form-input"
                value={form.jurisdiction_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select jurisdiction…</option>
                {jurisdictions.map((j) => (
                  <option key={j._id || j.id} value={j._id || j.id}>
                    {j.country_code} — {j.country_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Website</label>
            <input
              name="website"
              type="url"
              className="form-input"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.org"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              name="contact_email"
              type="email"
              className="form-input"
              value={form.contact_email}
              onChange={handleChange}
              placeholder="contact@organisation.org"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the organisation"
              disabled={loading}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Registering…
                </>
              ) : (
                'Register Organisation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminOrganizationsPage() {
  const { organizations, isLoading, error, mutate } = useOrganizations();
  const [addOpen, setAddOpen] = useState(false);
  const [verifying, setVerifying] = useState(null);

  async function handleVerify(id) {
    setVerifying(id);
    try {
      await patch(`/organizations/${id}/verify`, { verified: true });
      mutate();
    } catch (err) {
      alert('Failed to verify: ' + (err.message || 'Unknown error'));
    } finally {
      setVerifying(null);
    }
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
          <h1 className="page-title">Organisations</h1>
          <p className="page-subtitle">Manage registered credential-issuing organisations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Register New Org
        </button>
      </div>

      {isLoading && (
        <div className="loading-center">
          <span className="spinner spinner-lg" />
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          Failed to load organisations: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && organizations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <div className="empty-state-title">No organisations registered</div>
          <p>Register the first organisation to start issuing credentials.</p>
        </div>
      )}

      {!isLoading && !error && organizations.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Jurisdiction</th>
                <th>DID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => {
                const id = org._id || org.id;
                return (
                  <tr key={id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{org.name}</div>
                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, color: 'var(--color-primary)' }}
                        >
                          {org.website}
                        </a>
                      )}
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>
                      {org.type?.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {org.jurisdiction?.country_name
                        ? `${org.jurisdiction.country_code} — ${org.jurisdiction.country_name}`
                        : org.jurisdiction_id || '—'}
                    </td>
                    <td
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: 'var(--color-text-muted)',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {org.did || '—'}
                    </td>
                    <td>
                      {org.verified ? (
                        <span className="pill pill-active">Verified</span>
                      ) : (
                        <span className="pill pill-pending">Unverified</span>
                      )}
                    </td>
                    <td>
                      {!org.verified && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--color-success)' }}
                          onClick={() => handleVerify(id)}
                          disabled={verifying === id}
                        >
                          {verifying === id ? 'Verifying…' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && (
        <RegisterOrgModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
