// Canonical public origin — used by metadata, sitemap, robots, JSON-LD and
// OG-image routes. The azurewebsites.net default host 301s here (middleware).
export const SITE_URL = 'https://jobs.cazini.co.ke';
export const SITE_NAME = 'Cazini';

// Backend origin for server-side (RSC) fetches — same var middleware.js uses
// for the client-side /api proxy. GET /api/jobs* is optionalAuth, so no
// credentials are needed from a server component.
export const API_BACKEND_URL = process.env.API_BACKEND_URL || 'http://localhost:5000';
