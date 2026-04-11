'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser } from '../../lib/auth';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/organizations', label: 'Organisations', icon: '🏢' },
  { href: '/admin/jurisdictions', label: 'Jurisdictions', icon: '🌍' },
  { href: '/admin/audit', label: 'Audit Log', icon: '📋' },
];

export default function AdminNav() {
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Continue on failure
    } finally {
      setLoggingOut(false);
      router.push('/login');
    }
  }

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

      <nav
        className={`dashboard-sidebar${mobileOpen ? ' open' : ''}`}
        style={{ borderRight: '1px solid var(--color-border)' }}
        aria-label="Admin navigation"
      >
        <Link href="/admin/dashboard" className="nav-logo" style={{ color: '#7c3aed' }}>
          Admin Panel
        </Link>

        <div className="nav-section">
          {ADMIN_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${active ? ' active' : ''}`}
                style={active ? { color: '#7c3aed', background: '#f5f3ff', borderRightColor: '#7c3aed' } : {}}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

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
            Holder Portal
          </div>
          <Link href="/passport" className="nav-link">
            <span style={{ fontSize: 16 }}>🪪</span>
            Back to Passport
          </Link>
        </div>

        <div className="nav-footer">
          <div className="nav-user">
            <img
              src={user?.avatar_url || '/placeholder-avatar.svg'}
              alt={user?.full_name || 'Admin'}
              className="nav-avatar"
              onError={(e) => { e.target.src = '/placeholder-avatar.svg'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nav-username">
                {user?.full_name || user?.email || 'Admin'}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#7c3aed',
                  fontWeight: 600,
                }}
              >
                Platform Admin
              </div>
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
