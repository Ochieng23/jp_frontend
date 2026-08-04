import { API_BACKEND_URL } from './site';

/**
 * Server-side job fetchers for RSC pages, generateMetadata, OG-image
 * routes and the sitemap. GET /api/jobs* is optionalAuth on the backend,
 * so no credentials are needed. The backend itself caches the upstream
 * kazini list for 60s; we layer Next's data cache on top (5 min).
 */
export async function fetchJob(id) {
  try {
    const res = await fetch(`${API_BACKEND_URL}/api/jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchJobs(pageSize = 100) {
  try {
    const res = await fetch(`${API_BACKEND_URL}/api/jobs?pageSize=${pageSize}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { jobs: [], total: 0 };
    const json = await res.json();
    return { jobs: json.data || [], total: json.total || 0 };
  } catch {
    return { jobs: [], total: 0 };
  }
}
