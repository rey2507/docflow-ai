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

const id = process.argv[2];
if (!id) {
  console.error('Usage: npx ts-node scripts/inspect_document.ts <DOCUMENT_ID>');
  process.exit(1);
}

async function run() {
  const { data, error } = await supabase.from('documents').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('Error fetching document:', error);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

run().catch((e) => { console.error(e); process.exit(1); });
