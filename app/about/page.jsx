import Link from 'next/link';
import PublicNav from '../../components/PublicNav';

export const metadata = {
  title: 'About Cazini — The Job Passport for African Talent',
  description:
    'Cazini gives jobseekers a verified, portable Job Passport — credentials, work history and education that travel with you — and connects them to live jobs from verified employers across Kenya and Africa.',
  alternates: { canonical: '/about' },
};

const heading = 'text-lg font-bold text-gray-900 mt-8 mb-2';
const body = 'text-sm text-gray-600 leading-relaxed';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">About Cazini</h1>
        <p className={`${body} mt-3`}>
          Cazini is a job passport platform built for jobseekers in Kenya and across Africa.
          It solves a problem millions of workers face: your skills, work history and
          qualifications don&apos;t travel with you. Every new employer, agency or border means
          starting the proof from zero.
        </p>

        <h2 className={heading}>What is a Job Passport?</h2>
        <p className={body}>
          A Job Passport is a single, verified profile a jobseeker owns: work experience,
          education, certifications, references and skills. Entries can be reviewed and
          verified on the platform, and credentials issued by registered organisations are
          cryptographically signed as W3C Verifiable Credentials. The passport can be shared
          with any employer through an expiring link or exported as a PDF — the holder stays
          in control of who sees it and for how long.
        </p>

        <h2 className={heading}>How verification works</h2>
        <p className={body}>
          Jobseekers add their own history and can request verification. Platform reviewers
          confirm entries, and issuing organisations (employers, training institutions,
          certification bodies) registered on Cazini can issue signed credentials directly.
          Verified entries are locked against silent editing, so an employer reading a
          passport knows what has been checked and what is self-reported — both are clearly
          labelled.
        </p>

        <h2 className={heading}>The job board</h2>
        <p className={body}>
          Cazini runs a live <Link href="/jobs" className="font-medium" style={{ color: '#148438' }}>job board</Link> with
          openings from verified employers, updated continuously. Anyone can apply — no
          account required. Jobseekers with a passport get an automatically generated resume
          from their verified profile and can track their applications.
        </p>

        <h2 className={heading}>Cross-border recognition</h2>
        <p className={body}>
          Credentials on Cazini can be evaluated against other jurisdictions&apos; recognition
          rules, so a qualification earned in one country can be understood — and trusted —
          in another. That is the heart of the product: portable proof of ability for a
          continent where talent moves.
        </p>

        <h2 className={heading}>Who we are</h2>
        <p className={body}>
          Cazini is built by Cazini Systems Limited, based in Nairobi, Kenya. Reach us at{' '}
          <a href="mailto:hello@cazini.ai" className="font-medium" style={{ color: '#148438' }}>hello@cazini.ai</a>.
        </p>

        <div className="mt-10 flex gap-3">
          <Link
            href="/register"
            className="inline-block text-white font-semibold px-6 py-2.5 rounded-xl text-sm no-underline hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#148438' }}
          >
            Create your free Job Passport
          </Link>
          <Link
            href="/jobs"
            className="inline-block border-2 font-semibold px-6 py-2.5 rounded-xl text-sm no-underline hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#148438', color: '#148438' }}
          >
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
