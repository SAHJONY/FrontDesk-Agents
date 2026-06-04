// Self-Healing Monitor API Route
// GET /api/ai/self-healing - Get system health and anomaly status

import { NextRequest, NextResponse } from 'next/server'
import { getSelfHealingStatus, acknowledgeAlert, resolveAlert } from '@/lib/ai-decision-engine'
import { getOwnerSession } from '@/lib/owner-session'
import { authRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting — outside try so throws propagate as 500, not misleading
  const clientIp = getClientIp(request)
  const rateLimitResult = authRateLimit(clientIp)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter ?? 60) } }
    )
  }

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
  // Rate limiting — outside try so throws propagate as 500, not misleading
  const clientIp = getClientIp(request)
  const rateLimitResult = authRateLimit(clientIp)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter ?? 60) } }
    )
  }

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