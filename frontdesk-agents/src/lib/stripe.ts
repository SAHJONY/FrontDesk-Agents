// Stripe Service for FRONTDESK AGENTS
// Payment processing and subscription management

import Stripe from 'stripe'
import { updateCustomer, getCustomerByStripeSubscriptionId, getCustomerByStripeCustomerId, createBillingRecord } from '@/lib/supabase'
import { twilioService } from '@/lib/communication/twilioService'
import type { Customer } from '@/lib/supabase'

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
    price: 9900, // $99/month — aligns with FINANCIAL_FORECAST.md
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
    price: 29900, // $299/month — aligns with FINANCIAL_FORECAST.md
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
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate',
    price: 199900, // $1,999/month — aligns with FINANCIAL_FORECAST.md
    features: [
      'Everything in Enterprise',
      'Unlimited calls',
      '24/7 phone support',
      'Custom AI training',
      'White-label options',
      'API access',
      'Dedicated account manager',
      'SLA guarantee'
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
            name: `FrontDesk Agents AI - ${plan.name}`,
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
    subscription_data: {
      metadata: {
        plan: planId,
        customerId
      }
    },
    metadata: {
      plan: planId,
      customerId
    },
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
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentSucceeded(invoice)
      break
    }
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.client_reference_id
  if (!customerId) {
    console.error('Checkout webhook missing client_reference_id:', session.id)
    return
  }

  const subscriptionId = session.subscription
  const stripeCustomerId = session.customer

  if (!subscriptionId || !stripeCustomerId) {
    console.error('Checkout webhook missing subscription or customer:', session.id)
    return
  }

  // Determine which plan was purchased from metadata
  const planId = (session.metadata?.plan as string) || 'starter'

  try {
    const result = await updateCustomer(customerId, {
      stripe_customer_id: stripeCustomerId as string,
      stripe_subscription_id: subscriptionId as string,
      plan: planId as CustomerSubscription['plan'],
      status: 'active'
    })
    if (!result) {
      console.error('Failed to update customer after checkout:', customerId)
      return
    }

    // Create billing_history record for the initial checkout
    // invoice_id is UNIQUE so this is idempotent — safe to call on every checkout.session.completed
    const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : 0
    const record = await createBillingRecord({
      customer_id: customerId,
      invoice_id: session.id, // checkout session ID serves as the invoice ID for the first payment
      subscription_id: subscriptionId as string,
      amount: amountTotal,
      currency: session.currency || 'usd',
      status: 'succeeded',
      description: `Initial subscription to ${planId} plan — FrontDesk Agents AI`,
      billing_reason: 'initial',
      invoice_pdf_url: (session as any).invoice_pdf || null,
      period_start: null,
      period_end: null
    })

    if (!record) {
      console.error('Failed to create billing_history record for checkout session:', session.id)
    } else {
      console.log('Billing record created — customer:', customerId, 'invoice:', session.id, 'amount:', amountTotal)
    }

    console.log('Checkout completed - customer provisioned:', customerId, 'plan:', planId)
  } catch (error) {
    console.error('Error handling checkout complete:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  try {
    const customer = await getCustomerByStripeSubscriptionId(subscriptionId)

    if (!customer) {
      console.error('Subscription updated - no customer found for subscription:', subscriptionId)
      return
    }

    // Map Stripe status to our customer status
    let status: Customer['status']
    switch (subscription.status) {
      case 'active':
      case 'trialing':
        status = 'active'
        break
      case 'past_due':
        status = 'past_due'
        break
      case 'canceled':
      case 'unpaid':
        status = 'past_due'
        break
      default:
        status = 'active'
    }

    // Determine plan from subscription metadata
    const planFromMetadata = subscription.metadata?.plan as string | undefined
    const planId = planFromMetadata || customer.plan
    const plan = planId as Customer['plan']

    await updateCustomer(customer.id, {
      plan,
      status,
      stripe_subscription_id: subscriptionId
    })

    console.log('Subscription updated - customer synced:', customer.id, 'status:', status, 'plan:', plan)
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  try {
    const customer = await getCustomerByStripeSubscriptionId(subscriptionId)

    if (!customer) {
      console.error('Subscription deleted - no customer found for subscription:', subscriptionId)
      return
    }

    await updateCustomer(customer.id, {
      stripe_subscription_id: null,
      plan: 'starter',
      status: 'cancelled'
    })

    console.log('Subscription deleted - customer downgraded:', customer.id)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string
  // subscriptionId not available directly on Invoice type in this Stripe API version

  console.log('Payment succeeded - invoice:', invoice.id, 'customer:', stripeCustomerId, 'amount:', invoice.amount_paid)

  try {
    // Find customer by Stripe customer ID
    const customer = await getCustomerByStripeCustomerId(stripeCustomerId)

    if (!customer) {
      console.error('Payment succeeded - no customer found for Stripe customer:', stripeCustomerId)
      return
    }

    // Record the payment in billing history
    const record = await createBillingRecord({
      customer_id: customer.id,
      invoice_id: invoice.id,
      subscription_id: customer.stripe_subscription_id || null,
      amount: invoice.amount_paid,
      currency: invoice.currency || 'usd',
      status: 'succeeded',
      description: `Payment of ${(invoice.amount_paid / 100).toFixed(2)} ${(invoice.currency || 'usd').toUpperCase()} for ${invoice.billing_reason || 'subscription'}`,
      billing_reason: invoice.billing_reason || null,
      invoice_pdf_url: invoice.invoice_pdf || null,
      period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null
    })

    if (!record) {
      console.error('Failed to create billing history record for invoice:', invoice.id)
    } else {
      console.log('Payment recorded in billing history:', record.id, 'customer:', customer.id, 'amount:', invoice.amount_paid)
    }

    // If customer was past_due, restore to active
    if (customer.status === 'past_due') {
      await updateCustomer(customer.id, { status: 'active' })
      console.log('Payment succeeded - customer restored to active:', customer.id)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string
  // Customer lookup via Stripe customer ID is sufficient

  console.warn('Payment failed - invoice:', invoice.id, 'customer:', stripeCustomerId, 'amount:', invoice.amount_due)

  try {
    // Try to find by Stripe customer ID first
    let customer = await getCustomerByStripeCustomerId(stripeCustomerId)



    if (customer) {
      await updateCustomer(customer.id, {
        status: 'past_due'
      })
      console.log('Payment failed - customer flagged past_due:', customer.id)
    }

    // Send SMS notification to customer about failed payment
    if (customer && customer.phone) {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER
      if (!fromNumber) {
        console.warn('TWILIO_PHONE_NUMBER not set — skipping payment failed SMS')
      } else {
        try {
          const amount = ((invoice.amount_due || 0) / 100).toFixed(2)
          const currency = (invoice.currency || 'usd').toUpperCase()
          const message = `Payment of ${amount} ${currency} for your subscription failed. Please update your payment method to avoid service interruption. - FrontDesk`
          await twilioService.sendSMS(customer.phone, fromNumber, message)
          console.log('Payment failed SMS sent to:', customer.phone)
        } catch (smsError) {
          console.error('Failed to send payment failed SMS:', smsError)
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}