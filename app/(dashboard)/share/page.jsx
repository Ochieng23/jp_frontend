'use client';

import { useState, useEffect } from 'react';
import { post, get, del } from '../../../lib/api';
import { decodeJwt } from 'jose';

function formatExpiry(timestamp) {
  if (!timestamp) return 'Unknown';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(timestamp * 1000)
  );
}

function timeUntilExpiry(exp) {
  if (!exp) return null;
  const diff = exp * 1000 - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  if (hours < 24) return `${hours}h ${minutes}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function isExpiredToken(exp) {
  return exp ? exp * 1000 < Date.now() : false;
}

function isExpiringSoon(exp) {
  if (!exp) return false;
  const diff = exp * 1000 - Date.now();
  return diff > 0 && diff < 60 * 60 * 1000;
}

function ShareLinkCard({ link, onRevoke }) {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  let decoded = null;
  try { decoded = decodeJwt(link.token); } catch { decoded = null; }

  const exp = decoded?.exp || link.expires_at;
  const expired = isExpiredToken(exp);
  const expiringSoon = isExpiringSoon(exp);
  const remaining = timeUntilExpiry(exp);

  const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${link.token}`;

  function handleCopy() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleRevoke() {
    setRevoking(true);
    try { await onRevoke(link._id || link.id || link.token); }
    finally { setRevoking(false); }
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-opacity
      ${expired ? 'opacity-60 border-gray-100' : expiringSoon ? 'border-amber-200' : 'border-gray-100'}`}>

      {expiringSoon && !expired && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          This link expires in {remaining} — consider generating a new one.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Share URL</div>
          <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 break-all text-gray-700">
            {fullUrl}
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500">Expires: </span>
              <span className={`font-medium ${expired ? 'text-red-600' : expiringSoon ? 'text-amber-600' : 'text-gray-700'}`}>
                {exp ? formatExpiry(exp) : 'No expiry'}
              </span>
            </div>
            {!expired && remaining && (
              <div>
                <span className="text-gray-500">Remaining: </span>
                <span className={`font-medium ${expiringSoon ? 'text-amber-600' : 'text-green-600'}`}>
                  {remaining}
                </span>
              </div>
            )}
            {expired && (
              <span className="text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full">
                Expired
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {!expired && (
            <button
              onClick={handleCopy}
              className={`min-w-[70px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer
                ${copied
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
          <button
            onClick={handleRevoke}
            disabled={revoking}
            className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {revoking ? '…' : 'Revoke'}
          </button>
        </div>
      </div>

      {decoded && (
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Token details</summary>
          <pre className="mt-2 text-xs font-mono bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto max-h-36 text-gray-600">
            {JSON.stringify(decoded, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function SharePage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [expiry, setExpiry] = useState('7d');

  async function fetchLinks() {
    setLoading(true);
    setError('');
    try {
      const data = await get('/passport/share-links');
      setLinks(Array.isArray(data) ? data : data?.links || []);
    } catch (err) {
      setError(err.message || 'Failed to load share links');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLinks(); }, []);

  async function handleGenerate() {
    setGenError('');
    setGenerating(true);
    try {
      const data = await post('/passport/share-link', { expires_in: expiry });
      const newLink = {
        token: data.token || data.share_token || data.shareToken,
        _id: data._id || data.id || Date.now().toString(),
        expires_at: data.expires_at,
      };
      setLinks((prev) => [newLink, ...prev]);
    } catch (err) {
      setGenError(err.message || 'Failed to generate link');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevoke(idOrToken) {
    try {
      await del(`/passport/share-links/${idOrToken}`);
      setLinks((prev) => prev.filter((l) => (l._id || l.id || l.token) !== idOrToken));
    } catch (err) {
      alert('Failed to revoke: ' + (err.message || 'Unknown error'));
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Share Links</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Generate shareable links that let employers and organisations view your passport
        </p>
      </div>

      {/* Generate card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Generate New Share Link</h2>
        <p className="text-sm text-gray-500 mb-5">
          Anyone with this link can view your public passport profile (read-only).
        </p>

        {genError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {genError}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Link expiry
            </label>
            <select
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 w-40"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              disabled={generating}
            >
              <option value="1h">1 hour</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm cursor-pointer"
          >
            {generating ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : 'Generate Link'}
          </button>
        </div>
      </div>

      {/* Existing links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Active Links{' '}
            {!loading && (
              <span className="text-sm font-normal text-gray-500">({links.length})</span>
            )}
          </h2>
          <button
            onClick={fetchLinks}
            disabled={loading}
            className="text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <span className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && links.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No share links yet</h3>
            <p className="text-sm text-gray-500">Generate a link above to share your passport with employers.</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {links.map((link) => (
              <ShareLinkCard
                key={link._id || link.id || link.token}
                link={link}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
