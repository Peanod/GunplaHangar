import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png'],
      manifest: {
        name: 'GunplaHangar',
        short_name: 'GunplaHangar',
        description: 'Katalog koleksi model kit Gundam dan pelacak progres perakitan',
        theme_color: '#0a1224',
        background_color: '#0a1224',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/(kits|logs|grades)/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:3000' } },
});
