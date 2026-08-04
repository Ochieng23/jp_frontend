import PublicShareClient from './PublicShareClient';

// Token-based personal share link — never indexable. (The token is decoded
// client-side, so no server-side data is available for richer previews.)
export const metadata = {
  title: 'Shared Job Passport',
  robots: { index: false, follow: false },
};

export default function PublicSharePage() {
  return <PublicShareClient />;
}
