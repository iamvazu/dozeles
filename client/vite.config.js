import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Dozeles Professional Cleaning',
        short_name: 'Dozeles',
        description:
          'Commercial & residential janitorial and cleaning services across the Bay Area and Northern California.',
        theme_color: '#0A2540',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // cache images (including ones served from dozeles.com)
            urlPattern: /\.(png|jpg|jpeg|webp|svg|gif)(\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/api\/(content|reviews)/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-content' },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: { '/api': 'http://localhost:4000' },
  },
});
