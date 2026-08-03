'use client';

import { useRouter } from 'next/navigation';

// Type → left-border accent + icon bg + label colour (Tailwind classes)
const TYPE_CONFIG = {
  employment:    { border: 'border-blue-500',   iconBg: 'bg-blue-50',   labelCls: 'bg-blue-50 text-blue-700'    },
  education:     { border: 'border-violet-500',  iconBg: 'bg-violet-50', labelCls: 'bg-violet-50 text-violet-700' },
  certification: { border: 'border-green-500',   iconBg: 'bg-green-50',  labelCls: 'bg-green-50 text-green-700'  },
  skill:         { border: 'border-amber-500',   iconBg: 'bg-amber-50',  labelCls: 'bg-amber-50 text-amber-700'  },
  reference:     { border: 'border-cyan-500',    iconBg: 'bg-cyan-50',   labelCls: 'bg-cyan-50 text-cyan-700'    },
  license:       { border: 'border-red-500',     iconBg: 'bg-red-50',    labelCls: 'bg-red-50 text-red-700'      },
  identity:      { border: 'border-indigo-500',  iconBg: 'bg-indigo-50', labelCls: 'bg-indigo-50 text-indigo-700' },
};

const TYPE_ICONS = {
  employment: '💼', education: '🎓', certification: '📜',
  skill: '⚙️', reference: '📋', license: '🪪', identity: '🪪',
};

// Status pill colours — green = active/success, amber = warning, red = danger
const STATUS_PILL = {
  active:    'bg-green-100 text-green-700',
  verified:  'bg-green-100 text-green-700',
  suspended: 'bg-amber-100 text-amber-700',
  pending:   'bg-amber-100 text-amber-700',
  revoked:   'bg-red-100 text-red-700',
  expired:   'bg-red-100 text-red-700',
};

const COUNTRY_FLAGS = {
  AF:'🇦🇫',AL:'🇦🇱',DZ:'🇩🇿',US:'🇺🇸',AR:'🇦🇷',AM:'🇦🇲',AU:'🇦🇺',AT:'🇦🇹',AZ:'🇦🇿',
  BH:'🇧🇭',BD:'🇧🇩',BY:'🇧🇾',BE:'🇧🇪',BR:'🇧🇷',GB:'🇬🇧',BG:'🇧🇬',KH:'🇰🇭',CA:'🇨🇦',
  CL:'🇨🇱',CN:'🇨🇳',CO:'🇨🇴',CD:'🇨🇩',HR:'🇭🇷',CU:'🇨🇺',CZ:'🇨🇿',DK:'🇩🇰',NL:'🇳🇱',
  EG:'🇪🇬',ER:'🇪🇷',EE:'🇪🇪',ET:'🇪🇹',PH:'🇵🇭',FI:'🇫🇮',FR:'🇫🇷',GE:'🇬🇪',DE:'🇩🇪',
  GH:'🇬🇭',GR:'🇬🇷',HT:'🇭🇹',HU:'🇭🇺',IN:'🇮🇳',ID:'🇮🇩',IR:'🇮🇷',IQ:'🇮🇶',IE:'🇮🇪',
  IL:'🇮🇱',IT:'🇮🇹',JM:'🇯🇲',JP:'🇯🇵',JO:'🇯🇴',KZ:'🇰🇿',KE:'🇰🇪',KR:'🇰🇷',KW:'🇰🇼',
  LB:'🇱🇧',LY:'🇱🇾',LT:'🇱🇹',MY:'🇲🇾',ML:'🇲🇱',MR:'🇲🇷',MX:'🇲🇽',MD:'🇲🇩',MA:'🇲🇦',
  MZ:'🇲🇿',NA:'🇳🇦',NP:'🇳🇵',NG:'🇳🇬',NO:'🇳🇴',PK:'🇵🇰',PS:'🇵🇸',PE:'🇵🇪',PL:'🇵🇱',
  PT:'🇵🇹',RO:'🇷🇴',RU:'🇷🇺',RW:'🇷🇼',SA:'🇸🇦',SN:'🇸🇳',RS:'🇷🇸',SO:'🇸🇴',ZA:'🇿🇦',
  SS:'🇸🇸',ES:'🇪🇸',LK:'🇱🇰',SD:'🇸🇩',SE:'🇸🇪',CH:'🇨🇭',SY:'🇸🇾',TZ:'🇹🇿',TH:'🇹🇭',
  TN:'🇹🇳',TR:'🇹🇷',UG:'🇺🇬',UA:'🇺🇦',UY:'🇺🇾',VE:'🇻🇪',VN:'🇻🇳',YE:'🇾🇪',ZM:'🇿🇲',ZW:'🇿🇼',
};

function getFlag(code) {
  if (!code) return '🌍';
  return COUNTRY_FLAGS[code.toUpperCase()] || '🌍';
}

function formatDate(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(d));
}

export default function CredentialBadge({ credential, readOnly }) {
  const router = useRouter();
  if (!credential) return null;

  const type   = credential.type || 'employment';
  const cfg    = TYPE_CONFIG[type] || TYPE_CONFIG.employment;
  const icon   = TYPE_ICONS[type] || '📄';
  const status = credential.status || 'active';
  const isExpired = credential.expires_at && new Date(credential.expires_at) < new Date();

  const statusCls = STATUS_PILL[status] || 'bg-gray-100 text-gray-600';

  return (
    <div
      onClick={() => !readOnly && router.push(`/credentials/${credential._id || credential.id}`)}
      className={`relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
        border-l-4 ${cfg.border}
        ${!readOnly ? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md' : ''}`}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg flex-shrink-0 ${cfg.iconBg}`}>
              {icon}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cfg.labelCls}`}>
              {type.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusCls}`}>
              {status === 'active' ? '✓ Active' : status}
            </span>
            {credential.verified ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">
                ✓ Verified
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Not verified
              </span>
            )}
            {isExpired && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600">
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-sm font-bold text-gray-900 leading-snug mb-1">
          {credential.title}
        </div>

        {/* Issuer */}
        {(credential.issuer?.name || credential.issuer_name) && (
          <div className="text-xs text-gray-500 truncate">{credential.issuer?.name || credential.issuer_name}</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {credential.jurisdiction && (
            <>
              <span className="text-sm">{getFlag(credential.jurisdiction.country_code)}</span>
              <span>{credential.jurisdiction.country_name}</span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {formatDate(credential.issued_at) || '—'}
        </div>
      </div>
    </div>
  );
}
