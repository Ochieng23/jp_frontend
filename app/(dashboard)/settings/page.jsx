'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../lib/hooks';
import { patch, uploadFile } from '../../../lib/api';
import useAuthStore from '../../../lib/store/authStore';
import { INDUSTRIES } from '../../../lib/industries';
import ProfileCompletion from '../../../components/ProfileCompletion';

// avatar_key/intro_video_url are API-settable and rendered straight into
// src= — the backend restricts scheme at write time, but this guards
// existing rows and any other client. avatar_key additionally allows a
// base64 image data URI (the no-Azure-storage fallback).
function safeImageUrl(url) {
  return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);base64,)/i.test(url || '') ? url : null;
}
function safeUrl(url) {
  return /^https?:\/\//i.test(url || '') ? url : null;
}

const NATIONALITIES = [
  'Afghan','Albanian','Algerian','American','Argentine','Armenian','Australian',
  'Austrian','Azerbaijani','Bahraini','Bangladeshi','Belarusian','Belgian',
  'Bolivian','Bosnian','Brazilian','British','Bulgarian','Burundian','Cambodian',
  'Cameroonian','Canadian','Chilean','Chinese','Colombian','Congolese','Croatian',
  'Cuban','Czech','Danish','Dutch','Ecuadorian','Egyptian','Eritrean','Estonian',
  'Ethiopian','Filipino','Finnish','French','Georgian','German','Ghanaian','Greek',
  'Guatemalan','Guinean','Haitian','Honduran','Hungarian','Indian','Indonesian',
  'Iranian','Iraqi','Irish','Israeli','Italian','Ivorian','Jamaican','Japanese',
  'Jordanian','Kazakhstani','Kenyan','Korean','Kurdish','Kuwaiti','Lebanese',
  'Libyan','Lithuanian','Malawian','Malaysian','Malian','Mauritanian','Mexican',
  'Moldovan','Moroccan','Mozambican','Myanmar','Namibian','Nepalese','Nigerian',
  'Norwegian','Pakistani','Palestinian','Panamanian','Peruvian','Polish','Portuguese',
  'Romanian','Russian','Rwandan','Saudi','Senegalese','Serbian','Sierra Leonean',
  'Somali','South African','South Sudanese','Spanish','Sri Lankan','Stateless',
  'Sudanese','Swedish','Swiss','Syrian','Tanzanian','Thai','Togolese','Tunisian',
  'Turkish','Ugandan','Ukrainian','Undetermined','Uruguayan','Uzbekistani',
  'Venezuelan','Vietnamese','Yemeni','Zambian','Zimbabwean','Other',
];

