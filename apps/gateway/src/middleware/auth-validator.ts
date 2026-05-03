import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { FastifyRequest } from 'fastify';
import type { RouteAuthConfig } from '@gatekeeper/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Cache JWKS sets per URL to avoid re-fetching on every request
const jwksSets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(url: string) {
  if (!jwksSets.has(url)) {
    jwksSets.set(url, createRemoteJWKSet(new URL(url)));
  }
  return jwksSets.get(url)!;
}

export async function validateAuth(
  request: FastifyRequest,
  auth: RouteAuthConfig,
): Promise<string | null> {
  if (auth.type === 'none') return null;

  if (auth.type === 'jwt') {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      const err = new Error('Missing or invalid Authorization header') as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, getJwks(auth.jwks_url), {
        issuer: auth.issuer,
        audience: auth.audience,
      });
      return payload.sub ?? null;
    } catch {
      const err = new Error('JWT validation failed') as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }
  }

  if (auth.type === 'api_key') {
    const headerName = auth.header_name.toLowerCase();
    const rawKey = request.headers[headerName] as string | undefined;
    if (!rawKey) {
      const err = new Error(`Missing ${auth.header_name} header`) as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }

    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const { data } = await supabase
      .from('api_keys')
      .select('id')
      .eq('key_hash', keyHash)
      .single();

    if (!data) {
      const err = new Error('Invalid API key') as Error & { statusCode: number };
      err.statusCode = 403;
      throw err;
    }

    return keyHash;
  }

  return null;
}
