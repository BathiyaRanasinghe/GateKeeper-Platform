import type { FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import type { Route } from '@gatekeeper/types';

export async function applyRateLimit(
  redis: Redis,
  request: FastifyRequest,
  projectId: string,
  route: Route,
  identifier: string | null,
): Promise<{ limit: number; remaining: number; reset: number }> {
  if (!route.rate_limit) {
    return { limit: -1, remaining: -1, reset: -1 };
  }

  const { requests, window_seconds, scope } = route.rate_limit;
  const id = scope === 'per_user' && identifier ? identifier : 'global';
  const key = `rate_limit:${projectId}:${id}:${route.path}`;
  const now = Date.now();
  const windowStart = now - window_seconds * 1000;
  const resetAt = now + window_seconds * 1000;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, '-inf', windowStart);
  pipeline.zadd(key, now.toString(), `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, window_seconds + 1);
  const results = await pipeline.exec();

  if (!results) {
    return { limit: requests, remaining: 0, reset: resetAt };
  }

  const count = results[2][1] as number;
  const remaining = Math.max(0, requests - count);

  if (count > requests) {
    const err = new Error('Rate limit exceeded') as Error & {
      statusCode: number;
      retryAfter: number;
    };
    err.statusCode = 429;
    err.retryAfter = Math.ceil(window_seconds);
    throw err;
  }

  return { limit: requests, remaining, reset: resetAt };
}
