import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Work around version/type mismatches between Vite and Vitest in this repo.
  plugins: [react() as any],
  resolve: {
    alias: {
      '@': `${process.cwd()}/src`,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./scripts/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
} as any);

