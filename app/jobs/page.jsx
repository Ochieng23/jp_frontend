import { Suspense } from 'react';
import PublicNav from '../../components/PublicNav';
import JobRow from '../../components/JobRow';
import JsonLd from '../../components/JsonLd';
import { SITE_URL } from '../../lib/site';
import { fetchJobs } from '../../lib/jobsServer';
import JobsClient from './JobsClient';

export const revalidate = 300;

export const metadata = {
  title: 'Browse Jobs in Kenya & Africa — Live Openings from Verified Employers',
  description:
    'Search live job openings across Kenya and Africa — engineering, healthcare, sales, finance and more. Apply in minutes with or without an account. Free for jobseekers.',
  alternates: { canonical: '/jobs' },
  openGraph: {
    title: 'Browse Jobs in Kenya & Africa | Cazini',
    description: 'Live job openings from verified employers. Apply in minutes — no account needed.',
    url: `${SITE_URL}/jobs`,
  },
};

/** Server-rendered shell shown until the interactive client board hydrates.
 * Because it is the Suspense fallback it IS the crawler-visible HTML for
 * /jobs — h1 plus real links to every job (previously this page's server
 * output was empty). */
function JobsStaticShell({ jobs }) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <div className="px-4 sm:px-6 pt-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Browse jobs in Kenya &amp; across Africa</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live openings from verified employers — apply in minutes, with or without an account.</p>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-6" style={{ backgroundColor: '#faf8f4' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-gray-500 mb-4">{jobs.length} job{jobs.length === 1 ? '' : 's'}</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {jobs.map((job, i) => (
              <JobRow key={job.id} job={job} divider={i < jobs.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function JobsPage() {
  const { jobs } = await fetchJobs(100);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: jobs.slice(0, 50).map((job, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/jobs/${job.id}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <Suspense fallback={<JobsStaticShell jobs={jobs} />}>
        <JobsClient initialJobs={jobs} />
      </Suspense>
    </>
  );
}
