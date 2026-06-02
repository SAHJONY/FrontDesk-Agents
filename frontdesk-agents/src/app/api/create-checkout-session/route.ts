import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PRICE_MAP: Record<string, { name: string; price: number; displayPrice: number }> = {
  starter: { name: 'Starter', price: 9900, displayPrice: 99 },
  growth: { name: 'Growth', price: 14900, displayPrice: 149 },
  pro: { name: 'Pro', price: 29900, displayPrice: 299 },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body

    if (!planId || !PRICE_MAP[planId]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const plan = PRICE_MAP[planId]
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FrontDesk Agents AI - ${plan.name}`,
              description: `$${plan.displayPrice}/mo - AI Receptionist ${plan.name} Plan`,
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
      customer_creation: 'always',
      success_url: `${origin}/pricing?success=true&plan=${planId}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
