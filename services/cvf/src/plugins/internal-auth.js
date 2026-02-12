/**
 * Internal Service Authentication Plugin
 *
 * The CVF service is internal-only — called exclusively by the API gateway.
 * Validates requests using a shared service key (x-service-key header).
 * Forwards user context from the API gateway for audit logging.
 *
 * Security hardening:
 * - Fail-fast if CVF_SERVICE_KEY missing in production
 * - Time-constant key comparison (prevents timing attacks)
 * - Failed auth attempt logging
 * - User context size limit
 */

import crypto from 'crypto';

const MAX_USER_CONTEXT_LENGTH = 4096;

export default async function internalAuthPlugin(fastify) {
  const serviceKey = process.env.CVF_SERVICE_KEY;
  const isProd = process.env.NODE_ENV === 'production';

  if (!serviceKey) {
    if (isProd) {
      throw new Error('CVF_SERVICE_KEY is required in production. Set the environment variable before starting.');
    }
    fastify.log.warn('CVF_SERVICE_KEY not set — running in open mode (dev only)');
  }

  if (serviceKey && serviceKey.length < 32) {
    throw new Error('CVF_SERVICE_KEY must be at least 32 characters for adequate security.');
  }

  const serviceKeyBuffer = serviceKey ? Buffer.from(serviceKey) : null;

  fastify.decorateRequest('userContext', null);

  fastify.addHook('onRequest', async (request, reply) => {
    // Health check is always public
    if (request.url === '/health' || request.url === '/healthz') return;

    // Validate service key if set
    if (serviceKeyBuffer) {
      const key = request.headers['x-service-key'];
      if (!key) {
        fastify.log.warn({ ip: request.ip, url: request.url }, 'Auth: missing service key');
        return reply.code(401).send({ error: 'Missing service key' });
      }

      const keyBuffer = Buffer.from(String(key));

      // Time-constant comparison to prevent timing attacks
      if (keyBuffer.length !== serviceKeyBuffer.length ||
          !crypto.timingSafeEqual(keyBuffer, serviceKeyBuffer)) {
        fastify.log.warn({ ip: request.ip, url: request.url }, 'Auth: invalid service key');
        return reply.code(403).send({ error: 'Invalid service key' });
      }
    }

    // Forward user context from API gateway (with size limit)
    const userHeader = request.headers['x-user-context'];
    if (userHeader && userHeader.length <= MAX_USER_CONTEXT_LENGTH) {
      try {
        request.userContext = JSON.parse(userHeader);
      } catch {
        // Ignore malformed user context
      }
    }
  });
}
