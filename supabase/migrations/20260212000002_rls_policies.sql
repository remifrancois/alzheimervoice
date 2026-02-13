-- AlzheimerVoice — Row-Level Security Policies
-- Migration 002: Multi-tenant org isolation + audit immutability
-- Requires: 001_initial_schema.sql

BEGIN;

-- ============================================================
-- Create application role (used by the API service)
-- The superuser role used for migrations bypasses RLS.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN;
  END IF;
END
$$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Future tables get same permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO app_user;

-- ============================================================
-- Enable RLS on all PHI / tenant-scoped tables
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patient_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_recall_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Org isolation policies
-- The API sets: SET LOCAL app.current_org_id = '<uuid>';
-- ============================================================

-- organizations: can only see own org
CREATE POLICY org_isolation_organizations ON organizations
  FOR ALL TO app_user
  USING (id = current_setting('app.current_org_id', true)::UUID);

-- users: can only see users in same org
CREATE POLICY org_isolation_users ON users
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- clinician_credentials: via user join
CREATE POLICY org_isolation_clinician_credentials ON clinician_credentials
  FOR ALL TO app_user
  USING (
    user_id IN (
      SELECT id FROM users WHERE org_id = current_setting('app.current_org_id', true)::UUID
    )
  );

-- patients
CREATE POLICY org_isolation_patients ON patients
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- user_patient_access: accessible if the patient belongs to current org
CREATE POLICY org_isolation_user_patient_access ON user_patient_access
  FOR ALL TO app_user
  USING (
    patient_id IN (
      SELECT patient_id FROM patients WHERE org_id = current_setting('app.current_org_id', true)::UUID
    )
  );

-- sessions
CREATE POLICY org_isolation_sessions ON sessions
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- baselines
CREATE POLICY org_isolation_baselines ON baselines
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- weekly_reports
CREATE POLICY org_isolation_weekly_reports ON weekly_reports
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- memories
CREATE POLICY org_isolation_memories ON memories
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- memory_recall_events: via patient org
CREATE POLICY org_isolation_memory_recall_events ON memory_recall_events
  FOR ALL TO app_user
  USING (
    patient_id IN (
      SELECT patient_id FROM patients WHERE org_id = current_setting('app.current_org_id', true)::UUID
    )
  );

-- consents
CREATE POLICY org_isolation_consents ON consents
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- subscriptions
CREATE POLICY org_isolation_subscriptions ON subscriptions
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- invoices
CREATE POLICY org_isolation_invoices ON invoices
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- usage_tracking
CREATE POLICY org_isolation_usage_tracking ON usage_tracking
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- notifications
CREATE POLICY org_isolation_notifications ON notifications
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- api_keys
CREATE POLICY org_isolation_api_keys ON api_keys
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- ============================================================
-- Audit logs: append-only, immutable
-- INSERT always allowed, SELECT by org, no UPDATE/DELETE
-- ============================================================

-- Allow insert without org restriction (audit logs written for all requests)
CREATE POLICY audit_insert ON audit_logs
  FOR INSERT TO app_user
  WITH CHECK (true);

-- Select: only own org's logs
CREATE POLICY audit_select ON audit_logs
  FOR SELECT TO app_user
  USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- Explicitly revoke UPDATE and DELETE on audit_logs
REVOKE UPDATE, DELETE ON audit_logs FROM app_user;

COMMIT;
