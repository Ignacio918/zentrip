import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { viteMockServe } from 'vite-plugin-mock'; // Asegurar importación correcta

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    viteMockServe({
      mockPath: 'mock',
      localEnabled: true,
    }),
  ],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['framer-motion'],
  },
});