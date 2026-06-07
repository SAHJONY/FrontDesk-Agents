// Square Payment Service for FRONTDESK AGENTS
// Payment processing and subscription management via Square

import { SquareClient, SquareEnvironment } from 'square'

// Lazy initialization to prevent errors when env vars are missing
let squareClient: SquareClient | null = null

export function getSquareClient(): SquareClient {
  if (!squareClient) {
    const token = process.env.SQUARE_ACCESS_TOKEN
    if (!token) {
      throw new Error('SQUARE_ACCESS_TOKEN is not configured')
    }
    
    // Use SquareEnvironment.Sandbox for testing, Production for live
    const environment = process.env.NODE_ENV === 'production' 
      ? SquareEnvironment.Production 
      : SquareEnvironment.Sandbox

    squareClient = new SquareClient({
      token,
      environment
    })
  }
  return squareClient
}

export const square = {
  get client() { return getSquareClient() },
  
  // Payment operations
  payments: {      create: async (params: {
      sourceId: string
      amountMoney: { amount: number; currency: string }
      idempotencyKey: string
      referenceId?: string
      note?: string
    }) => {
      const client = getSquareClient()
      const response = await client.payments.create({
        sourceId: params.sourceId,
        amountMoney: {
          amount: BigInt(params.amountMoney.amount),
          currency: params.amountMoney.currency as any
        },
        idempotencyKey: params.idempotencyKey,
        referenceId: params.referenceId,
        note: params.note
      })
      return response
    },
    
    get: async (paymentId: string) => {
      const client = getSquareClient()
      const response = await client.payments.get({ paymentId })
      return response.payment
    },
    
    list: async (limit?: number) => {
      const client = getSquareClient()
      const response = await client.payments.list({ limit: limit || 100 })
      // Square SDK v44+ returns an async iterable, collect into array
      const payments: any[] = []
      for await (const payment of response) {
        payments.push(payment)
      }
      return payments
    }
  },
  
  // Customer operations
  customers: {
    create: async (params: {
      idempotencyKey: string
      emailAddress?: string
      givenName?: string
      familyName?: string
      referenceId?: string
    }) => {
      const client = getSquareClient()
      return await client.customers.create({
        idempotencyKey: params.idempotencyKey,
        emailAddress: params.emailAddress,
        givenName: params.givenName,
        familyName: params.familyName,
        referenceId: params.referenceId
      } as any)
    },
    
    get: async (customerId: string) => {
      const client = getSquareClient()
      const response = await client.customers.get({ customerId })
      return response.customer
    },
    
    search: async (email: string) => {
      const client = getSquareClient()
      const response = await client.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: email
            }
          }
        }
      })
      return response
    }
  },
  
  // Subscription operations (via Square Orders + Recurring)
  subscriptions: {
    create: async (params: {
      idempotencyKey: string
      locationId: string
      customerId: string
      priceMoney: { amount: number; currency: string }
    }) => {
      const client = getSquareClient()
      // Square SDK v44+ uses phase-based subscriptions
      return await client.subscriptions.create({
        idempotencyKey: params.idempotencyKey,
        locationId: params.locationId,
        customerId: params.customerId,
        phases: [{
          ordinal: 0,
          lines: [{
            name: 'Base Plan',
            basePriceMoney: params.priceMoney
          }]
        }]
      } as any)
    },
    
    get: async (subscriptionId: string) => {
      const client = getSquareClient()
      const response = await client.subscriptions.get({ subscriptionId })
      return response.subscription
    },
    
    cancel: async (subscriptionId: string) => {
      const client = getSquareClient()
      const response = await client.subscriptions.cancel({ subscriptionId })
      return response.subscription
    },
    
    pause: async (subscriptionId: string) => {
      const client = getSquareClient()
      const response = await client.subscriptions.pause({
        subscriptionId,
        pauseUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } as any)
      return response.subscription
    }
  },
  
  // Catalog operations (for products/plans) - simplified for SDK v44.1.0
  catalog: {
    list: async () => {
      // Catalog listing requires Square SDK v44+ specific patterns
      // For now, return empty array - catalog is not critical for payments
      return []
    },
    
    get: async (objectId: string) => {
      // Catalog retrieval not critical for basic payment processing
      return null
    }
  },
  
  // Webhook verification
  webhooks: {
    verifySignature: (body: string, signature: string, signatureKey: string, notificationUrl: string): boolean => {
      // Square webhook signature verification
      // In production, use Square's webhook signature verification
      if (!signature || !signatureKey) return false
      
      // For development, accept if signature exists
      // In production, implement proper HMAC verification
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', signatureKey)
        .update(body)
        .digest('base64')
      
      return signature === expectedSignature
    }
  }
}

