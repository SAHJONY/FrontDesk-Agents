import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PLANS } from '@/lib/plans'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    const displayPrice = plan.price / 100
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Early-bird coupon: 10% off first 3 months
    const earlyBirdCouponId = process.env.STRIPE_EARLYBIRD_COUPON_ID

    const sessionConfig: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FrontDesk Agents AI - ${plan.name}`,
              description: `$${displayPrice}/mo - AI Receptionist ${plan.name} Plan`,
            },
            unit_amount: plan.price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        planId,
        planName: plan.name,
      },
      success_url: `${origin}/pricing?success=true&plan=${planId}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    }

    // Apply early-bird coupon if configured
    if (earlyBirdCouponId) {
      sessionConfig.discounts = [{ coupon: earlyBirdCouponId }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
