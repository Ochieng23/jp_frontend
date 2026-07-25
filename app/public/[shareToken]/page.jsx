'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { decodeJwt } from 'jose';
import PassportCard from '../../../components/PassportCard';
import CredentialBadge from '../../../components/CredentialBadge';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function PublicPassportPage() {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!shareToken) return;

    async function loadPublicPassport() {
      setLoading(true);
      setError('');

      // First decode the JWT to check expiry
      let decoded = null;
      try {
        decoded = decodeJwt(shareToken);
      } catch (err) {
        setError('Invalid share link: the token is malformed.');
        setLoading(false);
        return;
      }

      // Check expiry
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        setExpired(true);
        setLoading(false);
        return;
      }

      // Extract holder ID from token
      const holderId = decoded.holder_id || decoded.sub || decoded.userId;
      if (!holderId) {
        setError('Invalid share link: cannot identify the passport holder.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/passport/${encodeURIComponent(holderId)}/public?token=${encodeURIComponent(shareToken)}`,
          { credentials: 'include' }
        );
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          setError(json.message || json.error || 'Failed to load passport');
        }
      } catch (err) {
        setError('Unable to load passport. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    loadPublicPassport();
  }, [shareToken]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: '40px 16px',
        fontFamily: 'var(--font)',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
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
            Shared Passport Profile
          </div>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner spinner-lg" />
            <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 14 }}>
              Loading passport…
            </p>
          </div>
        )}

        {expired && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
              This link has expired
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              The person who shared this passport needs to generate a new share link.
            </p>
          </div>
        )}

        {error && !loading && !expired && (
          <div className="card">
            <div className="alert alert-error" style={{ marginBottom: 0 }}>
              {error}
            </div>
          </div>
        )}

        {!loading && !expired && !error && data && (
          <>
            {/* Passport Card */}
            <div style={{ marginBottom: 32 }}>
              <PassportCard
                user={data.user || data.holder || data}
                hasActiveCredential={
                  Array.isArray(data.credentials) &&
                  data.credentials.some((c) => c.status === 'active')
                }
              />
            </div>

            {/* Credentials */}
            {Array.isArray(data.credentials) && data.credentials.length > 0 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
                  Credentials ({data.credentials.length})
                </h2>
                <div className="credential-grid">
                  {data.credentials.map((credential) => (
                    <CredentialBadge
                      key={credential._id || credential.id}
                      credential={credential}
                      readOnly
                    />
                  ))}
                </div>
              </div>
            )}

            {(!data.credentials || data.credentials.length === 0) && (
              <div className="empty-state">
                <div className="empty-state-icon">🎓</div>
                <div className="empty-state-title">No credentials to display</div>
                <p>This passport has no public credentials at this time.</p>
              </div>
            )}

            {/* Footer note */}
            <div
              style={{
                marginTop: 40,
                padding: '16px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                fontSize: 13,
                color: 'var(--color-text-muted)',
                textAlign: 'center',
              }}
            >
              This is a read-only view shared by the passport holder. To verify individual
              credentials, use the verify link on each credential.
            </div>
          </>
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
