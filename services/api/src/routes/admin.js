/**
 * Admin Routes — Enterprise Feature Stubs
 *
 * API Gateway handles admin routes directly (no CVF proxy needed).
 */

import { requireRole } from '@azh/shared-auth/rbac';

export default async function adminRoutes(app) {

  app.get('/api/admin/audit', {
    preHandler: [requireRole('admin')],
  }, async (request) => {
    return {
      entries: [],
      total: 0,
      page: parseInt(request.query.page || '1'),
      pageSize: 50,
      filters: { actor: null, action: null, severity: null },
      message: 'Audit trail stub — connect to immutable log store in production',
    };
  });

  app.get('/api/admin/organizations', {
    preHandler: [requireRole('admin')],
  }, async () => {
    return { organizations: [], total: 0, message: 'Organization management stub' };
  });

  app.get('/api/admin/security/sessions', {
    preHandler: [requireRole('admin')],
  }, async () => {
    return { activeSessions: [], loginHistory: [], securityScore: null, message: 'Security center stub' };
  });

  app.get('/api/admin/clinical/assignments', {
    preHandler: [requireRole('admin')],
  }, async () => {
    return { clinicians: [], assignments: [], qualityMetrics: null, message: 'Clinical governance stub' };
  });

  app.get('/api/admin/billing/revenue', {
    preHandler: [requireRole('admin')],
  }, async () => {
    return { mrr: 0, arr: 0, invoices: [], aiCosts: { daily: 0, monthly: 0, byOrg: [] }, message: 'Billing engine stub' };
  });

  app.get('/api/admin/incidents', {
    preHandler: [requireRole('admin')],
  }, async () => {
    return { incidents: [], activeCount: 0, slaConfig: { red: '1h', orange: '4h', yellow: '24h', system: '30m' }, message: 'Incident management stub' };
  });

  app.get('/api/admin/compliance', {
    preHandler: [requireRole('admin')],
  }, async () => {
    return { consents: [], agreements: [], gdprArticles: [], message: 'Compliance management stub' };
  });

}
