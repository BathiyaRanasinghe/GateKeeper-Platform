import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok' }));

// Catch all routes and methods — echo everything back
app.all('/*', async (request, reply) => {
  reply.send({
    method: request.method,
    path: request.url,
    headers: request.headers,
    body: request.body ?? null,
    timestamp: new Date().toISOString(),
  });
});

const port = Number(process.env.PORT ?? 4000);

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
