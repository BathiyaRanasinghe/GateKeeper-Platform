import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '0');
  const limit = 50;
  const from = page * limit;
  const to = from + limit - 1;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gateway_logs')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
