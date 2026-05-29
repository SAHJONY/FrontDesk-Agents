// Stripe Service for FRONTDESK AGENTS
// Payment processing and subscription management

import Stripe from 'stripe'

// Lazy initialization to prevent errors when env vars are missing
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia'
    })
  }
  return stripeInstance
}

export const stripe = {
  get client() { return getStripe() },
  checkout: {
    sessions: {
      create: (params: any) => getStripe().checkout.sessions.create(params),
    },
  },
  customers: {
    list: (params: any) => getStripe().customers.list(params),
    create: (params: any) => getStripe().customers.create(params),
  },
  subscriptions: {
    retrieve: (id: string) => getStripe().subscriptions.retrieve(id),
    cancel: (id: string) => getStripe().subscriptions.cancel(id),
  },
  billingPortal: {
    sessions: {
      create: (params: any) => getStripe().billingPortal.sessions.create(params),
    },
  },
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => 
      getStripe().webhooks.constructEvent(body, signature, secret),
  },
}

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19900, // $199/month
    features: [
      'Basic AI Receptionist',
      '100 calls/month',
      'Email support',
      'Basic analytics'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 39900, // $399/month
    features: [
      'Unlimited AI Receptionist',
      '1,000 calls/month',
      'Priority support',
      'Advanced analytics',
      'SMS integration',
      'Voice mail'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79900, // $799/month
    features: [
      'Everything in Professional',
      'Unlimited calls',
      '24/7 Support',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager'
    ]
  }
}

export interface CustomerSubscription {
  id: string
  customerId: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  currentPeriodStart: string
  currentPeriodEnd: string
}

export async function createCheckoutSession(
  customerId: string,
  email: string,
  planId: string
): Promise<{ sessionId: string; url: string }> {
  const plan = PLANS[planId as keyof typeof PLANS]
  
  if (!plan) {
    throw new Error('Invalid plan')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    client_reference_id: customerId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `FrontDesk Agents - ${plan.name}`,
            description: plan.features.join(', ')
          },
          unit_amount: plan.price,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard?success=true&plan=${planId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard?canceled=true`
  })

  return { sessionId: session.id, url: session.url! }
}

export async function createCustomerPortalSession(customerId: string, email: string): Promise<{ url: string }> {
  const customers = await stripe.customers.list({ email, limit: 1 })

  let customer: any
  if (customers.data.length > 0) {
    customer = customers.data[0]
  } else {
    customer = await stripe.customers.create({
      email,
      metadata: { customerId }
    })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard`
  })

  return { url: session.url }
}

export async function getSubscription(subscriptionId: string): Promise<CustomerSubscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
    
    return {
      id: subscription.id,
      customerId: subscription.metadata?.customerId || '',
      plan: (subscription.metadata?.plan as any) || 'starter',
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    }
  } catch (error) {
    console.error('Get subscription error:', error)
    return null
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId)
    return true
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return false
  }
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  // Update customer in database with subscription info
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  // Update subscription status in database
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  // Downgrade customer to free tier
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id)
  // Send notification to customer
}