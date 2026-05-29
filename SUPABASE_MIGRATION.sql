-- FrontDesk Agents Database Schema
-- Supabase Migration Script
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'suspended', 'canceled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY customers_select ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY customers_update ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY customers_insert ON customers FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- BUSINESS PROFILES TABLE
-- ============================================
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_profiles_customer ON business_profiles
  FOR ALL USING (auth.uid() = customer_id);

-- Index for faster queries on customer_id
CREATE INDEX idx_business_profiles_customer ON business_profiles(customer_id);

-- ============================================
-- FAQ TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY faqs_customer ON faqs
  FOR ALL USING (auth.uid() = customer_id);

-- Index for faster queries on customer_id
CREATE INDEX idx_faqs_customer ON faqs(customer_id);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_customer ON services
  FOR ALL USING (auth.uid() = customer_id);

-- Index for faster queries on customer_id
CREATE INDEX idx_services_customer ON services(customer_id);

-- ============================================
-- AI AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receptionist', 'scheduler', 'faq', 'transfer', 'voicemail')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  voice_id TEXT DEFAULT 'rachel',
  voice_settings JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_agents_customer ON ai_agents
  FOR ALL USING (auth.uid() = customer_id);

-- Index for faster queries on customer_id
CREATE INDEX idx_ai_agents_customer ON ai_agents(customer_id);

-- ============================================
-- CALL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  caller_id TEXT,
  caller_name TEXT,
  caller_phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound', 'ai')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'voicemail', 'transferred', 'failed')),
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript TEXT,
  sentiment TEXT,
  revenue DECIMAL(10,2) DEFAULT 0,
  agent_id UUID REFERENCES ai_agents(id),
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY call_records_customer ON call_records
  FOR ALL USING (auth.uid() = customer_id);

-- Create index for faster queries
CREATE INDEX idx_call_records_customer ON call_records(customer_id);
CREATE INDEX idx_call_records_created ON call_records(created_at DESC);

-- ============================================
-- VOICEMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voicemails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  call_record_id UUID REFERENCES call_records(id),
  caller_name TEXT,
  caller_phone TEXT,
  audio_url TEXT,
  transcription TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE voicemails ENABLE ROW LEVEL SECURITY;

CREATE POLICY voicemails_customer ON voicemails
  FOR ALL USING (auth.uid() = customer_id);

CREATE INDEX idx_voicemails_customer ON voicemails(customer_id);

-- ============================================
-- SMS RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sms_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sms_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY sms_records_customer ON sms_records
  FOR ALL USING (auth.uid() = customer_id);

CREATE INDEX idx_sms_records_customer ON sms_records(customer_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'voicemail', 'sms', 'system', 'billing')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_customer ON notifications
  FOR ALL USING (auth.uid() = customer_id);

CREATE INDEX idx_notifications_customer ON notifications(customer_id);
CREATE INDEX idx_notifications_unread ON notifications(customer_id) WHERE is_read = FALSE;

-- ============================================
-- BUSINESS METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_calls INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  ai_accuracy DECIMAL(5,2) DEFAULT 0,
  active_agents INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,
  period TEXT DEFAULT 'daily' CHECK (period IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, period, created_at)
);

ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_metrics_customer ON business_metrics
  FOR ALL USING (auth.uid() = customer_id);

-- ============================================
-- FUNCTION: Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_agents_updated_at BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE call_records;
ALTER PUBLICATION supabase_realtime ADD TABLE voicemails;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_records;