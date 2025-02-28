import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx'], // Asegurar que resuelva .ts
  },
  server: {
    proxy: {
      '/viator': {
        target: 'https://api.viator.com/partner',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/viator/, ''),
        headers: {
          'Accept': 'application/json;version=2.0',
          'Content-Type': 'application/json',
        },
      },
    },
  },
});