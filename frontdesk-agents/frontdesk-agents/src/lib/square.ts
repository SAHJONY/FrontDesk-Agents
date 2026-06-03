// Square Payment Integration
// Documentation: https://developer.squareup.com/docs

import { Client, Environment, ApiError } from 'square'
import { randomUUID } from 'crypto'
import crypto from 'crypto'

// Square Client Configuration
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
  environment: process.env.NODE_ENV === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
})

// Plan prices in cents (matching existing Stripe prices)
export const PLAN_PRICES: Record<string, { monthly: number; yearly: number; name: string }> = {
  starter: { 
    monthly: 9900, 
    yearly: 7900, 
    name: 'Starter Plan' 
  },
  growth: { 
    monthly: 14900, 
    yearly: 11900, 
    name: 'Growth Plan' 
  },
  pro: { 
    monthly: 29900, 
    yearly: 23900, 
    name: 'Pro Plan' 
  },
}

export interface SquareCustomer {
  id?: string
  email: string
  givenName?: string
  familyName?: string
  companyName?: string
  nickname?: string
}

export interface SquarePaymentResult {
  success: boolean
  paymentId?: string
  orderId?: string
  receiptUrl?: string
  error?: string
}

/**
 * Create or update a Square customer
 */
export async function createSquareCustomer(customerData: SquareCustomer): Promise<{ id: string } | null> {
  try {
    const response = await squareClient.customersApi.createCustomer({
      idempotencyKey: randomUUID(),
      emailAddress: customerData.email,
      givenName: customerData.givenName || customerData.email.split('@')[0],
      familyName: customerData.familyName,
      companyName: customerData.companyName,
      nickname: customerData.nickname,
    })
    
    return { id: response.result.customer?.id || '' }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Square API Error creating customer:', error.errors)
    } else {
      console.error('Error creating Square customer:', error)
    }
    return null
  }
}

/**
 * Create a checkout session (Payment Link) for Square
 */
export async function createSquareCheckout(params: {
  customerId?: string
  customerEmail?: string
  planId: string
  billing: 'monthly' | 'yearly'
}): Promise<{ url: string; checkoutId: string } | null> {
  try {
    const priceData = PLAN_PRICES[params.planId]
    if (!priceData) {
      throw new Error('Invalid plan')
    }

    const amount = params.billing === 'yearly' ? priceData.yearly : priceData.monthly
    const currency = 'USD'

    // Create a payment link
    const response = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      description: `${priceData.name} - ${params.billing === 'yearly' ? 'Annual' : 'Monthly'}`,
      amountMoney: {
        amount: amount, // Square SDK expects number/string, not BigInt
        currency,
      },
      pre_populated_data: params.customerEmail ? {
        buyerEmailAddress: params.customerEmail,
      } : undefined,
      metadata: {
        planId: params.planId,
        billing: params.billing,
        customerId: params.customerId || '',
      },
    })

    const paymentLink = response.result.paymentLink
    if (!paymentLink || !paymentLink.url) {
      throw new Error('Failed to create payment link')
    }

    return {
      url: paymentLink.url,
      checkoutId: paymentLink.id || '',
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Square API Error creating checkout:', error.errors)
    } else {
      console.error('Error creating Square checkout:', error)
    }
    return null
  }
}

/**
 * Process a payment with Square (for in-app payments)
 */
export async function processSquarePayment(params: {
  sourceId: string // Card nonce from Square Web Payments SDK
  amount: number
  currency?: string
  customerId?: string
  orderId?: string
  planId?: string
  billing?: string
}): Promise<SquarePaymentResult> {
  try {
    const idempotencyKey = randomUUID()

    // Create payment
    const response = await squareClient.paymentsApi.createPayment({
      sourceId: params.sourceId,
      idempotencyKey,
      amountMoney: {
        amount: params.amount, // Square SDK expects number, not BigInt
        currency: params.currency || 'USD',
      },
      customerId: params.customerId,
      autocomplete: true,
      referenceId: params.orderId,
      note: `GlobalVoice AI - ${params.planId || 'subscription'} - ${params.billing || 'monthly'}`,
    })

    const payment = response.result.payment
    return {
      success: true,
      paymentId: payment?.id,
      receiptUrl: payment?.receiptUrl,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      const errorMessage = error.errors?.[0]?.detail || 'Payment failed'
      console.error('Square payment error:', error.errors)
      return { success: false, error: errorMessage }
    }
    console.error('Error processing payment:', error)
    return { success: false, error: 'Payment processing failed' }
  }
}

/**
 * Verify Square webhook signature
 */
export function verifySquareWebhook(body: string, signature: string, signatureKey: string): boolean {
  try {
    if (!signature || !signatureKey) return false
    
    // Square webhook signature verification using HMAC-SHA256
    const hmac = crypto.createHmac('sha256', signatureKey)
    const expectedSignature = hmac.update(body).digest('base64')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

/**
 * Handle Square webhook events
 */
export interface SquareWebhookEvent {
  type: string
  objectId: string
  customerId?: string
  planId?: string
  billing?: string
  amount?: number
}

export function parseSquareWebhook(eventData: any): SquareWebhookEvent | null {
  try {
    const type = eventData.type
    const object = eventData.data?.object

    if (!type || !object) return null

    switch (type) {
      case 'payment.completed':
      case 'payment.updated':
        return {
          type: 'payment_completed',
          objectId: object.payment?.id || '',
          customerId: object.payment?.customerId,
          amount: Number(object.payment?.amountMoney?.amount || 0),
        }
      
      case 'payment_link.completed':
        return {
          type: 'payment_link_completed',
          objectId: object.payment_link?.id || '',
          customerId: object.payment_link?.metadata?.customerId,
          planId: object.payment_link?.metadata?.planId,
          billing: object.payment_link?.metadata?.billing,
        }
      
      case 'customer.created':
        return {
          type: 'customer_created',
          objectId: object.customer?.id || '',
        }
      
      default:
        return {
          type,
          objectId: object.id || '',
        }
    }
  } catch (error) {
    console.error('Error parsing webhook:', error)
    return null
  }
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(customerId: string): Promise<any[]> {
  try {
    const response = await squareClient.customersApi.listCards(customerId)
    return response.result.cards || []
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

/**
 * Charge a customer (for recurring billing)
 */
export async function chargeCustomer(params: {
  customerId: string
  amount: number
  currency?: string
  planId: string
  billing: string
}): Promise<SquarePaymentResult> {
  try {
    // Get customer's default card
    const cards = await getCustomerPaymentMethods(params.customerId)
    const defaultCard = cards.find((c: any) => c.cardholderName)

    if (!defaultCard) {
      return { success: false, error: 'No payment method on file' }
    }

    const idempotencyKey = randomUUID()

    const response = await squareClient.paymentsApi.createPayment({
      sourceId: defaultCard.id,
      idempotencyKey,
      amountMoney: {
        amount: params.amount, // Square SDK expects number, not BigInt
        currency: params.currency || 'USD',
      },
      customerId: params.customerId,
      autocomplete: true,
      note: `GlobalVoice AI - ${params.planId} - ${params.billing}`,
    })

    const payment = response.result.payment
    return {
      success: true,
      paymentId: payment?.id,
      receiptUrl: payment?.receiptUrl,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.errors?.[0]?.detail || 'Charge failed' }
    }
    return { success: false, error: 'Charge processing failed' }
  }
}

export default squareClient