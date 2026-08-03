'use client';

// Map of common nationality strings to flag emojis
const FLAG_MAP = {
  Afghan: '🇦🇫', Albanian: '🇦🇱', Algerian: '🇩🇿', American: '🇺🇸', Argentine: '🇦🇷',
  Armenian: '🇦🇲', Australian: '🇦🇺', Austrian: '🇦🇹', Azerbaijani: '🇦🇿', Bahraini: '🇧🇭',
  Bangladeshi: '🇧🇩', Belarusian: '🇧🇾', Belgian: '🇧🇪', Brazilian: '🇧🇷', British: '🇬🇧',
  Bulgarian: '🇧🇬', Cambodian: '🇰🇭', Canadian: '🇨🇦', Chilean: '🇨🇱', Chinese: '🇨🇳',
  Colombian: '🇨🇴', Congolese: '🇨🇩', Croatian: '🇭🇷', Cuban: '🇨🇺', Czech: '🇨🇿',
  Danish: '🇩🇰', Dutch: '🇳🇱', Egyptian: '🇪🇬', Eritrean: '🇪🇷', Estonian: '🇪🇪',
  Ethiopian: '🇪🇹', Filipino: '🇵🇭', Finnish: '🇫🇮', French: '🇫🇷', Georgian: '🇬🇪',
  German: '🇩🇪', Ghanaian: '🇬🇭', Greek: '🇬🇷', Haitian: '🇭🇹', Hungarian: '🇭🇺',
  Indian: '🇮🇳', Indonesian: '🇮🇩', Iranian: '🇮🇷', Iraqi: '🇮🇶', Irish: '🇮🇪',
  Israeli: '🇮🇱', Italian: '🇮🇹', Jamaican: '🇯🇲', Japanese: '🇯🇵', Jordanian: '🇯🇴',
  Kazakhstani: '🇰🇿', Kenyan: '🇰🇪', Korean: '🇰🇷', Kuwaiti: '🇰🇼', Lebanese: '🇱🇧',
  Libyan: '🇱🇾', Lithuanian: '🇱🇹', Malaysian: '🇲🇾', Malian: '🇲🇱', Mauritanian: '🇲🇷',
  Mexican: '🇲🇽', Moldovan: '🇲🇩', Moroccan: '🇲🇦', Mozambican: '🇲🇿', Namibian: '🇳🇦',
  Nepalese: '🇳🇵', Nigerian: '🇳🇬', Norwegian: '🇳🇴', Pakistani: '🇵🇰', Palestinian: '🇵🇸',
  Peruvian: '🇵🇪', Polish: '🇵🇱', Portuguese: '🇵🇹', Romanian: '🇷🇴', Russian: '🇷🇺',
  Rwandan: '🇷🇼', Saudi: '🇸🇦', Senegalese: '🇸🇳', Serbian: '🇷🇸', Somali: '🇸🇴',
  'South African': '🇿🇦', 'South Sudanese': '🇸🇸', Spanish: '🇪🇸', 'Sri Lankan': '🇱🇰',
  Stateless: '🏳️', Sudanese: '🇸🇩', Swedish: '🇸🇪', Swiss: '🇨🇭', Syrian: '🇸🇾',
  Tanzanian: '🇹🇿', Thai: '🇹🇭', Tunisian: '🇹🇳', Turkish: '🇹🇷', Ugandan: '🇺🇬',
  Ukrainian: '🇺🇦', Undetermined: '🏳️', Uruguayan: '🇺🇾', Venezuelan: '🇻🇪',
  Vietnamese: '🇻🇳', Yemeni: '🇾🇪', Zambian: '🇿🇲', Zimbabwean: '🇿🇼',
};

function getFlag(nationality) {
  if (!nationality) return '🌍';
  return FLAG_MAP[nationality] || '🌍';
}

// avatar_url/avatar_key are API-settable and rendered straight into
// src= on a page anyone with a share link can view — the backend
// restricts scheme at write time, but this guards existing rows and any
// other client. Also allows a base64 image data URI (the no-Azure-storage
// fallback).
function safeImageUrl(url) {
  return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);base64,)/i.test(url || '') ? url : null;
}

function VerifiedSeal() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="28" cy="28" r="26" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <circle cx="28" cy="28" r="20" fill="rgba(255,255,255,0.1)" />
      <path
        d="M18 28l7 7 13-14"
        stroke="#4ade80"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="28"
        y="46"
        textAnchor="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize="6"
        fontFamily="sans-serif"
        fontWeight="600"
        letterSpacing="0.5"
      >
        VERIFIED
      </text>
    </svg>
  );
}

export default function PassportCard({ user, hasActiveCredential }) {
  if (!user) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1a56db 100%)',
          borderRadius: 16,
          padding: '32px',
          color: '#fff',
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
      </div>
    );
  }

  const avatarSrc = safeImageUrl(user.avatar_url) || safeImageUrl(user.avatar_key) || '/placeholder-avatar.svg';
  const flag = getFlag(user.nationality);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1a56db 60%, #1e429f 100%)',
        borderRadius: 20,
        padding: '28px 32px',
        color: '#fff',
        boxShadow: '0 10px 40px rgba(26, 86, 219, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: 600,
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: -20,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          position: 'relative',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            Cazini
          </div>
          <div
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}
          >
            PORTABLE EMPLOYMENT CREDENTIAL
          </div>
        </div>
        {hasActiveCredential && <VerifiedSeal />}
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', position: 'relative' }}>
        {/* Avatar */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.3)',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          <img
            src={avatarSrc}
            alt={user.full_name || 'Avatar'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/placeholder-avatar.svg'; }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.3px',
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user.full_name || 'Unknown Name'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{flag}</span>
            <span
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}
            >
              {user.nationality || 'Nationality not specified'}
            </span>
          </div>

        </div>
      </div>

      {/* Footer details */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Email
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            {user.email || '—'}
          </div>
        </div>
        {user.phone && (
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Phone
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
              {user.phone}
            </div>
          </div>
        )}
        {user.created_at && (
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Registered
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
              {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
                new Date(user.created_at)
              )}
            </div>
          </div>
        )}
      </div>

      {(user.open_to_any_industry || (user.industries && user.industries.length > 0)) && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Industries
          </div>
          {user.open_to_any_industry ? (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
              }}
            >
              Open to any industry
            </span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user.industries.map((industry) => (
                <span
                  key={industry}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {industry}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
