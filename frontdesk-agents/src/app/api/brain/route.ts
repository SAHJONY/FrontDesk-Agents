import { NextRequest, NextResponse } from 'next/server'
import { AutonomousCore, Intent } from '@/lib/AutonomousCore'

/**
 * BRAIN API GATEWAY
 * All intelligent requests flow through here.
 * 
 * Usage:
 * POST /api/brain
 * {
 *   intent: 'AUTH' | 'DASHBOARD' | 'AI_CALL' | 'BILLING' | 'ONBOARDING'
 *   action: string
 *   payload: any
 *   context: { userId?: string, sessionId: string }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { intent, action, payload, context } = body

    if (!intent || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing intent or action' },
        { status: 400 }
      )
    }

    // Process through Autonomous Core
    const result = await AutonomousCore.processRequest(
      intent as Intent,
      action,
      payload || {},
      context || { sessionId: crypto.randomUUID(), timestamp: Date.now() }
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[BRAIN] Gateway error:', error)
    return NextResponse.json(
      { success: false, error: 'Brain gateway failure', details: error.message },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  const status = AutonomousCore.getStatus()
  return NextResponse.json({ status: 'awake', ...status })
}
