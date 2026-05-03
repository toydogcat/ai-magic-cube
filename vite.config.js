import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'pwa-192.webp', 'pwa-512.webp', 'maskable-512.webp'],
      manifest: {
        name: '3D Magic Cube Simulator',
        short_name: '3D Magic Cube',
        description: '3D Magic Cube simulator with Vanilla TypeScript & Canvas 2D',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'pwa-512.webp',
            sizes: '512x512',
            type: 'image/webp'
          },
          {
            src: 'maskable-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: '48x46',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
});
