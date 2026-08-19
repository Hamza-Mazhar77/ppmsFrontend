import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration
 * In development the dev server proxies /api to the Express backend. That keeps
 * the browser on a single origin, so the httpOnly session cookie and streamed
 * PDF responses behave exactly as they will in a same-origin production setup.
 * For a split deployment (frontend on Vercel, API elsewhere) set
 * VITE_API_BASE_URL to the API origin and configure CLIENT_URL on the server.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the vendor bundle separate so app updates do not invalidate it.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
