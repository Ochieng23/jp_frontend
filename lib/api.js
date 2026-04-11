/**
 * lib/api.js — Client-side API module
 *
 * All requests go through /api which is rewritten to the Express backend
 * by Next.js rewrites (except /api/auth/* which is handled by the Next.js
 * API route that manages httpOnly cookies).
 *
 * Tokens are NEVER accessed here — they live in httpOnly cookies and are
 * sent automatically by the browser. Only the non-httpOnly `user_info`
 * cookie is readable by client JS.
 */

const API_BASE = '/api';

let isRefreshing = false;

async function request(endpoint, options = {}, isRetry = false) {
  const defaultHeaders = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    credentials: 'include', // always send cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, config);

  if (res.status === 401 && !isRetry) {
    // Attempt token refresh via the Next.js auth route
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        isRefreshing = false;
        if (!refreshRes.ok) {
          // Refresh failed — redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please log in again.');
        }
      } catch (err) {
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw err;
      }
    }
    // Retry original request once with updated cookies
    return request(endpoint, options, true);
  }

  if (res.status === 401 && isRetry) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  // Handle no-content responses
  if (res.status === 204) {
    return null;
  }

  let payload;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await res.json();
  } else {
    payload = await res.text();
  }

  if (!res.ok) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export function get(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'GET' });
}

export function post(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function patch(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function del(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'DELETE' });
}

export function uploadFile(endpoint, formData) {
  return request(endpoint, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser sets it with boundary
  });
}

const api = { get, post, patch, del, uploadFile };
export default api;
