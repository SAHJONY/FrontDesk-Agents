// Stripe Customer Portal API Route
// POST /api/stripe/portal

import { NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/stripe'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function POST() {
  try {
    const { authorized, session, error } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await createCustomerPortalSession(session.customerId, session.email)

    return NextResponse.json({ success: true, url: result.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}