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
});
