'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCredential, useOrganizations } from '../../../../lib/hooks';
import VerificationStatus from '../../../../components/VerificationStatus';
import { get, patch, del, uploadFile } from '../../../../lib/api';

const ADDABLE_TYPES = ['certification', 'skill', 'reference', 'license', 'identity'];
const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-400 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// document_url is API-settable and rendered straight into href/src — the
// backend restricts it to http(s) at write time, but this guards existing
// rows written before that check existed.
function safeUrl(url) {
  return /^https?:\/\//i.test(url || '') ? url : null;
}

function CredentialDetail({ label, value, mono }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-text-muted)',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'var(--color-text)',
          fontFamily: mono ? 'Monaco, Menlo, Courier New, monospace' : undefined,
          wordBreak: 'break-all',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function LoadingPDF() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
      Generating PDF…
    </span>
  );
}

// Only self-reported credentials are editable — a real signed VC's fields
// can't be edited without desyncing them from the cryptographic vc_json.
function EditCredentialModal({ credential, onClose, onSuccess }) {
  const { organizations } = useOrganizations();
  const [form, setForm] = useState({
    title: credential.title || '',
    type: credential.type || 'certification',
    issuer: credential.issuer?.name || credential.issuer_name || '',
    issued_at: credential.issued_at ? credential.issued_at.split('T')[0] : '',
    expires_at: credential.expires_at ? credential.expires_at.split('T')[0] : '',
    description: credential.description || '',
  });
  const [documentUrl, setDocumentUrl] = useState(credential.document_url || '');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.issuer.trim()) { setError('Please say who issued this credential'); return; }
    if (!form.issued_at) { setError('Issue date is required'); return; }

    setLoading(true);
    try {
      let finalDocumentUrl = documentUrl;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await uploadFile('/uploads', fd);
        finalDocumentUrl = uploadRes.url;
      }

      const payload = {
        title: form.title.trim(),
        type: form.type,
        issued_at: form.issued_at,
        document_url: finalDocumentUrl || null,
      };
      const matchedOrg = organizations.find(
        (org) => org.name.trim().toLowerCase() === form.issuer.trim().toLowerCase()
      );
      if (matchedOrg) { payload.issuer_id = matchedOrg._id || matchedOrg.id; payload.issuer_name = null; }
      else { payload.issuer_name = form.issuer.trim(); payload.issuer_id = null; }

      payload.expires_at = form.expires_at || null;
      payload.description = form.description.trim() || null;

      await patch(`/credentials/${credential._id || credential.id}`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Credential</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer disabled:opacity-50">✕</button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input name="title" className={inputClass} value={form.title} onChange={handleChange} disabled={loading} />
            </div>

            <div>
              <label className={labelClass}>Type <span className="text-red-500">*</span></label>
              <select name="type" className={inputClass} value={form.type} onChange={handleChange} disabled={loading}>
                {ADDABLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Issued by <span className="text-red-500">*</span></label>
              <input
                name="issuer" list="edit-issuer-suggestions" className={inputClass} value={form.issuer}
                onChange={handleChange} disabled={loading}
              />
              <datalist id="edit-issuer-suggestions">
                {organizations.map((org) => (
                  <option key={org._id || org.id} value={org.name} />
                ))}
              </datalist>
            </div>

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
                <input name="expires_at" type="date" className={inputClass} value={form.expires_at} onChange={handleChange} disabled={loading} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" className={inputClass} value={form.description} onChange={handleChange} disabled={loading} rows={3} />
            </div>

            <div>
              <label className={labelClass}>Supporting Document</label>
              {documentUrl && !file ? (
                <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <a href={documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 truncate">
                    📄 View current document
                  </a>
                  <button type="button" onClick={() => setDocumentUrl('')} className="text-xs font-medium text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0" disabled={loading}>
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => handleFile(e.target.files[0])} disabled={loading} />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-xl">📄</span>
                      <span className="font-medium text-gray-700 truncate">{file.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl mb-2">📎</div>
                      <p className="text-sm text-gray-600 font-medium">Click to upload or drag &amp; drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WEBP accepted</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 cursor-pointer">
                {loading ? (<><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteCredentialModal({ credential, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Delete Credential</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete &quot;{credential.title}&quot;? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer">
            {loading ? (<><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</>) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

async function generateAndDownloadPDF(credential) {
  // Dynamic import to avoid SSR
  const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');

  const styles = StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      padding: 40,
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 30,
      borderBottom: '2px solid #1a56db',
      paddingBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#1a56db',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 11,
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1a56db',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: 4,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#6b7280',
      width: '30%',
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 11,
      color: '#111928',
      flex: 1,
    },
    statusBadge: {
      fontSize: 11,
      fontWeight: 'bold',
      color:
        credential.status === 'active'
          ? '#057a55'
          : credential.status === 'revoked'
          ? '#e02424'
          : '#c27803',
      textTransform: 'uppercase',
    },
    proof: {
      fontSize: 8,
      color: '#6b7280',
      fontFamily: 'Courier',
      marginTop: 4,
      wordBreak: 'break-all',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      fontSize: 9,
      color: '#9ca3af',
      textAlign: 'center',
      borderTop: '1px solid #e5e7eb',
      paddingTop: 8,
    },
  });

  const proofValue = credential.vc_proof_value || credential.proof?.value || '';
  const truncatedProof = proofValue ? proofValue.substring(0, 120) + '…' : 'Not available';

  const CredentialPDF = () => (
    <Document
      title={credential.title}
      author="Cazini"
      subject="Verifiable Credential Certificate"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{credential.title}</Text>
          <Text style={styles.subtitle}>Verifiable Credential Certificate</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credential Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{credential.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{credential.type?.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.statusBadge}>{credential.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{formatDate(credential.issued_at)}</Text>
          </View>
          {credential.expires_at && (
            <View style={styles.row}>
              <Text style={styles.label}>Expiry Date</Text>
              <Text style={styles.value}>{formatDate(credential.expires_at)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issuer</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{credential.issuer?.name || credential.issuer_name || 'Unknown'}</Text>
          </View>
          {credential.issuer?.did && (
            <View style={styles.row}>
              <Text style={styles.label}>DID</Text>
              <Text style={styles.value}>{credential.issuer.did}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Holder</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{credential.holder?.full_name || 'N/A'}</Text>
          </View>
          {credential.holder?.did && (
            <View style={styles.row}>
              <Text style={styles.label}>DID</Text>
              <Text style={styles.value}>{credential.holder.did}</Text>
            </View>
          )}
        </View>

        {credential.jurisdiction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jurisdiction</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Country</Text>
              <Text style={styles.value}>
                {credential.jurisdiction.country_name} ({credential.jurisdiction.country_code})
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cryptographic Proof</Text>
          <Text style={styles.proof}>{truncatedProof}</Text>
        </View>

        <Text style={styles.footer}>
          Generated by Cazini — {new Date().toISOString()} — This document is
          digitally verifiable
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<CredentialPDF />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `credential-${credential._id || credential.id}-${credential.title
    .replace(/\s+/g, '-')
    .toLowerCase()}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default function CredentialDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { credential, isLoading, error, mutate } = useCredential(id);
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await del(`/credentials/${id}`);
      router.push('/credentials');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete credential');
      setDeleteLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      setVerifying(true);
      get(`/credentials/${id}/verify`)
        .then((data) => setVerification(data))
        .catch((err) => setVerification({ valid: false, error: err.message }))
        .finally(() => setVerifying(false));
    }
  }, [id]);

  async function handleDownloadPDF() {
    if (!credential) return;
    setPdfLoading(true);
    try {
      await generateAndDownloadPDF(credential);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setPdfLoading(false);
    }
  }

  if (isLoading) {
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
        <div className="alert alert-error">
          Failed to load credential: {error.message || 'Unknown error'}
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Credential not found.</div>
        <button className="btn btn-secondary" onClick={() => router.push('/credentials')}>
          Back to credentials
        </button>
      </div>
    );
  }

  const expired = isExpired(credential.expires_at);
  const isSelfReported = credential.proof_value === 'self-reported';

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
        <button
          onClick={() => router.push('/credentials')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            padding: 0,
            fontSize: 13,
          }}
        >
          Credentials
        </button>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>{credential.title}</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title" style={{ marginBottom: 8 }}>
            {credential.title}
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`pill pill-${credential.status}`}>
              {credential.status}
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              {credential.type?.replace(/_/g, ' ')}
            </span>
            {expired && (
              <span className="pill" style={{ background: '#fde8e8', color: '#e02424' }}>
                Expired
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isSelfReported ? (
            <button className="btn btn-secondary" onClick={() => setEditOpen(true)}>
              Edit
            </button>
          ) : (
            <span
              title="Issued by a verified organisation — edit the entry via Work History/Education instead, or contact the issuer"
              style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}
            >
              Issued by {credential.issuer?.name || 'a verified organisation'} — cannot be edited
            </span>
          )}
          <button
            className="btn"
            onClick={() => setDeleteOpen(true)}
            style={{ background: '#fde8e8', color: '#e02424', border: '1px solid #f8b4b4' }}
          >
            Delete
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? <LoadingPDF /> : 'Download PDF Certificate'}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {deleteError}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2 className="card-title">Credential Details</h2>
            </div>
            <CredentialDetail label="Title" value={credential.title} />
            <CredentialDetail label="Type" value={credential.type?.replace(/_/g, ' ')} />
            <CredentialDetail label="Description" value={credential.description} />
            <CredentialDetail label="Issue Date" value={formatDate(credential.issued_at)} />
            <CredentialDetail
              label="Expiry Date"
              value={credential.expires_at ? formatDate(credential.expires_at) : 'No expiry'}
            />
            <CredentialDetail
              label="Credential ID"
              value={credential._id || credential.id}
              mono
            />
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2 className="card-title">Issuer</h2>
            </div>
            <CredentialDetail label="Name" value={credential.issuer?.name || credential.issuer_name} />
            {credential.issuer?.type && <CredentialDetail label="Type" value={credential.issuer.type} />}
            <CredentialDetail
              label="Jurisdiction"
              value={
                credential.jurisdiction
                  ? `${credential.jurisdiction.country_name} (${credential.jurisdiction.country_code})`
                  : credential.issuer?.jurisdiction?.country_name
              }
            />
            {credential.issuer?.did && (
              <CredentialDetail label="DID" value={credential.issuer.did} mono />
            )}
          </div>

          {credential.holder && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Holder</h2>
              </div>
              <CredentialDetail label="Name" value={credential.holder.full_name} />
              {credential.holder.did && (
                <CredentialDetail label="DID" value={credential.holder.did} mono />
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Verification */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2 className="card-title">Verification Status</h2>
            </div>
            {verifying ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                <span className="spinner" />
                <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                  Verifying credential…
                </span>
              </div>
            ) : (
              <VerificationStatus result={verification} />
            )}
          </div>

          {/* Cross-jurisdiction recognition */}
          {Array.isArray(credential.recognitions) && credential.recognitions.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <h2 className="card-title">Cross-Jurisdiction Recognition</h2>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Jurisdiction</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credential.recognitions.map((r, i) => (
                      <tr key={i}>
                        <td>
                          {r.jurisdiction?.country_name || r.jurisdiction_id || '—'}
                        </td>
                        <td>
                          <span className={`pill pill-${r.recognition_status}`}>
                            {r.recognition_status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {r.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supporting Document */}
          {safeUrl(credential.document_url) && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="card-title">Supporting Document</h2>
                <a
                  href={safeUrl(credential.document_url)}
                  download={`${credential.title.replace(/\s+/g, '-').toLowerCase()}-document`}
                  style={{ fontSize: 13, color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  Download
                </a>
              </div>
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img
                  src={safeUrl(credential.document_url)}
                  alt="Supporting document"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Raw VC JSON */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Raw Verifiable Credential</h2>
            </div>
            <details open={showRaw}>
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setShowRaw((prev) => !prev);
                }}
              >
                {showRaw ? 'Hide' : 'Show'} raw VC JSON
              </summary>
              {showRaw && (
                <div className="json-viewer" style={{ marginTop: 12 }}>
                  {JSON.stringify(credential, null, 2)}
                </div>
              )}
            </details>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditCredentialModal
          credential={credential}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            mutate();
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmDeleteCredentialModal
          credential={credential}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
