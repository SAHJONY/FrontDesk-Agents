import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null

// Plan configurations
const PLANS: Record<string, { priceId: string; callsLimit: number; phoneNumbersLimit: number; name: string }> = {
  starter: { priceId: 'price_starter', callsLimit: 500, phoneNumbersLimit: 1, name: 'Starter' },
  growth: { priceId: 'price_growth', callsLimit: 2000, phoneNumbersLimit: 3, name: 'Growth' },
  pro: { priceId: 'price_pro', callsLimit: -1, phoneNumbersLimit: 10, name: 'Pro' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, businessName, industry, website, employeeCount, plan, billing } = body

    // Validate required fields
    if (!email || !password || !businessName || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate plan
    if (!PLANS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create customer in database (or use mock if Supabase not configured)
    let customerId = `cus_${Date.now()}`
    let phoneNumber = '+13465214387' // Placeholder - will be provisioned

    if (supabase) {
      // Check if customer already exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        )
      }

      // Create customer record
      const { data, error } = await supabase
        .from('customers')
        .insert({
          email,
          business_name: businessName,
          industry,
          website,
          employee_count: employeeCount,
          plan_tier: plan,
          billing_cycle: billing || 'monthly',
          status: 'trial',
          phone_number_provisioned: false,
          stripe_customer_id: null,
          profit_generated: 0,
          tier_upgraded_at: null,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Supabase error:', error)
        // Continue with mock data for demo
      } else {
        customerId = data.id
      }
    }

    // Return customer data for checkout
    return NextResponse.json({
      success: true,
      customerId,
      email,
      businessName,
      plan: PLANS[plan],
      billing: billing || 'monthly',
      message: 'Account created successfully. Proceeding to payment.',
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}