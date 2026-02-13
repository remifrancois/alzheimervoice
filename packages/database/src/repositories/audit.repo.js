/**
 * Audit log repository — PostgreSQL implementation.
 * Append-only, immutable. HIPAA §164.312(b).
 *
 * Unlike other repos, audit_logs allow INSERT without org restriction
 * and SELECT is org-scoped. UPDATE/DELETE are revoked at the DB level.
 */

import { query, orgQuery } from '../connection.js';

/**
 * Write an audit log entry.
 * This bypasses org-scoping since audit entries are written for all requests.
 *
 * @param {object} entry - Audit log entry
 */
export async function writeAuditLog(entry) {
  await query(`
    INSERT INTO audit_logs (
      timestamp, method, url, status_code, duration_ms,
      ip_address, user_agent, user_id, user_role, org_id,
      patient_id, phi_access, category, severity, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  `, [
    entry.timestamp || new Date().toISOString(),
    entry.method,
    entry.url,
    entry.status_code,
    entry.duration_ms || null,
    entry.ip_address || null,
    entry.user_agent || null,
    entry.user_id || null,
    entry.user_role || null,
    entry.org_id || null,
    entry.patient_id || null,
    entry.phi_access || false,
    entry.category || null,
    entry.severity || 'info',
    JSON.stringify(entry.metadata || {}),
  ]);
}

/**
 * Query audit logs for an organization (paginated).
 *
 * @param {string} orgId
 * @param {object} options
 * @param {number} options.limit - Max rows (default 50)
 * @param {number} options.offset - Offset for pagination (default 0)
 * @param {string} options.from - ISO timestamp lower bound
 * @param {string} options.to - ISO timestamp upper bound
 * @param {string} options.userId - Filter by user
 * @param {string} options.patientId - Filter by patient
 * @param {string} options.category - Filter by category
 * @param {string} options.severity - Filter by severity
 * @returns {Promise<{logs: object[], total: number}>}
 */
export async function queryAuditLogs(orgId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    from,
    to,
    userId,
    patientId,
    category,
    severity,
  } = options;

  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (from) {
    conditions.push(`timestamp >= $${paramIdx++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`timestamp <= $${paramIdx++}`);
    params.push(to);
  }
  if (userId) {
    conditions.push(`user_id = $${paramIdx++}`);
    params.push(userId);
  }
  if (patientId) {
    conditions.push(`patient_id = $${paramIdx++}`);
    params.push(patientId);
  }
  if (category) {
    conditions.push(`category = $${paramIdx++}`);
    params.push(category);
  }
  if (severity) {
    conditions.push(`severity = $${paramIdx++}`);
    params.push(severity);
  }

  const whereClause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';

  // Count total matching rows
  const countResult = await orgQuery(orgId,
    `SELECT COUNT(*)::int AS total FROM audit_logs WHERE 1=1 ${whereClause}`,
    params
  );

  // Fetch page
  const logsResult = await orgQuery(orgId,
    `SELECT * FROM audit_logs WHERE 1=1 ${whereClause}
     ORDER BY timestamp DESC
     LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, limit, offset]
  );

  return {
    logs: logsResult.rows.map(rowToAuditLog),
    total: countResult.rows[0].total,
  };
}

/**
 * Get PHI access audit trail for a specific patient.
 */
export async function getPhiAccessTrail(orgId, patientId, limit = 100) {
  const { rows } = await orgQuery(orgId, `
    SELECT * FROM audit_logs
    WHERE patient_id = $1 AND phi_access = TRUE
    ORDER BY timestamp DESC
    LIMIT $2
  `, [patientId, limit]);

  return rows.map(rowToAuditLog);
}

/**
 * Get recent audit activity summary for an org.
 */
export async function getAuditSummary(orgId, hours = 24) {
  const { rows } = await orgQuery(orgId, `
    SELECT
      category,
      severity,
      COUNT(*)::int AS count
    FROM audit_logs
    WHERE timestamp > now() - $1::interval
    GROUP BY category, severity
    ORDER BY count DESC
  `, [`${hours} hours`]);

  return rows;
}

// -- Internal helpers --

function rowToAuditLog(row) {
  return {
    id: row.id,
    timestamp: row.timestamp?.toISOString?.() ?? row.timestamp,
    method: row.method,
    url: row.url,
    status_code: row.status_code,
    duration_ms: row.duration_ms,
    ip_address: row.ip_address,
    user_agent: row.user_agent,
    user_id: row.user_id,
    user_role: row.user_role,
    org_id: row.org_id,
    patient_id: row.patient_id,
    phi_access: row.phi_access,
    category: row.category,
    severity: row.severity,
    metadata: row.metadata || {},
  };
}
