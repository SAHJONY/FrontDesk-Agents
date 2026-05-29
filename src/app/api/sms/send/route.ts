// SMS API Route
// POST /api/sms/send - Send SMS to caller

import { NextRequest, NextResponse } from 'next/server'
import { twilioService } from '@/lib/communication/twilioService'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, body } = await request.json()
    if (!to || !body) {
      return NextResponse.json({ error: 'Phone number and message body are required' }, { status: 400 })
    }

    const formattedNumber = twilioService.formatPhoneNumber(to)
    if (!twilioService.validatePhoneNumber(formattedNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const twilioNumber = process.env.TWILIO_PHONE_NUMBER
    if (!twilioNumber) {
      return NextResponse.json({ error: 'Phone number not configured' }, { status: 500 })
    }

    const messageSid = await twilioService.sendSMS(formattedNumber, twilioNumber, body)

    return NextResponse.json({ success: true, messageSid })
  } catch (error) {
    console.error('SMS error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}