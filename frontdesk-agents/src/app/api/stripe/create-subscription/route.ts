/**
 * Stripe Subscription Creation API
 * Creates a new subscription for a customer
 */

import { NextResponse } from 'next/server'
import { stripe, createCustomer, createSubscription, pricingTiers } from '@/lib/stripe/config'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { email, name, plan } = await request.json()

    if (!email || !plan) {
      return NextResponse.json(
        { error: 'Email and plan are required' },
        { status: 400 }
      )
    }

    // Validate plan
    const validPlans = ['free', 'pro', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose from: free, pro, enterprise' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let customerId = await getOrCreateCustomerId(email, name)

    // Create subscription
    const priceId = pricingTiers[plan as keyof typeof pricingTiers].id
    const { subscriptionId, clientSecret } = await createSubscription(customerId, priceId)

    // Update user in database
    await supabaseAdmin
      .from('users')
      .update({ 
        stripe_customer_id: customerId,
        tier: plan
      })
      .eq('email', email)

    return NextResponse.json({
      subscriptionId,
      clientSecret,
      plan: pricingTiers[plan as keyof typeof pricingTiers],
    })
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

async function getOrCreateCustomerId(email: string, name?: string) {
  // Check if customer exists
  const existingCustomer = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomer.data.length > 0) {
    return existingCustomer.data[0].id
  }

  // Create new customer
  const { customerId } = await createCustomer(email, name)
  return customerId
}
