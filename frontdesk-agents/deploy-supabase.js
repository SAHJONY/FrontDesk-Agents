#!/usr/bin/env node

/**
 * FRONTDESK AGENTS - Supabase Schema Deployment Script
 * Deploys database schema to your Supabase instance
 */

const SUPABASE_URL = 'https://btjscudzrtarfommgegw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0anNjdWR6cnRhcmZvbW1nZWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MDE0NiwiZXhwIjoyMDgzNDE2MTQ2fQ.9xLFLfV6D4ITswZ9uA3rKsVbFtE7Pj6fpv6erAa7KhM';

const fs = require('fs');
const path = require('path');

async function deploySchema() {
  console.log('🚀 Deploying FrontDesk Agents schema to Supabase...');
  console.log(`📡 Project: ${SUPABASE_URL}`);
  
  // Read SQL schema
  const schemaPath = path.join(__dirname, 'SUPABASE_SCHEMA.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  
  console.log('📄 Schema loaded, executing...');
  
  try {
    // Execute SQL via Supabase REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_command: sql })
    });
    
    if (response.ok) {
      console.log('✅ Schema deployed successfully!');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Deployment failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deploying schema:', error.message);
    console.log('\n📝 Manual deployment instructions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/btjscudzrtarfommgegw/sql_editor');
    console.log('2. Copy the contents of SUPABASE_SCHEMA.sql');
    console.log('3. Paste and run in SQL Editor');
    return false;
  }
}

// Also create a test record
async function createTestCustomer() {
  console.log('\n🧪 Creating test customer...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email: 'demo@frontdeskagents.com',
        business_name: 'FrontDesk Demo',
        owner_name: 'Demo User',
        phone: '+1234567890',
        plan: 'professional',
        status: 'active'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test customer created:', data[0].id);
      return true;
    } else {
      console.log('⚠️  Could not create test customer (may already exist)');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating test customer:', error.message);
    return false;
  }
}

// Main execution
(async () => {
  const deployed = await deploySchema();
  if (deployed) {
    await createTestCustomer();
  }
  
  console.log('\n📊 Deployment complete!');
  console.log('\n🔗 Next steps:');
  console.log('1. Check your Supabase dashboard: https://supabase.com/dashboard/project/btjscudzrtarfommgegw');
  console.log('2. Verify tables: customers, business_metrics, call_records, agents, leads');
  console.log('3. Test the API endpoints');
})();
