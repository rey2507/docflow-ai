import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Root-level Vitest config so Vitest always picks it up.
export default defineConfig({
  plugins: [react() as any],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'docs': resolve(__dirname, './docs'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Ensure this path exists after the repo re-org.
    setupFiles: [resolve(__dirname, './scripts/setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
} as any);

