-- ==========================================
-- AI DECISIONS AND ALERTS TABLES
-- Enables production-grade persistent state for the AI decision engine
-- (survives serverless cold-starts on Vercel)
-- ==========================================
--
-- ai_decisions:  Stores every autonomous decision made by the AI engine
--                 (escalate, onboard, upsell, retain, optimize, alert)
--                 Capped at 500 entries in-engine; DB holds full history.
--
-- ai_alerts:     Self-healing system alerts (anomaly, threshold_breach,
--                 model_failure, customer_churn). Max 20 in-memory; DB holds all.
--
-- RLS:           Owner (service role) has full access.
--                 Customers can read their own decisions via auth.uid() = customer_id.
-- ==========================================

-- ─── AI DECISIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_decisions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  category    TEXT NOT NULL CHECK (
    category IN ('escalate', 'onboard', 'upsell', 'retain', 'optimize', 'alert')
  ),
  severity    TEXT NOT NULL CHECK (
    severity IN ('critical', 'high', 'medium', 'low', 'info')
  ),
  trigger     TEXT NOT NULL,
  reasoning   TEXT NOT NULL,
  action      TEXT NOT NULL,
  outcome     TEXT DEFAULT 'pending' CHECK (
    outcome IN ('success', 'failed', 'pending', 'escalated')
  ),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast chronological and customer-scoped queries
-- (idempotent — SUPABASE_SCHEMA.sql also creates these; CREATE INDEX IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS idx_ai_decisions_customer  ON ai_decisions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created   ON ai_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_category  ON ai_decisions(category);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_severity  ON ai_decisions(severity);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_outcome   ON ai_decisions(outcome);

-- ─── AI ALERTS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id     UUID REFERENCES ai_decisions(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (
    type IN ('anomaly', 'threshold_breach', 'model_failure', 'customer_churn')
  ),
  severity        TEXT NOT NULL CHECK (
    severity IN ('critical', 'high', 'medium', 'low')
  ),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ
);

-- Indexes for fast unresolved-alerts queries and owner dashboard
CREATE INDEX IF NOT EXISTS idx_ai_alerts_decision     ON ai_alerts(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_severity     ON ai_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_created      ON ai_alerts(created_at DESC);
-- Partial index for unresolved alerts (matches loadAlertsFromDb .is('resolved_at', null))
CREATE INDEX IF NOT EXISTS idx_ai_alerts_unresolved   ON ai_alerts(created_at DESC)
  WHERE resolved_at IS NULL;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────

ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts    ENABLE ROW LEVEL SECURITY;

-- Owner (service role): full CRUD on both tables
CREATE POLICY ai_decisions_service_all ON ai_decisions
  FOR ALL USING (true);

CREATE POLICY ai_alerts_service_all ON ai_alerts
  FOR ALL USING (true);

-- Customers: read their own decisions (filtered by customer_id = auth.uid())
-- Write access is reserved for the service role / AI engine
CREATE POLICY ai_decisions_self_read ON ai_decisions
  FOR SELECT USING (auth.uid() = customer_id);