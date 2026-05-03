'use client';

import type { CorsConfig } from '@gatekeeper/types';

const defaultCors = (): CorsConfig => ({
  allowed_origins: ['*'],
});

export default function CorsFieldset({
  cors,
  onChange,
}: {
  cors?: CorsConfig;
  onChange: (cors: CorsConfig | undefined) => void;
}) {
  const enabled = !!cors;

  function handleOriginsChange(value: string) {
    const origins = value.split(',').map((s) => s.trim()).filter(Boolean);
    onChange({ ...cors!, allowed_origins: origins });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          id="cors-enabled"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? defaultCors() : undefined)}
          className="rounded border-gray-300"
        />
        <label htmlFor="cors-enabled" className="text-sm font-medium text-gray-700">
          CORS
        </label>
      </div>

      {enabled && cors && (
        <div className="p-3 bg-green-50 rounded-md">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Allowed Origins (comma-separated)
          </label>
          <input
            type="text"
            value={cors.allowed_origins.join(', ')}
            onChange={(e) => handleOriginsChange(e.target.value)}
            placeholder="https://app.example.com, https://other.example.com"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
