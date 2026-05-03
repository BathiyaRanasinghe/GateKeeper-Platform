import { fetch, Headers } from 'undici';
import type { FastifyRequest } from 'fastify';

export async function forwardRequest(
  request: FastifyRequest,
  targetBase: string,
  remainingPath: string,
  extraHeaders: Record<string, string>,
): Promise<{ status: number; headers: Headers; body: Buffer }> {
  const targetUrl = targetBase.replace(/\/$/, '') + remainingPath;

  // Forward original headers, excluding host
  const forwardHeaders = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (key.toLowerCase() === 'host') continue;
    if (typeof value === 'string') {
      forwardHeaders.set(key, value);
    } else if (Array.isArray(value)) {
      forwardHeaders.set(key, value.join(', '));
    }
  }

  for (const [key, value] of Object.entries(extraHeaders)) {
    forwardHeaders.set(key, value);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body: ['GET', 'HEAD'].includes(request.method.toUpperCase())
      ? undefined
      : (request.body as BodyInit | undefined),
    // @ts-ignore — undici supports this
    duplex: 'half',
  });

  const body = Buffer.from(await response.arrayBuffer());

  return {
    status: response.status,
    headers: response.headers as Headers,
    body,
  };
}
