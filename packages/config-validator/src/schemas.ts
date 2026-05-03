import { z } from 'zod';

export const noAuthSchema = z.object({
  type: z.literal('none'),
});

export const jwtAuthSchema = z.object({
  type: z.literal('jwt'),
  issuer: z.string().min(1),
  audience: z.string().min(1),
  jwks_url: z.string().url(),
});

export const apiKeyAuthSchema = z.object({
  type: z.literal('api_key'),
  header_name: z.string().min(1).default('X-API-Key'),
});

export const routeAuthSchema = z.discriminatedUnion('type', [
  noAuthSchema,
  jwtAuthSchema,
  apiKeyAuthSchema,
]);

export const rateLimitSchema = z.object({
  requests: z.number().int().positive(),
  window_seconds: z.number().int().positive(),
  scope: z.enum(['per_user', 'global']),
});

export const corsSchema = z.object({
  allowed_origins: z.array(z.string()).min(1),
  allowed_methods: z.array(z.string()).optional(),
  allowed_headers: z.array(z.string()).optional(),
});

export const routeSchema = z.object({
  path: z.string().startsWith('/'),
  target_url: z.string().url(),
  auth: routeAuthSchema,
  rate_limit: rateLimitSchema.optional(),
  cors: corsSchema.optional(),
});

export const hmacSchema = z.object({
  secret: z.string().min(16),
});

export const gatewayConfigSchema = z.object({
  project_id: z.string().uuid(),
  routes: z.array(routeSchema),
  hmac: hmacSchema,
});

export type GatewayConfigInput = z.input<typeof gatewayConfigSchema>;
export type GatewayConfigOutput = z.output<typeof gatewayConfigSchema>;
