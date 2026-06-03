/**
 * Bland AI API Routes
 * Enhanced autonomous calling features
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeBland,
  autonomousCall,
  bulkAutonomousCall,
  scheduleCallback,
  getBlandClient,
  isBlandConfigured,
  BLAND_VOICES,
  BLAND_MODELS
} from '@/lib/bland-enhanced'

// Initialize Bland AI
if (process.env.BLAND_AI_API_KEY) {
  initializeBland(process.env.BLAND_AI_API_KEY)
}

/**
 * GET /api/ai/bland - Get Bland AI status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!isBlandConfigured()) {
      return NextResponse.json({ 
        configured: false,
        error: 'Bland AI API key not configured' 
      }, { status: 400 })
    }

    const client = getBlandClient()!

    if (action === 'voices') {
      return NextResponse.json({ voices: BLAND_VOICES })
    }

    if (action === 'models') {
      return NextResponse.json({ models: BLAND_MODELS })
    }

    if (action === 'balance') {
      const balance = await client.getBalance()
      return NextResponse.json(balance)
    }

    if (action === 'account') {
      const account = await client.getAccount()
      return NextResponse.json(account)
    }

    if (action === 'logs') {
      const logs = await client.getCall('recent').catch(() => null)
      return NextResponse.json({ logs: [] }) // Placeholder
    }

    return NextResponse.json({
      configured: true,
      status: 'active',
      features: ['autonomous_calls', 'batch_calls', 'voicemail_detection', 'call_analysis']
    })
  } catch (error) {
    console.error('[Bland AI API] GET error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 })
  }
}

/**
 * POST /api/ai/bland - Process Bland AI actions
 */
export async function POST(request: NextRequest) {
  try {
    if (!isBlandConfigured()) {
      return NextResponse.json({ error: 'Bland AI not configured' }, { status: 400 })
    }

    const body = await request.json()
    const { action, phone_number, task, voice, model, voice_settings, phone_numbers } = body

    const client = getBlandClient()!

    switch (action) {
      case 'call': {
        if (!phone_number || !task) {
          return NextResponse.json({ error: 'phone_number and task required' }, { status: 400 })
        }

        const result = await autonomousCall({
          phone_number,
          task,
          voice,
          model,
          voice_settings,
        })

        return NextResponse.json(result)
      }

      case 'batch': {
        if (!phone_numbers || !Array.isArray(phone_numbers) || !task) {
          return NextResponse.json({ error: 'phone_numbers array and task required' }, { status: 400 })
        }

        const result = await bulkAutonomousCall(phone_numbers, task, { voice, model })
        return NextResponse.json(result)
      }

      case 'schedule': {
        const { scheduled_time } = body
        if (!phone_number || !task || !scheduled_time) {
          return NextResponse.json({ error: 'phone_number, task, and scheduled_time required' }, { status: 400 })
        }

        const result = await scheduleCallback(
          phone_number,
          new Date(scheduled_time),
          task,
          voice
        )
        return NextResponse.json(result)
      }

      case 'analyze': {
        if (!body.call_id) {
          return NextResponse.json({ error: 'call_id required' }, { status: 400 })
        }

        const analysis = await client.analyzeCall(body.call_id)
        return NextResponse.json(analysis)
      }

      case 'transcript': {
        if (!body.call_id) {
          return NextResponse.json({ error: 'call_id required' }, { status: 400 })
        }

        const transcript = await client.getTranscript(body.call_id)
        return NextResponse.json(transcript)
      }

      case 'voicemail_detection': {
        if (!phone_number) {
          return NextResponse.json({ error: 'phone_number required' }, { status: 400 })
        }

        const result = await client.detectVoicemail(phone_number)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Bland AI API] POST error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}