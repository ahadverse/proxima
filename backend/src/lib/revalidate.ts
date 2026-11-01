import { env } from '../config/env';
import { runInBackground } from './background';
import { logger } from './logger';

/**
 * Asks the storefront to drop cached pages for the given tags so admin
 * changes show up without a rebuild. Failures are logged, never thrown.
 */
export function revalidateStorefront(tags: string[]): void {
  if (tags.length === 0) return;
  const request = fetch(`${env.CLIENT_URL.replace(/\/+$/, '')}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.REVALIDATE_SECRET },
    body: JSON.stringify({ tags }),
    signal: AbortSignal.timeout(5_000),
  }).then((response) => {
    if (!response.ok) logger.warn({ tags, status: response.status }, 'Storefront revalidation was rejected');
  });
  runInBackground(request, 'Storefront revalidation');
}

export const CacheTags = {
  settings: 'settings',
  categories: 'categories',
  products: 'products',
  product: (slug: string) => `product:${slug}`,
  pages: 'pages',
  page: (slug: string) => `page:${slug}`,
  videoReviews: 'video-reviews',
  ratings: 'ratings',
} as const;
