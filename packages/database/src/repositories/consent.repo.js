/**
 * Consent repository — PostgreSQL implementation.
 * GDPR Art. 7 — consent tracking per patient.
 */

import { orgQuery } from '../connection.js';

/**
 * Record a new consent.
 */
export async function createConsent(orgId, { patientId, type, version = '1.0', method = 'digital', guardianName, guardianRelation }) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO consents (
      patient_id, org_id, type, version, status,
      consent_date, method, guardian_name, guardian_relation
    ) VALUES ($1, $2, $3, $4, 'active', now(), $5, $6, $7)
    RETURNING *
  `, [patientId, orgId, type, version, method, guardianName || null, guardianRelation || null]);

  return rows[0];
}

/**
 * Withdraw a consent.
 */
export async function withdrawConsent(orgId, consentId, reason = null) {
  const { rows } = await orgQuery(orgId, `
    UPDATE consents
    SET status = 'withdrawn', withdrawn_at = now(), withdrawn_reason = $2
    WHERE id = $1
    RETURNING *
  `, [consentId, reason]);

  return rows.length ? rows[0] : null;
}

/**
 * Load all consents for a patient.
 */
export async function loadPatientConsents(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM consents WHERE patient_id = $1 ORDER BY consent_date DESC',
    [patientId]
  );
  return rows;
}

/**
 * Check if a patient has active consent of a specific type.
 */
export async function hasActiveConsent(orgId, patientId, consentType) {
  const { rows } = await orgQuery(orgId,
    `SELECT 1 FROM consents WHERE patient_id = $1 AND type = $2 AND status = 'active'`,
    [patientId, consentType]
  );
  return rows.length > 0;
}
