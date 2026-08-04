import { fetchJob } from '../../../../lib/jobsServer';
import ApplyClient from './ApplyClient';

// Conversion page — the job detail page is the canonical, indexable URL.
export async function generateMetadata({ params }) {
  const job = await fetchJob(params.id);
  const title = job ? `Apply to ${job.title}${job.employer?.name ? ` at ${job.employer.name}` : ''}` : 'Apply';
  return {
    title,
    robots: { index: false, follow: true },
    alternates: { canonical: `/jobs/${params.id}` },
  };
}

export default function ApplyPage() {
  return <ApplyClient />;
}
