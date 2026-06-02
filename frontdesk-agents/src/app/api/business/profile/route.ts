// Business Profile API Route
// GET/PUT /api/business/profile - Get or update business profile

import { NextRequest, NextResponse } from 'next/server'
import { requireCustomerAuth, updateCustomerProfile } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const { authorized, session, error } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supabaseAdmin } = await import('@/lib/supabase')

    if (!supabaseAdmin) {
      // Return mock profile if Supabase not configured
      return NextResponse.json({
        profile: {
          id: session.customerId,
          email: session.email,
          business_name: session.businessName,
          owner_name: session.ownerName,
          plan: session.plan,
          phone: '+1 (555) 123-4567',
          status: 'active',
          created_at: new Date().toISOString()
        }
      })
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', session.customerId)
      .single()

    if (dbError) {
      console.error('Profile fetch error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authorized, session, error } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const result = await updateCustomerProfile(session.customerId, updates)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, profile: result.customer })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}