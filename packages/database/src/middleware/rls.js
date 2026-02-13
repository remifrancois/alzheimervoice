/**
 * Fastify hook: sets the RLS org scope on each request.
 *
 * Must run after the auth plugin has populated request.user.
 * Sets `app.current_org_id` in the database connection so that
 * Row-Level Security policies filter by the authenticated user's org.
 *
 * Usage in Fastify:
 *   import rlsPlugin from '@azh/database/middleware/rls';
 *   fastify.register(rlsPlugin);
 */

export default async function rlsPlugin(fastify) {
  fastify.decorateRequest('orgId', null);

  fastify.addHook('onRequest', async (request) => {
    // Skip for unauthenticated routes
    if (!request.user) return;

    // The org_id comes from the authenticated user's profile
    const orgId = request.user.org_id || request.user.orgId;
    if (orgId) {
      request.orgId = orgId;
    }
  });
}
