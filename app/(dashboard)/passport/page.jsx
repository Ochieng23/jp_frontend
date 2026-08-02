'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useUser, useCredentials } from '../../../lib/hooks';
import ShareLinkDialog from '../../../components/ShareLinkDialog';
import { post, patch, uploadFile } from '../../../lib/api';

function StatCard({ label, value, icon, color, valueColor }) {
  return (
    // min-w-0 at both levels lets the card shrink below the label's
    // min-content width in narrow grid columns ("JURISDICTIONS" alone is
    // ~100px at this size) instead of forcing horizontal page scroll.
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 min-w-0">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-bold ${valueColor || 'text-gray-900'}`}>{value}</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5 [overflow-wrap:anywhere]">{label}</div>
      </div>
    </div>
  );
}

export default function PassportPage() {
  const { user, isLoading, error, mutate } = useUser();
  const { credentials } = useCredentials({ status: 'active' });
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState(null); // { token, slug, expires_at }
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB.');
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);
    try {
      let avatarKey;

      // Try the dedicated upload endpoint first (requires Azure/MinIO storage)
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadFile('/uploads', formData);
        avatarKey = result.url || result.blobName;
      } catch (uploadErr) {
        if (uploadErr.status === 501) {
          // Storage not configured — fall back to base64 data URL stored in MongoDB
          avatarKey = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else {
          throw uploadErr;
        }
      }

      const updated = await patch('/passport/me', { avatar_key: avatarKey });
      mutate({ data: updated.data }, false);
    } catch (err) {
      setAvatarError(err.message || 'Upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
        Failed to load passport: {error.message || 'Unknown error'}
      </div>
    );
  }

  const activeCredentials = credentials.filter((c) => c.status === 'active');
  const credByType = activeCredentials.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  const recognisedJurisdictions = new Set();
  activeCredentials.forEach((c) => {
    if (Array.isArray(c.recognitions)) {
      c.recognitions.forEach((r) => {
        if (r.recognition_status === 'recognised') {
          recognisedJurisdictions.add(r.jurisdiction?.country_code || r.jurisdiction_id);
        }
      });
    }
  });

  async function handleShare() {
    setShareError('');
    setShareData(null);
    setShareOpen(true);
    setShareLoading(true);
    try {
      const res = await post('/passport/share-link', { expires_in: '7d' });
      setShareData({ token: res.token, slug: res.slug, expires_at: res.expires_at });
    } catch (err) {
      setShareError(err.message || 'Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const joinedDate = user?.created_at
    ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long' }).format(new Date(user.created_at))
    : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Passport</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your portable employment credential identity</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm cursor-pointer"
        >
          🔗 Share Passport
        </button>
      </div>

      {/* Passport card */}
      <div className="relative bg-primary-800 rounded-3xl p-8 text-white overflow-hidden shadow-xl shadow-primary-200">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="relative flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            {/* Clickable avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              title="Upload profile photo"
              className="relative w-16 h-16 rounded-2xl flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed"
            >
              {user?.avatar_key ? (
                <img
                  src={user.avatar_key}
                  alt={user.full_name || 'Avatar'}
                  className="w-full h-full rounded-2xl object-cover border-2 border-white/30"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {avatarUploading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : initials}
                </div>
              )}
              {/* Overlay on hover */}
              {!avatarUploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
              {avatarUploading && user?.avatar_key && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider mb-1">Cazini</p>
              <h2 className="text-2xl font-bold break-words">{user?.full_name || '—'}</h2>
              <p className="text-primary-200 text-sm mt-1">{user?.nationality || '—'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-right">
            {user?.role && (
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full self-end">
                {user.role.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="relative mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {user?.email && (
            <div>
              <p className="text-primary-300 text-xs uppercase tracking-wide">Email</p>
              <p className="font-semibold mt-0.5 truncate">{user.email}</p>
            </div>
          )}
          <div>
            <p className="text-primary-300 text-xs uppercase tracking-wide">Member since</p>
            <p className="font-semibold mt-0.5">{joinedDate}</p>
          </div>
        </div>
      </div>

      {avatarError && (
        <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {avatarError}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Credentials"       value={activeCredentials.length}        icon="📜" color="bg-primary-50"   valueColor="text-primary-600"  />
        <StatCard label="Recognised Jurisdictions" value={recognisedJurisdictions.size}    icon="🌍" color="bg-green-50"  valueColor="text-green-600" />
        <StatCard label="Credential Types"         value={Object.keys(credByType).length}  icon="🗂️" color="bg-violet-50" valueColor="text-violet-600" />
        <StatCard label="Total Credentials"        value={credentials.length}              icon="🎓" color="bg-amber-50"  valueColor="text-amber-600" />
      </div>

      {/* Credentials by type */}
      {Object.keys(credByType).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Credentials by Type</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(credByType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2"
              >
                <span className="font-bold text-gray-900 text-base">{count}</span>
                <span className="text-sm text-gray-600 capitalize">{type.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Introduction video */}
      {user?.intro_video_url && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Introduction video</h2>
            <Link href="/settings" className="text-sm font-medium text-primary-600 hover:text-primary-700">Manage</Link>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={user.intro_video_url}
            controls
            preload="metadata"
            className="w-full max-w-xl aspect-video object-contain rounded-xl border border-gray-200 bg-black"
          />
        </div>
      )}

      {shareOpen && (
        <ShareLinkDialog
          isOpen={shareOpen}
          onClose={() => { setShareOpen(false); setShareData(null); setShareError(''); }}
          shareToken={shareLoading ? null : shareData}
          error={shareError}
          loading={shareLoading}
        />
      )}
    </div>
  );
}
