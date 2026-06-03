import { NextRequest, NextResponse } from 'next/server'
import { PLAN_PRICES } from '@/lib/square'

// Profit thresholds for auto-upgrade (trigger when profit exceeds this)
const AUTO_UPGRADE_THRESHOLDS: Record<string, number> = {
  starter: 3000,   // Upgrade to growth after $3,000 profit
  growth: 10000,   // Upgrade to pro after $10,000 profit
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, billing, customerId, email } = body

    if (!planId || !billing || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // In production, create Stripe Checkout Session
    // For now, return mock success that simulates Stripe redirect
    const isYearly = billing === 'yearly'
    const amount = isYearly ? priceData.yearly : priceData.monthly

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY
    
    if (stripeKey && stripeKey !== 'your_stripe_secret_key') {
      // In production, use Stripe API to create checkout session
      // const stripe = require('stripe')(stripeKey)
      // const session = await stripe.checkout.sessions.create({...})
      
      // For now, return mock redirect
      return NextResponse.json({
        success: true,
        url: `/customer/dashboard?checkout=success&plan=${planId}&billing=${billing}`,
        sessionId: `cs_demo_${Date.now()}`,
      })
    }

    // Demo mode - skip Stripe and go directly to dashboard
    return NextResponse.json({
      success: true,
      url: `/customer/dashboard?welcome=true&customerId=${customerId}&plan=${planId}&billing=${billing}`,
      sessionId: `cs_demo_${Date.now()}`,
      demo: true,
    })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}