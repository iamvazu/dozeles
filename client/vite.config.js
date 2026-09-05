import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Dozeles Operations & Admin',
        short_name: 'Dozeles Pro',
        description:
          'Dozeles Field Operations, Janitor Photo Station, Schedule & Service Quotes Management.',
        theme_color: '#0A192F',
        background_color: '#0A192F',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/admin',
        scope: '/',
        categories: ['business', 'productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Admin Dashboard',
            short_name: 'Admin',
            description: 'Open Dozeles Admin Portal',
            url: '/admin',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }]
          },
          {
            name: 'Field Projects & Photos',
            short_name: 'Photos',
            description: 'Janitor Photo Station & Checklists',
            url: '/admin',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /sitemap\.xml$/, /robots\.txt$/],
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
