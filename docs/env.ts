/**
 * Environment Variable Utility
 * 
 * Centralizes fetching of configuration to support multiple runtimes:
 * 1. Vite (Browser/React) -> import.meta.env
 * 2. Deno (Supabase/Local) -> Deno.env.get
 * 3. Cloudflare Workers -> Handled via context injection (or global fallback)
 */

export type EnvKey = 
  | 'SUPABASE_URL'
  | 'SUPABASE_ANON_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'STRIPE_SECRET_KEY'
  | 'STRIPE_WEBHOOK_SECRET'
  | 'OPENAI_API_KEY'
  | 'GEMINI_API_KEY'
  | 'AI_DEFAULT_PROVIDER'
  | 'AI_DEFAULT_MODEL'
  | 'AI_PROVIDER_CHAIN';

export const getEnv = (key: EnvKey, defaultValue?: string): string => {
  // 1. Try Deno (Supabase Edge / Local Deno)
  try {
    // @ts-ignore: Deno global
    if (typeof Deno !== 'undefined' && Deno.env) {
      return Deno.env.get(key) || defaultValue || '';
    }
  } catch { /* Not in Deno */ }

  // 2. Try Vite (React Frontend)
  // Vite requires NEXT_PUBLIC_ or VITE_ prefix for client-side access
  const viteKey = `VITE_${key}`;
  const publicViteKey = `NEXT_PUBLIC_${key}`;
  
  // @ts-ignore: Vite env
  const viteEnv = import.meta.env;
  if (viteEnv) {
    return viteEnv[viteKey] || viteEnv[publicViteKey] || defaultValue || '';
  }

  // 3. Try Node.js (Testing/CI)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue || '';
    }
  } catch { /* Not in Node */ }

  return defaultValue || '';
};