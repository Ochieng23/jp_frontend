import Link from 'next/link';

const AVATAR_COLORS = ['#004038', '#2E4BDA', '#B45309', '#7C3AED', '#0E7490', '#BE185D'];

function avatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins <= 1 ? 'Posted just now' : `Posted ${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Posted ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Posted ${months} month${months === 1 ? '' : 's'} ago`;
}

export default function JobRow({ job, divider = true }) {
  const name = job.employer?.name || 'Company';
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`flex items-start gap-4 py-5 px-4 sm:px-6 hover:bg-gray-50 transition-colors no-underline ${divider ? 'border-b border-gray-100' : ''}`}
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: avatarColor(name) }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-base leading-snug" style={{ color: '#004038' }}>{job.title}</h3>
        <p className="text-sm text-gray-600 mt-0.5">
          at {name}
          {job.jobType && <> · <span className="font-semibold capitalize">{job.jobType}</span></>}
          {job.location && <> · {job.location}</>}
          {job.companyIndustry && <> · {job.companyIndustry}</>}
          {job.contract_type && <> · <span className="capitalize">{job.contract_type.replace('-', ' ')}</span></>}
        </p>
        <p className="text-xs text-gray-400 mt-1.5">{timeAgo(job.posted_at)}</p>
      </div>
    </Link>
  );
}
