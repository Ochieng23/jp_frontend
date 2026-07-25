'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJob, useUser, useCredentials, useWorkHistory, useMyApplications } from '../../../../lib/hooks';
import { post, uploadFile } from '../../../../lib/api';

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-400 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function fmtSalary(job) {
  if (!job.expected_salary) return null;
  const amount = new Intl.NumberFormat('en-US').format(job.expected_salary);
  return `${job.expected_salary_currency || ''} ${amount}`.trim();
}

// Maps a kazini_backend requiredDocuments fieldName to the flat field this
// app collects a URL for. Documents outside this set (other than the résumé,
// handled separately) require a file upload kazini_backend doesn't expose a
// generic endpoint for, so mandatory ones block applying via this job board.
const URL_ONLY_FIELDS = {
  portfoliolink: 'portfolio_link',
  workprofile: 'work_profile',
  worksamples: 'work_samples',
};
const RESUME_FIELD_NAMES = new Set(['cv', 'resume', 'curriculumvitae']);

function normalizeFieldName(name) {
  return (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

function ApplyModal({ job, holder, credentials, workExperiences, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState(() => (job.customQuestions || []).map(() => ''));
  const [urlFields, setUrlFields] = useState({ portfolio_link: '', work_profile: '', work_samples: '' });
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('idle'); // idle | resume | uploading | submitting
  const [error, setError] = useState('');

  const missingContactInfo = !holder?.phone;

  const supportedDocs = [];
  const unsupportedMandatoryDocs = [];
  for (const doc of job.requiredDocuments || []) {
    const norm = normalizeFieldName(doc.fieldName || doc.name);
    if (RESUME_FIELD_NAMES.has(norm)) continue; // covered by the auto-generated resume
    if (URL_ONLY_FIELDS[norm]) {
      supportedDocs.push({ ...doc, key: URL_ONLY_FIELDS[norm] });
    } else if (doc.mandatory) {
      unsupportedMandatoryDocs.push(doc);
    }
  }
  const blockedByUnsupportedDoc = unsupportedMandatoryDocs.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (job.requireCoverLetter && !coverLetter.trim()) {
      setError('This position requires a cover letter.');
      return;
    }
    const missingRequired = (job.customQuestions || []).some((q, i) => q.mandatory && !answers[i]?.trim());
    if (missingRequired) {
      setError('Please answer all required questions.');
      return;
    }
    const missingMandatoryDoc = supportedDocs.some((d) => d.mandatory && !urlFields[d.key]?.trim());
    if (missingMandatoryDoc) {
      setError('Please provide all required links.');
      return;
    }
    if (missingContactInfo) {
      setError('Add a phone number to your passport profile (Settings) before applying.');
      return;
    }

    setLoading(true);
    try {
      setStage('resume');
      const [{ pdf }, { default: ResumePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../ResumePDF'),
      ]);
      const blob = await pdf(
        ResumePDF({ holder, credentials, workExperiences })
      ).toBlob();

      setStage('uploading');
      const fd = new FormData();
      fd.append('file', new File([blob], 'resume.pdf', { type: 'application/pdf' }));
      const uploadRes = await uploadFile('/uploads', fd);
      if (!uploadRes?.url) {
        throw new Error('Resume upload failed. File storage may not be configured on this server.');
      }

      setStage('submitting');
      const result = await post(`/jobs/${job.id}/apply`, {
        resume_url: uploadRes.url,
        cover_letter: coverLetter.trim() || undefined,
        how_heard: 'Job Board',
        portfolio_link: urlFields.portfolio_link.trim() || undefined,
        work_profile: urlFields.work_profile.trim() || undefined,
        work_samples: urlFields.work_samples.trim() || undefined,
        custom_answers: (job.customQuestions || []).map((q, i) => ({
          question: q.question,
          answer: answers[i] || '',
        })),
      });

      onSuccess(result.data);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }

  const stageLabel = {
    resume: 'Generating resume from your passport…',
    uploading: 'Uploading resume…',
    submitting: 'Submitting application…',
  }[stage];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Apply to {job.title}</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer disabled:opacity-50">✕</button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
            Your resume will be generated automatically from your Job Passport profile (work history + credentials) and attached to this application.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {blockedByUnsupportedDoc && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              This position requires {unsupportedMandatoryDocs.map((d) => d.name).join(', ')}, which isn&apos;t
              supported via the job board yet. Please apply directly on the employer&apos;s site.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>
                Cover Letter {job.requireCoverLetter && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className={inputClass}
                rows={4}
                maxLength={500}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Briefly say why you're a good fit (max 500 characters)"
                disabled={loading || blockedByUnsupportedDoc}
              />
            </div>

            {supportedDocs.map((d) => (
              <div key={d._id || d.key}>
                <label className={labelClass}>
                  {d.name} {d.mandatory && <span className="text-red-500">*</span>}
                </label>
                <input
                  className={inputClass}
                  type="url"
                  placeholder="https://…"
                  value={urlFields[d.key]}
                  onChange={(e) => setUrlFields((prev) => ({ ...prev, [d.key]: e.target.value }))}
                  disabled={loading || blockedByUnsupportedDoc}
                />
              </div>
            ))}

            {(job.customQuestions || []).map((q, i) => (
              <div key={q._id || i}>
                <label className={labelClass}>
                  {q.question} {q.mandatory && <span className="text-red-500">*</span>}
                </label>
                <input
                  className={inputClass}
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
                  disabled={loading || blockedByUnsupportedDoc}
                />
              </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button" onClick={onClose} disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading || blockedByUnsupportedDoc}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {stageLabel}
                  </>
                ) : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { job, isLoading, error } = useJob(id);
  const { user: holder } = useUser();
  const { credentials } = useCredentials();
  const { entries: workExperiences } = useWorkHistory();
  const { applications } = useMyApplications();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const alreadyApplied = useMemo(
    () => applied || applications.some((a) => a.kazini_job_id === id),
    [applications, id, applied]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load job: {error?.message || 'Not found'}
        </div>
        <Link href="/jobs" className="inline-block mt-4 text-sm font-medium text-blue-600 no-underline">← Back to Job Board</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700 no-underline">← Back to Job Board</Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-blue-600 font-medium mt-1">{job.employer?.name}</p>
            <p className="text-sm text-gray-400 mt-1">
              {job.location} · <span className="capitalize">{job.jobType}</span> · <span className="capitalize">{job.contract_type?.replace('-', ' ')}</span>
            </p>
          </div>
          <div className="text-right">
            {fmtSalary(job) && <p className="text-lg font-bold text-gray-900">{fmtSalary(job)}</p>}
            {alreadyApplied ? (
              <span className="inline-block mt-2 text-sm font-semibold bg-green-50 text-green-700 px-4 py-2.5 rounded-xl">
                ✓ Applied
              </span>
            ) : (
              <button
                onClick={() => setApplyOpen(true)}
                className="inline-block mt-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer"
              >
                Apply Now
              </button>
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

      {applyOpen && (
        <ApplyModal
          job={job}
          holder={holder}
          credentials={credentials}
          workExperiences={workExperiences}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => {
            setApplyOpen(false);
            setApplied(true);
            router.push('/jobs/applications');
          }}
        />
      )}
    </div>
  );
}
