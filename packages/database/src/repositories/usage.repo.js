/**
 * Usage tracking repository — PostgreSQL implementation.
 */

import { orgQuery } from '../connection.js';

/**
 * Get or create usage record for current billing period.
 */
export async function getOrCreateCurrentPeriod(orgId) {
  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const startStr = periodStart.toISOString().split('T')[0];
  const endStr = periodEnd.toISOString().split('T')[0];

  const { rows } = await orgQuery(orgId, `
    INSERT INTO usage_tracking (org_id, period_start, period_end)
    VALUES ($1, $2, $3)
    ON CONFLICT (org_id, period_start) DO NOTHING
    RETURNING *
  `, [orgId, startStr, endStr]);

  if (rows.length) return rows[0];

  // If conflict, fetch the existing row
  const existing = await orgQuery(orgId,
    'SELECT * FROM usage_tracking WHERE org_id = $1 AND period_start = $2',
    [orgId, startStr]
  );
  return existing.rows[0];
}

/**
 * Increment session count for current period.
 */
export async function incrementSessions(orgId, count = 1) {
  const period = await getOrCreateCurrentPeriod(orgId);
  await orgQuery(orgId,
    'UPDATE usage_tracking SET sessions_count = sessions_count + $2 WHERE id = $1',
    [period.id, count]
  );
}

/**
 * Increment API call count for current period.
 */
export async function incrementApiCalls(orgId, count = 1) {
  const period = await getOrCreateCurrentPeriod(orgId);
  await orgQuery(orgId,
    'UPDATE usage_tracking SET api_calls_count = api_calls_count + $2 WHERE id = $1',
    [period.id, count]
  );
}

/**
 * Record AI token usage.
 */
export async function recordAiUsage(orgId, { inputTokens = 0, outputTokens = 0, costCents = 0 }) {
  const period = await getOrCreateCurrentPeriod(orgId);
  await orgQuery(orgId, `
    UPDATE usage_tracking SET
      ai_tokens_input = ai_tokens_input + $2,
      ai_tokens_output = ai_tokens_output + $3,
      ai_cost_cents = ai_cost_cents + $4
    WHERE id = $1
  `, [period.id, inputTokens, outputTokens, costCents]);
}

/**
 * Get usage history for an organization.
 */
export async function getUsageHistory(orgId, months = 12) {
  const { rows } = await orgQuery(orgId, `
    SELECT * FROM usage_tracking
    WHERE org_id = $1
    ORDER BY period_start DESC
    LIMIT $2
  `, [orgId, months]);

  return rows;
}
