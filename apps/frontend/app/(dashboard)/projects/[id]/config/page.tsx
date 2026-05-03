import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RouteConfigEditor from '@/components/config/RouteConfigEditor';
import type { GatewayConfig } from '@gatekeeper/types';

export default async function ConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', id)
    .single();

  if (!project) notFound();

  const { data: configRow } = await supabase
    .from('gateway_configs')
    .select('config')
    .eq('project_id', id)
    .single();

  const config: GatewayConfig = configRow?.config ?? {
    project_id: id,
    routes: [],
    hmac: { secret: '' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Route Configuration</h1>
      </div>
      <RouteConfigEditor projectId={id} initialConfig={config} />
    </div>
  );
}
