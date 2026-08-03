// Note: no 'use client' here — getServerUser() must run in the admin layout's
// Server Component. The client-side exports below still work fine from
// either context: they only touch `document` inside their function bodies
// (guarded by the typeof check), never at module scope.

// ─── Cookie helper (client-side only) ────────────────────────────────────────

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const val = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
  return val ? val.split('=').slice(1).join('=') : null;
}

// ─── Client-side exports ─────────────────────────────────────────────────────

/**
 * Read the user object from the non-httpOnly `user_info` cookie.
 * Cookie value is base64-encoded JSON written by the Next.js auth route handler.
 * Returns parsed object or null.
 */
export function getUser() {
  const raw = getCookie('user_info');
  if (!raw) return null;
  try {
    // base64 → JSON string → object
    return JSON.parse(atob(raw));
  } catch {
    // Fallback: try plain JSON (backwards compat)
    try { return JSON.parse(decodeURIComponent(raw)); } catch { return null; }
  }
}

export function isAuthenticated() {
  return getUser() !== null;
}

export function clearAuth() {
  if (typeof document === 'undefined') return;
  document.cookie = 'user_info=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
}

export function getUserRole() {
  return getUser()?.role ?? null;
}

// ─── Server-side export ───────────────────────────────────────────────────────

export async function getServerUser(cookieStore) {
  const tokenCookie = cookieStore.get('access_token');
  if (!tokenCookie?.value) return null;
  try {
    const { decodeJwt } = await import('jose');
    return decodeJwt(tokenCookie.value);
  } catch {
    return null;
  }
}
