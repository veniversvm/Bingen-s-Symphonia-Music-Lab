import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa'; // <--- Importamos esto

export default defineConfig({
  plugins: [
    solidPlugin(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: "Bingen's Symphonia Music Lab",
        short_name: "BSML",
        description: "Entrenamiento Auditivo Profesional",
        theme_color: "#355C7D",
        icons: [
          {
            src: 'pwa-192x192.png', // Asegúrate de tener un icono eventualmente
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // ESTA ES LA CLAVE DE LA OPTIMIZACIÓN:
        // Cachear archivos externos (CDN de Soundfont)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/gleitz\.github\.io\/midi-js-soundfonts\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'midi-sounds-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }) as any
  ],
  server: {
    port: 3001,
    host: true,
    allowedHosts: true,
  },
  build: {
    target: 'esnext',
  },
});