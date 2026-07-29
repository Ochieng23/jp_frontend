'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicNav from '../../components/PublicNav';
import JobRow from '../../components/JobRow';
import { useJobs } from '../../lib/hooks';

const PAGE_SIZE = 20;

const JOB_TYPES = ['onsite', 'hybrid', 'remote'];
const EXPERIENCE_LEVELS = ['internship', 'entry', 'mid', 'senior', 'director', 'executive'];
const CONTRACT_TYPES = ['fulltime', 'part-time', 'contract', 'temporary'];
const DATE_POSTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Past 24 hours' },
  { value: '7', label: 'Past week' },
  { value: '30', label: 'Past month' },
];

const selectClass = 'px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:border-gray-400 cursor-pointer';
const inputClass = 'w-full px-4 py-3 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400';

export default function JobSearchPage() {
  return (
    <Suspense fallback={null}>
      <JobSearchPageInner />
    </Suspense>
  );
}

function JobSearchPageInner() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [contractType, setContractType] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { jobs, isLoading, error } = useJobs({
    pageSize: 100,
    search: keyword,
    location,
    jobType,
    experienceLevel,
    contractType,
  });

  const filteredJobs = useMemo(() => {
    if (!datePosted) return jobs;
    const cutoff = Date.now() - Number(datePosted) * 24 * 60 * 60 * 1000;
    return jobs.filter((j) => !j.posted_at || new Date(j.posted_at).getTime() >= cutoff);
  }, [jobs, datePosted]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);

  function resetPaging() {
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Search + filters */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
              <span className="pl-3 text-gray-400">🔎</span>
              <input
                className={inputClass}
                placeholder="Job title or keyword"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); resetPaging(); }}
              />
            </div>
            <div className="flex items-center flex-1">
              <span className="pl-3 text-gray-400">📍</span>
              <input
                className={inputClass}
                placeholder="Location"
                value={location}
                onChange={(e) => { setLocation(e.target.value); resetPaging(); }}
              />
            </div>
            <button
              type="button"
              className="font-bold text-white px-6 py-3 text-sm cursor-pointer"
              style={{ backgroundColor: '#148438' }}
              onClick={resetPaging}
            >
              Search jobs
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select className={selectClass} value={datePosted} onChange={(e) => { setDatePosted(e.target.value); resetPaging(); }}>
              {DATE_POSTED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className={`${selectClass} capitalize`} value={jobType} onChange={(e) => { setJobType(e.target.value); resetPaging(); }}>
              <option value="">On-site/Hybrid/Remote</option>
              {JOB_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
            <select className={`${selectClass} capitalize`} value={contractType} onChange={(e) => { setContractType(e.target.value); resetPaging(); }}>
              <option value="">Employment type</option>
              {CONTRACT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>)}
            </select>
            <select className={`${selectClass} capitalize`} value={experienceLevel} onChange={(e) => { setExperienceLevel(e.target.value); resetPaging(); }}>
              <option value="">Experience</option>
              {EXPERIENCE_LEVELS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 sm:px-6 py-6" style={{ backgroundColor: '#faf8f4' }}>
        <div className="max-w-5xl mx-auto">
          {!isLoading && !error && (
            <p className="text-sm text-gray-500 mb-4">{filteredJobs.length} job{filteredJobs.length === 1 ? '' : 's'}</p>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <span className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              Failed to load jobs: {error.message || 'Unknown error'}
            </div>
          )}

          {!isLoading && !error && visibleJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <div className="text-4xl mb-3">🔎</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No jobs found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}

          {!isLoading && !error && visibleJobs.length > 0 && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {visibleJobs.map((job, i) => (
                  <JobRow key={job.id} job={job} divider={i < visibleJobs.length - 1} />
                ))}
              </div>

              {visibleCount < filteredJobs.length && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-block border-2 font-semibold px-6 py-3 rounded-full text-sm hover:bg-white transition-colors cursor-pointer"
                    style={{ borderColor: '#148438', color: '#148438' }}
                  >
                    Show more jobs
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
