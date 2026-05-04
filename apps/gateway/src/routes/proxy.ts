import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { extractConfig } from '../middleware/extract-config';
import { matchRoute } from '../middleware/match-route';
import { validateAuth } from '../middleware/auth-validator';
import { applyRateLimit } from '../middleware/rate-limiter';
import { signWithHmac } from '../middleware/hmac-signer';
import { forwardRequest } from '../proxy/forwarder';
import { writeLog } from '../cache/config-cache';

const proxyRoute: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, _request, reply) => {
    const err = error as Error & { statusCode?: number; retryAfter?: number };
    const status = err.statusCode ?? 500;

    if (err.retryAfter) {
      reply.header('Retry-After', String(err.retryAfter));
    }

    reply.code(status).send({ error: err.message });
  });

  async function handleProxy(
    request: FastifyRequest,
    reply: FastifyReply,
    projectId: string,
    remainingPath: string,
  ) {
    const startMs = Date.now();

    // 1. Load config (Redis cache → Supabase on miss)
    const config = await extractConfig(fastify, projectId);
    if (!config) {
      return reply.code(404).send({ error: 'Project not found' });
    }

    // 2. Match route by longest-prefix
    const route = matchRoute(config, remainingPath);
    if (!route) {
      return reply.code(404).send({ error: 'No matching route' });
    }

    // 3. Validate auth — returns subject identifier for rate-limit scoping
    const identifier = await validateAuth(request, route.auth);

    // 4. Apply rate limiting
    const rateLimitInfo = await applyRateLimit(
      fastify.redis,
      request,
      projectId,
      route,
      identifier,
    );

    if (rateLimitInfo.limit !== -1) {
      reply.header('X-RateLimit-Limit', String(rateLimitInfo.limit));
      reply.header('X-RateLimit-Remaining', String(rateLimitInfo.remaining));
      reply.header('X-RateLimit-Reset', String(Math.ceil(rateLimitInfo.reset / 1000)));
    }

    // 5. Sign the request with project HMAC secret
    const signedHeaders = signWithHmac(request, config.hmac.secret, projectId);

    // 6. Forward to backend
    const upstream = await forwardRequest(request, route.target_url, remainingPath, signedHeaders);

    // 7. Return backend response
    const responseHeaders: Record<string, string> = {};
    upstream.headers.forEach((value, key) => {
      const hopByHop = ['transfer-encoding', 'connection', 'keep-alive', 'upgrade', 'proxy-authenticate'];
      if (!hopByHop.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // 8. Write log entry fire-and-forget (never blocks the response)
    writeLog({
      project_id: projectId,
      route_path: route.path,
      method: request.method,
      status_code: upstream.status,
      latency_ms: Date.now() - startMs,
      ip: request.ip,
    });

    return reply.code(upstream.status).headers(responseHeaders).send(upstream.body);
  }

  // /:projectId/some/path
  fastify.all('/:projectId/*', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const wildcardPath = (request.params as { '*': string })['*'];
    return handleProxy(request, reply, projectId, '/' + wildcardPath);
  });

  // /:projectId  (no trailing path — treat as /)
  fastify.all('/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    return handleProxy(request, reply, projectId, '/');
  });
};

export default proxyRoute;
