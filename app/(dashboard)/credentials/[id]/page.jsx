'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCredential } from '../../../../lib/hooks';
import VerificationStatus from '../../../../components/VerificationStatus';
import { get } from '../../../../lib/api';

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
            <Text style={styles.value}>{credential.issuer?.name || 'Unknown'}</Text>
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
  const { credential, isLoading, error } = useCredential(id);
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

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
        <button
          className="btn btn-secondary"
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? <LoadingPDF /> : 'Download PDF Certificate'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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
            <CredentialDetail label="Name" value={credential.issuer?.name} />
            <CredentialDetail label="Type" value={credential.issuer?.type} />
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
          {credential.document_url && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="card-title">Supporting Document</h2>
                <a
                  href={credential.document_url}
                  download={`${credential.title.replace(/\s+/g, '-').toLowerCase()}-document`}
                  style={{ fontSize: 13, color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  Download
                </a>
              </div>
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img
                  src={credential.document_url}
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
    </div>
  );
}
