import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';

export default fp(async (fastify) => {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is required');

  await fastify.register(fastifyRedis, { url });

  fastify.log.info('Redis connected');
});
