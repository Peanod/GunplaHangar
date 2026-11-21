import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        id: '/',
        name: 'GunplaHangar',
        short_name: 'GunplaHangar',
        description: 'Katalog koleksi model kit Gundam dan pelacak progres perakitan',
        theme_color: '#0a1224',
        background_color: '#0a1224',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // App shell: semua file hasil build ikut di-precache
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        cleanupOutdatedCaches: true,
        // Navigasi SPA (mis. buka /kit/3 saat offline) dilayani index.html dari cache
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // PENTING: pakai fungsi, BUKAN regex. Backend ada di domain Vercel yang berbeda
            // dari frontend, dan Workbox hanya mencocokkan regex pada request lintas-origin
            // jika cocok dari awal URL. Regex /\/api\/.../ lama tidak pernah cocok, jadi
            // data API tidak pernah masuk cache dan halaman kosong saat offline.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && /^\/api\/(kits|logs|grades)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Foto kit / foto progres (Supabase Storage, lintas-origin) agar tetap tampil offline
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:3000' } },
});
