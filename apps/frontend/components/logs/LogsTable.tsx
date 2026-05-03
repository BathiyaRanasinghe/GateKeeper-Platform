'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLogs } from '@/lib/api-client';
import type { GatewayLog } from '@gatekeeper/types';

function statusColor(code?: number) {
  if (!code) return 'text-gray-400';
  if (code < 300) return 'text-green-600';
  if (code < 400) return 'text-blue-600';
  if (code < 500) return 'text-yellow-600';
  return 'text-red-600';
}

export default function LogsTable({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<GatewayLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await getLogs(projectId);
      setLogs(data);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading logs...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        No requests logged yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Method</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Path</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Latency</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(log.created_at).toLocaleTimeString()}
              </td>
              <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                {log.method ?? '-'}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-xs truncate">
                {log.route_path ?? '-'}
              </td>
              <td className={`px-4 py-3 font-mono text-xs font-bold ${statusColor(log.status_code)}`}>
                {log.status_code ?? '-'}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {log.latency_ms != null ? `${log.latency_ms}ms` : '-'}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                {log.ip ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
