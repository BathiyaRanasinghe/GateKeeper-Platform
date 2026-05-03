import type { FastifyPluginAsync } from 'fastify';
import { extractConfig } from '../middleware/extract-config';
import { matchRoute } from '../middleware/match-route';
import { validateAuth } from '../middleware/auth-validator';
import { applyRateLimit } from '../middleware/rate-limiter';
import { signWithHmac } from '../middleware/hmac-signer';
import { forwardRequest } from '../proxy/forwarder';

const proxyRoute: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, _request, reply) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    const retryAfter = (error as { retryAfter?: number }).retryAfter;

    if (retryAfter) {
      reply.header('Retry-After', String(retryAfter));
    }

    reply.code(status).send({ error: error.message });
  });

  // Catch-all: /:projectId/*
  fastify.all('/:projectId/*', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const wildcardPath = (request.params as { '*': string })['*'];
    const remainingPath = '/' + wildcardPath;

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
      // Strip hop-by-hop headers
      const hopByHop = ['transfer-encoding', 'connection', 'keep-alive', 'upgrade', 'proxy-authenticate'];
      if (!hopByHop.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    return reply.code(upstream.status).headers(responseHeaders).send(upstream.body);
  });
};

export default proxyRoute;
