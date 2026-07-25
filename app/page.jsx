'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import JobRow from '../components/JobRow';
import CaziniLogo from '../components/CaziniLogo';
import { useJobs } from '../lib/hooks';

const inputClass = 'w-full px-4 py-3.5 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400';

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  // Fetch a decent-sized batch: enough to show a feed AND compute real
  // "popular searches" from the live catalog instead of hardcoding them.
  const { jobs, total, isLoading } = useJobs({ pageSize: 40 });
  const feedJobs = jobs.slice(0, 6);

  const popularSearches = useMemo(() => {
    const counts = new Map();
    for (const j of jobs) {
      if (!j.companyIndustry) continue;
      counts.set(j.companyIndustry, (counts.get(j.companyIndustry) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  }, [jobs]);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/jobs${params.toString() ? '?' + params.toString() : ''}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section
        className="px-4 sm:px-6 pt-16 pb-24 text-center"
        style={{ background: 'linear-gradient(135deg, #001f1a 0%, #004038 55%, #0e2f2a 100%)' }}
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Find a job with Cazini
        </h1>
        <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-10">
          Search live openings from employers hiring right now. Apply in minutes — with or without a Cazini profile.
        </p>

        <form
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col sm:flex-row overflow-hidden"
        >
          <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
            <span className="pl-4 text-gray-400">🔎</span>
            <input
              className={inputClass}
              placeholder="Job title or keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center flex-1">
            <span className="pl-4 text-gray-400">📍</span>
            <input
              className={inputClass}
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="font-bold text-white px-8 py-4 text-sm hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: '#004038' }}
          >
            Search jobs
          </button>
        </form>

        {popularSearches.length > 0 && (
          <p className="mt-6 text-sm text-white/70">
            Popular searches:{' '}
            {popularSearches.map((s, i) => (
              <span key={s}>
                <Link href={`/jobs?search=${encodeURIComponent(s)}`} className="text-white underline underline-offset-2 hover:text-white/90">
                  {s}
                </Link>
                {i < popularSearches.length - 1 ? '  ' : ''}
              </span>
            ))}
          </p>
        )}
      </section>

      {/* Latest jobs feed */}
      <section className="px-4 sm:px-6 py-14" style={{ backgroundColor: '#faf8f4' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg text-gray-500 mb-5">
            Latest jobs <span className="font-bold text-gray-900">near you</span>
          </h2>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <span className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && feedJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-500 text-sm">
              No jobs available right now — check back soon.
            </div>
          )}

          {!isLoading && feedJobs.length > 0 && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {feedJobs.map((job, i) => (
                  <JobRow key={job.id} job={job} divider={i < feedJobs.length - 1} />
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/jobs"
                  className="inline-block border-2 font-semibold px-6 py-3 rounded-full text-sm hover:bg-white transition-colors no-underline"
                  style={{ borderColor: '#004038', color: '#004038' }}
                >
                  Show more jobs{total ? ` (${total})` : ''}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
          <CaziniLogo markSize={26} wordmarkClassName="text-base" />
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <Link href="/jobs" className="hover:text-gray-800 transition-colors">Browse jobs</Link>
            <Link href="/login" className="hover:text-gray-800 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-gray-800 transition-colors">Create a profile</Link>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Cazini. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
