import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerUser } from '../../lib/auth';
import AdminNav from '../../components/layout/AdminNav';

export default async function AdminLayout({ children }) {
  const cookieStore = cookies();
  const user = await getServerUser(cookieStore);

  if (!user || user.role !== 'platform_admin') {
    redirect('/passport');
  }

  return (
    <div className="dashboard-layout">
      <AdminNav />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
