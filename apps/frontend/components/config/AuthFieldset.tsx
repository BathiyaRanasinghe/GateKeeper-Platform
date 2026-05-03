'use client';

import type { RouteAuthConfig } from '@gatekeeper/types';

export default function AuthFieldset({
  auth,
  onChange,
}: {
  auth: RouteAuthConfig;
  onChange: (auth: RouteAuthConfig) => void;
}) {
  function handleTypeChange(type: RouteAuthConfig['type']) {
    if (type === 'none') onChange({ type: 'none' });
    if (type === 'jwt') onChange({ type: 'jwt', issuer: '', audience: '', jwks_url: '' });
    if (type === 'api_key') onChange({ type: 'api_key', header_name: 'X-API-Key' });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
        <select
          value={auth.type}
          onChange={(e) => handleTypeChange(e.target.value as RouteAuthConfig['type'])}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="jwt">JWT</option>
          <option value="api_key">API Key</option>
        </select>
      </div>

      {auth.type === 'jwt' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50 rounded-md">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Issuer</label>
            <input
              type="text"
              value={auth.issuer}
              onChange={(e) => onChange({ ...auth, issuer: e.target.value })}
              placeholder="https://auth.example.com"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Audience</label>
            <input
              type="text"
              value={auth.audience}
              onChange={(e) => onChange({ ...auth, audience: e.target.value })}
              placeholder="my-api"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">JWKS URL</label>
            <input
              type="url"
              value={auth.jwks_url}
              onChange={(e) => onChange({ ...auth, jwks_url: e.target.value })}
              placeholder="https://auth.example.com/.well-known/jwks.json"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {auth.type === 'api_key' && (
        <div className="p-3 bg-yellow-50 rounded-md">
          <label className="block text-xs font-medium text-gray-600 mb-1">Header Name</label>
          <input
            type="text"
            value={auth.header_name}
            onChange={(e) => onChange({ ...auth, header_name: e.target.value })}
            placeholder="X-API-Key"
            className="w-48 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
