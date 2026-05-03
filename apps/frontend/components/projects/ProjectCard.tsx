'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { Project } from '@gatekeeper/types';

const gatewayBase = process.env.NEXT_PUBLIC_GATEWAY_BASE_URL ?? '';

export default function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const gatewayUrl = `${gatewayBase}/${project.id}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(gatewayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(project.id);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3 shadow-sm">
      <div>
        <h3 className="font-semibold text-gray-900">{project.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">Created {formatDate(project.created_at)}</p>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
        <code className="text-xs text-gray-600 truncate flex-1">{gatewayUrl}</code>
        <button
          onClick={handleCopy}
          className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link
          href={`/projects/${project.id}/config`}
          className="flex-1 text-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
        >
          Configure
        </Link>
        <Link
          href={`/projects/${project.id}/logs`}
          className="flex-1 text-center px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-xs font-medium hover:bg-gray-50"
        >
          Logs
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-medium hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
