import type { Project, GatewayConfig, GatewayLog } from '@gatekeeper/types';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? 'Request failed');
  }

  return res.json();
}

// ── Projects ──────────────────────────────────────────────────────────────────

export const getProjects = () =>
  apiFetch<Project[]>('/api/projects');

export const createProject = (name: string) =>
  apiFetch<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const deleteProject = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/projects/${id}`, { method: 'DELETE' });

// ── Config ────────────────────────────────────────────────────────────────────

export const getConfig = (projectId: string) =>
  apiFetch<GatewayConfig>(`/api/projects/${projectId}/config`);

export const updateConfig = (projectId: string, config: GatewayConfig) =>
  apiFetch<{ ok: boolean }>(`/api/projects/${projectId}/config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });

// ── Logs ──────────────────────────────────────────────────────────────────────

export const getLogs = (projectId: string, page = 0) =>
  apiFetch<GatewayLog[]>(`/api/projects/${projectId}/logs?page=${page}`);
