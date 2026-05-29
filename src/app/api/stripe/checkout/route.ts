// Stripe Checkout API Route
// POST /api/stripe/checkout

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { authorized, session, error } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const result = await createCheckoutSession(session.customerId, session.email, planId)

    return NextResponse.json({ success: true, url: result.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}