// Customer Authentication Service
// Handles customer signup, login, logout with Supabase Auth

import { createClient } from '@/lib/supabase-client'
import { cookies } from 'next/headers'
import type { Customer } from '@/lib/supabase'

const CUSTOMER_SESSION_COOKIE = 'customer_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

export interface CustomerSession {
  id: string
  email: string
  businessName: string
  ownerName: string
  plan: 'starter' | 'professional' | 'enterprise'
  customerId: string
  authenticated: boolean
  loginTime: string
}

export async function signUpCustomer(
  email: string,
  password: string,
  businessName: string,
  ownerName: string,
  industry: string
): Promise<{ success: boolean; session?: CustomerSession; error?: string }> {
  try {
    const supabase = await createClient()

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
          owner_name: ownerName,
          industry
        }
      }
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Create customer record in database
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        id: authData.user.id,
        email,
        business_name: businessName,
        owner_name: ownerName,
        phone: '',
        plan: 'starter',
        status: 'trial'
      })
      .select()
      .single()

    if (customerError) {
      console.error('Customer creation error:', customerError)
      // Continue anyway - customer record can be created later
    }

    // Create session
    const session: CustomerSession = {
      id: authData.user.id,
      email,
      businessName,
      ownerName,
      plan: 'starter',
      customerId: authData.user.id,
      authenticated: true,
      loginTime: new Date().toISOString()
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(CUSTOMER_SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/'
    })

    return { success: true, session }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signInCustomer(
  email: string,
  password: string
): Promise<{ success: boolean; session?: CustomerSession; error?: string }> {
  try {
    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to sign in' }
    }

    // Get customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Customer fetch error:', customerError)
    }

    // Create session
    const session: CustomerSession = {
      id: authData.user.id,
      email: authData.user.email || email,
      businessName: customerData?.business_name || '',
      ownerName: customerData?.owner_name || '',
      plan: customerData?.plan || 'starter',
      customerId: authData.user.id,
      authenticated: true,
      loginTime: new Date().toISOString()
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(CUSTOMER_SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/'
    })

    return { success: true, session }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signOutCustomer(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete(CUSTOMER_SESSION_COOKIE)

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    // Still try to clear cookie
    const cookieStore = await cookies()
    cookieStore.delete(CUSTOMER_SESSION_COOKIE)
    return { success: true }
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(CUSTOMER_SESSION_COOKIE)

    if (!sessionCookie) {
      return null
    }

    const session: CustomerSession = JSON.parse(sessionCookie.value)
    // Validate authenticated flag (same pattern as owner-session)
    return session?.authenticated ? session : null
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function requireCustomerAuth(): Promise<{ authorized: boolean; session?: CustomerSession; error?: string }> {
  const session = await getCustomerSession()

  if (!session) {
    return { authorized: false, error: 'Not authenticated' }
  }

  if (!session.authenticated) {
    return { authorized: false, error: 'Session not authenticated' }
  }

  return { authorized: true, session }
}

export async function updateCustomerProfile(
  customerId: string,
  updates: {
    business_name?: string
    owner_name?: string
    phone?: string
  }
): Promise<{ success: boolean; customer?: Customer; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, customer: data }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}