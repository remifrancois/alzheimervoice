-- AlzheimerVoice — Initial Database Schema
-- Migration 001: Complete DDL for 17 tables
-- PostgreSQL 15+ required (JSONB, RLS, GENERATED ALWAYS AS IDENTITY)

BEGIN;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE org_type AS ENUM ('hospital', 'clinic', 'ehpad', 'department', 'research');
CREATE TYPE org_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'clinical', 'enterprise');
CREATE TYPE user_role AS ENUM ('admin', 'clinician', 'family');
CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'disabled');
CREATE TYPE alert_level AS ENUM ('green', 'yellow', 'orange', 'red');
CREATE TYPE supported_language AS ENUM ('fr', 'en');
CREATE TYPE consent_type AS ENUM ('data_processing', 'voice_recording', 'ai_analysis', 'data_sharing', 'research');
CREATE TYPE consent_status AS ENUM ('active', 'withdrawn', 'requires_update');
CREATE TYPE consent_method AS ENUM ('digital', 'written', 'verbal_recorded');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trial');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');
CREATE TYPE notification_type AS ENUM ('report_ready', 'alert_escalation', 'security_alert', 'account_change', 'consent_update', 'billing', 'system');
CREATE TYPE audit_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE extraction_model AS ENUM ('sonnet-full', 'sonnet-early', 'legacy-v1');

-- ============================================================
-- 1. organizations
-- ============================================================

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            org_type DEFAULT 'clinic',
  parent_org_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status          org_status DEFAULT 'trial',
  region          TEXT DEFAULT 'eu-west-1',
  seats           INTEGER DEFAULT 5,
  mrr_cents       INTEGER DEFAULT 0,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. users
-- Cognito owns identity. This table stores app-specific data.
-- ============================================================

CREATE TABLE users (
  id              TEXT PRIMARY KEY,                          -- azh_user_id
  cognito_sub     TEXT UNIQUE,                               -- Cognito sub UUID, NULL for demo
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  role            user_role DEFAULT 'family',
  plan            plan_type DEFAULT 'free',
  avatar          TEXT DEFAULT '',
  status          user_status DEFAULT 'active',
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_cognito_sub ON users(cognito_sub) WHERE cognito_sub IS NOT NULL;

-- ============================================================
-- 3. clinician_credentials
-- ============================================================

CREATE TABLE clinician_credentials (
  user_id             TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialty           TEXT,
  license_number      TEXT,
  license_expiry      DATE,
  credential_verified BOOLEAN DEFAULT FALSE,
  verified_by         TEXT REFERENCES users(id) ON DELETE SET NULL,
  verified_at         TIMESTAMPTZ
);

-- ============================================================
-- 4. patients
-- Central PHI table. All access gated by RLS + user_patient_access.
-- ============================================================

CREATE TABLE patients (
  patient_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name          TEXT NOT NULL,
  language            supported_language DEFAULT 'fr',
  phone_number        TEXT,
  call_schedule       JSONB DEFAULT '{"time":"09:00","timezone":"Europe/Paris"}',
  baseline_established BOOLEAN DEFAULT FALSE,
  baseline_sessions   INTEGER DEFAULT 0,
  alert_level         alert_level DEFAULT 'green',
  confounders         JSONB DEFAULT '{}',
  personality_notes   TEXT DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patients_org_id ON patients(org_id);

-- ============================================================
-- 5. user_patient_access
-- Replaces assignedPatients[] / patientId fields. Clean M:N.
-- ============================================================

CREATE TABLE user_patient_access (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ DEFAULT now(),
  granted_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, patient_id)
);

CREATE INDEX idx_user_patient_access_user ON user_patient_access(user_id);
CREATE INDEX idx_user_patient_access_patient ON user_patient_access(patient_id);

-- ============================================================
-- 6. sessions
-- Highest-volume table. ~7 per patient per week.
-- ============================================================

CREATE TABLE sessions (
  session_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  language        supported_language DEFAULT 'fr',
  timestamp       TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  transcript      JSONB DEFAULT '[]',
  confounders     JSONB DEFAULT '{}',
  feature_vector  JSONB,
  extracted_at    TIMESTAMPTZ,
  extraction_model extraction_model,
  v3              BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- The hot path: session timeline for a patient
CREATE INDEX idx_sessions_patient_time ON sessions(patient_id, timestamp DESC);

-- V3-only sessions
CREATE INDEX idx_sessions_patient_time_v3 ON sessions(patient_id, timestamp DESC) WHERE v3 = TRUE;

-- Org-level queries
CREATE INDEX idx_sessions_org_id ON sessions(org_id);

-- ============================================================
-- 7. baselines
-- V1/V3/V4 baselines with version discriminator.
-- ============================================================

CREATE TABLE baselines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version         TEXT DEFAULT 'v3',
  complete        BOOLEAN DEFAULT FALSE,
  sessions_used   INTEGER DEFAULT 0,
  vector          JSONB DEFAULT '{}',
  high_variance   TEXT[] DEFAULT '{}',
  needs_extension BOOLEAN DEFAULT FALSE,
  personality_notes TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (patient_id, version)
);

CREATE INDEX idx_baselines_patient ON baselines(patient_id);

-- ============================================================
-- 8. weekly_reports
-- Deeply nested analysis. Promoted queryable fields to columns.
-- ============================================================

CREATE TABLE weekly_reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  week_number       INTEGER NOT NULL,
  version           TEXT DEFAULT 'v3',

  -- Promoted columns (filtered/sorted/aggregated)
  composite_score   DOUBLE PRECISION,
  alert_level       alert_level DEFAULT 'green',
  sessions_analyzed INTEGER DEFAULT 0,
  trend             DOUBLE PRECISION DEFAULT 0,
  domain_scores     JSONB DEFAULT '{}',

  -- Everything else in one JSONB blob
  report_body       JSONB DEFAULT '{}',

  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (patient_id, week_number, version)
);

