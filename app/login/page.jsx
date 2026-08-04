import LoginClient from './LoginClient';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your Cazini Job Passport — manage your verified credentials, work history and job applications.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return <LoginClient />;
}
