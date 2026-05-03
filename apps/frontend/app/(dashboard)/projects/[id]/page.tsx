import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GatewayUrlDisplay from '@/components/projects/GatewayUrlDisplay';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) notFound();

  const gatewayBase = process.env.NEXT_PUBLIC_GATEWAY_BASE_URL ?? '';
  const gatewayUrl = `${gatewayBase}/${id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
      </div>

      <GatewayUrlDisplay url={gatewayUrl} />

      <div className="flex gap-4">
        <Link
          href={`/projects/${id}/config`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Configure Routes
        </Link>
        <Link
          href={`/projects/${id}/logs`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
        >
          View Logs
        </Link>
      </div>
    </div>
  );
}
