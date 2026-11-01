import { defineConfig } from 'tsup';

export default defineConfig({
  // app.js is the Vercel entry (default-exported Express app); server.js runs it on a regular host.
  entry: ['src/app.ts', 'src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Each entry must be self-contained: Vercel detects the app by its `express` import.
  splitting: false,
  // On Vercel, sanitize-html failed to load as an external package, so every admin save that cleans
  // rich text returned 500. Bundling it (and nanoid, which its postcss dependency needs at v3 while
  // the app uses v6) removes the dependency on Vercel packaging those files.
  noExternal: ['sanitize-html', 'nanoid'],
  // Bundled CommonJS code calls require() for Node built-ins, which ESM output only has via createRequire.
  banner: { js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);" },
});
