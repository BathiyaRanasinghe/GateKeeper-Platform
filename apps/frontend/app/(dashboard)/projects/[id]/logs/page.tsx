import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LogsTable from '@/components/logs/LogsTable';

export default async function LogsPage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Request Logs</h1>
      </div>
      <LogsTable projectId={id} />
    </div>
  );
}
