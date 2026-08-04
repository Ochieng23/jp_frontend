import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from '../../components/layout/DashboardShell';

// Private, per-user pages — keep the whole dashboard out of search indexes.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  const cookieStore = cookies();
  // Guard on the refresh token (7-day TTL) rather than the access token (15-min TTL).
  // The access token is refreshed transparently by api.js on the first 401 response,
  // so checking it here would log the user out on every normal page refresh.
  const refreshToken = cookieStore.get('refresh_token');

  if (!refreshToken?.value) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
