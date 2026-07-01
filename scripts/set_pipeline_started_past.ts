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
  // Set pipelineStartedAt to 31 minutes ago for processing rows missing timestamp
  const past = new Date(Date.now() - 31 * 60 * 1000).toISOString();

  console.log('Finding processing docs without pipelineStartedAt...');
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, metadata')
    .eq('status', 'processing')
    .is('metadata->>pipelineStartedAt', null);

  if (error) {
    console.error('Query error', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No matching documents found.');
    return;
  }

  for (const doc of data) {
    const id = (doc as any).id;
    const name = (doc as any).name;
    const metadata = (doc as any).metadata || {};
    const newMeta = { ...metadata, pipelineStartedAt: past };
    const { error: upErr } = await supabase.from('documents').update({ metadata: newMeta }).eq('id', id);
    if (upErr) console.error('Failed to update', id, upErr);
    else console.log(`Set pipelineStartedAt for ${id} (${name}) to ${past}`);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
