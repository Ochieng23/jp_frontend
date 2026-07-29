'use client';

import Link from 'next/link';
import CaziniLogo from './CaziniLogo';
import { useOptionalUser } from '../lib/hooks';

const NAV_LINKS = [
  { href: '/jobs', label: 'Find jobs' },
  { href: '/login', label: 'Credentials' },
  { href: '/#employers', label: 'For employers' },
  { href: '/#how-it-works', label: 'About' },
];

export default function PublicNav() {
  const { user, isLoading } = useOptionalUser();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="no-underline flex-shrink-0">
            <CaziniLogo markSize={38} wordmarkClassName="text-lg" />
          </Link>
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {!isLoading && (
          user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/jobs/applications"
                className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors no-underline"
              >
                My Applications
              </Link>
              <Link
                href="/passport"
                className="text-[15px] font-semibold text-white px-[18px] py-2.5 rounded no-underline transition-colors"
                style={{ backgroundColor: '#148438' }}
              >
                My Passport
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-[15px] text-gray-700 hover:text-gray-900 transition-colors no-underline"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-[15px] font-semibold text-white px-[18px] py-2.5 rounded no-underline transition-colors hover:opacity-90"
                style={{ backgroundColor: '#148438' }}
              >
                Create a profile
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}
