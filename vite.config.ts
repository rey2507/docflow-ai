import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite config for building the production static site.
// Output goes to dist/ — picked up by Cloudflare Pages.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'docs': resolve(__dirname, './docs'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  define: {
    // Expose env vars to the browser bundle
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''),
    'process.env.AI_DEFAULT_PROVIDER': JSON.stringify(process.env.AI_DEFAULT_PROVIDER ?? 'openai'),
    'process.env.AI_DEFAULT_MODEL': JSON.stringify(process.env.AI_DEFAULT_MODEL ?? 'gpt-4o'),
    // Server-only keys are intentionally excluded from the browser bundle
  },
});
