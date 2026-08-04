'use client';

import { useState } from 'react';
import Link from 'next/link';
import CaziniLogo from '../../components/CaziniLogo';
import { post } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      // Backend always returns a generic success message — a thrown error
      // here means the request itself failed (network/backend down), not
      // that the email doesn't exist.
      setError(err.message || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="no-underline inline-block">
            <CaziniLogo markSize={38} wordmarkClassName="text-lg" />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter the email address on your account and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            If an account exists for that email, we&apos;ve sent a password reset link. Check your inbox.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-400 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
