import { NextResponse } from 'next/server';

/**
 * Two jobs:
 *
 * 1. Host canonicalization (SEO): the app is reachable on both the custom
 *    domain (jobs.cazini.co.ke) and the Azure default host
 *    (jpfrontend-*.azurewebsites.net). Serving identical content on two
 *    hosts splits ranking signal, so any request on an azurewebsites.net
 *    host gets a 301 to the canonical domain, same path + query.
 *
 * 2. /api/* proxy: intercept all /api/* requests that are NOT /api/auth/*,
 *    read the httpOnly access_token cookie, and inject it as an
 *    Authorization: Bearer <token> header before proxying to Express.
 *    /api/auth/* is handled by the Next.js Route Handler at
 *    app/api/auth/[...nextauth]/route.js — middleware must not intercept it.
 */
const CANONICAL_HOST = 'jobs.cazini.co.ke';

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const host = request.headers.get('host') || '';
  if (host.endsWith('.azurewebsites.net')) {
    return NextResponse.redirect(
      `https://${CANONICAL_HOST}${pathname}${search}`,
      301
    );
  }

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const BACKEND = process.env.API_BACKEND_URL || 'http://localhost:5000';

  // Let the Next.js Route Handler deal with auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Public share-slug endpoint — no auth required, pass through without Authorization header
  if (pathname.startsWith('/api/passport/s/')) {
    const destination = `${BACKEND}${pathname}${search}`;
    return NextResponse.rewrite(new URL(destination));
  }

  const accessToken = request.cookies.get('access_token')?.value;

  const headers = new Headers(request.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const destination = `${BACKEND}${pathname}${search}`;
  return NextResponse.rewrite(new URL(destination), { request: { headers } });
}

export const config = {
  // Everything except Next internals and static assets — the host-redirect
  // check must see page routes too, not just /api/*.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
