import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * 
 * This client is used for both Database access and Authentication.
 * It uses the 'anon' key for client-side operations, respecting RLS policies.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // We log an error but don't crash the process immediately to allow for 
  // environment variable debugging in different deployments.
  console.error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// Exported singleton instance
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');