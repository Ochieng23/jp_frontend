import { SITE_URL } from '../lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/passport',
          '/credentials',
          '/work-history',
          '/education',
          '/recognition',
          '/settings',
          '/jobs/applications',
          '/p/',
          '/public/',
          '/verify/',
          '/verify-email',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
