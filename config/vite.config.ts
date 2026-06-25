import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const resolveEnvValue = (env: Record<string, string>, ...keys: string[]) => {
  for (const key of keys) {
    const value = env[key] || process.env[key];
    if (value) {
      return value;
    }
  }

  return '';
};

// Vite config for building the production static site.
// Output goes to dist/ — picked up by Cloudflare Pages.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '..'), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src'),
        'docs': resolve(__dirname, '../docs'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, '../index.html'),
        },
      },
    },
    define: {
      // Expose env vars to the browser bundle
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
        resolveEnvValue(env, 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL')
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        resolveEnvValue(env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY')
      ),
      'process.env.AI_DEFAULT_PROVIDER': JSON.stringify(env.AI_DEFAULT_PROVIDER || process.env.AI_DEFAULT_PROVIDER || 'openai'),
      'process.env.AI_DEFAULT_MODEL': JSON.stringify(env.AI_DEFAULT_MODEL || process.env.AI_DEFAULT_MODEL || 'gpt-4o'),
      // Server-only keys are intentionally excluded from the browser bundle
    },
  };
});
