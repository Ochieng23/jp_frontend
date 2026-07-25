'use client';

import Link from 'next/link';
import CaziniLogo from './CaziniLogo';
import { useOptionalUser } from '../lib/hooks';

export default function PublicNav() {
  const { user, isLoading } = useOptionalUser();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <CaziniLogo markSize={30} wordmarkClassName="text-lg" />
          <span className="hidden sm:inline text-[11px] font-bold tracking-widest text-gray-400 border-l border-gray-200 pl-2.5 ml-0.5">
            JOBS
          </span>
        </Link>

        {!isLoading && (
          user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/jobs/applications"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 no-underline"
              >
                My Applications
              </Link>
              <Link
                href="/passport"
                className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-colors no-underline"
                style={{ backgroundColor: '#004038' }}
              >
                My Passport
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 no-underline"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-colors no-underline"
                style={{ backgroundColor: '#004038' }}
              >
                Sign up
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}
