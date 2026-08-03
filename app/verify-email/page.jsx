'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CaziniLogo from '../../components/CaziniLogo';
import { get } from '../../lib/api';

function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  // The verify-email token is single-use (the backend clears it on success),
  // so this guards against React Strict Mode's double-invoked effect in dev
  // firing the request twice and the second (now-consumed-token) call's
  // failure clobbering the first call's success.
  const requested = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing its token.');
      return;
    }
    if (requested.current) return;
    requested.current = true;

    get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'This verification link is invalid or has expired.');
      });
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="flex items-center gap-3 text-gray-600 text-sm">
        <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
        Verifying your email…
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
        Your email has been verified. You&apos;re all set.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="no-underline inline-block">
            <CaziniLogo markSize={38} wordmarkClassName="text-lg" />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Email verification</h1>

        <div className="text-left">
          <Suspense fallback={null}>
            <VerifyEmailStatus />
          </Suspense>
        </div>

        <Link
          href="/passport"
          className="inline-block mt-8 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Go to my passport →
        </Link>
      </div>
    </div>
  );
}
