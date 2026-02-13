/**
 * Organization repository — PostgreSQL implementation.
 */

import { query, orgQuery } from '../connection.js';

/**
 * Create an organization.
 * Uses direct query (not org-scoped) since the org doesn't exist yet.
 */
export async function createOrganization({ name, type = 'clinic', parentOrgId = null, region = 'eu-west-1', seats = 5 }) {
  const { rows } = await query(`
    INSERT INTO organizations (name, type, parent_org_id, region, seats)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [name, type, parentOrgId, region, seats]);

  return rowToOrg(rows[0]);
}

/**
 * Load an organization by ID.
 */
export async function loadOrganization(orgId) {
  const { rows } = await query(
    'SELECT * FROM organizations WHERE id = $1',
    [orgId]
  );
  return rows.length ? rowToOrg(rows[0]) : null;
}

/**
 * Update organization settings.
 */
export async function updateOrganization(orgId, updates) {
  const setClauses = [];
  const params = [orgId];
  let idx = 2;

  if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); params.push(updates.name); }
  if (updates.type !== undefined) { setClauses.push(`type = $${idx++}`); params.push(updates.type); }
  if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); params.push(updates.status); }
  if (updates.seats !== undefined) { setClauses.push(`seats = $${idx++}`); params.push(updates.seats); }
  if (updates.mrr_cents !== undefined) { setClauses.push(`mrr_cents = $${idx++}`); params.push(updates.mrr_cents); }
  if (updates.settings !== undefined) { setClauses.push(`settings = $${idx++}`); params.push(JSON.stringify(updates.settings)); }

  if (setClauses.length === 0) return loadOrganization(orgId);

  const { rows } = await query(
    `UPDATE organizations SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    params
  );
  return rows.length ? rowToOrg(rows[0]) : null;
}

/**
 * List all organizations (admin only, no RLS scope).
 */
export async function listOrganizations() {
  const { rows } = await query(
    'SELECT * FROM organizations ORDER BY created_at DESC'
  );
  return rows.map(rowToOrg);
}

function rowToOrg(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    parent_org_id: row.parent_org_id,
    status: row.status,
    region: row.region,
    seats: row.seats,
    mrr_cents: row.mrr_cents,
    settings: row.settings || {},
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
    updated_at: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}
