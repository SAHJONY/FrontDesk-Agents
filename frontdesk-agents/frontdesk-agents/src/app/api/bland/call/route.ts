import { NextRequest, NextResponse } from 'next/server'
import { getBlandAPIClient, BlandCallOptions, DEFAULT_VOICE_ID } from '@/lib/bland'

// POST /api/bland/call - Initiate a voice call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { phone_number, prompt, voice, language, webhook, max_duration, variables } = body

    // Validate required fields
    if (!phone_number) {
      return NextResponse.json(
        { error: 'phone_number is required' },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic E.164 check)
    const phoneRegex = /^\\+?[1-9]\\d{1,14}$/
    if (!phoneRegex.test(phone_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format (e.g., +15555555555)' },
        { status: 400 }
      )
    }

    const bland = getBlandAPIClient()

    const callOptions: BlandCallOptions = {
      phone_number,
      prompt,
      voice: voice || process.env.BLAND_DEFAULT_VOICE || DEFAULT_VOICE_ID,
      language: language || process.env.BLAND_DEFAULT_LANGUAGE || 'en',
      webhook: webhook || `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/bland/webhook`,
      max_duration: max_duration || parseInt(process.env.BLAND_MAX_CALL_DURATION || '600'),
      from_number: process.env.BLAND_DEFAULT_FROM_NUMBER,
      caller_id: process.env.BLAND_DEFAULT_CALLER_ID,
      variables: variables || {},
    }

    const result = await bland.createCall(callOptions)

    return NextResponse.json({
      success: true,
      call: result,
    })
  } catch (error) {
    console.error('Bland AI call error:', error)
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Bland AI is not configured. Please set BLAND_AI_API_KEY in environment variables.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    )
  }
}

// GET /api/bland/call - Get call status or list recent calls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('call_id')

    if (callId) {
      // Get specific call details
      const bland = getBlandAPIClient()
      const call = await bland.getCall(callId)
      
      return NextResponse.json({ success: true, call })
    }

    return NextResponse.json(
      { error: 'call_id parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Bland AI error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve call information' },
      { status: 500 }
    )
  }
}