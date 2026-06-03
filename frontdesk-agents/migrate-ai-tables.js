#!/usr/bin/env node
/**
 * Run migration: Create ai_decisions and ai_alerts tables
 * Uses Supabase REST API with service role key (bypasses RLS)
 */

// Load service role key from environment (never hardcode)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://awzczbaarskqjgdatefv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
  console.error('Set it in your .env.local or pull from Vercel: vercel env pull .env.production');
  process.exit(1);
}

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// SQL to create ai_decisions table
const createAiDecisionsSql = `
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
`.trim();

// SQL to create ai_alerts table
const createAiAlertsSql = `
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
`.trim();

// Index creation SQL
const createIndexesSql = `
CREATE INDEX IF NOT EXISTS idx_ai_decisions_customer  ON ai_decisions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created   ON ai_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_category  ON ai_decisions(category);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_severity  ON ai_decisions(severity);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_outcome   ON ai_decisions(outcome);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_decision     ON ai_alerts(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_severity     ON ai_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_created      ON ai_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_unresolved   ON ai_alerts(created_at DESC) WHERE resolved_at IS NULL;
`.trim();

// RLS SQL
const enableRlsAndPoliciesSql = `
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts    ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_decisions_service_all ON ai_decisions;
DROP POLICY IF EXISTS ai_alerts_service_all ON ai_alerts;
DROP POLICY IF EXISTS ai_decisions_self_read ON ai_decisions;
CREATE POLICY ai_decisions_service_all ON ai_decisions FOR ALL USING (true);
CREATE POLICY ai_alerts_service_all ON ai_alerts FOR ALL USING (true);
CREATE POLICY ai_decisions_self_read ON ai_decisions FOR SELECT USING (auth.uid() = customer_id);
`.trim();

// Check if table already exists
async function tableExists(tableName) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
    headers
  });
  return res.status !== 404;
}

// Execute raw SQL via POST to a dummy RPC call that errors out
// But we can use the fact that the REST API can INSERT with service role
// Instead, let's use a different approach: POSTGRES function approach

async function execSql(sql) {
  // Supabase doesn't expose raw SQL exec via REST, but we can work around it.
  // We'll use the pg_* endpoint approach or just call individual statements.
  // For complex multi-statement, we use the RPC approach with a dummy function.
  const encoded = Buffer.from(sql).toString('base64');

  // Use the sql endpoint via management API (project-level)
  const response = await fetch(`${SUPABASE_URL}/sql/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL exec failed (${response.status}): ${text}`);
  }
  return response.json();
}

// Simpler approach: use Supabase's direct table creation via REST API
// Check existing tables and create if needed

async function createTableIfNotExists() {
  console.log('Checking existing tables...');

  // Check ai_decisions
  const decisionsExists = await tableExists('ai_decisions');
  if (decisionsExists) {
    console.log('✓ ai_decisions table already exists');
  } else {
    console.log('Creating ai_decisions table...');
    // Use direct POST to create table via SQL function
    // We'll create using RPC exec approach
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_catalog.pg_extension_config_dump`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ extname: 'pg_stat_statements' })
    });
    console.log(`ai_decisions creation attempted (API status: ${createRes.status})`);
  }

  const alertsExists = await tableExists('ai_alerts');
  if (alertsExists) {
    console.log('✓ ai_alerts table already exists');
  } else {
    console.log('Creating ai_alerts table...');
  }
}

// NOTE: Supabase REST API doesn't support raw SQL execution directly.
// We need to use the Supabase CLI or management API.
// Let's try a different approach using the management endpoint.

async function runMigrationViaPostgrest(sql) {
  // The Supabase PostgREST doesn't support DDL directly.
  // We need the management API or supabase CLI.
  // Let's try using the project management endpoint
  const response = await fetch(`https://awzczbaarskqjgdatefv.supabase.co/project-v1/database/query`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });
  return response;
}

// Alternative: use a simple approach where we create the tables by
// using the supabase-js client directly via REST calls for each table

async function main() {
  console.log('='.repeat(60));
  console.log('AI DECISIONS & ALERTS MIGRATION');
  console.log('='.repeat(60));
  console.log(`Project: awzczbaarskqjgdatefv`);
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('');

  // First verify we can connect
  console.log('Verifying connection...');
  try {
    const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?limit=1`, { headers });
    if (verifyRes.ok) {
      console.log('✓ Connected to Supabase database (service role)');
    } else {
      console.log(`✗ Connection failed: ${verifyRes.status}`);
      process.exit(1);
    }
  } catch (e) {
    console.log(`✗ Connection error: ${e.message}`);
    process.exit(1);
  }

  console.log('');
  console.log('Checking existing tables...');

  const decisionsExists = await tableExists('ai_decisions');
  const alertsExists = await tableExists('ai_alerts');

  console.log(`  ai_decisions: ${decisionsExists ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ai_alerts:    ${alertsExists ? 'EXISTS' : 'MISSING'}`);

  if (decisionsExists && alertsExists) {
    console.log('\n✓ Both tables already exist. Migration complete.');
    process.exit(0);
  }

  // We need to create tables
  // Supabase REST API cannot execute DDL, so we need CLI or management API
  console.log('\n⚠ Tables need to be created.');
  console.log('Supabase REST API does not support raw DDL statements.');
  console.log('');
  console.log('Please run the following commands locally:');
  console.log('');
  console.log('  # Install Supabase CLI if not already installed');
  console.log('  npm install -g supabase');
  console.log('');
  console.log('  # Link to your Supabase project');
  console.log('  supabase login');
  console.log('  supabase link --project-ref awzczbaarskqjgdatefv');
  console.log('');
  console.log('  # Apply the migration (from project root)');
  console.log('  supabase db execute --file supabase/migrations/00003_ai_decisions_alerts.sql');
  console.log('');
  console.log('  # Or push the full schema');
  console.log('  supabase db push');
  console.log('');
  console.log('Alternatively, you can manually run the SQL from:');
  console.log('  supabase/migrations/00003_ai_decisions_alerts.sql');
  console.log('in the Supabase SQL Editor at:');
  console.log('  https://supabase.com/dashboard/project/awzczbaarskqjgdatefv/sql');
  console.log('');
  console.log('The migration SQL creates:');
  console.log('  - ai_decisions table (persistent AI decision history)');
  console.log('  - ai_alerts table (self-healing system alerts)');
  console.log('  - 9 indexes for fast queries');
  console.log('  - RLS policies for secure access');

  // Since we can't run DDL via REST, let's exit with non-zero
  process.exit(1);
}

main().catch(e => {
  console.error('Migration script error:', e);
  process.exit(1);
});