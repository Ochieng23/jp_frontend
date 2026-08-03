/**
 * app/api/auth/[...nextauth]/route.js
 *
 * Next.js Route Handler that proxies auth requests to the Express backend
 * and manages httpOnly cookies. Handles:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   POST /api/auth/refresh
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use server-only var (no NEXT_PUBLIC_ prefix) so it is always read at runtime
const EXPRESS_API = process.env.API_BACKEND_URL || 'http://localhost:5000';
const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function cookieOptions(maxAge, httpOnly = true) {
  return {
    httpOnly,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

function setAuthCookies(response, accessToken, refreshToken, user) {
  response.cookies.set('access_token', accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE, true));
  response.cookies.set('refresh_token', refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE, true));
  // Store only the minimal fields needed for the UI shell in the cookie.
  // avatar_key can be a multi-MB base64 data URL — keeping it out prevents
  // ERR_RESPONSE_HEADERS_TOO_BIG and keeps the cookie under the 4 KB browser limit.
  const slim = {
    id: user.id || user._id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    nationality: user.nationality,
  };
  const userB64 = Buffer.from(JSON.stringify(slim)).toString('base64');
  response.cookies.set('user_info', userB64, cookieOptions(REFRESH_TOKEN_MAX_AGE, false));
}

function clearAuthCookies(response) {
  const expired = { httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/', maxAge: 0 };
  response.cookies.set('access_token', '', expired);
  response.cookies.set('refresh_token', '', expired);
  response.cookies.set('user_info', '', { ...expired, httpOnly: false });
}

export async function POST(request, { params }) {
  const segments = params.nextauth; // array of path segments
  const action = segments[segments.length - 1]; // last segment: login | register | refresh | logout

  const cookieStore = cookies();

  if (action === 'login' || action === 'register') {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let expressRes;
    try {
      expressRes = await fetch(`${EXPRESS_API}/api/auth/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return NextResponse.json({ error: 'Backend unreachable', details: err.message }, { status: 502 });
    }

    const data = await expressRes.json().catch(() => ({}));

    if (!expressRes.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Authentication failed' },
        { status: expressRes.status }
      );
    }

    const { accessToken, refreshToken, user } = data;

    if (!accessToken || !refreshToken || !user) {
      return NextResponse.json({ error: 'Unexpected response from backend' }, { status: 502 });
    }

    const response = NextResponse.json({ user }, { status: expressRes.status });
    setAuthCookies(response, accessToken, refreshToken, user);
    return response;
  }

  if (action === 'refresh') {
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    let expressRes;
    try {
      expressRes = await fetch(`${EXPRESS_API}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      return NextResponse.json({ error: 'Backend unreachable', details: err.message }, { status: 502 });
    }

    const data = await expressRes.json().catch(() => ({}));

    if (!expressRes.ok) {
      const response = NextResponse.json(
        { error: data.message || 'Token refresh failed' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    const { accessToken, refreshToken: newRefreshToken } = data;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token in refresh response' }, { status: 502 });
    }

    // Only rotate the token cookies — do NOT touch user_info since the backend
    // refresh endpoint doesn't return the user object.
    const response = NextResponse.json({ ok: true });
    response.cookies.set('access_token',  accessToken,                       cookieOptions(ACCESS_TOKEN_MAX_AGE,  true));
    response.cookies.set('refresh_token', newRefreshToken || refreshToken,   cookieOptions(REFRESH_TOKEN_MAX_AGE, true));
    return response;
  }

  if (action === 'forgot-password' || action === 'reset-password') {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let expressRes;
    try {
      expressRes = await fetch(`${EXPRESS_API}/api/auth/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return NextResponse.json({ error: 'Backend unreachable', details: err.message }, { status: 502 });
    }

    const data = await expressRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: expressRes.status });
  }

  if (action === 'resend-verification') {
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let expressRes;
    try {
      expressRes = await fetch(`${EXPRESS_API}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      return NextResponse.json({ error: 'Backend unreachable', details: err.message }, { status: 502 });
    }

    const data = await expressRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: expressRes.status });
  }

  if (action === 'logout') {
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Best-effort: notify backend
    try {
      await fetch(`${EXPRESS_API}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore backend errors on logout
    }

    const response = NextResponse.json({ ok: true });
    clearAuthCookies(response);
    return response;
  }

  return NextResponse.json({ error: 'Unknown auth action' }, { status: 404 });
}

export async function GET(request, { params }) {
  const segments = params.nextauth;
  const action = segments[segments.length - 1];

  if (action === 'verify-email') {
    const token = new URL(request.url).searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    let expressRes;
    try {
      expressRes = await fetch(`${EXPRESS_API}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    } catch (err) {
      return NextResponse.json({ error: 'Backend unreachable', details: err.message }, { status: 502 });
    }

    const data = await expressRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: expressRes.status });
  }

  if (action === 'me') {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let expressRes;
    try {
      expressRes = await fetch(`${EXPRESS_API}/api/passport/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      return NextResponse.json({ error: 'Backend unreachable', details: err.message }, { status: 502 });
    }

    const data = await expressRes.json().catch(() => ({}));

    if (!expressRes.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch user' },
        { status: expressRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  }

  return NextResponse.json({ error: 'Unknown auth action' }, { status: 404 });
}
