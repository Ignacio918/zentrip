import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  define: {
    'import.meta.env.RAPIDAPI_KEY_TRIPADVISOR': JSON.stringify(
      process.env.RAPIDAPI_KEY_TRIPADVISOR
    ),
  },
});
