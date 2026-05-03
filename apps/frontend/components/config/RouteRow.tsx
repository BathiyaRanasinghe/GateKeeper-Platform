'use client';

import type { Route } from '@gatekeeper/types';
import AuthFieldset from './AuthFieldset';
import RateLimitFieldset from './RateLimitFieldset';
import CorsFieldset from './CorsFieldset';

export default function RouteRow({
  index,
  route,
  onChange,
  onRemove,
}: {
  index: number;
  route: Route;
  onChange: (r: Route) => void;
  onRemove: () => void;
}) {
  function set<K extends keyof Route>(key: K, value: Route[K]) {
    onChange({ ...route, [key]: value });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Route {index + 1}</span>
        <button
          onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
          <input
            type="text"
            value={route.path}
            onChange={(e) => set('path', e.target.value)}
            placeholder="/api/documents"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
          <input
            type="url"
            value={route.target_url}
            onChange={(e) => set('target_url', e.target.value)}
            placeholder="https://mybackend.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <AuthFieldset auth={route.auth} onChange={(auth) => set('auth', auth)} />

      <RateLimitFieldset
        rateLimit={route.rate_limit}
        onChange={(rl) => set('rate_limit', rl)}
      />

      <CorsFieldset cors={route.cors} onChange={(cors) => set('cors', cors)} />
    </div>
  );
}
