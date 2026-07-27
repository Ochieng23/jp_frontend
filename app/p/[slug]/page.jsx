'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import CaziniLogo from '../../../components/CaziniLogo';
// @react-pdf/renderer is loaded dynamically inside the click handler to avoid
// SSR crashes — the library requires a browser/canvas environment.

const FLAG_MAP = {
  Afghan:'🇦🇫',Albanian:'🇦🇱',Algerian:'🇩🇿',American:'🇺🇸',Argentine:'🇦🇷',Armenian:'🇦🇲',
  Australian:'🇦🇺',Austrian:'🇦🇹',Azerbaijani:'🇦🇿',Bangladeshi:'🇧🇩',Belgian:'🇧🇪',
  Brazilian:'🇧🇷',British:'🇬🇧',Bulgarian:'🇧🇬',Cambodian:'🇰🇭',Canadian:'🇨🇦',Chilean:'🇨🇱',
  Chinese:'🇨🇳',Colombian:'🇨🇴',Congolese:'🇨🇩',Croatian:'🇭🇷',Cuban:'🇨🇺',Czech:'🇨🇿',
  Danish:'🇩🇰',Dutch:'🇳🇱',Egyptian:'🇪🇬',Eritrean:'🇪🇷',Estonian:'🇪🇪',Ethiopian:'🇪🇹',
  Filipino:'🇵🇭',Finnish:'🇫🇮',French:'🇫🇷',Georgian:'🇬🇪',German:'🇩🇪',Ghanaian:'🇬🇭',
  Greek:'🇬🇷',Haitian:'🇭🇹',Hungarian:'🇭🇺',Indian:'🇮🇳',Indonesian:'🇮🇩',Iranian:'🇮🇷',
  Iraqi:'🇮🇶',Irish:'🇮🇪',Israeli:'🇮🇱',Italian:'🇮🇹',Jamaican:'🇯🇲',Japanese:'🇯🇵',
  Jordanian:'🇯🇴',Kazakhstani:'🇰🇿',Kenyan:'🇰🇪',Korean:'🇰🇷',Kuwaiti:'🇰🇼',Lebanese:'🇱🇧',
  Libyan:'🇱🇾',Lithuanian:'🇱🇹',Malaysian:'🇲🇾',Mexican:'🇲🇽',Moroccan:'🇲🇦',
  Namibian:'🇳🇦',Nepalese:'🇳🇵',Nigerian:'🇳🇬',Norwegian:'🇳🇴',Pakistani:'🇵🇰',
  Palestinian:'🇵🇸',Peruvian:'🇵🇪',Polish:'🇵🇱',Portuguese:'🇵🇹',Romanian:'🇷🇴',
  Russian:'🇷🇺',Rwandan:'🇷🇼',Saudi:'🇸🇦',Senegalese:'🇸🇳',Serbian:'🇷🇸',Somali:'🇸🇴',
  'South African':'🇿🇦','South Sudanese':'🇸🇸',Spanish:'🇪🇸','Sri Lankan':'🇱🇰',
  Stateless:'🏳️',Sudanese:'🇸🇩',Swedish:'🇸🇪',Swiss:'🇨🇭',Syrian:'🇸🇾',Tanzanian:'🇹🇿',
  Thai:'🇹🇭',Tunisian:'🇹🇳',Turkish:'🇹🇷',Ugandan:'🇺🇬',Ukrainian:'🇺🇦',
  Undetermined:'🏳️',Uruguayan:'🇺🇾',Venezuelan:'🇻🇪',Vietnamese:'🇻🇳',Yemeni:'🇾🇪',
  Zambian:'🇿🇲',Zimbabwean:'🇿🇼',
};

const TYPE_LABELS = {
  VocationalCertificate: 'Vocational',
  WorkHistory:           'Work',
  LanguageTest:          'Language',
  EducationDegree:       'Education',
  ProfessionalLicense:   'License',
};

const TYPE_ICONS = {
  VocationalCertificate: '🎓',
  WorkHistory:           '💼',
  LanguageTest:          '🗣️',
  EducationDegree:       '📚',
  ProfessionalLicense:   '📋',
};

function fmtDate(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short' }).format(new Date(d));
}

function isVerified(cred) {
  return cred.proof_value && cred.proof_value !== 'PENDING_VERIFICATION';
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Verified
    </span>
  );
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Pending
    </span>
  );
}

