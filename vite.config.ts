import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        // Exclude large PNG files from precaching, they'll be cached on demand
        globIgnores: ['**/icon-512.png'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
      },
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'TextCraft',
        short_name: 'TextCraft',
        description: 'Format your text with Unicode styling for social media platforms',
        theme_color: '#34C759',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
})
