/**
 * Weekly report repository — PostgreSQL implementation.
 * Replaces file-based weekly analysis storage in @azh/shared-models/cvf.
 */

import { orgQuery } from '../connection.js';

/**
 * Save (upsert) a weekly report.
 * Promotes queryable fields to columns, stores the rest in report_body.
 *
 * @param {string} orgId - Organization UUID
 * @param {object} report - Weekly analysis object (file-based format)
 * @returns {Promise<object>}
 */
export async function saveWeeklyReport(orgId, report) {
  const version = report.version || 'v3';

  // Extract promoted columns from the report
  const compositeScore = report.composite_score ?? report.computed_composite ?? null;
  const alertLevel = report.alert_level || 'green';
  const sessionsAnalyzed = report.sessions_analyzed || 0;
  const trend = report.trend || 0;
  const domainScores = report.domain_scores ?? report.computed_domains ?? {};

  // Everything else goes into report_body
  const reportBody = {
    confidence: report.confidence,
    computed_composite: report.computed_composite,
    computed_domains: report.computed_domains,
    cascade_patterns: report.cascade_patterns,
    clinical_narrative_family: report.clinical_narrative_family,
    clinical_narrative_medical: report.clinical_narrative_medical,
    conversation_adaptations: report.conversation_adaptations,
    next_week_focus: report.next_week_focus,
    flags: report.flags,
  };

  const { rows } = await orgQuery(orgId, `
    INSERT INTO weekly_reports (
      patient_id, org_id, week_number, version,
      composite_score, alert_level, sessions_analyzed, trend,
      domain_scores, report_body, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (patient_id, week_number, version) DO UPDATE SET
      composite_score = EXCLUDED.composite_score,
      alert_level = EXCLUDED.alert_level,
      sessions_analyzed = EXCLUDED.sessions_analyzed,
      trend = EXCLUDED.trend,
      domain_scores = EXCLUDED.domain_scores,
      report_body = EXCLUDED.report_body
    RETURNING *
  `, [
    report.patient_id,
    orgId,
    report.week_number,
    version,
    compositeScore,
    alertLevel,
    sessionsAnalyzed,
    trend,
    JSON.stringify(domainScores),
    JSON.stringify(reportBody),
    report.created_at || new Date().toISOString(),
  ]);

  return rowToReport(rows[0]);
}

/**
 * Load a weekly report by patient and week number.
 * @param {string} orgId
 * @param {string} patientId
 * @param {number} weekNumber
 * @param {string} version
 * @returns {Promise<object|null>}
 */
export async function loadWeeklyReport(orgId, patientId, weekNumber, version = 'v3') {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM weekly_reports WHERE patient_id = $1 AND week_number = $2 AND version = $3',
    [patientId, weekNumber, version]
  );
  return rows.length ? rowToReport(rows[0]) : null;
}

/**
 * Load all weekly reports for a patient, ordered by week (newest first).
 * @param {string} orgId
 * @param {string} patientId
 * @returns {Promise<object[]>}
 */
export async function loadPatientReports(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM weekly_reports WHERE patient_id = $1 ORDER BY week_number DESC',
    [patientId]
  );
  return rows.map(rowToReport);
}

/**
 * Delete all weekly reports for a patient.
 */
export async function deletePatientReports(orgId, patientId) {
  const { rowCount } = await orgQuery(orgId,
    'DELETE FROM weekly_reports WHERE patient_id = $1',
    [patientId]
  );
  return rowCount;
}

/**
 * Get alert distribution across all patients in an org.
 * @param {string} orgId
 * @returns {Promise<{green: number, yellow: number, orange: number, red: number}>}
 */
export async function getAlertDistribution(orgId) {
  const { rows } = await orgQuery(orgId, `
    SELECT wr.alert_level, COUNT(*)::int AS count
    FROM weekly_reports wr
    INNER JOIN (
      SELECT patient_id, MAX(week_number) AS max_week
      FROM weekly_reports
      GROUP BY patient_id
    ) latest ON wr.patient_id = latest.patient_id AND wr.week_number = latest.max_week
    GROUP BY wr.alert_level
  `);

  const dist = { green: 0, yellow: 0, orange: 0, red: 0 };
  for (const row of rows) {
    dist[row.alert_level] = row.count;
  }
  return dist;
}

/**
 * Get patients with non-green alerts (for alert dashboard).
 */
export async function getActiveAlerts(orgId) {
  const { rows } = await orgQuery(orgId, `
    SELECT wr.*, p.first_name
    FROM weekly_reports wr
    INNER JOIN patients p ON p.patient_id = wr.patient_id
    INNER JOIN (
      SELECT patient_id, MAX(week_number) AS max_week
      FROM weekly_reports
      GROUP BY patient_id
    ) latest ON wr.patient_id = latest.patient_id AND wr.week_number = latest.max_week
    WHERE wr.alert_level != 'green'
    ORDER BY
      CASE wr.alert_level
        WHEN 'red' THEN 1
        WHEN 'orange' THEN 2
        WHEN 'yellow' THEN 3
      END
  `);
  return rows.map(row => ({
    ...rowToReport(row),
    patient_first_name: row.first_name,
  }));
}

// -- Internal helpers --

function rowToReport(row) {
  const body = row.report_body || {};
  return {
    id: row.id,
    patient_id: row.patient_id,
    week_number: row.week_number,
    version: row.version,
    composite_score: row.composite_score,
    alert_level: row.alert_level,
    sessions_analyzed: row.sessions_analyzed,
    trend: row.trend,
    domain_scores: row.domain_scores || {},
    // Flatten report_body back for compatibility
    confidence: body.confidence,
    computed_composite: body.computed_composite,
    computed_domains: body.computed_domains,
    cascade_patterns: body.cascade_patterns || [],
    clinical_narrative_family: body.clinical_narrative_family || '',
    clinical_narrative_medical: body.clinical_narrative_medical || '',
    conversation_adaptations: body.conversation_adaptations || [],
    next_week_focus: body.next_week_focus || '',
    flags: body.flags || [],
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
  };
}
