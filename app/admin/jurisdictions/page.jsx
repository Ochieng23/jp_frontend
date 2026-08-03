'use client';

import { useState } from 'react';
import { useJurisdictions } from '../../../lib/hooks';
import { post, patch } from '../../../lib/api';

function AddJurisdictionModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    country_code: '',
    country_name: '',
    recognition_rules: '',
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
    if (!form.country_code.trim()) {
      setError('Country code is required (e.g. DE, US, CA)');
      return;
    }
    if (!form.country_name.trim()) {
      setError('Country name is required');
      return;
    }
    let rules = null;
    if (form.recognition_rules.trim()) {
      try {
        rules = JSON.parse(form.recognition_rules);
      } catch {
        setError('Recognition rules must be valid JSON');
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        country_code: form.country_code.trim().toUpperCase(),
        country_name: form.country_name.trim(),
      };
      if (rules) payload.recognition_rules = rules;
      await post('/jurisdictions', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add jurisdiction');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h2 className="modal-title">Add Jurisdiction</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Country Code *</label>
              <input
                name="country_code"
                className="form-input"
                value={form.country_code}
                onChange={handleChange}
                placeholder="DE"
                maxLength={3}
                style={{ textTransform: 'uppercase' }}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country Name *</label>
              <input
                name="country_name"
                className="form-input"
                value={form.country_name}
                onChange={handleChange}
                placeholder="Germany"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Recognition Rules{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(JSON)</span>
            </label>
            <textarea
              name="recognition_rules"
              className="form-input"
              value={form.recognition_rules}
              onChange={handleChange}
              placeholder={`{\n  "auto_recognise_types": ["education", "certification"],\n  "requires_notarisation": false\n}`}
              rows={5}
              disabled={loading}
            />
            <span className="form-hint">
              Define rules for automatic recognition. Leave blank for manual review only.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Adding…
                </>
              ) : (
                'Add Jurisdiction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRulesModal({ isOpen, onClose, onSuccess, jurisdiction }) {
  const [rules, setRules] = useState(
    jurisdiction?.recognition_rules
      ? JSON.stringify(jurisdiction.recognition_rules, null, 2)
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    let parsed = null;
    if (rules.trim()) {
      try {
        parsed = JSON.parse(rules);
      } catch {
        setError('Must be valid JSON');
        return;
      }
    }
    setLoading(true);
    try {
      await patch(`/jurisdictions/${jurisdiction._id || jurisdiction.id}`, {
        recognition_rules: parsed || {},
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update rules');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !jurisdiction) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600 }}>
        <h2 className="modal-title">
          Edit Recognition Rules — {jurisdiction.country_code}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Define automatic recognition logic for {jurisdiction.country_name}
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Recognition Rules (JSON)</label>
            <textarea
              className="form-input"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={12}
              style={{ fontFamily: 'Monaco, Menlo, monospace', fontSize: 12 }}
              disabled={loading}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Rules'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminJurisdictionsPage() {
  const { jurisdictions, isLoading, error, mutate } = useJurisdictions();
  const [addOpen, setAddOpen] = useState(false);
  const [editJurisdiction, setEditJurisdiction] = useState(null);

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
          <h1 className="page-title">Jurisdictions</h1>
          <p className="page-subtitle">
            Manage supported countries and their credential recognition rules
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Add Jurisdiction
        </button>
      </div>

      {isLoading && (
        <div className="loading-center">
          <span className="spinner spinner-lg" />
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          Failed to load jurisdictions: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && jurisdictions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🌍</div>
          <div className="empty-state-title">No jurisdictions configured</div>
          <p>Add the first jurisdiction to enable cross-border recognition.</p>
        </div>
      )}

      {!isLoading && !error && jurisdictions.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Country Name</th>
                <th>Recognition Rules</th>
                <th>Credentials Issued</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jurisdictions
                .slice()
                .sort((a, b) => a.country_name.localeCompare(b.country_name))
                .map((j) => {
                  const id = j._id || j.id;
                  const hasRules =
                    j.recognition_rules && Object.keys(j.recognition_rules).length > 0;
                  return (
                    <tr key={id}>
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: 15,
                            color: 'var(--color-primary)',
                          }}
                        >
                          {j.country_code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{j.country_name}</td>
                      <td>
                        {hasRules ? (
                          <details>
                            <summary style={{ fontSize: 12 }}>
                              {Object.keys(j.recognition_rules).length} rule(s)
                            </summary>
                            <div className="json-viewer" style={{ marginTop: 8, maxHeight: 120 }}>
                              {JSON.stringify(j.recognition_rules, null, 2)}
                            </div>
                          </details>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            No rules defined
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {j.credentials_count ?? '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditJurisdiction(j)}
                        >
                          Edit Rules
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && (
        <AddJurisdictionModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => mutate()}
        />
      )}

      {editJurisdiction && (
        <EditRulesModal
          isOpen={Boolean(editJurisdiction)}
          onClose={() => setEditJurisdiction(null)}
          onSuccess={() => {
            mutate();
            setEditJurisdiction(null);
          }}
          jurisdiction={editJurisdiction}
        />
      )}
    </div>
  );
}
