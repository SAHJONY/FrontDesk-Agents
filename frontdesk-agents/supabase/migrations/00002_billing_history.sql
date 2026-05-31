-- FRONTDESK AGENTS - Billing History Table
-- Migration 00002: Tracks all successful Stripe payments for customer billing history
-- ============================================================

CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed', 'refunded', 'pending')),
  description TEXT NOT NULL DEFAULT '',
  billing_reason TEXT,
  invoice_pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Customers can view their own billing history
CREATE POLICY billing_history_select_own ON billing_history
  FOR SELECT USING (
    auth.uid() = customer_id
  );

-- Service role has full access
CREATE POLICY service_role_all_billing_history ON billing_history
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_billing_history_customer_id ON billing_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_invoice_id ON billing_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON billing_history(status);
