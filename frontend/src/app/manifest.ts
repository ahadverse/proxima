import type { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/lib/api';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [{ brand }, t] = await Promise.all([getSettings(), getTranslations({ locale: 'en', namespace: 'meta' })]);
  return {
    name: t('siteName'),
    short_name: brand.name,
    description: t('homeDescription'),
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9ff',
    theme_color: '#6d28d9',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
