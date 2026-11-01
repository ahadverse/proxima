import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: env.VITE_API_PROXY || 'http://localhost:5000', changeOrigin: true },
      },
    },
    preview: { port: 5173 },
    build: {
      rollupOptions: {
        output: {
          // Only React gets its own long-lived chunk. Grouping by package name also pulled shared
          // helpers into those groups, which made every page download the charts library.
          manualChunks(id) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)) return 'react';
          },
        },
      },
    },
  };
});
