import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'knowHer',
        short_name: 'knowHer',
        description: 'A warm, fearless period & cycle health companion.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#A51F2D',
        background_color: '#FDF7F4',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // The nudge lives in the service worker, so it has to run on localhost too —
      // without this the toggle in Profile has nothing to subscribe against in dev.
      devOptions: { enabled: true, type: 'module' },
      workbox: {
        // App shell precache only. Offline log queue + last-fetched dashboard arrive in 13.0.3.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Our half of the service worker: receiving the daily nudge and opening
        // the log when she taps it. Workbox writes the rest of sw.js.
        importScripts: ['push-sw.js'],
      },
    }),
  ],
  // amazon-cognito-identity-js reaches for Node's `global`; point it at the browser global.
  define: { global: 'globalThis' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
