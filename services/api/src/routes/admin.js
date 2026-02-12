/**
 * Admin Routes — Enterprise Feature Stubs
 *
 * API Gateway handles admin routes directly (no CVF proxy needed).
 */

import { requireRole } from '@azh/shared-auth/rbac';

export default async function adminRoutes(app) {

  app.get('/api/admin/audit', {
    preHandler: [requireRole('superadmin', 'admin')],
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
    preHandler: [requireRole('superadmin')],
  }, async () => {
    return { organizations: [], total: 0, message: 'Organization management stub' };
  });

  app.get('/api/admin/security/sessions', {
    preHandler: [requireRole('superadmin')],
  }, async () => {
    return { activeSessions: [], loginHistory: [], securityScore: null, message: 'Security center stub' };
  });

  app.get('/api/admin/clinical/assignments', {
    preHandler: [requireRole('superadmin')],
  }, async () => {
    return { clinicians: [], assignments: [], qualityMetrics: null, message: 'Clinical governance stub' };
  });

  app.get('/api/admin/billing/revenue', {
    preHandler: [requireRole('superadmin')],
  }, async () => {
    return { mrr: 0, arr: 0, invoices: [], aiCosts: { daily: 0, monthly: 0, byOrg: [] }, message: 'Billing engine stub' };
  });

  app.get('/api/admin/incidents', {
    preHandler: [requireRole('superadmin', 'admin')],
  }, async () => {
    return { incidents: [], activeCount: 0, slaConfig: { red: '1h', orange: '4h', yellow: '24h', system: '30m' }, message: 'Incident management stub' };
  });

  app.get('/api/admin/compliance', {
    preHandler: [requireRole('superadmin', 'admin')],
  }, async () => {
    return { consents: [], agreements: [], gdprArticles: [], message: 'Compliance management stub' };
  });

  // Audit log endpoint used by frontend
  app.get('/api/admin/audit-logs', {
    preHandler: [requireRole('superadmin', 'admin')],
  }, async (request) => {
    return {
      entries: [],
      total: 0,
      limit: parseInt(request.query.limit || '100'),
      offset: parseInt(request.query.offset || '0'),
    };
  });
}
