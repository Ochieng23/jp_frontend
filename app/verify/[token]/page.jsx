'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import VerificationStatus from '../../../components/VerificationStatus';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export default function VerifyPage() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    async function verify() {
      setLoading(true);
      setError('');
      try {
        // No auth required — public verification endpoint
        const res = await fetch(`/api/credentials/${encodeURIComponent(token)}/verify`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setResult(data.verification || data);
          setCredential(data.credential || null);
        } else {
          setResult({ valid: false, error: data.message || 'Verification failed' });
        }
      } catch (err) {
        setError('Unable to reach verification service. Please try again.');
        setResult({ valid: false, error: err.message });
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const isExpired =
    credential?.expires_at && new Date(credential.expires_at) < new Date();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: '40px 16px',
        fontFamily: 'var(--font)',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.5px',
              marginBottom: 4,
            }}
          >
            Cazini
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Credential Verification
          </div>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner spinner-lg" />
            <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 14 }}>
              Verifying credential…
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && result && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h2
              style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--color-text)' }}
            >
              Verification Result
            </h2>
            <VerificationStatus result={result} />
          </div>
        )}

        {!loading && credential && (
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Credential Details
            </h2>

            {isExpired && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                This credential expired on {formatDate(credential.expires_at)}.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  Title
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{credential.title}</div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  Type
                </div>
                <div style={{ fontSize: 14 }}>{credential.type?.replace(/_/g, ' ')}</div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  Holder Name
                </div>
                <div style={{ fontSize: 14 }}>{credential.holder?.full_name || 'N/A'}</div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  Issuer
                </div>
                <div style={{ fontSize: 14 }}>{credential.issuer?.name || 'N/A'}</div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  Issue Date
                </div>
                <div style={{ fontSize: 14 }}>{formatDate(credential.issued_at)}</div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}
                >
                  Status
                </div>
                <div>
                  <span className={`pill pill-${credential.status}`}>{credential.status}</span>
                </div>
              </div>

              {credential.expires_at && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    Expiry Date
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: isExpired ? 'var(--color-danger)' : 'var(--color-text)',
                    }}
                  >
                    {formatDate(credential.expires_at)}
                    {isExpired && (
                      <span style={{ marginLeft: 6, fontSize: 12 }}>(Expired)</span>
                    )}
                  </div>
                </div>
              )}

              {credential.jurisdiction && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    Jurisdiction
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {credential.jurisdiction.country_name} (
                    {credential.jurisdiction.country_code})
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <p
          style={{
            textAlign: 'center',
            marginTop: 32,
            fontSize: 12,
            color: 'var(--color-text-muted)',
          }}
        >
          Powered by Cazini — portable employment credentials for everyone
        </p>
      </div>
    </div>
  );
}
