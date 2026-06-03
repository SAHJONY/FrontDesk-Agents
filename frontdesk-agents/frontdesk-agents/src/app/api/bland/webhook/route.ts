import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { sendCallSummaryEmail } from '@/lib/email'

// Bland AI webhook endpoint for call events
// POST /api/bland/webhook

interface BlandWebhookPayload {
  call_id: string
  status: 'queued' | 'started' | 'ended' | 'failed'
  duration?: number
  transcript?: string
  summary?: string
  recording_url?: string
  disposition?: string
  phone_number?: string
  [key: string]: unknown
}

// Email recipient for call summaries (configure in environment or use default admin)
const CALL_SUMMARY_RECIPIENT = process.env.CALL_SUMMARY_EMAIL || process.env.ADMIN_EMAIL || ''

/**
 * Verify Bland AI webhook signature
 * Bland AI sends X-Bland-Signature header with HMAC-SHA256 signature
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false
  
  const secret = process.env.BLAND_AI_WEBHOOK_SECRET
  if (!secret) {
    console.warn('BLAND_AI_WEBHOOK_SECRET not configured, skipping signature verification')
    return true // Skip verification if secret not set (not recommended for production)
  }
  
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === expectedSignature
}

async function handleCallEnded(payload: BlandWebhookPayload) {
  const { call_id, phone_number, duration, transcript, summary, disposition } = payload
  
  if (!CALL_SUMMARY_RECIPIENT) {
    console.warn('No CALL_SUMMARY_EMAIL configured, skipping email notification')
    return
  }
  
  try {
    // Map Bland AI disposition to our status
    // Default to 'completed' for unknown dispositions (safer assumption)
    let status: 'completed' | 'failed' | 'missed' = 'completed'
    if (disposition === 'SUCCESS') {
      status = 'completed'
    } else if (disposition === 'NO_ANSWER') {
      status = 'missed'
    } else if (disposition === 'failed' || disposition === 'FAILED') {
      status = 'failed'
    } else if (disposition) {
      // Log unknown dispositions but default to completed
      console.log(`Unknown disposition '${disposition}' for call ${call_id}, defaulting to completed`)
    }
    
    await sendCallSummaryEmail({
      to: CALL_SUMMARY_RECIPIENT,
      callId: call_id,
      phoneNumber: phone_number || 'Unknown',
      duration: duration || 0,
      status,
      transcript,
      summary,
    })
    
    console.log(`Call summary email sent for ${call_id}`)
  } catch (error) {
    console.error(`Failed to send call summary email for ${call_id}:`, error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-bland-signature')
    
    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    const payload: BlandWebhookPayload = JSON.parse(rawBody)
    
    console.log('Bland AI webhook received:', JSON.stringify(payload, null, 2))

    const { call_id, status, duration } = payload

    // Handle different call statuses
    switch (status) {
      case 'started':
        console.log(`Call ${call_id} started`)
        break

      case 'ended':
        console.log(`Call ${call_id} ended. Duration: ${duration}s`)
        // Send call summary email
        await handleCallEnded(payload)
        break

      case 'failed':
        console.error(`Call ${call_id} failed`)
        // Send failed call notification email
        await handleCallEnded(payload)
        break

      default:
        console.log(`Call ${call_id} status: ${status}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Health check endpoint for Bland AI webhook validation
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'Bland AI Webhook Handler',
    timestamp: new Date().toISOString()
  })
}