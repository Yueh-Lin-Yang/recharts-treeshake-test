import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    analyzer({
      analyzerMode: 'static',
      fileName: 'report',
      defaultSizes: 'gzip',
      openAnalyzer: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});