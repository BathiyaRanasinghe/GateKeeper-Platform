import type { GatewayConfig, Route } from '@gatekeeper/types';

// Longest-prefix match — more specific routes win
export function matchRoute(config: GatewayConfig, requestPath: string): Route | null {
  const sorted = [...config.routes].sort(
    (a, b) => b.path.length - a.path.length,
  );

  for (const route of sorted) {
    if (requestPath === route.path || requestPath.startsWith(route.path + '/')) {
      return route;
    }
  }

  return null;
}
