/**
 * Generates an API key, hashes it, and inserts it into the api_keys table.
 * Usage: pnpm create-api-key --project-id <uuid> --label "my key"
 */

import { createHash, randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
function getArg(name: string, required = true): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || !args[idx + 1]) {
    if (required) { console.error(`Missing --${name}`); process.exit(1); }
    return undefined;
  }
  return args[idx + 1];
}

async function main() {
  const projectId = getArg('project-id')!;
  const label     = getArg('label', false);

  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const rawKey  = randomBytes(32).toString('hex');
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const { error } = await supabase
    .from('api_keys')
    .insert({ project_id: projectId, key_hash: keyHash, label: label ?? null });

  if (error) {
    console.error('Failed to insert API key:', error.message);
    process.exit(1);
  }

  console.log('\nAPI key created successfully!\n');
  console.log('Raw key (send this in the header — it will not be shown again):');
  console.log(rawKey);
  console.log('\nRoute auth config to paste into GateKeeper UI:');
  console.log(JSON.stringify({ type: 'api_key', header_name: 'X-API-Key' }, null, 2));
}

main();
