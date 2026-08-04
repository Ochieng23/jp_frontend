'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CaziniLogo from '../../components/CaziniLogo';
import { post } from '../../lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!token) {
      setServerError('This reset link is missing its token. Please request a new one.');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setServerError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
        This reset link is missing its token.{' '}
        <Link href="/forgot-password" className="font-medium underline">
          Request a new one
        </Link>
        .
      </div>
    );
  }

  if (done) {
    return (
      <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
        Password reset successfully. Redirecting you to sign in…
      </div>
    );
  }

  return (
    <>
      {serverError && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
            placeholder="At least 8 characters"
            disabled={loading}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 ${
              errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-400 focus:border-primary-500'
            }`}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
            placeholder="Re-enter your new password"
            disabled={loading}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 ${
              errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-400 focus:border-primary-500'
            }`}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetting…
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="no-underline inline-block">
            <CaziniLogo markSize={38} wordmarkClassName="text-lg" />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-gray-500 text-sm mb-8">Choose a new password for your account.</p>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
