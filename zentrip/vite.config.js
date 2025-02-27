import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  build: {
    minify: 'esbuild', // Minificar código
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Separar dependencias
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['framer-motion'], // Pre-cargar dependencias comunes
  },
});