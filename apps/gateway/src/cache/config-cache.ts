import { createClient } from '@supabase/supabase-js';
import type { Redis } from 'ioredis';
import type { GatewayConfig } from '@gatekeeper/types';

const TTL = Number(process.env.CONFIG_CACHE_TTL_SECONDS ?? 30);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function fetchFromSupabase(projectId: string): Promise<GatewayConfig | null> {
  const { data, error } = await supabase
    .from('gateway_configs')
    .select('config, project_id')
    .eq('project_id', projectId)
    .single();

  if (error || !data) return null;
  return data.config as GatewayConfig;
}

export async function getConfig(
  redis: Redis,
  projectId: string,
): Promise<GatewayConfig | null> {
  const cacheKey = `config:${projectId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as GatewayConfig;
  }

  const config = await fetchFromSupabase(projectId);
  if (!config) return null;

  await redis.setex(cacheKey, TTL, JSON.stringify(config));
  return config;
}

export async function invalidateConfig(redis: Redis, projectId: string): Promise<void> {
  await redis.del(`config:${projectId}`);
}

export function writeLog(entry: {
  project_id: string;
  route_path: string;
  method: string;
  status_code: number;
  latency_ms: number;
  ip: string;
}): void {
  // Fire-and-forget — never await so it never slows down the response
  supabase.from('gateway_logs').insert(entry).then(({ error }) => {
    if (error) console.error('[log-writer]', error.message);
  });
}
