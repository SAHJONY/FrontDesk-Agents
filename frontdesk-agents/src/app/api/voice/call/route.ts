// Voice Call API Route
// POST /api/voice/call - Make an AI voice call

import { NextRequest, NextResponse } from 'next/server'
import { blandService } from '@/lib/communication/blandService'
import { requireCustomerAuth } from '@/lib/customer-auth'

// Phone number validation
function validatePhoneNumber(phone: string): boolean {
  const regex = /^\+?[1-9]\/?[0-9]{1,14}$/
  return regex.test(phone.replace(/[\s\/]/g, ''))
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, session, error } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber, task, config } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const result = await blandService.makeAICall(phoneNumber, task || 'Handle incoming customer inquiry', {
      model: config?.model || 'enhanced',
      voice: config?.voice || 'rachel',
      voiceSettings: config?.voiceSettings || {
        stability: 0.5,
        similarity_boost: 0.75,
        speed: 1.0
      },
      maxDuration: config?.maxDuration || 300,
      temperature: config?.temperature || 0.7,
      language: config?.language || 'en'
    })

    // Record call in database
    const { supabaseAdmin } = await import('@/lib/supabase')
    if (supabaseAdmin) {
      await supabaseAdmin.from('call_records').insert({
        customer_id: session.customerId,
        type: 'outbound',
        external_id: result.callId,
        status: 'in_progress'
      })
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
      status: result.status
    })
  } catch (error) {
    console.error('Voice call error:', error)
    return NextResponse.json({ error: 'Failed to make voice call' }, { status: 500 })
  }
}