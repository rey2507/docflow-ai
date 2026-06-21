import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // Work around version/type mismatches between Vite and Vitest in this repo.
  plugins: [react() as any],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      'docs': resolve(__dirname, '../docs'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(__dirname, '../scripts/setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
} as any);

