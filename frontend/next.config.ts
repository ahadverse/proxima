import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// On Vercel a missing API address would silently proxy to localhost, so fail the build instead.
if (process.env.VERCEL && !process.env.API_URL) {
  throw new Error('Set API_URL in the Vercel project environment variables to the public URL of the Proxima API.');
}

const apiUrl = (process.env.API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
const r2Host = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname : undefined;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  agentRules: false,
  experimental: {
    optimizePackageImports: ['radix-ui'],
  },
  images: {
    // Uploads are already WebP. AVIF would add a slow, separately billed encode per size for little gain.
    formats: ['image/webp'],
    // Fewer widths means fewer optimized variants to generate and cache; these cover every `sizes` in use.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [96, 160, 256, 384],
    // Uploaded images get a fresh key on every upload, so optimized copies never go stale.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...(r2Host ? [{ protocol: 'https' as const, hostname: r2Host }] : []),
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${apiUrl}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
