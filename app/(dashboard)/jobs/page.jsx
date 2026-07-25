'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useJobs } from '../../../lib/hooks';

const PAGE_SIZE = 12;

const JOB_TYPES = ['onsite', 'hybrid', 'remote'];

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-400 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function fmtSalary(job) {
  if (!job.expected_salary) return null;
  const amount = new Intl.NumberFormat('en-US').format(job.expected_salary);
  return `${job.expected_salary_currency || ''} ${amount}`.trim();
}

function JobCard({ job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow no-underline"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">{job.title}</h3>
          <p className="text-sm text-blue-600 font-medium mt-0.5 truncate">{job.employer?.name || 'Company'}</p>
        </div>
        <span className="flex-shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full capitalize">
          {job.jobType}
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        {job.location}{job.experienceLevel ? ` · ${job.experienceLevel} level` : ''}
      </p>

      <div className="flex items-center flex-wrap gap-1.5 mb-3">
        {(job.skills || []).slice(0, 4).map((s) => (
          <span key={s} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 capitalize">{job.contract_type?.replace('-', ' ')}</span>
        {fmtSalary(job) && (
          <span className="text-sm font-semibold text-gray-900">{fmtSalary(job)}</span>
        )}
      </div>
    </Link>
  );
}

export default function JobBoardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const { jobs, total, hasNext, isLoading, error } = useJobs({
    page, pageSize: PAGE_SIZE, search, location, jobType,
  });

  function resetAndSet(setter) {
    return (value) => { setter(value); setPage(1); };
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Live openings from Cazini employers — apply using your existing Job Passport profile.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input
          className={`${inputClass} flex-1 min-w-[180px]`}
          placeholder="Search title or industry…"
          value={search}
          onChange={(e) => resetAndSet(setSearch)(e.target.value)}
        />
        <input
          className={`${inputClass} w-40`}
          placeholder="Location"
          value={location}
          onChange={(e) => resetAndSet(setLocation)(e.target.value)}
        />
        <select
          className={`${inputClass} w-36`}
          value={jobType}
          onChange={(e) => resetAndSet(setJobType)(e.target.value)}
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load jobs: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div className="text-5xl mb-4">🔎</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">{total} job{total === 1 ? '' : 's'} total</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
