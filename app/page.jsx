'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import JobCard, { JobCardSkeleton } from '../components/JobCard';
import CaziniLogo from '../components/CaziniLogo';
import { useJobs } from '../lib/hooks';

// GREEN is the large-section background/text tone — a deep, uniform forest
// green (not the bright logo-mark green, which looks garish at hero scale).
// GREEN_LIGHT is reserved for small vivid accents (buttons, numerals) where
// a pop of the actual brand green reads as a highlight, not a wash.
const GREEN = '#0c4d20';
const GREEN_LIGHT = '#1bb14b';

const inputClass = 'w-full px-0 py-3.5 text-[15px] outline-none bg-transparent text-gray-900 placeholder-gray-400 border-0';

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Build your credential once',
    body: 'Add work history, references and skills. We verify them with the source.',
  },
  {
    n: '02',
    title: 'Apply anywhere',
    body: 'Share a signed, tamper-evident profile that employers can trust instantly.',
  },
  {
    n: '03',
    title: 'Move without starting over',
    body: 'Your record stays valid across borders, employers and job categories.',
  },
];

const FOOTER_COLUMNS = [
  {
    heading: 'Jobseekers',
    links: [
      { label: 'Browse jobs', href: '/jobs' },
      { label: 'Create a profile', href: '/register' },
      { label: 'Verify credentials', href: '/login' },
      { label: 'Help centre', href: 'mailto:hello@cazini.ai' },
    ],
  },
  {
    heading: 'Employers',
    links: [
      { label: 'Post a job', href: '/#employers' },
      { label: 'Hire verified talent', href: '/#employers' },
      { label: 'Pricing', href: '/#employers' },
      { label: 'Contact sales', href: 'mailto:hello@cazini.ai' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Cazini', href: '/#how-it-works' },
      { label: 'Partners', href: 'mailto:hello@cazini.ai' },
      { label: 'Newsroom', href: 'mailto:hello@cazini.ai' },
      { label: 'Careers', href: 'mailto:hello@cazini.ai' },
    ],
  },
];

function SearchMarkerCircle() {
  return <span className="inline-block w-2 h-2 rounded-full border-2" style={{ borderColor: '#8a919b' }} />;
}

function SearchMarkerPin() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: '#8a919b', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}
    />
  );
}

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const { jobs, total, isLoading, error } = useJobs({ pageSize: 100 });
  const feedJobs = jobs.slice(0, 6);

  const popularSearches = useMemo(() => {
    const counts = new Map();
    for (const j of jobs) {
      if (!j.companyIndustry) continue;
      counts.set(j.companyIndustry, (counts.get(j.companyIndustry) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  }, [jobs]);

  const stats = useMemo(() => {
    if (isLoading || error || jobs.length === 0) return null;
    const employers = new Set(jobs.map((j) => j.employer?.id).filter(Boolean));
    const industries = new Set(jobs.map((j) => j.companyIndustry).filter(Boolean));
    return [
      { label: 'Open roles', value: total ?? jobs.length },
      { label: 'Employers', value: employers.size },
      { label: 'Industries', value: industries.size },
    ];
  }, [jobs, total, isLoading, error]);

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
      <section className="px-5 sm:px-8 lg:px-16 pt-16 pb-16 lg:pt-[76px] lg:pb-[84px] text-white" style={{ backgroundColor: GREEN }}>
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-[72px] items-start">
          {/* Left column */}
          <div>
            <p
              className="font-mono text-xs uppercase tracking-[0.14em] mb-5"
              style={{ color: '#a7e8d0' }}
            >
              Portable employment credentials
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold leading-[1.1] lg:leading-[1.08] tracking-tight mb-6">
              Find work that recognises the skills you already have.
            </h1>
            <p className="text-lg leading-[1.55] max-w-[560px] mb-8" style={{ color: '#d6e6e2' }}>
              Search live openings from employers hiring right now. Apply in minutes — with or without a Cazini profile.
            </p>

            <form onSubmit={handleSearch} className="bg-white rounded-md p-2 grid sm:grid-cols-[1.3fr_1fr_auto] gap-2">
              <div className="flex items-center gap-2.5 px-3.5 border-b sm:border-b-0 sm:border-r border-gray-100">
                <SearchMarkerCircle />
                <input
                  className={inputClass}
                  placeholder="Job title, skill or company"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2.5 px-3.5">
                <SearchMarkerPin />
                <input
                  className={inputClass}
                  placeholder="City or region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="font-semibold text-[15px] px-[30px] py-0 rounded transition-colors"
                style={{ backgroundColor: GREEN_LIGHT, color: '#0d211d' }}
              >
                Search jobs
              </button>
            </form>

            {popularSearches.length > 0 && (
              <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
                <span className="text-[13px]" style={{ color: '#b9cdc8' }}>Popular:</span>
                {popularSearches.map((s) => (
                  <Link
                    key={s}
                    href={`/jobs?search=${encodeURIComponent(s)}`}
                    className="text-[13px] text-white border rounded-full px-3 py-1.5 no-underline transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.25)' }}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column — credential panel */}
          <div
            className="rounded-md p-7 border"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)' }}
          >
            <h2 className="text-[15px] font-semibold mb-2">Your credential travels with you</h2>
            <p className="text-sm leading-[1.6] mb-5" style={{ color: '#cfe3de' }}>
              Verified work history, references and skills — recognised across jurisdictions.
            </p>

            {stats && (
              <div className="grid gap-px rounded overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between px-[18px] py-4" style={{ backgroundColor: 'rgba(12,77,32,0.6)' }}>
                    <span className="text-sm" style={{ color: '#cfe3de' }}>{s.label}</span>
                    <span className="font-mono text-lg font-medium" style={{ color: GREEN_LIGHT }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest jobs near you */}
      <section className="px-5 sm:px-8 lg:px-16 pt-16 pb-6 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <h2 className="text-[26px] font-semibold tracking-tight text-gray-900">Latest jobs near you</h2>
              <p className="text-[15px] text-gray-500 mt-1">Updated continuously from verified employers</p>
            </div>
            <Link href="/jobs" className="text-[15px] font-medium no-underline hover:underline" style={{ color: GREEN }}>
              Browse all jobs →
            </Link>
          </div>

          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          )}

          {error && !isLoading && (
            <div className="border border-gray-100 rounded-md p-10 text-center">
              <p className="text-sm text-gray-600 mb-3">Couldn&apos;t load jobs right now.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium underline"
                style={{ color: GREEN }}
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && feedJobs.length === 0 && (
            <div className="border border-gray-100 rounded-md p-10 text-center">
              <p className="text-sm text-gray-600 mb-3">No jobs available right now.</p>
              <Link href="/jobs" className="text-sm font-medium underline" style={{ color: GREEN }}>
                Browse all jobs
              </Link>
            </div>
          )}

          {!isLoading && !error && feedJobs.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedJobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-5 sm:px-8 lg:px-16 pt-14 pb-16 bg-white scroll-mt-[72px]">
        <div className="max-w-[1440px] mx-auto">
          <div
            className="grid sm:grid-cols-3 border border-gray-100 rounded-md overflow-hidden gap-px"
            style={{ backgroundColor: '#e5e6e9' }}
          >
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} className="bg-white p-7">
                <p className="font-mono text-xs mb-3" style={{ color: GREEN }}>{step.n}</p>
                <h3 className="text-[17px] font-semibold text-gray-900 mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm leading-[1.6] text-gray-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer CTA band */}
      <section id="employers" className="px-5 sm:px-8 lg:px-16 pb-[72px] scroll-mt-[72px]">
        <div
          className="max-w-[1440px] mx-auto rounded-md border border-gray-100 p-8 sm:p-11 flex flex-col sm:flex-row items-center justify-between gap-8"
          style={{ backgroundColor: '#faf8f4' }}
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
              Hiring? Reach verified, work-ready candidates.
            </h2>
            <p className="text-[15px] text-gray-500 max-w-[620px]">
              Post a role and match against credentials that have already been checked — no re-verification required.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="mailto:hello@cazini.ai?subject=Post%20a%20job%20on%20Cazini"
              className="font-semibold text-[15px] text-white px-[22px] py-3 rounded no-underline transition-colors hover:opacity-90"
              style={{ backgroundColor: GREEN }}
            >
              Post a job
            </a>
            <a
              href="mailto:hello@cazini.ai?subject=Cazini%20for%20employers"
              className="font-medium text-[15px] px-[22px] py-3 rounded border border-gray-200 text-gray-700 no-underline transition-colors hover:border-gray-400 bg-white"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-5 sm:px-8 lg:px-16 pt-11 pb-8">
        <div className="max-w-[1440px] mx-auto grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-8">
          <div>
            <CaziniLogo markSize={32} wordmarkClassName="text-base" />
            <p className="text-sm leading-[1.6] text-gray-500 mt-3 max-w-[300px]">
              Portable employment credentials for every jobseeker.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[13px] font-semibold text-gray-800 mb-2.5">{col.heading}</h4>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link key={link.label} href={link.href} className="text-sm text-gray-500 hover:text-gray-800 transition-colors no-underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1440px] mx-auto border-t border-gray-50 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-gray-400">
          <p>© {new Date().getFullYear()} Cazini. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Accessibility</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
