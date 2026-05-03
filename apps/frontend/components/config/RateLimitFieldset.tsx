'use client';

import type { RateLimitConfig } from '@gatekeeper/types';

const defaultRateLimit = (): RateLimitConfig => ({
  requests: 100,
  window_seconds: 60,
  scope: 'per_user',
});

export default function RateLimitFieldset({
  rateLimit,
  onChange,
}: {
  rateLimit?: RateLimitConfig;
  onChange: (rl: RateLimitConfig | undefined) => void;
}) {
  const enabled = !!rateLimit;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          id="rl-enabled"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? defaultRateLimit() : undefined)}
          className="rounded border-gray-300"
        />
        <label htmlFor="rl-enabled" className="text-sm font-medium text-gray-700">
          Rate Limiting
        </label>
      </div>

      {enabled && rateLimit && (
        <div className="grid grid-cols-3 gap-3 p-3 bg-orange-50 rounded-md">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Requests</label>
            <input
              type="number"
              min={1}
              value={rateLimit.requests}
              onChange={(e) => onChange({ ...rateLimit, requests: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Window (seconds)</label>
            <input
              type="number"
              min={1}
              value={rateLimit.window_seconds}
              onChange={(e) => onChange({ ...rateLimit, window_seconds: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scope</label>
            <select
              value={rateLimit.scope}
              onChange={(e) => onChange({ ...rateLimit, scope: e.target.value as 'per_user' | 'global' })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="per_user">Per User</option>
              <option value="global">Global</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
