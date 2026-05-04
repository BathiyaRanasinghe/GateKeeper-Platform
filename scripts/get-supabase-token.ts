/**
 * Logs in to Supabase and prints the JWT access token.
 * Usage: pnpm get-token --email you@example.com --password yourpassword
 */

const args = process.argv.slice(2);
function getArg(name: string): string {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || !args[idx + 1]) {
    console.error(`Missing --${name}`);
    process.exit(1);
  }
  return args[idx + 1];
}

async function main() {
  const email    = getArg('email');
  const password = getArg('password');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in your .env');
    process.exit(1);
  }

  const res = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ email, password }),
    },
  );

  const data = await res.json() as { access_token?: string; error_description?: string };

  if (!data.access_token) {
    console.error('Login failed:', data.error_description ?? JSON.stringify(data));
    process.exit(1);
  }

  console.log('\nJWT access token (use as: Authorization: Bearer <token>):\n');
  console.log(data.access_token);
  console.log('\nRoute auth config to paste into GateKeeper UI:');
  console.log(JSON.stringify({
    type: 'jwt',
    jwks_url: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    issuer: `${supabaseUrl}/auth/v1`,
    audience: 'authenticated',
  }, null, 2));
}

main();
