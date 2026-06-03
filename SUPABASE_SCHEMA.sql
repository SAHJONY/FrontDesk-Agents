-- ==========================================
-- FRONTDESK AGENTS — Unified Database Schema
-- Authoritative source: supersedes all prior schema files
-- Run this SQL in your Supabase SQL Editor to set up the complete database
-- ==========================================

-- ==========================================
-- CUSTOMERS TABLE
-- Main customer/business accounts
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'past_due', 'suspended', 'cancelled')),
  onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'in_progress', 'completed')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BUSINESS METRICS TABLE
-- Track revenue, calls, and AI performance
-- ==========================================
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_calls INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0,
  ai_accuracy NUMERIC(5, 2) DEFAULT 99.7,
  active_agents INTEGER DEFAULT 0,
  satisfaction_score NUMERIC(3, 1) DEFAULT 4.9,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, period)
);

-- ==========================================
-- CALL RECORDS TABLE
-- Individual call/SMS transactions with revenue
-- ==========================================
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  caller_id TEXT,
  caller_name TEXT,
  caller_phone TEXT,
  type TEXT DEFAULT 'inbound' CHECK (type IN ('inbound', 'outbound', 'ai')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'voicemail', 'transferred', 'failed')),
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript TEXT,
  sentiment TEXT,
  revenue NUMERIC(10, 2) DEFAULT 0,
  agent_id UUID,
  external_id TEXT,
  intent TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AI DECISIONS TABLE (production persistent state)
-- Replaces in-memory singleton in ai-decision-engine.ts
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('escalate', 'onboard', 'upsell', 'retain', 'optimize', 'alert')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  trigger TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  action TEXT NOT NULL,
  outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('success', 'failed', 'pending', 'escalated')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AI ALERTS TABLE
-- Persistent alerts from the self-healing system
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES ai_decisions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('anomaly', 'threshold_breach', 'model_failure', 'customer_churn')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- ==========================================
-- BILLING HISTORY TABLE
-- All payment events recorded for audit trail
-- ==========================================
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL,
  subscription_id TEXT,
  amount INTEGER NOT NULL,  -- amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('succeeded', 'failed', 'refunded', 'pending')),
  description TEXT DEFAULT '',
  billing_reason TEXT,
  invoice_pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invoice_id)  -- idempotency: prevent duplicate payment records
);

-- ==========================================
-- AGENTS TABLE
-- AI agent configurations per customer
-- ==========================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'busy', 'offline')),
  avatar_url TEXT,
  conversations INTEGER DEFAULT 0,
  avg_response_time TEXT DEFAULT '< 1s',
  satisfaction NUMERIC(5, 2) DEFAULT 98.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- LEADS TABLE
-- Prospect tracking and conversion
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- ==========================================
-- BUSINESS PROFILES TABLE
-- Extended business info per customer
-- ==========================================
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT DEFAULT 'corporate',
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  timezone TEXT DEFAULT 'America/New_York',
  greeting_message TEXT,
  business_hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FAQ TABLE
-- Per-customer FAQ knowledge base
-- ==========================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SERVICES TABLE
-- Per-customer services offered
-- ==========================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 30,
  price NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VOICEMAILS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS voicemails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  call_record_id UUID REFERENCES call_records(id) ON DELETE SET NULL,
  caller_name TEXT,
  caller_phone TEXT,
  audio_url TEXT,
  transcription TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SMS RECORDS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS sms_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'voicemail', 'sms', 'system', 'billing')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_business_metrics_customer ON business_metrics(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_period ON business_metrics(period);
CREATE INDEX IF NOT EXISTS idx_call_records_customer ON call_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_records_created ON call_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_customer ON agents(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_customer ON ai_decisions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created ON ai_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_decision ON ai_alerts(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_severity ON ai_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_billing_history_customer ON billing_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_customer ON faqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_customer ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_voicemails_customer ON voicemails(customer_id);
CREATE INDEX IF NOT EXISTS idx_sms_records_customer ON sms_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(customer_id) WHERE is_read = FALSE;

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicemails ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Customers: service role does all, customers read their own row
CREATE POLICY IF NOT EXISTS customers_service_all ON customers FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS customers_self_read ON customers FOR SELECT USING (auth.uid() = id);

-- Billing history: owner (service role) can read all, customers read their own
CREATE POLICY IF NOT EXISTS billing_history_service_all ON billing_history FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS billing_history_self_read ON billing_history FOR SELECT USING (auth.uid() = customer_id);

-- AI decisions: owner can read all, customers read their own
CREATE POLICY IF NOT EXISTS ai_decisions_service_all ON ai_decisions FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS ai_decisions_self_read ON ai_decisions FOR SELECT USING (auth.uid() = customer_id);

-- AI alerts: owner can read all
CREATE POLICY IF NOT EXISTS ai_alerts_service_all ON ai_alerts FOR ALL USING (true);

-- All other tables: service role does everything, customers access their own
CREATE POLICY IF NOT EXISTS service_role_all ON business_metrics FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON call_records FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON agents FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON leads FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON business_profiles FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON faqs FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON services FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON voicemails FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON sms_records FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS service_role_all ON notifications FOR ALL USING (true);

-- Customer self-access policies (using auth.uid())
CREATE POLICY customers_insert ON customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY customers_update ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY business_metrics_customer ON business_metrics FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY call_records_customer ON call_records FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY agents_customer ON agents FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY leads_customer ON leads FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY business_profiles_customer ON business_profiles FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY faqs_customer ON faqs FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY services_customer ON services FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY voicemails_customer ON voicemails FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY sms_records_customer ON sms_records FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY notifications_customer ON notifications FOR ALL USING (auth.uid() = customer_id);

-- ==========================================
-- ENABLE REALTIME
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE call_records;
ALTER PUBLICATION supabase_realtime ADD TABLE voicemails;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_records;

-- ==========================================
-- FUNCTION: Auto-update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with the column
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();