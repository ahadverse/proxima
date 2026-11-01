/**
 * Vercel project config. It runs at build time, so the API address comes from the
 * API_URL environment variable instead of being written into the repository.
 */
const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, '');
if (!apiUrl) {
  throw new Error('Set API_URL in the Vercel project environment variables to the public URL of the Proxima API.');
}

export const config = {
  framework: 'vite',
  installCommand: 'npx --yes pnpm@11.15.1 install --frozen-lockfile',
  buildCommand: 'npx --yes pnpm@11.15.1 run build',
  outputDirectory: 'dist',
  rewrites: [
    // Calling the API through this domain keeps the session cookies first-party.
    { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    // Single-page app: any other route renders index.html and the client router takes over.
    { source: '/(.*)', destination: '/index.html' },
  ],
  headers: [
    {
      source: '/assets/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};
