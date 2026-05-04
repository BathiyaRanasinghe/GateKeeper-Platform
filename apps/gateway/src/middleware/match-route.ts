import type { GatewayConfig, Route } from '@gatekeeper/types';

// Longest-prefix match — more specific routes win
export function matchRoute(config: GatewayConfig, requestPath: string): Route | null {
  const sorted = [...config.routes].sort(
    (a, b) => b.path.length - a.path.length,
  );

  for (const route of sorted) {
    const normalizedRoute = route.path.replace(/\/+$/, '');
    if (requestPath === normalizedRoute || requestPath.startsWith(normalizedRoute + '/')) {
      return route;
    }
  }

  return null;
}