-- Report timeline
CREATE INDEX idx_weekly_reports_patient_week ON weekly_reports(patient_id, week_number DESC);

-- Alert dashboard: non-green alerts
CREATE INDEX idx_weekly_reports_alert ON weekly_reports(alert_level) WHERE alert_level != 'green';

-- Org-level queries
CREATE INDEX idx_weekly_reports_org ON weekly_reports(org_id);

-- ============================================================
-- 9. memories
-- Split from single-file memory profile into proper rows.
-- ============================================================

CREATE TABLE memories (
  id              TEXT PRIMARY KEY,                          -- 'mem_XXXXXXXX' format
  patient_id      UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  source          TEXT DEFAULT 'family',
  category        TEXT DEFAULT 'other',
  people          TEXT[] DEFAULT '{}',
  places          TEXT[] DEFAULT '{}',
  dates           TEXT[] DEFAULT '{}',
  emotional_valence TEXT DEFAULT 'positive',
  times_tested    INTEGER DEFAULT 0,
  date_added      DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memories_patient ON memories(patient_id);

-- ============================================================
-- 10. memory_recall_events
-- Each time a memory is tested in a session.
-- ============================================================

CREATE TABLE memory_recall_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id   TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  session_id  UUID REFERENCES sessions(session_id) ON DELETE SET NULL,
  recall_date DATE DEFAULT CURRENT_DATE,
  recall_type TEXT NOT NULL,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memory_recall_memory ON memory_recall_events(memory_id);
CREATE INDEX idx_memory_recall_patient ON memory_recall_events(patient_id);

-- ============================================================
-- 11. consents
-- GDPR Art. 7 — consent tracking per patient.
-- ============================================================

CREATE TABLE consents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            consent_type NOT NULL,
  version         TEXT DEFAULT '1.0',
  status          consent_status DEFAULT 'active',
  consent_date    TIMESTAMPTZ,
  method          consent_method DEFAULT 'digital',
  guardian_name   TEXT,
  guardian_relation TEXT,
  withdrawn_at    TIMESTAMPTZ,
  withdrawn_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_consents_patient ON consents(patient_id);

-- ============================================================
-- 12. subscriptions
-- One active subscription per organization.
-- ============================================================

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan                    plan_type DEFAULT 'free',
  status                  subscription_status DEFAULT 'trial',
  mrr_cents               INTEGER DEFAULT 0,
  started_at              TIMESTAMPTZ,
  next_billing_at         TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  max_patients            INTEGER DEFAULT 1,
  max_sessions_per_month  INTEGER DEFAULT 30,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. invoices
-- ============================================================

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount_cents    INTEGER NOT NULL,
  currency        TEXT DEFAULT 'EUR',
  status          invoice_status DEFAULT 'draft',
  invoice_date    DATE DEFAULT CURRENT_DATE,
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  payment_method  TEXT,
  line_items      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_org ON invoices(org_id);

-- ============================================================
-- 14. usage_tracking
-- Monthly usage counters per organization.
-- ============================================================

CREATE TABLE usage_tracking (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  sessions_count      INTEGER DEFAULT 0,
  patients_count      INTEGER DEFAULT 0,
  api_calls_count     INTEGER DEFAULT 0,
  storage_bytes       BIGINT DEFAULT 0,
  ai_tokens_input     BIGINT DEFAULT 0,
  ai_tokens_output    BIGINT DEFAULT 0,
  ai_cost_cents       INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (org_id, period_start)
);

-- ============================================================
-- 15. audit_logs
-- Append-only, immutable. HIPAA §164.312(b).
-- ============================================================

CREATE TABLE audit_logs (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
  method          TEXT NOT NULL,
  url             TEXT NOT NULL,
  status_code     SMALLINT NOT NULL,
  duration_ms     INTEGER,
  ip_address      INET,
  user_agent      TEXT,
  user_id         TEXT,
  user_role       user_role,
  org_id          UUID,
  patient_id      UUID,
  phi_access      BOOLEAN DEFAULT FALSE,
  category        TEXT,
  severity        audit_severity DEFAULT 'info',
  metadata        JSONB DEFAULT '{}'
);

-- Time-range audit queries
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- PHI access audit trail
CREATE INDEX idx_audit_logs_patient ON audit_logs(patient_id, timestamp DESC) WHERE patient_id IS NOT NULL;

-- Org-scoped audit
CREATE INDEX idx_audit_logs_org ON audit_logs(org_id, timestamp DESC) WHERE org_id IS NOT NULL;

-- User activity audit
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC) WHERE user_id IS NOT NULL;

-- ============================================================
-- 16. notifications
-- ============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Unread notifications bell
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read = FALSE;

-- ============================================================
-- 17. api_keys
-- Future: external API access for clinical plan.
-- ============================================================

CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  key_hash    TEXT NOT NULL,
  prefix      TEXT NOT NULL,
  scopes      TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_keys_org ON api_keys(org_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(prefix);

-- ============================================================
-- updated_at trigger function
-- Automatically updates updated_at on row modification.
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_baselines_updated_at BEFORE UPDATE ON baselines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_consents_updated_at BEFORE UPDATE ON consents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
