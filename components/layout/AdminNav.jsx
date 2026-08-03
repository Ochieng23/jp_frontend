'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser } from '../../lib/auth';

const ADMIN_SECTIONS = [
  {
    label: 'Overview',
    links: [{ href: '/admin/dashboard', label: 'Dashboard', icon: '📊' }],
  },
  {
    label: 'People',
    links: [{ href: '/admin/holders', label: 'Holders', icon: '🧑‍💻' }],
  },
  {
    label: 'Verifications',
    links: [{ href: '/admin/verifications', label: 'Verifications', icon: '✅' }],
  },
  {
    label: 'Organizations',
    links: [
      { href: '/admin/organizations', label: 'Organisations', icon: '🏢' },
      { href: '/admin/jurisdictions', label: 'Jurisdictions', icon: '🌍' },
    ],
  },
  {
    label: 'System',
    links: [{ href: '/admin/audit', label: 'Audit Log', icon: '📋' }],
  },
];

export default function AdminNav({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Continue on failure
    } finally {
      setLoggingOut(false);
      router.push('/login');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — distinct purple identity so it never reads as the jobseeker dashboard */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-[#1b0f33] flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        aria-label="Admin navigation"
      >
        {/* Logo */}
        <div className="px-4 h-16 flex items-center gap-2 border-b border-white/10 flex-shrink-0">
          <span className="text-lg">🛡️</span>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Cazini Admin</div>
            <div className="text-[11px] text-purple-300 leading-tight">Platform control panel</div>
          </div>
        </div>

        {/* Nav sections */}
        <div className="flex-1 py-3 overflow-y-auto">
          {ADMIN_SECTIONS.map((section) => (
            <div key={section.label} className="mb-1">
              <div className="mx-4 mt-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-purple-300/70">
                {section.label}
              </div>
              {section.links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors no-underline mx-2 rounded-lg mb-0.5 ${
                      active
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-100/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer / user */}
        <div className="border-t border-white/10 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {user?.full_name || user?.email || 'Admin'}
              </div>
              <div className="text-xs text-purple-300">Platform Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-purple-100 border border-white/15 rounded-lg py-2 hover:bg-white/10 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loggingOut ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="lg:hidden sticky top-0 z-20 bg-[#1b0f33] h-14 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-purple-100 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold text-sm">Cazini Admin</span>
        </div>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
