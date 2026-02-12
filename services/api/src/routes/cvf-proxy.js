/**
 * CVF Proxy Routes — API Gateway → CVF Engine
 *
 * Forwards all CVF-related requests to the internal CVF service.
 * Maintains existing /api/* URL patterns for frontend compatibility.
 * Adds x-service-key and x-user-context headers for service-to-service auth.
 */

import { cvfClient } from '../lib/cvf-client.js';
import { requireRole, requirePatientAccess } from '@azh/shared-auth/rbac';

export default async function cvfProxyRoutes(app) {

  // ── V1 Routes ──

  app.post('/api/cvf/process', {
    preHandler: [requireRole('clinician')],
  }, async (request, reply) => {
    const { patientIds } = request.user;
    if (patientIds && !patientIds.includes(request.body.patientId)) {
      return reply.code(403).send({ error: 'Access denied for this patient' });
    }
    return cvfClient.post('/cvf/v1/process', { body: request.body, userContext: request.user });
  });

  app.get('/api/cvf/timeline/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v1/timeline/${request.params.patientId}`, { userContext: request.user });
  });

  app.post('/api/cvf/weekly-analysis', {
    preHandler: [requireRole('clinician')],
  }, async (request, reply) => {
    const { patientIds } = request.user;
    if (patientIds && !patientIds.includes(request.body.patientId)) {
      return reply.code(403).send({ error: 'Access denied for this patient' });
    }
    return cvfClient.post('/cvf/v1/weekly-analysis', { body: request.body, userContext: request.user });
  });

  app.get('/api/cvf/weekly-report/:patientId/:weekNumber', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v1/weekly-report/${request.params.patientId}/${request.params.weekNumber}`, { userContext: request.user });
  });

  // ── V2 Routes ──

  app.post('/api/v2/deep-analysis/:patientId', {
    preHandler: [requireRole('clinician'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.post(`/cvf/v2/deep-analysis/${request.params.patientId}`, { body: request.body, userContext: request.user });
  });

  app.get('/api/v2/deep-analysis/:patientId/:weekNumber', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v2/deep-analysis/${request.params.patientId}/${request.params.weekNumber}`, { userContext: request.user });
  });

  app.get('/api/v2/deep-analysis/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v2/deep-analysis/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v2/differential/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v2/differential/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v2/semantic-map/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v2/semantic-map/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v2/twin/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    const query = request.query.week ? `week=${request.query.week}` : '';
    return cvfClient.get(`/cvf/v2/twin/${request.params.patientId}`, { userContext: request.user, query });
  });

  app.get('/api/v2/cohort-match/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v2/cohort-match/${request.params.patientId}`, { userContext: request.user });
  });

  app.post('/api/v2/cohort/generate', {
    preHandler: [requireRole('clinician', 'superadmin')],
  }, async (request) => {
    return cvfClient.post('/cvf/v2/cohort/generate', { userContext: request.user });
  });

  app.get('/api/v2/library/status', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: 'Authentication required' });
    return cvfClient.get('/cvf/v2/library/status', { userContext: request.user });
  });

  app.get('/api/v2/cost-estimate/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v2/cost-estimate/${request.params.patientId}`, { userContext: request.user });
  });

  // ── V3 Routes ──

  app.post('/api/v3/process', {
    preHandler: [requireRole('clinician')],
  }, async (request, reply) => {
    const { patientIds } = request.user;
    if (patientIds && !patientIds.includes(request.body.patientId)) {
      return reply.code(403).send({ error: 'Access denied for this patient' });
    }
    return cvfClient.post('/cvf/v3/process', { body: request.body, userContext: request.user });
  });

  app.post('/api/v3/weekly', {
    preHandler: [requireRole('clinician')],
  }, async (request, reply) => {
    const { patientIds } = request.user;
    if (patientIds && !patientIds.includes(request.body.patientId)) {
      return reply.code(403).send({ error: 'Access denied for this patient' });
    }
    return cvfClient.post('/cvf/v3/weekly', { body: request.body, userContext: request.user });
  });

  app.get('/api/v3/drift/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/drift/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v3/timeline/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/timeline/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v3/differential/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/differential/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v3/trajectory/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/trajectory/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v3/report/:patientId/:weekNumber', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/report/${request.params.patientId}/${request.params.weekNumber}`, { userContext: request.user });
  });

  app.get('/api/v3/reports/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/reports/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v3/indicators', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: 'Authentication required' });
    return cvfClient.get('/cvf/v3/indicators', { userContext: request.user });
  });

  app.get('/api/v3/baseline/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return cvfClient.get(`/cvf/v3/baseline/${request.params.patientId}`, { userContext: request.user });
  });

  app.get('/api/v3/meta', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: 'Authentication required' });
    return cvfClient.get('/cvf/v3/meta', { userContext: request.user });
  });
}
