'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { updateConfig } from '@/lib/api-client';
import { gatewayConfigSchema } from '@gatekeeper/config-validator';
import type { GatewayConfig, Route } from '@gatekeeper/types';
import RouteRow from './RouteRow';
import JsonToggle from './JsonToggle';

const defaultRoute = (): Route => ({
  path: '/',
  target_url: '',
  auth: { type: 'none' },
});

export default function RouteConfigEditor({
  projectId,
  initialConfig,
}: {
  projectId: string;
  initialConfig: GatewayConfig;
}) {
  const [config, setConfig] = useState<GatewayConfig>(initialConfig);
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);

  function switchToJson() {
    setJsonText(JSON.stringify(config.routes, null, 2));
    setJsonError('');
    setViewMode('json');
  }

  function switchToForm() {
    try {
      const parsed = JSON.parse(jsonText);
      // Validate routes array through schema
      const result = gatewayConfigSchema.safeParse({ ...config, routes: parsed });
      if (!result.success) {
        setJsonError('Invalid config: ' + result.error.issues[0]?.message);
        return;
      }
      setConfig((c) => ({ ...c, routes: parsed }));
      setJsonError('');
      setViewMode('form');
    } catch {
      setJsonError('Invalid JSON');
    }
  }

  function handleToggle(toJson: boolean) {
    if (toJson) {
      switchToJson();
    } else {
      switchToForm();
    }
  }

  const updateRoute = useCallback((index: number, route: Route) => {
    setConfig((c) => {
      const routes = [...c.routes];
      routes[index] = route;
      return { ...c, routes };
    });
  }, []);

  const removeRoute = useCallback((index: number) => {
    setConfig((c) => ({
      ...c,
      routes: c.routes.filter((_, i) => i !== index),
    }));
  }, []);

  function addRoute() {
    setConfig((c) => ({ ...c, routes: [...c.routes, defaultRoute()] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // If in JSON mode, flush changes to config state first
      if (viewMode === 'json') {
        const parsed = JSON.parse(jsonText);
        const result = gatewayConfigSchema.safeParse({ ...config, routes: parsed });
        if (!result.success) {
          setJsonError('Invalid config: ' + result.error.issues[0]?.message);
          setSaving(false);
          return;
        }
        await updateConfig(projectId, { ...config, routes: parsed });
      } else {
        await updateConfig(projectId, config);
      }
      toast.success('Configuration saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <JsonToggle isJson={viewMode === 'json'} onChange={handleToggle} />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Config'}
        </button>
      </div>

      {viewMode === 'json' ? (
        <div>
          {jsonError && (
            <p className="text-red-600 text-sm mb-2">{jsonError}</p>
          )}
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={20}
            className="w-full font-mono text-sm border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {config.routes.length === 0 && (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              No routes configured. Add your first route below.
            </div>
          )}
          {config.routes.map((route, i) => (
            <RouteRow
              key={i}
              index={i}
              route={route}
              onChange={(r) => updateRoute(i, r)}
              onRemove={() => removeRoute(i)}
            />
          ))}
          <button
            onClick={addRoute}
            className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm hover:border-blue-400 hover:text-blue-500"
          >
            + Add Route
          </button>
        </div>
      )}
    </div>
  );
}
