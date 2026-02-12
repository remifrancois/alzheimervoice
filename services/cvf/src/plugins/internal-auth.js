/**
 * Internal Service Authentication Plugin
 *
 * The CVF service is internal-only — called exclusively by the API gateway.
 * Validates requests using a shared service key (x-service-key header).
 * Forwards user context from the API gateway for audit logging.
 */

export default async function internalAuthPlugin(fastify) {
  const serviceKey = process.env.CVF_SERVICE_KEY;

  if (!serviceKey) {
    fastify.log.warn('CVF_SERVICE_KEY not set — running in open mode (dev only)');
  }

  fastify.decorateRequest('userContext', null);

  fastify.addHook('onRequest', async (request, reply) => {
    // Health check is always public
    if (request.url === '/health' || request.url === '/healthz') return;

    // Validate service key if set
    if (serviceKey) {
      const key = request.headers['x-service-key'];
      if (key !== serviceKey) {
        return reply.code(403).send({ error: 'Invalid service key' });
      }
    }

    // Forward user context from API gateway
    const userHeader = request.headers['x-user-context'];
    if (userHeader) {
      try {
        request.userContext = JSON.parse(userHeader);
      } catch {
        // Ignore malformed user context
      }
    }
  });
}
