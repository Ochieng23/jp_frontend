import { NextResponse } from 'next/server';

/**
 * Intercept all /api/* requests that are NOT /api/auth/*.
 * Reads the httpOnly access_token cookie and injects it as an
 * Authorization: Bearer <token> header before proxying to Express.
 *
 * /api/auth/* is handled by the Next.js Route Handler at
 * app/api/auth/[...nextauth]/route.js — middleware must not intercept it.
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl;
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
  matcher: '/api/:path*',
};
