/**
 * Voice AI API - Initiate AI Voice Call
 */

import { NextResponse } from 'next/server'
import { initiateCall, getCallStatus, hangupCall, sendCallMessage } from '@/lib/bland/client'

export async function POST(request: Request) {
  try {
    const { action, phoneNumber, message, callId } = await request.json()

    if (!phoneNumber && !callId) {
      return NextResponse.json(
        { error: 'Phone number or call ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'initiate': {
        if (!phoneNumber || !message) {
          return NextResponse.json(
            { error: 'Phone number and message are required' },
            { status: 400 }
          )
        }

        const result = await initiateCall({
          phone_number: phoneNumber,
          message: message,
          voice: 'Rachel',
          model: 'enhanced',
          language: 'en',
        })

        return NextResponse.json(result)
      }

      case 'status': {
        if (!callId) {
          return NextResponse.json(
            { error: 'Call ID is required' },
            { status: 400 }
          )
        }

        const status = await getCallStatus(callId)
        return NextResponse.json(status)
      }

      case 'hangup': {
        if (!callId) {
          return NextResponse.json(
            { error: 'Call ID is required' },
            { status: 400 }
          )
        }

        const result = await hangupCall(callId)
        return NextResponse.json(result)
      }

      case 'send': {
        if (!callId || !message) {
          return NextResponse.json(
            { error: 'Call ID and message are required' },
            { status: 400 }
          )
        }

        const result = await sendCallMessage(callId, message)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: initiate, status, hangup, or send' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Voice AI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process voice AI request' },
      { status: 500 }
    )
  }
}
