import { API_BACKEND_URL } from '../../../lib/site';
import PassportShareClient from './PassportShareClient';

/**
 * Personal share links: always noindex (they expire — 410 Gone — and hold
 * personal data the holder shared with a specific recipient, not the open
 * web), but with rich per-person OG tags so pasting the link into
 * WhatsApp/LinkedIn/email shows "[Name]'s verified Job Passport" instead
 * of the generic site card. The client component keeps its own fetch:
 * expiry must be evaluated at view time.
 */
export async function generateMetadata({ params }) {
  const base = {
    title: 'Shared Job Passport',
    robots: { index: false, follow: false },
  };

  try {
    const res = await fetch(
      `${API_BACKEND_URL}/api/passport/s/${encodeURIComponent(params.slug)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return base; // 404 unknown, 410 expired — generic card
    const json = await res.json();
    const holder = json?.data?.holder;
    if (!holder?.full_name) return base;

    const credCount = json.data?.credentials?.length || 0;
    const title = `${holder.full_name}'s verified Job Passport`;
    const description = holder.bio
      ? `${holder.bio.slice(0, 140)}${holder.bio.length > 140 ? '…' : ''}`
      : `${holder.full_name} shared their verified Cazini Job Passport${credCount ? ` — ${credCount} credential${credCount === 1 ? '' : 's'}` : ''}. View credentials, work history and education.`;

    // Only http(s) avatars work as OG images (base64 data-URI avatars are
    // rejected by scrapers); otherwise fall back to the sitewide image.
    const avatar = /^https?:\/\//i.test(holder.avatar_key || '') ? holder.avatar_key : null;

    return {
      ...base,
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        ...(avatar ? { images: [{ url: avatar }] } : {}),
      },
      twitter: {
        card: avatar ? 'summary' : 'summary_large_image',
        title,
        description,
        ...(avatar ? { images: [avatar] } : {}),
      },
    };
  } catch {
    return base;
  }
}

export default function PassportSharePage() {
  return <PassportShareClient />;
}
