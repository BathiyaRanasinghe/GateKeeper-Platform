// ── Auth config ───────────────────────────────────────────────────────────────

export interface JwtAuthConfig {
  type: 'jwt';
  issuer: string;
  audience: string;
  jwks_url: string;
}

export interface ApiKeyAuthConfig {
  type: 'api_key';
  header_name: string; // default: 'X-API-Key'
}

export interface NoAuthConfig {
  type: 'none';
}

export type RouteAuthConfig = JwtAuthConfig | ApiKeyAuthConfig | NoAuthConfig;

// ── Route-level config ────────────────────────────────────────────────────────

export interface RateLimitConfig {
  requests: number;
  window_seconds: number;
  scope: 'per_user' | 'global';
}

export interface CorsConfig {
  allowed_origins: string[];
  allowed_methods?: string[];
  allowed_headers?: string[];
}

export interface Route {
  path: string;       // e.g. "/api/documents"
  target_url: string; // e.g. "https://mybackend.com"
  auth: RouteAuthConfig;
  rate_limit?: RateLimitConfig;
  cors?: CorsConfig;
}

// ── Project-level config ──────────────────────────────────────────────────────

export interface HmacConfig {
  secret: string;
}

export interface GatewayConfig {
  project_id: string;
  routes: Route[];
  hmac: HmacConfig;
}

// ── Platform entities ─────────────────────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  project_id: string;
  label?: string;
  created_at: string;
}

export interface GatewayLog {
  id: number;
  project_id: string;
  route_path?: string;
  method?: string;
  status_code?: number;
  latency_ms?: number;
  ip?: string;
  created_at: string;
}
