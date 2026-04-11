'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-text)' }}>
        MyApp
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Button variant="secondary" onClick={logout} style={{ padding: '0.3rem 0.9rem' }}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
