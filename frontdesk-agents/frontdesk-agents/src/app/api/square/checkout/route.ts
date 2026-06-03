import { NextRequest, NextResponse } from 'next/server'
import { createSquareCheckout, PLAN_PRICES } from '@/lib/square'

// GET - Get available plans and pricing
export async function GET(request: NextRequest) {
  try {
    const squareConfigured = process.env.SQUARE_ACCESS_TOKEN && 
                              process.env.SQUARE_ACCESS_TOKEN !== 'your_square_access_token'

    return NextResponse.json({
      provider: 'square',
      configured: squareConfigured,
      plans: PLAN_PRICES,
      features: [
        'PCI-compliant payments',
        'Instant payment processing',
        'Automatic receipt generation',
        'Subscription management',
        'Invoice generation',
      ],
    })
  } catch (error: any) {
    console.error('Square checkout GET error:', error)
    return NextResponse.json({ error: 'Failed to get checkout info' }, { status: 500 })
  }
}

// POST - Create Square checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, billing, customerId, email } = body

    if (!planId || !billing) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, billing' },
        { status: 400 }
      )
    }

    // Validate plan
    const priceData = PLAN_PRICES[planId]
    if (!priceData) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose starter, growth, or pro' },
        { status: 400 }
      )
    }

    // Check if Square is configured
    const squareToken = process.env.SQUARE_ACCESS_TOKEN
    if (!squareToken || squareToken === 'your_square_access_token') {
      // Demo mode - return mock success
      const amount = billing === 'yearly' ? priceData.yearly : priceData.monthly
      return NextResponse.json({
        success: true,
        provider: 'square',
        demo: true,
        url: `/customer/dashboard?checkout=success&plan=${planId}&billing=${billing}&provider=square`,
        checkoutId: `sq_demo_${Date.now()}`,
        amount,
        currency: 'USD',
        plan: priceData.name,
        message: 'Demo mode - Square not configured',
      })
    }

    // Create real Square checkout
    const checkout = await createSquareCheckout({
      customerId,
      customerEmail: email,
      planId,
      billing,
    })

    if (!checkout) {
      return NextResponse.json(
        { error: 'Failed to create Square checkout session' },
        { status: 500 }
      )
    }

    const amount = billing === 'yearly' ? priceData.yearly : priceData.monthly

    return NextResponse.json({
      success: true,
      provider: 'square',
      url: checkout.url,
      checkoutId: checkout.checkoutId,
      amount,
      currency: 'USD',
      plan: priceData.name,
    })
  } catch (error: any) {
    console.error('Square checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}