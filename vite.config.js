import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'Safari 10'],
      renderLegacyChunks: true,
      polyfills: ['es.promise', 'es.object.assign', 'es.array.from', 'es.string.includes']
    })
  ],
  build: {
    target: 'es5',
    minify: 'terser',
  }
});