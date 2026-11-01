import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

// Cart and sign-in pages stay crawlable on purpose: they are linked from every header and carry
// `noindex`, which crawlers can only see if they are allowed to fetch the page.
const PRIVATE_PATHS = ['/account', '/checkout'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', ...PRIVATE_PATHS, ...PRIVATE_PATHS.map((path) => `/bn${path}`)],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
