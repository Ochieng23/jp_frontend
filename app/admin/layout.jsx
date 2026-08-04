import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerUser } from '../../lib/auth';
import AdminNav from '../../components/layout/AdminNav';

// Platform-admin-only pages — never indexable.
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const cookieStore = cookies();
  const user = await getServerUser(cookieStore);

  if (!user || user.role !== 'platform_admin') {
    redirect('/passport');
  }

  return <AdminNav>{children}</AdminNav>;
}
