'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '../../../components/PublicNav';
import { useJob, useOptionalUser, useMyApplications } from '../../../lib/hooks';

const PRIMARY = '#148438';

function fmtSalary(job) {
  if (!job.expected_salary) return null;
  const amount = new Intl.NumberFormat('en-US').format(job.expected_salary);
  return `${job.expected_salary_currency || ''} ${amount}`.trim();
}

/** Only mounted for signed-in users — keeps useMyApplications() from ever
 * firing (and 401-redirecting) while logged out. */
function AlreadyAppliedCheck({ jobId, children }) {
  const { applications } = useMyApplications();
  const alreadyApplied = applications.some((a) => a.kazini_job_id === jobId);
  return children(alreadyApplied);
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { job, isLoading, error } = useJob(id);
  const { user } = useOptionalUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="flex items-center justify-center py-24">
          <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load job: {error?.message || 'Not found'}
          </div>
          <Link href="/jobs" className="inline-block mt-4 text-sm font-medium no-underline" style={{ color: PRIMARY }}>← Back to Job Board</Link>
        </div>
      </div>
    );
  }

  const ApplyButton = ({ alreadyApplied }) => (
    alreadyApplied ? (
      <span className="inline-block mt-2 text-sm font-semibold bg-green-50 text-green-700 px-4 py-2.5 rounded-xl">✓ Applied</span>
    ) : (
      <Link
        href={`/jobs/${job.id}/apply`}
        className="inline-block mt-2 text-white font-semibold px-6 py-2.5 rounded-xl text-sm cursor-pointer hover:opacity-90 transition-opacity no-underline"
        style={{ backgroundColor: PRIMARY }}
      >
        Apply now
      </Link>
    )
  );

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <Link href="/jobs" className="text-sm font-medium hover:underline no-underline" style={{ color: PRIMARY }}>← Back to Job Board</Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="font-medium mt-1" style={{ color: PRIMARY }}>{job.employer?.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {job.location} · <span className="capitalize">{job.jobType}</span> · <span className="capitalize">{job.contract_type?.replace('-', ' ')}</span>
              </p>
            </div>
            <div className="text-right">
              {fmtSalary(job) && <p className="text-lg font-bold text-gray-900">{fmtSalary(job)}</p>}
              {user ? (
                <AlreadyAppliedCheck jobId={job.id}>
                  {(alreadyApplied) => <ApplyButton alreadyApplied={alreadyApplied} />}
                </AlreadyAppliedCheck>
              ) : (
                <ApplyButton alreadyApplied={false} />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {(job.skills || []).map((s) => (
              <span key={s} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">{s}</span>
            ))}
          </div>

          <section className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.aboutJob}</p>
          </section>

          {job.responsibilities?.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Responsibilities</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}

          {job.qualifications?.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Qualifications</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {job.qualifications.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </section>
          )}

          {job.benefits?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Benefits</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
