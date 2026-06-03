import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, accept any credentials
    // In production, verify against database
    let customer = {
      id: 'cus_demo_123',
      email,
      businessName: 'GlobalVoice Demo Business',
      plan: 'growth',
      status: 'active',
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        // For demo, create a mock session
        // In production, return error for invalid credentials
      } else {
        customer = {
          id: data.id,
          email: data.email,
          businessName: data.business_name,
          plan: data.plan_tier,
          status: data.status,
        }
      }
    }

    // Create session (in production, use proper JWT/session management)
    const sessionToken = Buffer.from(JSON.stringify({
      customerId: customer.id,
      email: customer.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })).toString('base64')

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        businessName: customer.businessName,
        plan: customer.plan,
        status: customer.status,
      },
    })

    // Set session cookie
    response.cookies.set('customer_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    )
  }
}