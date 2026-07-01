import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('Finding documents with status=processing and no pipelineStartedAt...');
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, status, metadata')
    .eq('status', 'processing')
    .is('metadata->>pipelineStartedAt', null);

  if (error) {
    console.error('Query error', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No stuck documents found.');
    return;
  }

  console.log(`Found ${data.length} stuck document(s). Marking as failed with diagnostic.`);

  for (const doc of data) {
    const id = (doc as any).id;
    const name = (doc as any).name;
    const metadata = (doc as any).metadata || {};

    const newMeta = {
      ...metadata,
      pipelineStartedAt: new Date().toISOString(),
      pipelineError: 'Marked failed by maintenance script: missing pipelineStartedAt (stuck).',
      failedAt: new Date().toISOString(),
    };

    const { error: upErr } = await supabase
      .from('documents')
      .update({ status: 'failed', metadata: newMeta })
      .eq('id', id);

    if (upErr) {
      console.error(`Failed to update document ${id}`, upErr);
    } else {
      console.log(`Marked ${id} (${name}) as failed.`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
