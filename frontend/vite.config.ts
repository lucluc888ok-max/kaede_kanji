import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: '漢字チャレンジ',
        short_name: '漢字',
        description: '小学3年生向け漢字学習アプリ',
        start_url: '/',
        display: 'standalone',
        background_color: '#EBF1F6',
        theme_color: '#6366F1',
        lang: 'ja',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // questions.jsonをキャッシュ（オフライン対応）
            urlPattern: /\/src\/data\/questions\.json$/,
            handler: 'CacheFirst',
            options: { cacheName: 'questions-cache' },
          },
          {
            // Google Fontsキャッシュ
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-static-cache' },
          },
        ],
      },
    }),
  ],
})
