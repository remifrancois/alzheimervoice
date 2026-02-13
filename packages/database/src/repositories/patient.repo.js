/**
 * Patient repository — PostgreSQL implementation.
 * Same interface as @azh/shared-models/patient (file-based).
 */

import { query, orgQuery, withOrgScope } from '../connection.js';

/**
 * Create a new patient object (in-memory only, call savePatient to persist).
 */
export function createPatient({ firstName, language = 'fr', phoneNumber = null, callTime = '09:00', timezone = 'Europe/Paris' }) {
  return {
    patient_id: crypto.randomUUID(),
    first_name: firstName,
    language,
    phone_number: phoneNumber,
    call_schedule: { time: callTime, timezone },
    created_at: new Date().toISOString(),
    baseline_established: false,
    baseline_sessions: 0,
    alert_level: 'green',
    confounders: {},
    personality_notes: '',
  };
}

/**
 * Save (upsert) a patient record.
 * @param {string} orgId - Organization UUID
 * @param {object} patient - Patient object
 * @returns {Promise<object>} The saved patient
 */
export async function savePatient(orgId, patient) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO patients (
      patient_id, org_id, first_name, language, phone_number,
      call_schedule, baseline_established, baseline_sessions,
      alert_level, confounders, personality_notes, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (patient_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      language = EXCLUDED.language,
      phone_number = EXCLUDED.phone_number,
      call_schedule = EXCLUDED.call_schedule,
      baseline_established = EXCLUDED.baseline_established,
      baseline_sessions = EXCLUDED.baseline_sessions,
      alert_level = EXCLUDED.alert_level,
      confounders = EXCLUDED.confounders,
      personality_notes = EXCLUDED.personality_notes
    RETURNING *
  `, [
    patient.patient_id,
    orgId,
    patient.first_name,
    patient.language,
    patient.phone_number,
    JSON.stringify(patient.call_schedule),
    patient.baseline_established,
    patient.baseline_sessions,
    patient.alert_level,
    JSON.stringify(patient.confounders),
    patient.personality_notes,
    patient.created_at,
  ]);

  return rowToPatient(rows[0]);
}

/**
 * Load a single patient by ID.
 * @param {string} orgId - Organization UUID
 * @param {string} patientId - Patient UUID
 * @returns {Promise<object|null>}
 */
export async function loadPatient(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM patients WHERE patient_id = $1',
    [patientId]
  );
  return rows.length ? rowToPatient(rows[0]) : null;
}

/**
 * List all patients in an organization.
 * @param {string} orgId - Organization UUID
 * @returns {Promise<object[]>}
 */
export async function listPatients(orgId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM patients ORDER BY created_at DESC'
  );
  return rows.map(rowToPatient);
}

/**
 * Delete a patient and all related data (CASCADE).
 * @param {string} orgId - Organization UUID
 * @param {string} patientId - Patient UUID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deletePatient(orgId, patientId) {
  const { rowCount } = await orgQuery(orgId,
    'DELETE FROM patients WHERE patient_id = $1',
    [patientId]
  );
  return rowCount > 0;
}

/**
 * List patients accessible by a specific user.
 * @param {string} orgId - Organization UUID
 * @param {string} userId - User ID
 * @returns {Promise<object[]>}
 */
export async function listPatientsForUser(orgId, userId) {
  const { rows } = await orgQuery(orgId, `
    SELECT p.* FROM patients p
    INNER JOIN user_patient_access upa ON upa.patient_id = p.patient_id
    WHERE upa.user_id = $1
    ORDER BY p.created_at DESC
  `, [userId]);
  return rows.map(rowToPatient);
}

/**
 * Grant a user access to a patient.
 * @param {string} orgId - Organization UUID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient UUID
 * @param {string} [grantedBy] - User ID who granted access
 */
export async function grantPatientAccess(orgId, userId, patientId, grantedBy = null) {
  await orgQuery(orgId, `
    INSERT INTO user_patient_access (user_id, patient_id, granted_by)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, patient_id) DO NOTHING
  `, [userId, patientId, grantedBy]);
}

/**
 * Revoke a user's access to a patient.
 */
export async function revokePatientAccess(orgId, userId, patientId) {
  await orgQuery(orgId,
    'DELETE FROM user_patient_access WHERE user_id = $1 AND patient_id = $2',
    [userId, patientId]
  );
}

/**
 * Get all patient IDs a user has access to.
 * @param {string} orgId - Organization UUID
 * @param {string} userId - User ID
 * @returns {Promise<string[]>}
 */
export async function getUserPatientIds(orgId, userId) {
  const { rows } = await orgQuery(orgId,
    'SELECT patient_id FROM user_patient_access WHERE user_id = $1',
    [userId]
  );
  return rows.map(r => r.patient_id);
}

/**
 * Check if a user has access to a specific patient.
 */
export async function canUserAccessPatient(orgId, userId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT 1 FROM user_patient_access WHERE user_id = $1 AND patient_id = $2',
    [userId, patientId]
  );
  return rows.length > 0;
}

// -- Internal helpers --

function rowToPatient(row) {
  return {
    patient_id: row.patient_id,
    first_name: row.first_name,
    language: row.language,
    phone_number: row.phone_number,
    call_schedule: row.call_schedule,
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
    updated_at: row.updated_at?.toISOString?.() ?? row.updated_at,
    baseline_established: row.baseline_established,
    baseline_sessions: row.baseline_sessions,
    alert_level: row.alert_level,
    confounders: row.confounders || {},
    personality_notes: row.personality_notes || '',
  };
}
