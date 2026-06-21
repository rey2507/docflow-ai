import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * 
 * This client is used for both Database access and Authentication.
 * It uses the 'anon' key for client-side operations, respecting RLS policies.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Missing Supabase environment variables. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or provide SUPABASE_URL and SUPABASE_ANON_KEY at build time.';

if (!isSupabaseConfigured) {
  // We log an error but don't crash the process immediately to allow for 
  // environment variable debugging in different deployments.
  console.error(supabaseConfigError);
}

// Exported singleton instance
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);