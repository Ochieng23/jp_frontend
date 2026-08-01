'use client';

import { useState } from 'react';

// shareToken can be a JWT string (legacy) or an object { slug, token, expires_at }
export default function ShareLinkDialog({ isOpen, onClose, shareToken, error, loading }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // Support both old format (raw JWT string) and new format ({ slug, token, expires_at })
  const slug = shareToken?.slug || null;
  const rawToken = typeof shareToken === 'string' ? shareToken : shareToken?.token || null;

  const shortUrl = slug ? `${origin}/p/${slug}` : null;
  const legacyUrl = rawToken && !slug
    ? `${origin}/public/${rawToken}`
    : null;
  const fullUrl = shortUrl || legacyUrl;

  function handleCopy() {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Expiry from API response or JWT
  let expTime = null;
  if (shareToken?.expires_at) {
    expTime = new Date(shareToken.expires_at);
  } else if (rawToken) {
    try {
      const parts = rawToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp) expTime = new Date(payload.exp * 1000);
      }
    } catch { expTime = null; }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Share Your Passport</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-8 gap-4">
              <span className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Generating your share link…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {!loading && !error && fullUrl && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Anyone with this link can view your public passport profile (read-only).
              </p>

              {/* URL box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs text-gray-700 break-all">
                {fullUrl}
              </div>

              {/* Expiry */}
              {expTime && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>⏰</span>
                  <span>
                    Expires:{' '}
                    <strong className="text-gray-700">
                      {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(expTime)}
                    </strong>
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer
                    ${copied
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                This link expires automatically — generate a new one any time from My Passport.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
