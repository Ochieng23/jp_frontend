import Link from 'next/link';
import { timeAgo } from './JobRow';

function fmtPay(job) {
  if (!job.expected_salary) return null;
  const amount = new Intl.NumberFormat('en-US').format(job.expected_salary);
  const period = job.salaryType === 'commission' ? '' : ' / month';
  return `${job.expected_salary_currency || ''} ${amount}${period}`.trim();
}

export function JobCardSkeleton() {
  return (
    <div className="border border-gray-100 rounded-md p-6 flex flex-col gap-3.5 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-14 flex-shrink-0" />
      </div>
      <div className="h-3.5 bg-gray-100 rounded w-1/2" />
      <div className="h-3.5 bg-gray-100 rounded w-1/3" />
      <div className="pt-3.5 border-t border-gray-50 flex justify-between">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-1/5" />
      </div>
    </div>
  );
}

export default function JobCard({ job }) {
  const pay = fmtPay(job);
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group border border-gray-100 rounded-md p-6 flex flex-col gap-3.5 no-underline transition-all duration-150 hover:shadow-[0_2px_10px_rgba(20,132,56,0.08)]"
      style={{ borderColor: undefined }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1bb14b'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[17px] font-semibold text-gray-900 leading-snug tracking-tight">{job.title}</h3>
        {job.jobType && (
          <span
            className="flex-shrink-0 font-mono text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap"
            style={{ backgroundColor: '#effaf3', color: '#10672c' }}
          >
            {job.jobType}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">
        {job.employer?.name || 'Company'}{job.location ? ` · ${job.location}` : ''}
      </p>
      {pay && <p className="text-sm text-gray-700">{pay}</p>}

      <div className="mt-auto pt-3.5 border-t border-gray-50 flex items-center justify-between">
        <span className="text-[13px] text-gray-400">{timeAgo(job.posted_at)}</span>
        <span className="text-sm font-medium group-hover:underline" style={{ color: '#148438' }}>
          View role →
        </span>
      </div>
    </Link>
  );
}
