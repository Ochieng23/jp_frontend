'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '../../../components/PublicNav';
import { useJob, useOptionalUser, useCredentials, useWorkHistory, useMyApplications } from '../../../lib/hooks';
import { post, uploadFile } from '../../../lib/api';

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:border-gray-500 disabled:opacity-60';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const PRIMARY = '#004038';

function fmtSalary(job) {
  if (!job.expected_salary) return null;
  const amount = new Intl.NumberFormat('en-US').format(job.expected_salary);
  return `${job.expected_salary_currency || ''} ${amount}`.trim();
}

// Maps a kazini_backend requiredDocuments fieldName to the flat field this
// app collects a URL for. Everything else (other than the résumé, handled
// separately) is collected as a real file upload via POST /uploads and sent
// through the apply endpoint's `documents[]` array.
const URL_ONLY_FIELDS = { portfoliolink: 'portfolio_link', workprofile: 'work_profile', worksamples: 'work_samples' };
const RESUME_FIELD_NAMES = new Set(['cv', 'resume', 'curriculumvitae']);
function normalizeFieldName(name) {
  return (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

function splitRequiredDocs(job) {
  const urlDocs = [];
  const fileDocs = [];
  for (const doc of job.requiredDocuments || []) {
    const norm = normalizeFieldName(doc.fieldName || doc.name);
    if (RESUME_FIELD_NAMES.has(norm)) continue;
    if (URL_ONLY_FIELDS[norm]) urlDocs.push({ ...doc, key: URL_ONLY_FIELDS[norm] });
    else fileDocs.push(doc);
  }
  return { urlDocs, fileDocs };
}

/** A single required-document file upload — uploads immediately on selection
 * via the generic /uploads endpoint, then reports the resulting URL up. */
function FileDocField({ doc, url, onUploaded, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  async function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFile('/uploads', fd);
      if (!res?.url) throw new Error('Upload failed. File storage may not be configured on this server.');
      setFileName(file.name);
      onUploaded(doc.name, res.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
      onUploaded(doc.name, null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={labelClass}>{doc.name} {doc.mandatory && <span className="text-red-500">*</span>}</label>
      <input
        className={inputClass} type="file" accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleChange} disabled={disabled || uploading}
      />
      {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
      {url && !uploading && <p className="text-xs text-green-600 mt-1">✓ {fileName || 'Uploaded'}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function ExtraFields({ job, urlDocs, urlFields, setUrlFields, fileDocs, fileDocsState, setFileDocsState, answers, setAnswers, disabled }) {
  return (
    <>
      {urlDocs.map((d) => (
        <div key={d._id || d.key}>
          <label className={labelClass}>{d.name} {d.mandatory && <span className="text-red-500">*</span>}</label>
          <input
            className={inputClass} type="url" placeholder="https://…"
            value={urlFields[d.key]}
            onChange={(e) => setUrlFields((prev) => ({ ...prev, [d.key]: e.target.value }))}
            disabled={disabled}
          />
        </div>
      ))}
      {fileDocs.map((d) => (
        <FileDocField
          key={d._id || d.name}
          doc={d}
          url={fileDocsState[d.name]}
          onUploaded={(name, url) => setFileDocsState((prev) => ({ ...prev, [name]: url }))}
          disabled={disabled}
        />
      ))}
      {(job.customQuestions || []).map((q, i) => (
        <div key={q._id || i}>
          <label className={labelClass}>{q.question} {q.mandatory && <span className="text-red-500">*</span>}</label>
          <input
            className={inputClass}
            value={answers[i] || ''}
            onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
            disabled={disabled}
          />
        </div>
      ))}
    </>
  );
}

function ModalShell({ title, onClose, loading, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer disabled:opacity-50">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Signed-in path: auto-generates a résumé from the holder's existing profile. */
function SignedInApplyForm({ job, holder, onClose, onSuccess }) {
  const { credentials } = useCredentials();
  const { entries: workExperiences } = useWorkHistory();
  const { urlDocs, fileDocs } = useMemo(() => splitRequiredDocs(job), [job]);

  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState(() => (job.customQuestions || []).map(() => ''));
  const [urlFields, setUrlFields] = useState({ portfolio_link: '', work_profile: '', work_samples: '' });
  const [fileDocsState, setFileDocsState] = useState({});
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState('');

  const missingContactInfo = !holder?.phone;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (job.requireCoverLetter && !coverLetter.trim()) return setError('This position requires a cover letter.');
    if ((job.customQuestions || []).some((q, i) => q.mandatory && !answers[i]?.trim())) return setError('Please answer all required questions.');
    if (urlDocs.some((d) => d.mandatory && !urlFields[d.key]?.trim())) return setError('Please provide all required links.');
    if (fileDocs.some((d) => d.mandatory && !fileDocsState[d.name])) return setError('Please upload all required documents.');
    if (missingContactInfo) return setError('Add a phone number to your passport profile (Settings) before applying.');

    setLoading(true);
    try {
      setStage('resume');
      const [{ pdf }, { default: ResumePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../(dashboard)/jobs/ResumePDF'),
      ]);
      const blob = await pdf(ResumePDF({ holder, credentials, workExperiences })).toBlob();

      setStage('uploading');
      const fd = new FormData();
      fd.append('file', new File([blob], 'resume.pdf', { type: 'application/pdf' }));
      const uploadRes = await uploadFile('/uploads', fd);
      if (!uploadRes?.url) throw new Error('Resume upload failed. File storage may not be configured on this server.');

      setStage('submitting');
      const result = await post(`/jobs/${job.id}/apply`, {
        resume_url: uploadRes.url,
        cover_letter: coverLetter.trim() || undefined,
        how_heard: 'Job Board',
        portfolio_link: urlFields.portfolio_link.trim() || undefined,
        work_profile: urlFields.work_profile.trim() || undefined,
        work_samples: urlFields.work_samples.trim() || undefined,
        documents: fileDocs.filter((d) => fileDocsState[d.name]).map((d) => ({ name: d.name, url: fileDocsState[d.name] })),
        custom_answers: (job.customQuestions || []).map((q, i) => ({ question: q.question, answer: answers[i] || '' })),
      });
      onSuccess(result.data);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }

  const stageLabel = { resume: 'Generating resume from your passport…', uploading: 'Uploading resume…', submitting: 'Submitting application…' }[stage];

  return (
    <ModalShell title={`Apply to ${job.title}`} onClose={onClose} loading={loading}>
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
        Your resume will be generated automatically from your Cazini profile (work history + credentials) and attached to this application.
      </p>
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Cover Letter {job.requireCoverLetter && <span className="text-red-500">*</span>}</label>
          <textarea className={inputClass} rows={4} maxLength={500} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Briefly say why you're a good fit (max 500 characters)" disabled={loading} />
        </div>
        <ExtraFields
          job={job} urlDocs={urlDocs} urlFields={urlFields} setUrlFields={setUrlFields}
          fileDocs={fileDocs} fileDocsState={fileDocsState} setFileDocsState={setFileDocsState}
          answers={answers} setAnswers={setAnswers} disabled={loading}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 cursor-pointer" style={{ backgroundColor: PRIMARY }}>
            {loading ? (<><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{stageLabel}</>) : 'Submit Application'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/** Guest path: no account required — matches the Workable apply pattern. */
function GuestApplyForm({ job, onClose, onSuccess }) {
  const { urlDocs, fileDocs } = useMemo(() => splitRequiredDocs(job), [job]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState(() => (job.customQuestions || []).map(() => ''));
  const [urlFields, setUrlFields] = useState({ portfolio_link: '', work_profile: '', work_samples: '' });
  const [fileDocsState, setFileDocsState] = useState({});
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) return setError('First and last name are required.');
    if (!email.trim()) return setError('Email is required.');
    if (!phone.trim()) return setError('Phone number is required.');
    if (!resumeFile) return setError('Please attach your resume (PDF).');
    if (job.requireCoverLetter && !coverLetter.trim()) return setError('This position requires a cover letter.');
    if ((job.customQuestions || []).some((q, i) => q.mandatory && !answers[i]?.trim())) return setError('Please answer all required questions.');
    if (urlDocs.some((d) => d.mandatory && !urlFields[d.key]?.trim())) return setError('Please provide all required links.');
    if (fileDocs.some((d) => d.mandatory && !fileDocsState[d.name])) return setError('Please upload all required documents.');

    setLoading(true);
    try {
      setStage('uploading');
      const fd = new FormData();
      fd.append('file', resumeFile);
      const uploadRes = await uploadFile('/uploads', fd);
      if (!uploadRes?.url) throw new Error('Resume upload failed. File storage may not be configured on this server.');

      setStage('submitting');
      const result = await post(`/jobs/${job.id}/apply`, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume_url: uploadRes.url,
        cover_letter: coverLetter.trim() || undefined,
        how_heard: 'Job Board',
        portfolio_link: urlFields.portfolio_link.trim() || undefined,
        work_profile: urlFields.work_profile.trim() || undefined,
        work_samples: urlFields.work_samples.trim() || undefined,
        documents: fileDocs.filter((d) => fileDocsState[d.name]).map((d) => ({ name: d.name, url: fileDocsState[d.name] })),
        custom_answers: (job.customQuestions || []).map((q, i) => ({ question: q.question, answer: answers[i] || '' })),
      });
      onSuccess(result.data);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }

  const stageLabel = { uploading: 'Uploading resume…', submitting: 'Submitting application…' }[stage];
  const disabled = loading;

  return (
    <ModalShell title={`Apply to ${job.title}`} onClose={onClose} loading={loading}>
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
        No account needed — fill this in and submit.{' '}
        <Link href="/register" className="font-semibold underline" style={{ color: PRIMARY }}>Create a free profile</Link> instead to auto-fill this from your work history next time.
      </p>
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First name <span className="text-red-500">*</span></label>
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={disabled} />
          </div>
          <div>
            <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={disabled} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
          <input className={inputClass} type="tel" placeholder="+254…" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <label className={labelClass}>Resume (PDF) <span className="text-red-500">*</span></label>
          <input
            className={inputClass} type="file" accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={labelClass}>Cover Letter {job.requireCoverLetter && <span className="text-red-500">*</span>}</label>
          <textarea className={inputClass} rows={4} maxLength={500} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Briefly say why you're a good fit (max 500 characters)" disabled={disabled} />
        </div>
        <ExtraFields
          job={job} urlDocs={urlDocs} urlFields={urlFields} setUrlFields={setUrlFields}
          fileDocs={fileDocs} fileDocsState={fileDocsState} setFileDocsState={setFileDocsState}
          answers={answers} setAnswers={setAnswers} disabled={disabled}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer">Cancel</button>
          <button type="submit" disabled={disabled} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 cursor-pointer" style={{ backgroundColor: PRIMARY }}>
            {loading ? (<><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{stageLabel}</>) : 'Submit Application'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ApplyModal({ job, user, onClose, onSuccess }) {
  if (user === undefined) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <span className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  return user
    ? <SignedInApplyForm job={job} holder={user} onClose={onClose} onSuccess={onSuccess} />
    : <GuestApplyForm job={job} onClose={onClose} onSuccess={onSuccess} />;
}

/** Only mounted for signed-in users — keeps useMyApplications() from ever
 * firing (and 401-redirecting) while logged out. */
function AlreadyAppliedCheck({ jobId, applied, children }) {
  const { applications } = useMyApplications();
  const alreadyApplied = applied || applications.some((a) => a.kazini_job_id === jobId);
  return children(alreadyApplied);
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { job, isLoading, error } = useJob(id);
  const { user } = useOptionalUser();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

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
      <button
        onClick={() => setApplyOpen(true)}
        className="inline-block mt-2 text-white font-semibold px-6 py-2.5 rounded-xl text-sm cursor-pointer hover:opacity-90 transition-opacity"
        style={{ backgroundColor: PRIMARY }}
      >
        Apply now
      </button>
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
                <AlreadyAppliedCheck jobId={job.id} applied={applied}>
                  {(alreadyApplied) => <ApplyButton alreadyApplied={alreadyApplied} />}
                </AlreadyAppliedCheck>
              ) : (
                <ApplyButton alreadyApplied={applied} />
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

      {applyOpen && (
        <ApplyModal
          job={job}
          user={user}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => {
            setApplyOpen(false);
            setApplied(true);
            if (user) router.push('/jobs/applications');
          }}
        />
      )}
    </div>
  );
}
