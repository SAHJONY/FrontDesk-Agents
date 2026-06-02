// Square Checkout API Route
// POST /api/square/checkout - Process Square payment

import { NextResponse } from 'next/server'
import { processSquarePayment, SQUARE_PLANS } from '@/lib/square'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sourceId, customerId, email, planId } = body

    if (!sourceId || !customerId || !email || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceId, customerId, email, planId' },
        { status: 400 }
      )
    }

    const plan = SQUARE_PLANS[planId as keyof typeof SQUARE_PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Process the payment via Square
    const result = await processSquarePayment(
      sourceId,
      customerId,
      email,
      planId,
      plan.name
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment processing failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      plan: planId
    })

  } catch (error: any) {
    console.error('Square checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}