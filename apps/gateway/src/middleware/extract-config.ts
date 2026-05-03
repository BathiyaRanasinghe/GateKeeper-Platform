import type { FastifyInstance } from 'fastify';
import type { GatewayConfig } from '@gatekeeper/types';
import { getConfig } from '../cache/config-cache';

export async function extractConfig(
  fastify: FastifyInstance,
  projectId: string,
): Promise<GatewayConfig | null> {
  return getConfig(fastify.redis, projectId);
}
