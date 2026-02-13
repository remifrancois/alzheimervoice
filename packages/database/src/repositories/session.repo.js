/**
 * Session repository — PostgreSQL implementation.
 * Same interface as @azh/shared-models/session (file-based).
 */

import { orgQuery } from '../connection.js';

/**
 * Create a new session object (in-memory only, call saveSession to persist).
 */
export function createSession({ patientId, language = 'fr', transcript = [], durationSeconds = 0, confounders = {} }) {
  return {
    session_id: crypto.randomUUID(),
    patient_id: patientId,
    language,
    timestamp: new Date().toISOString(),
    duration_seconds: durationSeconds,
    transcript,
    confounders,
    feature_vector: null,
    extracted_at: null,
  };
}

/**
 * Save (upsert) a session record.
 * @param {string} orgId - Organization UUID
 * @param {object} session - Session object
 * @returns {Promise<object>}
 */
export async function saveSession(orgId, session) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO sessions (
      session_id, patient_id, org_id, language, timestamp,
      duration_seconds, transcript, confounders, feature_vector,
      extracted_at, extraction_model, v3, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (session_id) DO UPDATE SET
      language = EXCLUDED.language,
      duration_seconds = EXCLUDED.duration_seconds,
      transcript = EXCLUDED.transcript,
      confounders = EXCLUDED.confounders,
      feature_vector = EXCLUDED.feature_vector,
      extracted_at = EXCLUDED.extracted_at,
      extraction_model = EXCLUDED.extraction_model,
      v3 = EXCLUDED.v3
    RETURNING *
  `, [
    session.session_id,
    session.patient_id,
    orgId,
    session.language,
    session.timestamp,
    session.duration_seconds,
    JSON.stringify(session.transcript),
    JSON.stringify(session.confounders),
    session.feature_vector ? JSON.stringify(session.feature_vector) : null,
    session.extracted_at,
    session.extraction_model || null,
    session.v3 || false,
    session.created_at || session.timestamp,
  ]);

  return rowToSession(rows[0]);
}

/**
 * Load a single session by ID.
 * @param {string} orgId - Organization UUID
 * @param {string} sessionId - Session UUID
 * @returns {Promise<object|null>}
 */
export async function loadSession(orgId, sessionId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM sessions WHERE session_id = $1',
    [sessionId]
  );
  return rows.length ? rowToSession(rows[0]) : null;
}

/**
 * Load all sessions for a patient, sorted by timestamp (newest first).
 * @param {string} orgId - Organization UUID
 * @param {string} patientId - Patient UUID
 * @returns {Promise<object[]>}
 */
export async function loadPatientSessions(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM sessions WHERE patient_id = $1 ORDER BY timestamp ASC',
    [patientId]
  );
  return rows.map(rowToSession);
}

/**
 * Delete all sessions for a patient.
 * @param {string} orgId - Organization UUID
 * @param {string} patientId - Patient UUID
 * @returns {Promise<number>} Number of sessions deleted
 */
export async function deletePatientSessions(orgId, patientId) {
  const { rowCount } = await orgQuery(orgId,
    'DELETE FROM sessions WHERE patient_id = $1',
    [patientId]
  );
  return rowCount;
}

/**
 * Count sessions for a patient.
 */
export async function countPatientSessions(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT COUNT(*)::int AS count FROM sessions WHERE patient_id = $1',
    [patientId]
  );
  return rows[0].count;
}

/**
 * Load sessions for a patient within a date range.
 * @param {string} orgId
 * @param {string} patientId
 * @param {string} from - ISO8601 start date
 * @param {string} to - ISO8601 end date
 * @returns {Promise<object[]>}
 */
export async function loadPatientSessionsInRange(orgId, patientId, from, to) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM sessions WHERE patient_id = $1 AND timestamp >= $2 AND timestamp < $3 ORDER BY timestamp ASC',
    [patientId, from, to]
  );
  return rows.map(rowToSession);
}

// -- Internal helpers --

function rowToSession(row) {
  return {
    session_id: row.session_id,
    patient_id: row.patient_id,
    language: row.language,
    timestamp: row.timestamp?.toISOString?.() ?? row.timestamp,
    duration_seconds: row.duration_seconds,
    transcript: row.transcript || [],
    confounders: row.confounders || {},
    feature_vector: row.feature_vector || null,
    extracted_at: row.extracted_at?.toISOString?.() ?? row.extracted_at,
    extraction_model: row.extraction_model,
    v3: row.v3,
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
  };
}
