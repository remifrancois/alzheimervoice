/**
 * Baseline repository — PostgreSQL implementation.
 * Replaces file-based baseline storage in @azh/shared-models/cvf.
 * Supports V1/V3/V4 baselines via version discriminator.
 */

import { orgQuery } from '../connection.js';

/**
 * Create a new baseline object (in-memory).
 */
export function createBaseline(patientId, version = 'v1') {
  return {
    patient_id: patientId,
    version,
    complete: false,
    sessions_used: 0,
    vector: {},
    high_variance: [],
    needs_extension: false,
    personality_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Save (upsert) a baseline.
 * @param {string} orgId - Organization UUID
 * @param {object} baseline - Baseline object
 * @returns {Promise<object>}
 */
export async function saveBaseline(orgId, baseline) {
  const version = baseline.version || 'v1';

  // Map from the file-based format to DB columns
  const complete = baseline.complete ?? baseline.calibration_complete ?? false;
  const sessionsUsed = baseline.sessions_used ?? 0;

  // The baseline_vector from the file format maps to vector
  const vector = baseline.vector ?? baseline.baseline_vector ?? {};

  const { rows } = await orgQuery(orgId, `
    INSERT INTO baselines (
      patient_id, org_id, version, complete, sessions_used,
      vector, high_variance, needs_extension, personality_notes, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (patient_id, version) DO UPDATE SET
      complete = EXCLUDED.complete,
      sessions_used = EXCLUDED.sessions_used,
      vector = EXCLUDED.vector,
      high_variance = EXCLUDED.high_variance,
      needs_extension = EXCLUDED.needs_extension,
      personality_notes = EXCLUDED.personality_notes
    RETURNING *
  `, [
    baseline.patient_id,
    orgId,
    version,
    complete,
    sessionsUsed,
    JSON.stringify(vector),
    baseline.high_variance || [],
    baseline.needs_extension || false,
    baseline.personality_notes || '',
    baseline.created_at || new Date().toISOString(),
  ]);

  return rowToBaseline(rows[0]);
}

/**
 * Load a baseline by patient and version.
 * @param {string} orgId
 * @param {string} patientId
 * @param {string} version - 'v1', 'v3', or 'v4'
 * @returns {Promise<object|null>}
 */
export async function loadBaseline(orgId, patientId, version = 'v1') {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM baselines WHERE patient_id = $1 AND version = $2',
    [patientId, version]
  );
  return rows.length ? rowToBaseline(rows[0]) : null;
}

/**
 * Load V3 baseline (convenience alias).
 */
export async function loadV3Baseline(orgId, patientId) {
  return loadBaseline(orgId, patientId, 'v3');
}

/**
 * Save V3 baseline (convenience alias).
 */
export async function saveV3Baseline(orgId, patientId, baselineData) {
  return saveBaseline(orgId, {
    patient_id: patientId,
    version: 'v3',
    ...baselineData,
  });
}

/**
 * Delete all baselines for a patient.
 * @param {string} orgId
 * @param {string} patientId
 * @returns {Promise<number>}
 */
export async function deletePatientBaselines(orgId, patientId) {
  const { rowCount } = await orgQuery(orgId,
    'DELETE FROM baselines WHERE patient_id = $1',
    [patientId]
  );
  return rowCount;
}

/**
 * Load all baselines for a patient (all versions).
 */
export async function loadPatientBaselines(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM baselines WHERE patient_id = $1 ORDER BY version',
    [patientId]
  );
  return rows.map(rowToBaseline);
}

// -- Internal helpers --

function rowToBaseline(row) {
  return {
    id: row.id,
    patient_id: row.patient_id,
    version: row.version,
    complete: row.complete,
    // Compat: file-based code uses calibration_complete
    calibration_complete: row.complete,
    sessions_used: row.sessions_used,
    vector: row.vector || {},
    // Compat: file-based code uses baseline_vector
    baseline_vector: row.vector || {},
    high_variance: row.high_variance || [],
    needs_extension: row.needs_extension,
    personality_notes: row.personality_notes || '',
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
    updated_at: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}
