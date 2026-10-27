import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Charis — Spiritual Discipline',
        short_name: 'Charis',
        description: 'A private, rhythm-first spiritual discipline companion for Scripture, prayer, study, and reflection.',
        theme_color: '#F8F2E8',
        background_color: '#F8F2E8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/bible-go': {
        target: 'https://bible-go-api.rkeplin.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bible-go/, ''),
      },
    },
  }
})
