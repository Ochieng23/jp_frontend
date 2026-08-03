'use client';

import { useState, useRef } from 'react';
import { useEducation } from '../../../lib/hooks';
import { post, patch, del, uploadFile } from '../../../lib/api';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short' }).format(new Date(dateStr));
}

// document_url is API-settable and rendered straight into an href — the
// backend now restricts it to http(s) at write time, but this guards
// existing rows written before that check existed and any other client.
function safeUrl(url) {
  return /^https?:\/\//i.test(url || '') ? url : null;
}

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-400 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function QualificationModal({ isOpen, onClose, onSuccess, entry }) {
  const isEdit = Boolean(entry);
  const [form, setForm] = useState({
    institution_name: entry?.institution_name || '',
    qualification: entry?.qualification || '',
    start_date: entry?.start_date ? entry.start_date.split('T')[0] : '',
    end_date: entry?.end_date ? entry.end_date.split('T')[0] : '',
    location: entry?.location || '',
    description: entry?.description || '',
    is_current: entry?.is_current || false,
  });
  const [documentUrl, setDocumentUrl] = useState(entry?.document_url || '');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleFile(f) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (f && allowed.includes(f.type)) {
      setFile(f);
      setError('');
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
    if (!form.institution_name.trim()) { setError('Institution name is required'); return; }
    if (!form.qualification.trim()) { setError('Qualification is required'); return; }
    if (!form.start_date) { setError('Start date is required'); return; }

    setLoading(true);
    try {
      let finalDocumentUrl = documentUrl;
      if (file) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('file', file);
          const uploadRes = await uploadFile('/uploads', fd);
          finalDocumentUrl = uploadRes.url;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        institution_name: form.institution_name.trim(),
        qualification: form.qualification.trim(),
        start_date: form.start_date,
        is_current: form.is_current,
        document_url: finalDocumentUrl || null,
      };
      if (form.end_date && !form.is_current) payload.end_date = form.end_date;
      if (form.location.trim()) payload.location = form.location.trim();
      if (form.description.trim()) payload.description = form.description.trim();

      if (isEdit) {
        await patch(`/education/${entry._id || entry.id}`, payload);
      } else {
        await post('/education', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save entry');
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
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Qualification' : 'Add Qualification'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer">✕</button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Institution Name <span className="text-red-500">*</span></label>
              <input
                name="institution_name" className={inputClass} value={form.institution_name}
                onChange={handleChange} placeholder="e.g. Kenyatta University" disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>Qualification <span className="text-red-500">*</span></label>
              <input
                name="qualification" className={inputClass} value={form.qualification}
                onChange={handleChange} placeholder="e.g. Diploma in Software Engineering" disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                name="location" className={inputClass} value={form.location}
                onChange={handleChange} placeholder="City, Country" disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Date <span className="text-red-500">*</span></label>
                <input
                  name="start_date" type="date" className={inputClass}
                  value={form.start_date} onChange={handleChange}
                  disabled={loading} max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input
                  name="end_date" type="date" className={inputClass}
                  value={form.end_date} onChange={handleChange}
                  disabled={loading || form.is_current}
                  min={form.start_date} max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                name="is_current" type="checkbox"
                checked={form.is_current} onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">I&apos;m currently studying here</span>
            </label>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description" className={inputClass} value={form.description}
                onChange={handleChange} placeholder="Notable coursework, achievements, or activities"
                disabled={loading} rows={3}
              />
            </div>

            {/* Certificate */}
            <div>
              <label className={labelClass}>Certificate</label>
              <p className="text-xs text-gray-400 -mt-1 mb-2">
                Most programs issue a certificate or diploma on completion — attach a copy so employers can see proof.
              </p>

              {safeUrl(documentUrl) && !file ? (
                <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <a
                    href={safeUrl(documentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 truncate"
                  >
                    📄 View current certificate
                  </a>
                  <button
                    type="button"
                    onClick={() => setDocumentUrl('')}
                    className="text-xs font-medium text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ) : (
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
                      <span className="font-medium text-gray-700 truncate">{file.name}</span>
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
                      <div className="text-2xl mb-2">🎓</div>
                      <p className="text-sm text-gray-600 font-medium">Click to upload or drag &amp; drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WEBP accepted — optional</p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                    {uploading ? 'Uploading certificate…' : 'Saving…'}
                  </>
                ) : isEdit ? 'Save Changes' : 'Add Qualification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, entryName, loading }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Delete Qualification</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete &quot;{entryName}&quot;? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose} disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EducationPage() {
  const { entries, isLoading, error, mutate } = useEducation();
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleteEntry) return;
    setDeleteLoading(true);
    try {
      await del(`/education/${deleteEntry._id || deleteEntry.id}`);
      mutate();
      setDeleteEntry(null);
    } catch (err) {
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  }

  const sortedEntries = entries
    .slice()
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Education</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schools, colleges, and training you&apos;ve completed</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm cursor-pointer"
        >
          + Add Qualification
        </button>
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
          Failed to load education: {error.message || 'Unknown error'}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No education added yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your qualifications to build your professional profile.</p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm cursor-pointer"
          >
            Add Qualification
          </button>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && !error && sortedEntries.length > 0 && (
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-5">
            {sortedEntries.map((entry) => {
              const id = entry._id || entry.id;
              return (
                <div key={id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-5 top-5 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow" />

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">{entry.qualification}</h3>
                        <p className="text-primary-600 font-medium text-sm mt-0.5">{entry.institution_name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {entry.location && <span>{entry.location} · </span>}
                          {formatDate(entry.start_date)} —{' '}
                          {entry.is_current ? (
                            <span className="text-green-600 font-semibold">Present</span>
                          ) : (
                            formatDate(entry.end_date) || 'Unknown'
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {entry.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                            ✓ Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => setEditEntry(entry)}
                            className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteEntry(entry)}
                          className="text-xs font-medium text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {entry.description && (
                      <p className="text-sm text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">
                        {entry.description}
                      </p>
                    )}

                    {safeUrl(entry.document_url) ? (
                      <a
                        href={safeUrl(entry.document_url)}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 mt-3 ${entry.description ? '' : 'pt-3 border-t border-gray-100'}`}
                      >
                        📄 View certificate
                      </a>
                    ) : (
                      !entry.verified && (
                        <p className={`text-xs text-gray-400 mt-3 ${entry.description ? '' : 'pt-3 border-t border-gray-100'}`}>
                          No certificate attached —{' '}
                          <button onClick={() => setEditEntry(entry)} className="underline hover:text-gray-600 cursor-pointer">
                            add one
                          </button>
                        </p>
                      )
                    )}

                    {entry.verified && (
                      <p className="text-xs text-gray-400 italic mt-2">
                        This entry has been verified and cannot be edited.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {addOpen && (
        <QualificationModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => mutate()}
        />
      )}

      {editEntry && (
        <QualificationModal
          isOpen={Boolean(editEntry)}
          onClose={() => setEditEntry(null)}
          onSuccess={() => { mutate(); setEditEntry(null); }}
          entry={editEntry}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteEntry)}
        onClose={() => setDeleteEntry(null)}
        onConfirm={handleDelete}
        entryName={deleteEntry ? `${deleteEntry.qualification} at ${deleteEntry.institution_name}` : ''}
        loading={deleteLoading}
      />
    </div>
  );
}
