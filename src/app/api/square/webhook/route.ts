// Square Webhook API Route
// POST /api/square/webhook - Handle Square webhook events

import { NextResponse } from 'next/server'
import { getSquareClient } from '@/lib/square'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await request.headers
    
    // Square webhook signature
    const signature = headersList.get('x-square-signature')
    const notificationUrl = process.env.SQUARE_WEBHOOK_URL || ''
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || ''

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && signatureKey) {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', signatureKey)
        .update(body)
        .digest('base64')
      
      if (signature !== expectedSignature) {
        console.error('Invalid Square webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const eventData = JSON.parse(body)
    
    // Handle Square events
    switch (eventData.type) {
      case 'payment.completed':
        await handlePaymentCompleted(eventData.data)
        break
        
      case 'payment.failed':
        await handlePaymentFailed(eventData.data)
        break
        
      case 'subscription.created':
        await handleSubscriptionCreated(eventData.data)
        break
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(eventData.data)
        break
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(eventData.data)
        break
        
      case 'customer.created':
        await handleCustomerCreated(eventData.data)
        break
        
      default:
        console.log(`Unhandled Square event type: ${eventData.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Square webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(data: any) {
  const payment = data.object?.payment
  if (payment) {
    console.log(`Square payment completed: ${payment.id}`)
    // Update customer subscription in database
    // Add payment record to Supabase
  }
}

async function handlePaymentFailed(data: any) {
  const payment = data.object?.payment
  if (payment) {
    console.log(`Square payment failed: ${payment.id}`)
    // Send notification to customer
    // Update payment status in database
  }
}

async function handleSubscriptionCreated(data: any) {
  const subscription = data.object?.subscription
  if (subscription) {
    console.log(`Square subscription created: ${subscription.id}`)
    // Activate customer account with subscription
  }
}

async function handleSubscriptionUpdated(data: any) {
  const subscription = data.object?.subscription
  if (subscription) {
    console.log(`Square subscription updated: ${subscription.id}`)
    // Update subscription status in database
  }
}

async function handleSubscriptionCanceled(data: any) {
  const subscription = data.object?.subscription
  if (subscription) {
    console.log(`Square subscription canceled: ${subscription.id}`)
    // Downgrade customer to free tier
  }
}

async function handleCustomerCreated(data: any) {
  const customer = data.object?.customer
  if (customer) {
    console.log(`Square customer created: ${customer.id}`)
    // Link Square customer to FrontDesk customer ID
  }
}