function Field({ label, hint, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1.5 text-xs">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white text-gray-900
   placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:bg-gray-50
   ${err ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'}`;

export default function SettingsPage() {
  const { user, isLoading, mutate } = useUser();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const [videoPreview, setVideoPreview] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const videoInputRef = useRef(null);

  // Populate form once user data loads
  useEffect(() => {
    if (user && !form) {
      const dob = user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split('T')[0]
        : '';
      setForm({
        full_name: user.full_name || '',
        bio: user.bio || '',
        nationality: user.nationality || '',
        date_of_birth: dob,
        phone: user.phone || '',
        industries: user.industries || [],
        open_to_any_industry: user.open_to_any_industry || false,
      });
    }
  }, [user, form]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setSaved(false);
  }

  function toggleIndustry(industry) {
    setForm((prev) => {
      const current = prev.industries || [];
      const next = current.includes(industry)
        ? current.filter((i) => i !== industry)
        : [...current, industry];
      return { ...prev, industries: next, open_to_any_industry: next.length > 0 ? false : prev.open_to_any_industry };
    });
    setSaved(false);
  }

  function toggleOpenToAnyIndustry() {
    setForm((prev) => ({
      ...prev,
      open_to_any_industry: !prev.open_to_any_industry,
      industries: !prev.open_to_any_industry ? [] : prev.industries,
    }));
    setSaved(false);
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (form.date_of_birth) {
      const age = (Date.now() - new Date(form.date_of_birth + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (age < 13) errs.date_of_birth = 'Must be at least 13 years old';
    }
    if (form.phone && !/^\+?[\d\s\-().]{7,20}$/.test(form.phone))
      errs.phone = 'Enter a valid phone number';
    if (form.bio && form.bio.length > 600)
      errs.bio = 'Bio must be 600 characters or fewer';
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');
    setSaved(false);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim() || null,
      };
      if (form.nationality) payload.nationality = form.nationality;
      if (form.date_of_birth) payload.date_of_birth = form.date_of_birth;
      payload.open_to_any_industry = form.open_to_any_industry;
      payload.industries = form.open_to_any_industry ? [] : form.industries;

      const result = await patch('/passport/me', payload);
      mutate({ data: result.data }, false);
      setUser(result.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
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

    // Show immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setAvatarError('');
    setAvatarUploading(true);

    try {
      let avatarKey;
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadFile('/uploads', formData);
        avatarKey = result.url || result.blobName;
      } catch (uploadErr) {
        if (uploadErr.status === 501) {
          // Storage not configured — store base64 directly
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

      const result = await patch('/passport/me', { avatar_key: avatarKey });
      mutate({ data: result.data }, false);
      setUser(result.data);
    } catch (err) {
      setAvatarPreview(null);
      setAvatarError(err.message || 'Upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const result = await patch('/passport/me', { avatar_key: null });
      mutate({ data: result.data }, false);
      setUser(result.data);
      setAvatarPreview(null);
    } catch (err) {
      setAvatarError(err.message || 'Failed to remove photo. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  }

  const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

  async function handleVideoChange(e) {
    const file = e.target.files?.[0];
    videoInputRef.current.value = '';
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      setVideoError('Please select an MP4, WEBM, or MOV video file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setVideoError('Video must be under 50 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    setVideoError('');
    setVideoUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await uploadFile('/uploads/video', formData);
      if (!uploadRes?.url) throw new Error('Video upload failed. File storage may not be configured on this server.');

      const result = await patch('/passport/me', { intro_video_url: uploadRes.url });
      mutate({ data: result.data }, false);
      setUser(result.data);
    } catch (err) {
      setVideoPreview(null);
      setVideoError(err.message || 'Upload failed. Please try again.');
    } finally {
      setVideoUploading(false);
    }
  }

  async function handleRemoveVideo() {
    setVideoError('');
    setVideoUploading(true);
    try {
      const result = await patch('/passport/me', { intro_video_url: null });
      mutate({ data: result.data }, false);
      setUser(result.data);
      setVideoPreview(null);
    } catch (err) {
      setVideoError(err.message || 'Failed to remove video. Please try again.');
    } finally {
      setVideoUploading(false);
    }
  }

  // videoPreview/avatarPreview are local blob: URLs (browser-generated,
  // always safe) and take priority; only the API-sourced fallback needs
  // the scheme guard.
  const videoSrc = videoPreview || safeUrl(user?.intro_video_url) || null;

  const avatarSrc = avatarPreview || safeImageUrl(user?.avatar_key) || null;
  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your profile and account details</p>
      </div>

      {user?.profile_completion && (
        <ProfileCompletion percentage={user.profile_completion.percentage} compact />
      )}

      <form onSubmit={handleSave} noValidate className="space-y-6">
        {/* ── Profile photo ─────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile photo</h2>

          <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarPreview(null)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {avatarUploading ? 'Uploading…' : avatarSrc ? 'Replace photo' : 'Upload photo'}
                </button>
                {user?.avatar_key && (
                  <>
                    <a
                      href="/api/passport/me/avatar/download"
                      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors no-underline"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarUploading}
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or WebP — max 5 MB</p>
              {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
            </div>
          </div>
        </section>

        {/* ── Introduction video ───────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Introduction video</h2>
          <p className="text-sm text-gray-500 mb-4">A short video explaining your craft — helps employers get to know you before they read a single credential.</p>

          {videoSrc ? (
            <div className="space-y-3">
              <div className="relative">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={videoSrc}
                  controls
                  preload="metadata"
                  className="w-full max-w-md aspect-video object-contain rounded-xl border border-gray-200 bg-black"
                />
                {videoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl max-w-md">
                    <span className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoChange} />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={videoUploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Replace video
                </button>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  disabled={videoUploading}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoChange} />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={videoUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {videoUploading ? 'Uploading…' : 'Upload video'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">MP4, WEBM, or MOV — max 50 MB. Videos are automatically screened for inappropriate content.</p>
            </div>
          )}
          {videoError && <p className="text-xs text-red-600 mt-2">{videoError}</p>}
        </section>

        {/* ── Personal information ───────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Personal information</h2>

          <Field label="Full name" required error={errors.full_name}>
            <input
              name="full_name"
              type="text"
              autoComplete="name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full legal name"
              disabled={saving}
              className={inputCls(errors.full_name)}
            />
          </Field>

          <Field label="Bio" hint="(optional — max 600 characters)" error={errors.bio}>
            <textarea
              name="bio"
              rows={3}
              value={form.bio}
              onChange={handleChange}
              placeholder="A short description about yourself — your skills, experience, or background"
              disabled={saving}
              className={`${inputCls(errors.bio)} resize-none`}
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {form.bio.length} / 600
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nationality" hint="(optional)" error={errors.nationality}>
              <select
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                disabled={saving}
                className={inputCls(errors.nationality)}
              >
                <option value="">Select…</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>

            <Field label="Date of birth" error={errors.date_of_birth}>
              <input
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                disabled={saving}
                max={new Date().toISOString().split('T')[0]}
                className={inputCls(errors.date_of_birth)}
              />
            </Field>
          </div>

          <Field label="Industries" hint="(optional — which industries are you targeting?)">
            <label className="flex items-center gap-2 mb-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.open_to_any_industry}
                onChange={toggleOpenToAnyIndustry}
                disabled={saving}
                className="rounded border-gray-300"
              />
              Open to any industry
            </label>
            <div
              className={`flex flex-wrap gap-2 ${form.open_to_any_industry ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {INDUSTRIES.map((industry) => {
                const selected = form.industries.includes(industry);
                return (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleIndustry(industry)}
                    disabled={saving || form.open_to_any_industry}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer
                      ${selected
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {industry}
                  </button>
                );
              })}
            </div>
          </Field>
        </section>

        {/* ── Contact & identity ─────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Contact &amp; identity</h2>

          <Field label="Phone" hint="(optional)" error={errors.phone}>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8901"
              disabled={saving}
              className={inputCls(errors.phone)}
            />
          </Field>

          <Field label="Email address" hint="(cannot be changed)">
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
            />
          </Field>
        </section>

        {/* ── Save bar ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
          {!saveError && (
            <span className={`text-sm transition-opacity ${saved ? 'text-green-600 opacity-100' : 'opacity-0'}`}>
              Changes saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
