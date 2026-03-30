import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      /** Manual registration in main.jsx with `immediate: true` (before window.load). */
      injectRegister: false,
      srcDir: 'src',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SweatNScroll',
        short_name: 'SweatNScroll',
        description: 'Earn your scroll time. Every session. No exceptions.',
        theme_color: '#E8533A',
        background_color: '#0F1647',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      }
    })
  ]
});
