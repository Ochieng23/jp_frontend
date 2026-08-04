import { SITE_URL, API_BACKEND_URL } from '../lib/site';

/**
 * Static routes plus every live job detail page. The backend's job list is
 * a single upstream call cached 60s in-process (kaziniJobsService), so
 * enumerating all IDs here is cheap. Revalidated hourly.
 */
export const revalidate = 3600;

export default async function sitemap() {
  const staticEntries = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/jobs`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/register`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  let jobEntries = [];
  try {
    const res = await fetch(`${API_BACKEND_URL}/api/jobs?pageSize=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      jobEntries = (json.data || []).map((job) => ({
        url: `${SITE_URL}/jobs/${job.id}`,
        lastModified: job.posted_at ? new Date(job.posted_at) : undefined,
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    }
  } catch {
    // Backend unreachable at build/revalidate time — ship the static
    // entries rather than failing the whole sitemap.
  }

  return [...staticEntries, ...jobEntries];
}
