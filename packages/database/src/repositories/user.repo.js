/**
 * User repository — PostgreSQL implementation.
 * Replaces file-based users.json storage in @azh/shared-models/users.
 */

import { query, orgQuery, withOrgScope } from '../connection.js';

/**
 * Save (upsert) a user.
 * @param {string} orgId - Organization UUID
 * @param {object} user - User object
 * @returns {Promise<object>}
 */
export async function saveUser(orgId, user) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO users (
      id, cognito_sub, org_id, name, email, role, plan, avatar, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      cognito_sub = COALESCE(EXCLUDED.cognito_sub, users.cognito_sub),
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      plan = EXCLUDED.plan,
      avatar = EXCLUDED.avatar,
      status = EXCLUDED.status
    RETURNING *
  `, [
    user.id,
    user.cognito_sub || user.cognitoSub || null,
    orgId,
    user.name,
    user.email,
    mapRole(user.role),
    mapPlan(user.plan),
    user.avatar || '',
    user.status || 'active',
    user.created_at || new Date().toISOString(),
  ]);

  return rowToUser(rows[0]);
}

/**
 * Find a user by ID.
 * Note: Does not require orgId since user IDs are globally unique.
 */
export async function findUser(userId) {
  const { rows } = await query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return rows.length ? rowToUser(rows[0]) : null;
}

/**
 * Find a user by email.
 */
export async function findUserByEmail(email) {
  const { rows } = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows.length ? rowToUser(rows[0]) : null;
}

/**
 * Find a user by Cognito sub.
 */
export async function findUserByCognitoSub(cognitoSub) {
  const { rows } = await query(
    'SELECT * FROM users WHERE cognito_sub = $1',
    [cognitoSub]
  );
  return rows.length ? rowToUser(rows[0]) : null;
}

/**
 * Load all users in an organization.
 * @param {string} orgId
 * @returns {Promise<object[]>}
 */
export async function loadUsers(orgId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM users ORDER BY created_at ASC'
  );
  return rows.map(rowToUser);
}

/**
 * Update last login timestamp.
 */
export async function updateLastLogin(userId) {
  await query(
    'UPDATE users SET last_login_at = now() WHERE id = $1',
    [userId]
  );
}

/**
 * Delete a user.
 */
export async function deleteUser(orgId, userId) {
  const { rowCount } = await orgQuery(orgId,
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
  return rowCount > 0;
}

/**
 * Get user with their patient access list.
 * Returns user object with patientIds array.
 */
export async function findUserWithAccess(userId) {
  const user = await findUser(userId);
  if (!user) return null;

  const { rows } = await query(
    'SELECT patient_id FROM user_patient_access WHERE user_id = $1',
    [userId]
  );

  return {
    ...user,
    patientIds: rows.map(r => r.patient_id),
  };
}

// -- Clinician credentials --

/**
 * Save clinician credentials.
 */
export async function saveClinicianCredentials(orgId, userId, credentials) {
  await orgQuery(orgId, `
    INSERT INTO clinician_credentials (
      user_id, specialty, license_number, license_expiry,
      credential_verified, verified_by, verified_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id) DO UPDATE SET
      specialty = EXCLUDED.specialty,
      license_number = EXCLUDED.license_number,
      license_expiry = EXCLUDED.license_expiry,
      credential_verified = EXCLUDED.credential_verified,
      verified_by = EXCLUDED.verified_by,
      verified_at = EXCLUDED.verified_at
  `, [
    userId,
    credentials.specialty,
    credentials.license_number,
    credentials.license_expiry,
    credentials.credential_verified || false,
    credentials.verified_by || null,
    credentials.verified_at || null,
  ]);
}

// -- Internal helpers --

/**
 * Map file-based roles to DB enum.
 * 'superadmin' is not in the DB enum — map to 'admin'.
 */
function mapRole(role) {
  if (role === 'superadmin') return 'admin';
  if (['admin', 'clinician', 'family'].includes(role)) return role;
  return 'family';
}

/**
 * Map file-based plans to DB enum.
 * 'admin' plan from file-based → 'enterprise' in DB.
 */
function mapPlan(plan) {
  if (plan === 'admin') return 'enterprise';
  if (['free', 'pro', 'clinical', 'enterprise'].includes(plan)) return plan;
  return 'free';
}

function rowToUser(row) {
  return {
    id: row.id,
    cognito_sub: row.cognito_sub,
    org_id: row.org_id,
    name: row.name,
    email: row.email,
    role: row.role,
    plan: row.plan,
    avatar: row.avatar || '',
    status: row.status,
    last_login_at: row.last_login_at?.toISOString?.() ?? row.last_login_at,
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
    updated_at: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}
