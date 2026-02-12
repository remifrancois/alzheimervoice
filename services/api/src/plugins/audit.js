/**
 * Audit Logging Plugin.
 *
 * HIPAA §164.312(b) — Audit Controls
 *
 * Logs every API request to data/audit/audit.log as newline-delimited JSON.
 * Includes: timestamp, user, role, method, url, status, duration, patientId.
 */

import fs from 'fs/promises';
import path from 'path';

const AUDIT_DIR = path.resolve('data/audit');
const AUDIT_FILE = path.join(AUDIT_DIR, 'audit.log');

// Extract patientId from common URL patterns
function extractPatientId(url) {
  const m = url.match(/\/(?:patients|memories|cvf\/timeline|cvf\/weekly-report|gdpr\/(?:export|erase)|v2\/[^/]+)\/([0-9a-f-]+)/);
  return m ? m[1] : null;
}

export default async function auditPlugin(fastify) {
  await fs.mkdir(AUDIT_DIR, { recursive: true });

  fastify.addHook('onResponse', async (request, reply) => {
    const patientId = extractPatientId(request.url);
    const entry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status: reply.statusCode,
      user: request.user?.sub || 'anonymous',
      role: request.user?.role || 'none',
      ip: request.ip,
      duration_ms: Math.round(reply.elapsedTime || 0),
    };
    if (patientId) {
      entry.patientId = patientId;
      entry.phiAccess = true;
    }

    // Append as newline-delimited JSON (non-blocking, best-effort)
    fs.appendFile(AUDIT_FILE, JSON.stringify(entry) + '\n').catch(() => {});
  });

  // Admin route: read audit logs (superadmin only)
  fastify.get('/api/admin/audit-logs', async (request, reply) => {
    if (!request.user || request.user.role !== 'superadmin') {
      return reply.code(403).send({ error: 'Superadmin access required' });
    }

    const limit = Math.min(parseInt(request.query.limit) || 100, 1000);
    const offset = parseInt(request.query.offset) || 0;

    try {
      const raw = await fs.readFile(AUDIT_FILE, 'utf-8');
      const lines = raw.trim().split('\n').filter(Boolean);
      const total = lines.length;
      const entries = lines
        .slice(Math.max(0, total - offset - limit), total - offset)
        .reverse()
        .map(line => JSON.parse(line));

      return { total, offset, limit, entries };
    } catch {
      return { total: 0, offset, limit, entries: [] };
    }
  });
}
