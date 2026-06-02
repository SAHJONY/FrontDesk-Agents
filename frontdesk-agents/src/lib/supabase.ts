import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase Client Configuration
// FRONTDESK AGENTS Native System 100%
// ==========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Only create clients if credentials are available
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Type definitions for database tables
export interface Customer {
  id: string
  email: string
  business_name: string
  owner_name: string
  phone: string
  industry: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled'
  onboarding_status: 'pending' | 'in_progress' | 'completed'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface BillingRecord {
  id: string
  customer_id: string
  invoice_id: string
  subscription_id: string | null
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'refunded' | 'pending'
  description: string
  billing_reason: string | null
  invoice_pdf_url: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
}

export async function createBillingRecord(
  record: Omit<BillingRecord, 'id' | 'created_at'>
): Promise<BillingRecord | null> {
  if (!supabaseAdmin) return null

  // Check if a billing record for this invoice already exists (idempotency)
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('billing_history')
    .select()
    .eq('invoice_id', record.invoice_id)
    .maybeSingle()

  if (lookupError) {
    console.error('Error checking existing billing record:', lookupError)
    return null
  }

  if (existing) {
    return existing as BillingRecord
  }

  const { data, error } = await supabaseAdmin
    .from('billing_history')
    .insert(record)
    .select()
    .single()
  if (error) return null
  return data as BillingRecord
}

export interface BusinessMetrics {
  id: string
  customer_id: string
  total_calls: number
  total_sms: number
  total_revenue: number
  ai_accuracy: number
  active_agents: number
  satisfaction_score: number
  period: 'daily' | 'weekly' | 'monthly'
  created_at: string
}

export interface CallRecord {
  id: string
  customer_id: string
  caller: string
  name: string
  type: 'inbound' | 'outbound' | 'ai'
  duration: number
  status: 'completed' | 'missed' | 'voicemail' | 'transferred' | 'failed'
  revenue: number
  intent: string
  notes: string
  created_at: string
}
export type { AiAgentRow, ReportRow, CustomerPhoneRow, PhoneServiceRow, CallerProfileRow, FaqRow, ServiceRow, HarnessLearningRow } from '@/lib/database.types'
export type { CustomerInsert, BusinessMetricsInsert, CallRecordInsert } from '@/lib/database.types'

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
}

// Database helper functions with null checks
export async function getCustomer(customerId: string): Promise<Customer | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()
  
  if (error) return null
  return data as Customer
}

export async function getCustomerMetrics(customerId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<BusinessMetrics | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('business_metrics')
    .select('*')
    .eq('customer_id', customerId)
    .eq('period', period)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) return null
  return data as BusinessMetrics
}

export async function getCallHistory(customerId: string, limit = 50): Promise<CallRecord[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('call_records')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) return []
  return (data as CallRecord[]) || []
}
export interface BillingRecordWithCustomer extends BillingRecord {
  customer_email?: string
  customer_name?: string
  business_name?: string
}

export async function getBillingHistory(customerId: string, limit = 50): Promise<BillingRecord[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('billing_history')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching billing history:', error)
    return []
  }
  return (data as BillingRecord[]) || []
}

export async function getAllBillingRecords(limit = 100, offset = 0): Promise<BillingRecordWithCustomer[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('billing_history')
    .select('*, customers!inner(email, business_name, owner_name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching all billing records:', error)
    return []
  }

  return (data as any[]).map((r) => ({
    ...r,
    customer_email: r.customers?.email || '',
    customer_name: r.customers?.owner_name || r.customers?.business_name || '',
    business_name: r.customers?.business_name || '',
  }))
}

export async function getCustomerByStripeSubscriptionId(subscriptionId: string): Promise<Customer | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()
  if (error) return null
  return data as Customer
}

export async function getCustomerByStripeCustomerId(stripeCustomerId: string): Promise<Customer | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()
  if (error) return null
  return data as Customer
}

export async function updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', customerId)
    .select()
    .single()
  
  if (error) return null
  return data as Customer
}

// Create new customer
export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert(customer)
    .select()
    .single()
  
  if (error) return null
  return data as Customer
}

// Record call/SMS activity
export async function recordCall(call: Omit<CallRecord, 'id' | 'created_at'>): Promise<CallRecord | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('call_records')
    .insert(call)
    .select()
    .single()
  
  if (error) return null
  return data as CallRecord
}

// Update business metrics
export async function updateBusinessMetrics(customerId: string, period: 'daily' | 'weekly' | 'monthly', metrics: Partial<BusinessMetrics>): Promise<BusinessMetrics | null> {
  if (!supabaseAdmin) return null
  
  // Check if record exists
  const existing = await getCustomerMetrics(customerId, period)
  
  if (existing) {
    // Update existing
    const { data, error } = await supabaseAdmin
      .from('business_metrics')
      .update(metrics)
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) return null
    return data as BusinessMetrics
  } else {
    // Create new
    const { data, error } = await supabaseAdmin
      .from('business_metrics')
      .insert({ ...metrics, customer_id: customerId, period })
      .select()
      .single()
    
    if (error) return null
    return data as BusinessMetrics
  }
}