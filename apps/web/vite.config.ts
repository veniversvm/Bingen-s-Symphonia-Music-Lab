import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite'; // <--- Importación

export default defineConfig({
  plugins: [
    solidPlugin(),
    tailwindcss(), // <--- Ejecución del plugin
  ],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
  },
});