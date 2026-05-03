import { createHmac } from 'crypto';
import type { FastifyRequest } from 'fastify';

export function signWithHmac(
  request: FastifyRequest,
  secret: string,
  projectId: string,
): Record<string, string> {
  const timestamp = Date.now().toString();
  const method = request.method.toUpperCase();
  const url = request.url;
  const payload = `${method}:${url}:${timestamp}`;

  const signature = createHmac('sha256', secret).update(payload).digest('hex');

  return {
    'X-GateKeeper-Signature': signature,
    'X-GateKeeper-Timestamp': timestamp,
    'X-GateKeeper-Project': projectId,
  };
}
