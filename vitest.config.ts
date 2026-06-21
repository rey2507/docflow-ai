import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Root-level Vitest config so Vitest always picks it up.
export default defineConfig({
  plugins: [react() as any],
  resolve: {
    alias: {
      '@': `${process.cwd()}/src`,
      'docs': `${process.cwd()}/docs`,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Ensure this path exists after the repo re-org.
    setupFiles: ['./scripts/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
} as any);

