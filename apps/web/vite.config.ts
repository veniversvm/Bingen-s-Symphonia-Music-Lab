import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    solidPlugin(),
    tailwindcss(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      // Configuración simplificada de SVG para evitar errores de SVGO
      svg: {
        multipass: true,
        plugins: [
          'removeViewBox', // Simplemente el nombre del plugin como string
          'sortAttrs',
        ],
      },
      png: { quality: 70 },
      jpeg: { quality: 70 },
      jpg: { quality: 70 },
      webp: { quality: 70 },
      // Bajamos a 45 para forzar una reducción real de peso
      avif: { quality: 45 }, 
    }),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "mask-icon.svg",
        "assets/*.avif",
      ],
      manifest: {
        name: "Bingen's Symphonia Music Lab",
        short_name: "BSML",
        description: "Entrenamiento Auditivo Profesional",
        theme_color: "#355C7D",
        background_color: "#F7F9FB",
        display: "standalone",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,avif,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/gleitz\.github\.io\/midi-js-soundfonts\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "midi-sounds-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }) as any,
  ],

  server: {
    port: 3001,
    host: true,
    allowedHosts: true,
  },

  optimizeDeps: {
    exclude: ["vexflow", "tonal"],
  },

  build: {
    target: "esnext",
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["solid-js", "@solidjs/router"],
          music: ["vexflow", "soundfont-player", "tonal"],
        },
      },
    },
  },
});