/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Database types
export interface User {
  id: string
  email: string
  name: string | null
  tier: string
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  status: string
  plan: string | null
  current_period_end: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  details: any
  created_at: string
}

// Helper functions
export async function createUser(email: string, name?: string) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      name: name || null,
      tier: 'free',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) throw error
  return data
}

export async function updateUserTier(userId: string, tier: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ tier })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createAuditLog(userId: string, action: string, details?: any) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      details: details || {},
    })

  if (error) throw error
}

export async function getPlatformMetrics() {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get active users (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', thirtyDaysAgo)

  // Get revenue from subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan, status')

  const monthlyRevenue = subscriptions?.reduce((acc, sub) => {
    if (sub.status === 'active') {
      const planPrice = getPlanPrice(sub.plan || '')
      return acc + planPrice
    }
    return acc
  }, 0) || 0

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    monthlyRevenue,
  }
}

function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    free: 0,
    pro: 299,
    enterprise: 2999,
  }
  return prices[plan] || 0
}
