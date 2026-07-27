'use client';

import { useState, useRef } from 'react';
import { useCredentials } from '../../../lib/hooks';
import CredentialBadge from '../../../components/CredentialBadge';
import JurisdictionSelector from '../../../components/JurisdictionSelector';
import Pagination from '../../../components/Pagination';
import { post, uploadFile } from '../../../lib/api';

const CREDENTIAL_TYPES = [
  'employment', 'education', 'certification', 'skill', 'reference', 'license', 'identity',
];

const PAGE_SIZE = 12;

const TYPE_COLORS = {
  employment: 'bg-primary-100 text-primary-700',
  education: 'bg-purple-100 text-purple-700',
  certification: 'bg-green-100 text-green-700',
  skill: 'bg-yellow-100 text-yellow-700',
  reference: 'bg-pink-100 text-pink-700',
  license: 'bg-orange-100 text-orange-700',
  identity: 'bg-gray-100 text-gray-700',
};

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-400 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function AddCredentialModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', type: 'employment', issuer_id: '', jurisdiction_id: '',
    issued_at: '', expires_at: '', description: '', metadata: '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFile(f) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (f && allowed.includes(f.type)) {
      setFile(f);
    } else if (f) {
      setError('Please upload a PDF, JPG, PNG, or WEBP file.');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.issued_at) { setError('Issue date is required'); return; }

    setLoading(true);
    try {
      let document_url = null;
      let document_key = null;

      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await uploadFile('/uploads', fd);
        document_url = uploadRes.url || uploadRes.document_url;
        document_key = uploadRes.key || uploadRes.document_key;
      }

      const payload = {
        title: form.title.trim(),
        type: form.type,
        issued_at: form.issued_at,
      };
      if (form.issuer_id.trim()) payload.issuer_id = form.issuer_id.trim();
      if (form.jurisdiction_id) payload.jurisdiction_id = form.jurisdiction_id;
      if (form.expires_at) payload.expires_at = form.expires_at;
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.metadata.trim()) {
        try { payload.metadata = JSON.parse(form.metadata); }
        catch { setError('Metadata must be valid JSON'); setLoading(false); return; }
      }
      if (document_url) payload.document_url = document_url;
      if (document_key) payload.document_key = document_key;

      await post('/credentials', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add credential');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Credential</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer">✕</button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input
                name="title" className={inputClass} value={form.title}
                onChange={handleChange} placeholder="e.g. Certified Welder — Grade III"
                disabled={loading}
              />
            </div>

            {/* Type + Jurisdiction */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Type <span className="text-red-500">*</span></label>
                <select name="type" className={inputClass} value={form.type} onChange={handleChange} disabled={loading}>
                  {CREDENTIAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Jurisdiction</label>
                <JurisdictionSelector
                  value={form.jurisdiction_id}
                  onChange={(v) => setForm((prev) => ({ ...prev, jurisdiction_id: v }))}
                />
              </div>
            </div>

            {/* Issuer */}
            <div>
              <label className={labelClass}>Issuer ID (Organisation)</label>
              <input
                name="issuer_id" className={inputClass} value={form.issuer_id}
                onChange={handleChange} placeholder="Organisation ID" disabled={loading}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Issue Date <span className="text-red-500">*</span></label>
                <input
                  name="issued_at" type="date" className={inputClass}
                  value={form.issued_at} onChange={handleChange}
                  disabled={loading} max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Date</label>
                <input
                  name="expires_at" type="date" className={inputClass}
                  value={form.expires_at} onChange={handleChange} disabled={loading}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description" className={inputClass} value={form.description}
                onChange={handleChange} placeholder="Optional description of the credential"
                disabled={loading} rows={3}
              />
            </div>

            {/* Metadata */}
            <div>
              <label className={labelClass}>Additional Metadata (JSON)</label>
              <textarea
                name="metadata" className={inputClass} value={form.metadata}
                onChange={handleChange} placeholder='{"grade": "A", "score": 95}'
                disabled={loading} rows={2}
              />
            </div>

            {/* File upload */}
            <div>
              <label className={labelClass}>Supporting Document</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                  disabled={loading}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-xl">📄</span>
                    <span className="font-medium text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="ml-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2">📎</div>
                    <p className="text-sm text-gray-600 font-medium">Click to upload or drag &amp; drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WEBP accepted</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button" onClick={onClose} disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding…
                  </>
                ) : 'Add Credential'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CredentialsPage() {
  const [filters, setFilters] = useState({ type: '', status: '', jurisdiction_id: '', page: 1 });
  const [addOpen, setAddOpen] = useState(false);

  const { credentials, total, hasNext, isLoading, error, mutate } = useCredentials({
    ...filters,
    pageSize: PAGE_SIZE,
  });

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = filters.type || filters.status || filters.jurisdiction_id;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your verifiable employment credentials</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm cursor-pointer"
        >
          + Add Credential
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 w-36"
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value)}
          >
            <option value="">All types</option>
            {CREDENTIAL_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 w-36"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Jurisdiction</label>
          <JurisdictionSelector
            value={filters.jurisdiction_id}
            onChange={(v) => setFilter('jurisdiction_id', v)}
          />
        </div>

        {hasFilters && (
          <button
            className="text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer self-end"
            onClick={() => setFilters({ type: '', status: '', jurisdiction_id: '', page: 1 })}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load credentials: {error.message || 'Unknown error'}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && credentials.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No credentials found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {hasFilters ? 'Try adjusting your filters.' : 'Add your first employment credential to get started.'}
          </p>
          {!hasFilters && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm cursor-pointer"
            >
              Add Credential
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && credentials.length > 0 && (
        <>
          <p className="text-xs text-gray-400">
            Showing {credentials.length} of {total} credential{total !== 1 ? 's' : ''}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((credential) => (
              <CredentialBadge key={credential._id || credential.id} credential={credential} />
            ))}
          </div>
          {total > PAGE_SIZE && (
            <div className="mt-6">
              <Pagination
                page={filters.page}
                pageSize={PAGE_SIZE}
                total={total}
                hasNext={hasNext}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            </div>
          )}
        </>
      )}

      <AddCredentialModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={() => mutate()} />
    </div>
  );
}
