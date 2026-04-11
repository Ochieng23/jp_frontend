'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser } from '../../lib/auth';

const NAV_LINKS = [
  { href: '/passport', label: 'My Passport', icon: '🪪' },
  { href: '/credentials', label: 'Credentials', icon: '🎓' },
  { href: '/work-history', label: 'Work History', icon: '💼' },
  { href: '/recognition', label: 'Recognition', icon: '🗺️' },
  { href: '/share', label: 'Share Links', icon: '🔗' },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Continue even if request fails
    } finally {
      setLoggingOut(false);
      router.push('/login');
    }
  }

  const isAdmin = user?.role === 'platform_admin';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen((p) => !p)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`dashboard-sidebar${mobileOpen ? ' open' : ''}`}
        aria-label="Dashboard navigation"
      >
        <Link href="/passport" className="nav-logo">
          Job Passport
        </Link>

        <div className="nav-section">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${active ? ' active' : ''}`}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div
                style={{
                  margin: '8px 16px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                }}
              >
                Admin
              </div>
              <Link
                href="/admin/dashboard"
                className={`nav-link${pathname.startsWith('/admin') ? ' active' : ''}`}
              >
                <span style={{ fontSize: 16 }}>⚙️</span>
                Admin Panel
              </Link>
            </>
          )}
        </div>

        <div className="nav-footer">
          <div className="nav-user">
            <img
              src={user?.avatar_url || '/placeholder-avatar.svg'}
              alt={user?.full_name || 'User'}
              className="nav-avatar"
              onError={(e) => { e.target.src = '/placeholder-avatar.svg'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nav-username">
                {user?.full_name || user?.email || 'Loading…'}
              </div>
              {user?.role && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {user.role.replace(/_/g, ' ')}
                </div>
              )}
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: 13 }}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                Signing out…
              </>
            ) : (
              'Sign out'
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
