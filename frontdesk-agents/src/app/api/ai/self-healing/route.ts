// Self-Healing Monitor API Route
// GET /api/ai/self-healing - Get system health and anomaly status

import { NextRequest, NextResponse } from 'next/server'
import { getSelfHealingStatus, acknowledgeAlert, resolveAlert } from '@/lib/ai-decision-engine'
import { getOwnerSession } from '@/lib/owner-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const status = getSelfHealingStatus()

    return NextResponse.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Self-healing API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { action, alertId } = body

    if (action === 'acknowledge' && alertId) {
      acknowledgeAlert(alertId)
      return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
    }

    if (action === 'resolve' && alertId) {
      resolveAlert(alertId)
      return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Self-healing POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}