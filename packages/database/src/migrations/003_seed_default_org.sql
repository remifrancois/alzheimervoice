-- AlzheimerVoice — Seed Default Organization
-- Migration 003: Creates the default org for single-tenant / demo mode
-- Requires: 001_initial_schema.sql, 002_rls_policies.sql

BEGIN;

-- Default organization for demo / single-tenant mode
INSERT INTO organizations (id, name, type, status, region, seats, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'AlzheimerVoice Demo',
  'clinic',
  'active',
  'eu-west-1',
  100,
  '{"demo": true}'
)
ON CONFLICT (id) DO NOTHING;

-- Default subscription for the demo org (free tier, generous limits)
INSERT INTO subscriptions (org_id, plan, status, max_patients, max_sessions_per_month, started_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'enterprise',
  'active',
  1000,
  100000,
  now()
)
ON CONFLICT (org_id) DO NOTHING;

COMMIT;
