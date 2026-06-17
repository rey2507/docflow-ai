// Supabase Edge Function (Deno) - Automated Cleanup Task
// This function marks documents stuck in 'processing' for too long as 'failed'.

/// <reference path="./types/deno-globals.d.ts" />
/// <reference path="./types/esm-url-modules.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (_req: Request): Promise<Response> => {
  try {
    const TIMEOUT_MINUTES = 15;
    const timeoutDate = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000).toISOString();

    console.log(`[Cleanup] Searching for documents stuck in 'processing' since before ${timeoutDate}`);

    // 1. Fetch documents that have been in 'processing' state for longer than the timeout
    // We use service role to bypass RLS and see all stuck documents
    const { data: staleDocs, error: fetchError } = await supabase
      .from('documents')
      .select('id, metadata')
      .eq('status', 'processing')
      .lt('updated_at', timeoutDate);

    if (fetchError) throw fetchError;

    if (!staleDocs || staleDocs.length === 0) {
      return new Response(JSON.stringify({ message: 'No stale documents found.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Cleanup] Found ${staleDocs.length} stale document(s). Transitioning to failed state.`);

    // 2. Batch update status to 'failed' and update corresponding workflows
    const updates = staleDocs.map(async (doc: { id: string; metadata: any }) => {
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({
          status: 'failed',
          metadata: {
            ...doc.metadata,
            pipelineError: `Processing timed out (no update for > ${TIMEOUT_MINUTES} minutes).`,
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', doc.id);

      const { error: wfUpdateError } = await supabase
        .from('workflows')
        .update({ status: 'failed' })
        .eq('documentId', doc.id);

      return { 
        id: doc.id, 
        success: !docUpdateError && !wfUpdateError,
        error: docUpdateError?.message || wfUpdateError?.message 
      };
    });

    const results = await Promise.all(updates);

    return new Response(JSON.stringify({ processedCount: staleDocs.length, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`[Cleanup] Fatal error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});