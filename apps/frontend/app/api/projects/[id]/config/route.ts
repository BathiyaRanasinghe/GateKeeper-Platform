import { createClient } from '@/lib/supabase/server';
import { getRedis } from '@/lib/redis';
import { gatewayConfigSchema } from '@gatekeeper/config-validator';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gateway_configs')
    .select('config')
    .eq('project_id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data.config);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  // Validate with Zod
  const parsed = gatewayConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid config', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('gateway_configs')
    .update({
      config: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate Redis cache so all gateway replicas pick up the new config
  try {
    const redis = getRedis();
    await redis.del(`config:${id}`);
  } catch {
    // Non-fatal — gateway will re-fetch on next TTL expiry
  }

  return NextResponse.json({ ok: true });
}
