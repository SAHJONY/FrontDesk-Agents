/**
 * Stripe Configuration - Test Mode
 * Switch to live mode by updating STRIPE_MODE env var
 */

import Stripe from 'stripe'

const stripeConfig = {
  apiKey: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY || '',
  apiVersion: '2024-06-20',
}

export const stripe = new Stripe(stripeConfig.apiKey, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const isTestMode = process.env.STRIPE_MODE === 'test' || !process.env.STRIPE_MODE

// Test mode card numbers for testing
export const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  threeDSecure: '4000002760003184',
  authenticationRequired: '4000002500003155',
}

// Pricing tiers
export const pricingTiers = {
  free: {
    id: 'price_free_tier',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Basic AI Receptionist', '100 calls/month', 'Email support'],
  },
  pro: {
    id: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_monthly',
    name: 'Pro',
    price: 299,
    interval: 'month',
    features: ['Unlimited AI Receptionist', '1,000 calls/month', 'Priority support', 'Advanced analytics'],
  },
  enterprise: {
    id: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise_monthly',
    name: 'Enterprise',
    price: 2999,
    interval: 'month',
    features: ['Everything in Pro', 'Unlimited calls', '6 Enterprise Modules', 'Autonomous Harness', '24/7 Support', 'Custom integrations'],
  },
}

export async function createSubscription(customerId: string, priceId: string) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
    }
  } catch (error: any) {
    console.error('Stripe subscription error:', error)
    throw error
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        platform: 'frontdesk-agents',
        mode: isTestMode ? 'test' : 'live',
      },
    })

    return {
      customerId: customer.id,
    }
  } catch (error: any) {
    console.error('Stripe customer creation error:', error)
    throw error
  }
}

export async function getCustomerByUserId(userId: string) {
  const customers = await stripe.customers.list({
    metadata: {
      frontdesk_user_id: userId,
    },
    limit: 1,
  })

  return customers.data[0] || null
}
