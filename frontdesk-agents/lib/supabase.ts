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
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trial' | 'suspended'
  created_at: string
  updated_at: string
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
  type: 'inbound' | 'outbound' | 'ai'
  duration: number
  status: 'completed' | 'missed' | 'voicemail'
  revenue: number
  created_at: string
}

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