// Square Plans matching Stripe PLANS
export const SQUARE_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 11900, // $199/month in cents
    priceMoney: { amount: 11900, currency: 'USD' },
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
    price: 34900, // $399/month in cents
    priceMoney: { amount: 34900, currency: 'USD' },
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
    price: 119900, // $7,199/month in cents
    priceMoney: { amount: 119900, currency: 'USD' },
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

// Square environment/connection status
export async function getSquareStatus(): Promise<{
  connected: boolean
  environment: string
  paymentsEnabled: boolean
  subscriptionsEnabled: boolean
}> {
  try {
    const client = getSquareClient()
    // Try to list payments to verify connection
    await client.payments.list()
    
    return {
      connected: true,
      environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox',
      paymentsEnabled: true,
      subscriptionsEnabled: true
    }
  } catch (error: any) {
    console.error('Square connection error:', error?.message || error)
    return {
      connected: false,
      environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox',
      paymentsEnabled: false,
      subscriptionsEnabled: false
    }
  }
}

// Process Square checkout
export async function createSquareCheckoutSession(
  customerId: string,
  email: string,
  planId: string
): Promise<{ checkoutUrl: string; paymentId?: string }> {
  const plan = SQUARE_PLANS[planId as keyof typeof SQUARE_PLANS]
  
  if (!plan) {
    throw new Error('Invalid plan')
  }

  // For Square checkout, we create a checkout page via Square Web Payments SDK
  // The frontend will use Square's Web Payments SDK to tokenize the card
  // and then send the token to process the payment
  
  // In this implementation, we return a checkout session info
  // The actual payment processing happens client-side with Square's SDK
  return {
    checkoutUrl: `/customer/dashboard?square=true&plan=${planId}`,
    paymentId: undefined
  }
}

// Process Square payment (server-side after client tokenizes card)
export async function processSquarePayment(
  sourceId: string,     // Card nonce from Square Web Payments SDK
  customerId: string,
  email: string,
  planId: string,
  planName: string
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const plan = SQUARE_PLANS[planId as keyof typeof SQUARE_PLANS]
    
    if (!plan) {
      return { success: false, error: 'Invalid plan' }
    }

    // Find or create Square customer
    let squareCustomer: any
    const searchResponse = await square.customers.search(email)
    
    const customersList = (searchResponse as any)?.customers || []
    if (customersList.length > 0) {
      squareCustomer = customersList[0]
    } else {
      const createResponse = await square.customers.create({
        idempotencyKey: `customer-${customerId}-${Date.now()}`,
        emailAddress: email,
        referenceId: customerId
      })
      squareCustomer = (createResponse as any).customer
    }

    // Create payment
    const paymentResponse = await square.payments.create({
      sourceId,
      amountMoney: plan.priceMoney,
      idempotencyKey: `payment-${customerId}-${planId}-${Date.now()}`,
      referenceId: customerId,
      note: `FrontDesk Agents AI - ${planName} Plan`
    })

    return {
      success: true,
      paymentId: paymentResponse.payment?.id
    }
  } catch (error: any) {
    console.error('Square payment error:', error?.message || error)
    return {
      success: false,
      error: error?.message || 'Payment processing failed'
    }
  }
}

// Cancel Square subscription
export async function cancelSquareSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await square.subscriptions.cancel(subscriptionId)
    return true
  } catch (error) {
    console.error('Cancel Square subscription error:', error)
    return false
  }
}

// Get Square subscription
export async function getSquareSubscription(subscriptionId: string): Promise<any> {
  try {
    return await square.subscriptions.get(subscriptionId)
  } catch (error) {
    console.error('Get Square subscription error:', error)
    return null
  }
}

// Types for Square responses
export interface SquarePayment {
  id: string
  status: 'COMPLETED' | 'APPROVED' | 'PENDING' | 'FAILED' | 'CANCELED'
  amountMoney: { amount: number; currency: string }
  sourceType: string
  cardDetails?: any
  createdAt: string
}

export interface SquareCustomer {
  id: string
  emailAddress?: string
  givenName?: string
  familyName?: string
  referenceId?: string
  createdAt: string
}

export interface SquareSubscription {
  id: string
  customerId: string
  locationId: string
  planId: string
  status: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED'
  startDate: string
  canceledAt?: string
}

// Error type for Square API errors
export type SquareApiError = Error & { status?: number; body?: any }