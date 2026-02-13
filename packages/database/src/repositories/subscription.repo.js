/**
 * Subscription & invoice repository — PostgreSQL implementation.
 */

import { orgQuery } from '../connection.js';

// -- Subscriptions --

/**
 * Get the subscription for an organization.
 */
export async function getSubscription(orgId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM subscriptions WHERE org_id = $1',
    [orgId]
  );
  return rows.length ? rows[0] : null;
}

/**
 * Create or update a subscription.
 */
export async function upsertSubscription(orgId, sub) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO subscriptions (
      org_id, plan, status, mrr_cents, started_at,
      next_billing_at, max_patients, max_sessions_per_month
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (org_id) DO UPDATE SET
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      mrr_cents = EXCLUDED.mrr_cents,
      next_billing_at = EXCLUDED.next_billing_at,
      max_patients = EXCLUDED.max_patients,
      max_sessions_per_month = EXCLUDED.max_sessions_per_month
    RETURNING *
  `, [
    orgId,
    sub.plan || 'free',
    sub.status || 'trial',
    sub.mrr_cents || 0,
    sub.started_at || new Date().toISOString(),
    sub.next_billing_at || null,
    sub.max_patients || 1,
    sub.max_sessions_per_month || 30,
  ]);

  return rows[0];
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(orgId) {
  const { rows } = await orgQuery(orgId, `
    UPDATE subscriptions SET status = 'cancelled', cancelled_at = now()
    WHERE org_id = $1
    RETURNING *
  `, [orgId]);

  return rows.length ? rows[0] : null;
}

// -- Invoices --

/**
 * Create an invoice.
 */
export async function createInvoice(orgId, invoice) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO invoices (
      org_id, subscription_id, amount_cents, currency, status,
      invoice_date, due_date, line_items
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    orgId,
    invoice.subscription_id || null,
    invoice.amount_cents,
    invoice.currency || 'EUR',
    invoice.status || 'draft',
    invoice.invoice_date || new Date().toISOString().split('T')[0],
    invoice.due_date || null,
    JSON.stringify(invoice.line_items || []),
  ]);

  return rows[0];
}

/**
 * List invoices for an organization.
 */
export async function listInvoices(orgId, { limit = 50, offset = 0 } = {}) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM invoices WHERE org_id = $1 ORDER BY invoice_date DESC LIMIT $2 OFFSET $3',
    [orgId, limit, offset]
  );
  return rows;
}

/**
 * Mark an invoice as paid.
 */
export async function markInvoicePaid(orgId, invoiceId, paymentMethod = null) {
  const { rows } = await orgQuery(orgId, `
    UPDATE invoices SET status = 'paid', paid_at = now(), payment_method = $2
    WHERE id = $1
    RETURNING *
  `, [invoiceId, paymentMethod]);

  return rows.length ? rows[0] : null;
}
