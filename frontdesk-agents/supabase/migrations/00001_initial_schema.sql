-- FRONTDESK AGENTS - Initial Database Schema
-- Migration 00001: Complete schema with all tables, RLS, indexes, and triggers

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================
-- 1. CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT 'corporate',
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'past_due', 'suspended', 'cancelled')),
  onboarding_status TEXT NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_select_own ON customers
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY customers_update_own ON customers
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY customers_insert_own ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY service_role_all_customers ON customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_plan ON customers(plan);
CREATE INDEX IF NOT EXISTS idx_customers_industry ON customers(industry);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_subscription_id ON customers(stripe_subscription_id);

-- ============================================================
-- 2. BUSINESS METRICS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_sms INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  ai_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  active_agents INTEGER NOT NULL DEFAULT 0,
  satisfaction_score NUMERIC(3,1) NOT NULL DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, period, created_at)
);

ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_metrics_select_own ON business_metrics
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_metrics ON business_metrics
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_business_metrics_customer ON business_metrics(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_period ON business_metrics(period);
CREATE INDEX IF NOT EXISTS idx_business_metrics_customer_period ON business_metrics(customer_id, period);

-- ============================================================
-- 3. CALL RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  caller TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'inbound' CHECK (type IN ('inbound', 'outbound', 'ai')),
  duration INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'voicemail', 'transferred', 'failed')),
  revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  intent TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY call_records_select_own ON call_records
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_calls ON call_records
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_call_records_customer ON call_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_records_created ON call_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);

-- ============================================================
-- 4. AI AGENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receptionist', 'scheduler', 'faq', 'transfer', 'voicemail')),
  voice_id TEXT NOT NULL DEFAULT 'rachel',
  voice_settings JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  calls_handled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_agents_select_own ON ai_agents
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY ai_agents_insert_own ON ai_agents
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY ai_agents_update_own ON ai_agents
  FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_agents ON ai_agents
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ai_agents_customer ON ai_agents(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(type);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);

-- ============================================================
-- 5. REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  file_path TEXT NOT NULL DEFAULT '',
  storage_url TEXT NOT NULL DEFAULT '',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_select_own ON reports
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_reports ON reports
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_reports_customer ON reports(customer_id);
CREATE INDEX IF NOT EXISTS idx_reports_frequency ON reports(frequency);

-- ============================================================
-- 6. CUSTOMER PHONES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  formatted_number TEXT NOT NULL DEFAULT '',
  capabilities JSONB NOT NULL DEFAULT '{}',
  monthly_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  provisioned_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE customer_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_phones_select_own ON customer_phones
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_phones ON customer_phones
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_customer_phones_customer ON customer_phones(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_phones_number ON customer_phones(phone_number);

-- ============================================================
-- 7. PHONE SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS phone_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  configured_at TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE phone_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY phone_services_select_own ON phone_services
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_phone_services ON phone_services
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_phone_services_customer ON phone_services(customer_id);

-- ============================================================
-- 8. CALLER PROFILES TABLE (Memory/Vector Store)
-- ============================================================
CREATE TABLE IF NOT EXISTS caller_profiles (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  business TEXT NOT NULL DEFAULT '',
  previous_calls INTEGER NOT NULL DEFAULT 0,
  last_contact TIMESTAMPTZ,
  preferences JSONB NOT NULL DEFAULT '{}',
  embedding VECTOR(1536),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE caller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_all_profiles ON caller_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_caller_profiles_embedding ON caller_profiles USING ivfflat (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_caller_profiles_last_contact ON caller_profiles(last_contact);

-- ============================================================
-- 9. FAQS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY faqs_select_own ON faqs
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY faqs_insert_own ON faqs
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY faqs_update_own ON faqs
  FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY faqs_delete_own ON faqs
  FOR DELETE USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_faqs ON faqs
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_faqs_customer ON faqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);

-- ============================================================
-- 10. SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_select_own ON services
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY services_insert_own ON services
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY services_update_own ON services
  FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY services_delete_own ON services
  FOR DELETE USING (auth.uid() = customer_id);
CREATE POLICY service_role_all_services ON services
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_services_customer ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- ============================================================
-- 11. HARNESS LEARNINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS harness_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT '',
  hypothesis TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  test_result TEXT NOT NULL DEFAULT '',
  deployment JSONB NOT NULL DEFAULT '{}',
  cycle INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE harness_learnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_all_learnings ON harness_learnings
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_harness_learnings_customer ON harness_learnings(customer_id);
CREATE INDEX IF NOT EXISTS idx_harness_learnings_type ON harness_learnings(type);
CREATE INDEX IF NOT EXISTS idx_harness_learnings_created ON harness_learnings(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_faqs_updated_at
  BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_services_updated_at
  BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_caller_profiles_updated_at
  BEFORE UPDATE ON caller_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE: Reports bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY reports_storage_select_own ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reports' AND auth.role() = 'service_role');

CREATE POLICY reports_storage_all_service ON storage.objects
  FOR ALL
  USING (bucket_id = 'reports' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'reports' AND auth.role() = 'service_role');
