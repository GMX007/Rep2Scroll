import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'SweatNScroll',
        short_name: 'SweatNScroll',
        description: 'Earn your scroll time. Every session. No exceptions.',
        theme_color: '#E8533A',
        background_color: '#0F1647',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'apple touch icon' }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      }
    })
  ]
});
