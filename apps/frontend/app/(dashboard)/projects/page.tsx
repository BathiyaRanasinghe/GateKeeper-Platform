import { createClient } from '@/lib/supabase/server';
import ProjectList from '@/components/projects/ProjectList';
import type { Project } from '@gatekeeper/types';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Gateway Projects</h1>
      </div>
      <ProjectList initialProjects={(projects ?? []) as Project[]} />
    </div>
  );
}
