'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '../../lib/store/authStore';

const NAV_LINKS = [
  { href: '/passport', label: 'My Passport', icon: '🪪' },
  { href: '/credentials', label: 'Credentials', icon: '📜' },
  { href: '/work-history', label: 'Work History', icon: '💼' },
  { href: '/recognition', label: 'Recognition', icon: '🌍' },
  { href: '/jobs', label: 'Job Board', icon: '🔎' },
  { href: '/share', label: 'Share Links', icon: '🔗' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    router.push('/login');
  }

  const isAdmin = user?.role === 'platform_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <div className="px-4 h-16 flex items-center border-b border-gray-100 flex-shrink-0">
          <Link href="/passport" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">JP</span>
            </div>
            <span className="font-bold text-gray-900 text-base">Job Passport</span>
          </Link>
        </div>

        {/* Nav links */}
        <div className="flex-1 py-3 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors no-underline mx-2 rounded-lg mb-0.5 ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              {/* gray-500 on white = 4.8:1 ✅ AA  (was gray-400 = 2.54:1 ❌) */}
              <div className="mx-4 mt-4 mb-1 text-xs font-bold uppercase tracking-widest text-gray-500">
                Admin
              </div>
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors no-underline mx-2 rounded-lg mb-0.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">⚙️</span>
                Admin Panel
              </Link>
            </>
          )}
        </div>

        {/* Footer / user */}
        <div className="border-t border-gray-100 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 font-bold text-sm">
                {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || user?.email || 'Loading…'}
              </div>
              {user?.role && (
                <div className="text-xs text-gray-500 capitalize">
                  {user.role.replace(/_/g, ' ')}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loggingOut ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                Signing out…
              </>
            ) : (
              'Sign out'
            )}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 h-14 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">JP</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Job Passport</span>
          </div>
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