function CredentialCard({ cred }) {
  const verified = isVerified(cred);
  const icon = TYPE_ICONS[cred.type] || '📄';
  const label = TYPE_LABELS[cred.type] || cred.type?.replace(/([A-Z])/g, ' $1').trim();
  return (
    <div className={`bg-white border rounded-xl p-4 transition-shadow hover:shadow-md ${verified ? 'border-green-100' : 'border-amber-100'}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{cred.title}</h3>
            {verified ? <VerifiedBadge /> : <PendingBadge />}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">{label}</span>
            {cred.issued_at && (
              <span className="text-xs text-gray-400">· {fmtDate(cred.issued_at)}</span>
            )}
            {cred.expires_at && (
              <span className="text-xs text-gray-400">· exp. {fmtDate(cred.expires_at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkCard({ work }) {
  const verified = work.verified;
  const dateRange = work.start_date
    ? `${fmtDate(work.start_date)} — ${work.is_current ? 'Present' : (work.end_date ? fmtDate(work.end_date) : '—')}`
    : null;
  return (
    <div className={`bg-white border rounded-xl p-4 transition-shadow hover:shadow-md ${verified ? 'border-green-100' : 'border-amber-100'}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">💼</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug">{work.job_title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{work.employer_name}{work.location ? ` · ${work.location}` : ''}</p>
            </div>
            {verified ? <VerifiedBadge /> : <PendingBadge />}
          </div>
          {dateRange && (
            <p className="text-xs text-gray-400 mt-1.5">{dateRange}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicPassportPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [expired, setExpired] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/passport/s/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const json = await res.json();
        if (res.status === 410) { setExpired(true); return; }
        if (!res.ok) { setErrorMsg(json.message || 'Failed to load passport'); return; }
        setData(json.data);
      })
      .catch(() => setErrorMsg('Unable to load. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleDownloadPDF() {
    if (!data) return;
    setPdfLoading(true);
    try {
      // Dynamic import keeps @react-pdf/renderer out of the SSR bundle
      const [{ pdf }, { default: PassportPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PassportPDF'),
      ]);
      const blob = await pdf(
        PassportPDF({ holder: data.holder, credentials: data.credentials, pageUrl })
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(data.holder?.full_name || 'passport').replace(/\s+/g, '_')}_passport.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setPdfLoading(false);
    }
  }

  const holder = data?.holder;
  const credentials = data?.credentials || [];
  const workExperiences = data?.workExperiences || [];
  const verifiedCreds = credentials.filter(isVerified);
  const pendingCreds = credentials.filter((c) => !isVerified(c));
  const verifiedWork = workExperiences.filter((w) => w.verified);
  const pendingWork = workExperiences.filter((w) => !w.verified);
  const initials = holder?.full_name
    ? holder.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const flag = FLAG_MAP[holder?.nationality] || '🌍';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="no-underline inline-block">
            <CaziniLogo markSize={28} wordmarkClassName="text-sm" />
          </Link>
          <span className="text-xs text-gray-400">Shared credential profile</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading passport…</p>
          </div>
        )}

        {/* Expired */}
        {expired && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">This link has expired</h2>
            <p className="text-sm text-gray-500">The person who shared this passport needs to generate a new share link.</p>
          </div>
        )}

        {/* Error */}
        {errorMsg && !loading && !expired && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Content */}
        {!loading && !expired && !errorMsg && data && (
          <>
            {/* Profile hero card */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl p-8 text-white shadow-xl shadow-primary-200 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

              <div className="relative flex items-center gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 flex-shrink-0">
                  {holder?.avatar_key ? (
                    <img src={holder.avatar_key} alt={holder.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider mb-1">Verified Passport</p>
                  <h1 className="text-2xl font-bold truncate">{holder?.full_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{flag}</span>
                    <span className="text-primary-200 text-sm">{holder?.nationality || '—'}</span>
                  </div>
                </div>

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {pdfLoading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  Download PDF
                </button>
              </div>

              {/* Bio */}
              {holder?.bio && (
                <div className="relative mt-5 pt-5 border-t border-white/20">
                  <p className="text-primary-50 text-sm leading-relaxed">{holder.bio}</p>
                </div>
              )}

              {/* Stats strip */}
              <div className="relative mt-4 pt-4 border-t border-white/20 flex gap-5 text-sm">
                <div>
                  <p className="text-primary-300 text-xs uppercase tracking-wide">Credentials</p>
                  <p className="font-bold text-base mt-0.5">{credentials.length}</p>
                </div>
                {workExperiences.length > 0 && (
                  <div>
                    <p className="text-primary-300 text-xs uppercase tracking-wide">Experience</p>
                    <p className="font-bold text-base mt-0.5">{workExperiences.length}</p>
                  </div>
                )}
                <div>
                  <p className="text-primary-300 text-xs uppercase tracking-wide">Verified</p>
                  <p className="font-bold text-base mt-0.5">{verifiedCreds.length + verifiedWork.length}</p>
                </div>
              </div>
            </div>

            {/* Credentials */}
            {credentials.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Credentials</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {verifiedCreds.length} verified
                    </span>
                    {pendingCreds.length > 0 && (
                      <span className="text-amber-600">· {pendingCreds.length} pending</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {credentials.map((c) => (
                    <CredentialCard key={c._id || c.id} cred={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {workExperiences.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Work Experience</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {verifiedWork.length} verified
                    </span>
                    {pendingWork.length > 0 && (
                      <span className="text-amber-600">· {pendingWork.length} pending</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {workExperiences.map((w) => (
                    <WorkCard key={w._id || w.id} work={w} />
                  ))}
                </div>
              </section>
            )}

            {credentials.length === 0 && workExperiences.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm text-gray-500">No credentials or work history to display.</p>
              </div>
            )}

            {/* QR + verification footer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="p-2 bg-white border border-gray-200 rounded-xl">
                    <QRCode value={pageUrl} size={80} level="M" />
                  </div>
                  <p className="text-xs text-gray-400">Scan to verify</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-gray-900">Cazini</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Read-only profile shared by the credential holder. Scan or share this link to verify.
                  </p>
                  <p className="mt-2 text-xs font-mono text-gray-400 break-all">{pageUrl}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 pb-4">
              Powered by Cazini — portable employment credentials for everyone
            </p>
          </>
        )}
      </div>
    </div>
  );
}
