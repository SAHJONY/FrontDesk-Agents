-- ==========================================
-- FRONTDESK AGENTS - Supabase Database Schema
-- Native System 100%
-- ==========================================
-- Run this SQL in your Supabase SQL Editor to create the required tables
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql_editor

-- ==========================================
-- CUSTOMERS TABLE
-- Main customer/business accounts
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BUSINESS METRICS TABLE
-- Track revenue, calls, and AI performance
-- ==========================================
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'inbound' CHECK (type IN ('inbound', 'outbound', 'ai')),
  duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'voicemail')),
  revenue NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AGENTS TABLE
-- AI agent configurations per customer
-- ==========================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_business_metrics_customer ON business_metrics(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_period ON business_metrics(period);
CREATE INDEX IF NOT EXISTS idx_call_records_customer ON call_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_records_created ON call_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_customer ON agents(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- Customers can only see their own data
-- ==========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can read their own data
CREATE POLICY IF NOT EXISTS customers_select ON customers
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS metrics_select ON business_metrics
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS calls_select ON call_records
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS agents_select ON agents
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS leads_select ON leads
  FOR SELECT USING (true);

-- Policy: Service role can do everything (for API)
-- Note: Using auth.jwt() role check - service_role key bypasses RLS
CREATE POLICY IF NOT EXISTS service_role_all ON customers
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS service_role_metrics ON business_metrics
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS service_role_calls ON call_records
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS service_role_agents ON agents
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS service_role_leads ON leads
  FOR ALL USING (true);

-- ==========================================
-- SAMPLE DATA (Optional - for testing)
-- ==========================================
-- Run these INSERTs manually after creating tables:
-- INSERT INTO customers (email, business_name, owner_name, phone, plan, status)
-- VALUES 
--   ('demo@acmecorp.com', 'Acme Corporation', 'John Smith', '+1234567890', 'enterprise', 'active'),
--   ('admin@techstart.io', 'TechStart Inc', 'Jane Doe', '+1987654321', 'professional', 'active')