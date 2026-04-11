'use client';
/**
 * lib/store/authStore.js — Zustand auth store
 *
 * Single source of truth for the logged-in user on the client.
 * Tokens live in httpOnly cookies (never touched by JS).
 * The user object is hydrated from the base64 user_info cookie on init,
 * then kept in sync via login / logout / register actions.
 */

import { create } from 'zustand';

// ── Read user_info cookie (base64 JSON) ──────────────────────────────────────
function readUserFromCookie() {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.split('; ').find((r) => r.startsWith('user_info='));
    if (!match) return null;
    const raw = match.split('=').slice(1).join('=');
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────
const useAuthStore = create((set, get) => ({
  /** @type {object|null} */
  user: null,
  /** Whether initialize() has been called */
  ready: false,

  /**
   * Populate user from cookie on first client render.
   * Call once in a top-level layout / provider.
   */
  initialize() {
    if (get().ready) return;
    set({ user: readUserFromCookie(), ready: true });
  },

  /**
   * Login action — calls /api/auth/login, stores user in Zustand.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} user
   */
  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed. Please check your credentials.');
    set({ user: data.user });
    return data.user;
  },

  /**
   * Register action — calls /api/auth/register, stores user in Zustand.
   * @param {object} payload registration fields
   * @returns {Promise<object>} user
   */
  async register(payload) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed. Please try again.');
    set({ user: data.user });
    return data.user;
  },

  /**
   * Logout action — calls /api/auth/logout, clears Zustand user.
   */
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors — still clear local state
    }
    set({ user: null });
  },

  /** Manually update stored user (e.g. after PATCH /passport/me) */
  setUser(user) {
    set({ user });
  },
}));

export default useAuthStore;
