import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import AuthProvider from '../components/AuthProvider';
import JsonLd from '../components/JsonLd';
import { SITE_URL } from '../lib/site';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cazini — Job Passport & Verified Job Board for Africa',
    template: '%s | Cazini',
  },
  description:
    'Build a verified, portable Job Passport — credentials, work history and education that travel with you — and apply to live jobs from verified employers across Kenya and Africa. Free for jobseekers.',
  applicationName: 'Cazini',
  keywords: [
    'jobs in Kenya',
    'jobs in Africa',
    'verified credentials',
    'job passport',
    'employment verification',
    'job board',
    'work history verification',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Cazini',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Cazini — Job Passport & Verified Job Board for Africa',
    description:
      'Verified, portable employment credentials and a live job board for jobseekers across Kenya and Africa.',
    images: [{ url: '/xuyt50qed9sr7tcuo6op-Sharpened.png', width: 1200, height: 676, alt: 'Cazini' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cazini — Job Passport & Verified Job Board for Africa',
    description:
      'Verified, portable employment credentials and a live job board for jobseekers across Kenya and Africa.',
    images: ['/xuyt50qed9sr7tcuo6op-Sharpened.png'],
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#148438',
};

// Sitewide structured data: who Cazini is + site search. Rendered once in
// the root layout so every page carries it; page-level JSON-LD
// (JobPosting, BreadcrumbList) is added by the individual pages.
const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cazini',
  url: SITE_URL,
  logo: `${SITE_URL}/xuyt50qed9sr7tcuo6op-Sharpened.png`,
  description:
    'Cazini is a job passport platform: jobseekers build verified, portable employment credentials and apply to live jobs from verified employers across Africa.',
  email: 'hello@cazini.ai',
  areaServed: 'Africa',
};

const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Cazini',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/jobs?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <JsonLd data={ORG_JSONLD} />
        <JsonLd data={WEBSITE_JSONLD} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
