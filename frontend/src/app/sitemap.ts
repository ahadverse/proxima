import type { MetadataRoute } from 'next';
import { getCategories, getPages, getProducts } from '@/lib/api';
import { absoluteUrl, localePath } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_PATHS = ['', '/membership', '/reviews', '/help'];

function entry(path: string, options: { lastModified?: string; priority?: number; images?: string[] } = {}): MetadataRoute.Sitemap[number] {
  const en = absoluteUrl(localePath('en', path));
  return {
    url: en,
    lastModified: options.lastModified ? new Date(options.lastModified) : undefined,
    priority: options.priority ?? 0.6,
    alternates: { languages: { en, bn: absoluteUrl(localePath('bn', path)), 'x-default': en } },
    ...(options.images?.length ? { images: options.images.map(absoluteUrl) } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => entry(path, { priority: path === '' ? 1 : 0.7 }));

  // Each source is optional: an API hiccup should shrink the sitemap, not break it.
  const [categories, pages] = await Promise.all([getCategories().catch(() => []), getPages().catch(() => [])]);
  urls.push(...categories.filter((c) => c.productCount > 0).map((c) => entry(`/category/${c.slug}`, { priority: 0.7 })));
  urls.push(...pages.map((p) => entry(`/p/${p.slug}`, { lastModified: p.updatedAt, priority: 0.4 })));

  try {
    let page = 1;
    let totalPages = 1;
    do {
      const { items, meta } = await getProducts({ page, limit: 48 });
      urls.push(
        ...items.map((p) =>
          entry(`/product/${p.slug}`, { lastModified: p.updatedAt || p.createdAt, priority: 0.8, images: p.thumbnail ? [p.thumbnail] : [] }),
        ),
      );
      totalPages = meta.pages;
      page += 1;
    } while (page <= totalPages && page <= 50);
  } catch {
    /* API unavailable: serve what we have */
  }

  return urls;
}
