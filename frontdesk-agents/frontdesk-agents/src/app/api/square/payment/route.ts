import { NextRequest, NextResponse } from 'next/server'
import { processSquarePayment, chargeCustomer, PLAN_PRICES } from '@/lib/square'

// POST - Process a payment (for in-app card processing with Square Web Payments SDK)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceId, customerId, planId, billing } = body

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Missing required field: sourceId (card nonce)' },
        { status: 400 }
      )
    }

    if (!planId || !billing) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, billing' },
        { status: 400 }
      )
    }

    const priceData = PLAN_PRICES[planId]
    if (!priceData) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const amount = billing === 'yearly' ? priceData.yearly : priceData.monthly

    // Check if Square is configured
    const squareToken = process.env.SQUARE_ACCESS_TOKEN
    if (!squareToken || squareToken === 'your_square_access_token') {
      // Demo mode
      return NextResponse.json({
        success: true,
        provider: 'square',
        demo: true,
        paymentId: `sq_demo_${Date.now()}`,
        receiptUrl: null,
        amount,
        currency: 'USD',
        plan: priceData.name,
        message: 'Demo mode - Square not configured',
      })
    }

    // Process payment with Square
    let result
    if (customerId) {
      // Charge existing customer
      result = await chargeCustomer({
        customerId,
        amount,
        planId,
        billing,
      })
    } else {
      // Process one-time payment with card nonce
      result = await processSquarePayment({
        sourceId,
        amount,
        customerId,
        planId,
        billing,
      })
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      provider: 'square',
      paymentId: result.paymentId,
      receiptUrl: result.receiptUrl,
      amount,
      currency: 'USD',
      plan: priceData.name,
    })
  } catch (error: any) {
    console.error('Square payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    )
  }
}