'use client';

import Link from 'next/link';
import { useMyApplications } from '../../../../lib/hooks';

function fmtDate(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(d));
}

const STATUS_COLORS = {
  Applied: 'bg-blue-50 text-blue-700',
  Assessment: 'bg-amber-50 text-amber-700',
  Interview: 'bg-purple-50 text-purple-700',
  BackgroundCheck: 'bg-amber-50 text-amber-700',
  Offer: 'bg-green-50 text-green-700',
  Hired: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
};

export default function MyApplicationsPage() {
  const { applications, isLoading, error } = useMyApplications();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Jobs you&apos;ve applied to via the Job Board</p>
        </div>
        <Link
          href="/jobs"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 no-underline"
        >
          ← Back to Job Board
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load applications: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-sm text-gray-500 mb-6">Browse the job board and apply to your first position.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm no-underline"
          >
            Browse Jobs
          </Link>
        </div>
      )}

      {!isLoading && !error && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app._id || app.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{app.job_title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{app.employer_name}</p>
                <p className="text-xs text-gray-400 mt-1">Applied {fmtDate(app.applied_at)}</p>
              </div>
              <span
                className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-50 text-gray-600'}`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
