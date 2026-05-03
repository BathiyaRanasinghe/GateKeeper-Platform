import Fastify from 'fastify';
import redisPlugin from './plugins/redis';
import proxyRoute from './routes/proxy';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  await app.register(redisPlugin);
  await app.register(proxyRoute);

  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    redis: app.redis ? 'connected' : 'disconnected',
  }));

  return app;
}
