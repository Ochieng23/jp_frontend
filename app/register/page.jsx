import RegisterClient from './RegisterClient';

export const metadata = {
  title: 'Create your free Job Passport',
  description: 'Create a free Cazini account and build a verified, portable Job Passport — credentials, work history and education that travel with you. Apply to jobs across Kenya and Africa.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
