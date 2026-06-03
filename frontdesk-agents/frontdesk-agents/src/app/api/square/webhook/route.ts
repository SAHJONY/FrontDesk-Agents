import { NextRequest, NextResponse } from 'next/server'
import { parseSquareWebhook, verifySquareWebhook } from '@/lib/square'

// Square Webhook Signature Key
const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-square-hmacsha256-signature') || ''
    
    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && SQUARE_WEBHOOK_SIGNATURE_KEY) {
      const isValid = verifySquareWebhook(rawBody, signature, SQUARE_WEBHOOK_SIGNATURE_KEY)
      if (!isValid) {
        console.error('Invalid Square webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Parse the webhook event
    const eventData = JSON.parse(rawBody)
    const event = parseSquareWebhook(eventData)

    if (!event) {
      console.error('Failed to parse Square webhook event')
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
    }

    console.log('Square webhook event:', event.type, event.objectId)

    // Handle different event types
    switch (event.type) {
      case 'payment_link_completed':
        // Payment link was paid - activate subscription
        console.log(`Payment completed for plan: ${event.planId}, billing: ${event.billing}`)
        
        // In production, you would:
        // 1. Update customer's subscription status in database
        // 2. Send welcome email with receipt
        // 3. Provision AI receptionist for the customer
        // 4. Store payment record for accounting
        
        await handlePaymentCompleted({
          customerId: event.customerId || '',
          planId: event.planId || '',
          billing: event.billing || 'monthly',
        })
        break

      case 'payment_completed':
        // Direct payment completed
        console.log(`Payment ${event.objectId} completed for customer ${event.customerId}`)
        
        await handlePaymentCompleted({
          customerId: event.customerId || '',
          planId: '',
          billing: 'monthly',
          paymentId: event.objectId,
        })
        break

      case 'customer_created':
        // New customer created in Square
        console.log(`New Square customer: ${event.objectId}`)
        break

      default:
        console.log(`Unhandled Square event type: ${event.type}`)
    }

    // Respond with 200 to acknowledge receipt
    return NextResponse.json({ 
      received: true, 
      eventType: event.type,
      objectId: event.objectId 
    })
  } catch (error: any) {
    console.error('Square webhook error:', error)
    // Return 500 so Square retries the webhook (critical errors only)
    return NextResponse.json({ 
      received: true, 
      error: error.message 
    }, { status: 500 })
  }
}

// Handle successful payment - update customer subscription
async function handlePaymentCompleted(data: {
  customerId: string
  planId: string
  billing: string
  paymentId?: string
}) {
  try {
    // In production, this would update the database
    // Example:
    // await supabase.from('customers').update({
    //   subscription_status: 'active',
    //   plan: data.planId,
    //   billing_cycle: data.billing,
    //   subscription_started_at: new Date().toISOString(),
    //   square_payment_id: data.paymentId,
    // }).eq('id', data.customerId)

    console.log('Processing payment completion:', {
      customer: data.customerId,
      plan: data.planId,
      billing: data.billing,
      payment: data.paymentId,
    })

    // TODO: Send confirmation email with receipt
    // TODO: Create customer dashboard access
    // TODO: Set up AI receptionist for the plan

  } catch (error) {
    console.error('Error handling payment completion:', error)
  }
}

// Handle GET for webhook verification
export async function GET(request: NextRequest) {
  // Square may send a GET request to verify the webhook endpoint
  // Return 200 OK to acknowledge
  return NextResponse.json({ status: 'Square webhook endpoint active' })
}