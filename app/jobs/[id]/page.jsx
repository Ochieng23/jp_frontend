import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { SITE_URL } from '../../../lib/site';
import { fetchJob } from '../../../lib/jobsServer';
import JobDetailClient from './JobDetailClient';

export const revalidate = 300;

function truncate(text, max = 155) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }) {
  const job = await fetchJob(params.id);
  if (!job) return { title: 'Job not found', robots: { index: false } };

  const title = `${job.title}${job.employer?.name ? ` at ${job.employer.name}` : ''}${job.location ? ` — ${job.location}` : ''}`;
  const description = truncate(job.aboutJob) ||
    `Apply to ${job.title} on Cazini — verified employers, apply in minutes with or without an account.`;

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/jobs/${job.id}`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// contract_type values from kazini → schema.org employmentType enum.
const EMPLOYMENT_TYPE = {
  fulltime: 'FULL_TIME',
  'full-time': 'FULL_TIME',
  'part time': 'PART_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  internship: 'INTERN',
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Google for Jobs requires an HTML description; assemble one from the
 * structured fields, entity-escaping the source text. */
function buildHtmlDescription(job) {
  const parts = [`<p>${esc(job.aboutJob)}</p>`];
  if (job.responsibilities?.length) {
    parts.push(`<p><strong>Responsibilities</strong></p><ul>${job.responsibilities.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`);
  }
  if (job.qualifications?.length) {
    parts.push(`<p><strong>Qualifications</strong></p><ul>${job.qualifications.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>`);
  }
  if (job.benefits?.length) {
    parts.push(`<p><strong>Benefits</strong></p><ul>${job.benefits.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`);
  }
  return parts.join('');
}

function buildJobPostingJsonLd(job) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: buildHtmlDescription(job),
    datePosted: job.posted_at,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.employer?.name || 'Cazini employer',
      ...(job.employer?.website ? { sameAs: job.employer.website } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location || 'Kenya' },
    },
    identifier: {
      '@type': 'PropertyValue',
      name: job.employer?.name || 'Cazini',
      value: job.id,
    },
    directApply: true,
    url: `${SITE_URL}/jobs/${job.id}`,
  };

  const employmentType = EMPLOYMENT_TYPE[(job.contract_type || '').toLowerCase()];
  if (employmentType) jsonLd.employmentType = employmentType;
  if (job.jobType === 'remote') jsonLd.jobLocationType = 'TELECOMMUTE';
  if (job.applicationDeadline && !job.rollingBasis) jsonLd.validThrough = job.applicationDeadline;
  if (job.companyIndustry) jsonLd.industry = job.companyIndustry;
  if (job.skills?.length) jsonLd.skills = job.skills.join(', ');
  // baseSalary intentionally omitted: the API exposes amount + currency but
  // not the pay period, and asserting a wrong unitText (e.g. MONTH vs YEAR)
  // in structured data is worse than leaving the optional field out. The
  // salary is still shown on-page.

  return jsonLd;
}

export default async function JobDetailPage({ params }) {
  const job = await fetchJob(params.id);
  if (!job) notFound();

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Jobs', item: `${SITE_URL}/jobs` },
      { '@type': 'ListItem', position: 2, name: job.title, item: `${SITE_URL}/jobs/${job.id}` },
    ],
  };

  return (
    <>
      <JsonLd data={buildJobPostingJsonLd(job)} />
      <JsonLd data={breadcrumbs} />
      <JobDetailClient job={job} />
    </>
  );
}
