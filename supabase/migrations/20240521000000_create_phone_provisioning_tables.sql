-- ==========================================
-- PHONE PROVISIONING TABLES
-- For Bland.ai native phone number management
-- ==========================================

-- CUSTOMER PHONES TABLE
-- Stores provisioned phone numbers per customer
CREATE TABLE IF NOT EXISTS customer_phones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  phone_number_id TEXT, -- Bland.ai phone number ID
  phone_type TEXT DEFAULT 'local' CHECK (phone_type IN ('local', 'tollfree', 'international')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'releasing')),
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  provisioned_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(customer_id, phone_number)
);

-- PHONE SERVICES TABLE
-- Stores configured services per phone per customer
CREATE TABLE IF NOT EXISTS phone_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  service_name TEXT NOT NULL CHECK (service_name IN (
    'phone_number', 'voicemail', 'call_routing', 'recording', 
    'sms', 'forwarding', 'ai_voice_agent', 'sip_endpoint'
  )),
  service_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
  configured_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, service_name)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customer_phones_customer ON customer_phones(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_phones_status ON customer_phones(status);
CREATE INDEX IF NOT EXISTS idx_phone_services_customer ON phone_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_phone_services_phone ON phone_services(phone_number);

-- Enable Row Level Security
ALTER TABLE customer_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
-- For service role API access (bypass RLS):
CREATE POLICY phone_service_role_all ON customer_phones
  FOR ALL USING (true);

CREATE POLICY phone_services_service_role_all ON phone_services
  FOR ALL USING (true);

-- For customer self-access (using auth.uid()):
CREATE POLICY customer_phones_select ON customer_phones
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY phone_services_select ON phone_services
  FOR SELECT USING (auth.uid() = customer_id);