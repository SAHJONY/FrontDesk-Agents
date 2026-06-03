// AI Decisions API Route
// GET /api/ai/decisions - List recent AI decisions
// POST /api/ai/decisions - Make a new autonomous decision

import { NextRequest, NextResponse } from 'next/server'
import { getDecisions, makeDecision, evaluateAndDecide, getAIDecisionMetrics, resolveDecision } from '@/lib/ai-decision-engine'
import { getOwnerSession } from '@/lib/owner-session'
import { getModelRouterStatuses } from '@/lib/ai-decision-engine'
import { getSelfHealingStatus } from '@/lib/ai-decision-engine'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200)
    const includeMetrics = searchParams.get('metrics') === 'true'

    const decisions = await getDecisions(limit)
    const modelStatuses = getModelRouterStatuses()
    const selfHealing = await getSelfHealingStatus()
    const metrics = includeMetrics ? await getAIDecisionMetrics() : null

    return NextResponse.json({
      success: true,
      decisions,
      modelStatuses,
      selfHealing,
      metrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI decisions API error:', error)
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
    const { action, context } = body

    if (action === 'evaluate') {
      // Autonomous evaluation and decision making
      const decisions = await evaluateAndDecide(context || {})
      return NextResponse.json({
        success: true,
        decisionsMade: decisions.length,
        decisions,
        timestamp: new Date().toISOString(),
      })
    }

    if (action === 'decide') {
      // Manual decision trigger
      const { category, severity, trigger, reasoning, decisionAction, metadata } = body
      if (!category || !severity || !trigger || !reasoning || !decisionAction) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
      }
      // Validate enum values
      const validCategories = ['escalate', 'onboard', 'upsell', 'retain', 'optimize', 'alert']
      const validSeverities = ['critical', 'high', 'medium', 'low', 'info']
      const validOutcomes = ['success', 'failed', 'pending', 'escalated']
      if (!validCategories.includes(category)) {
        return NextResponse.json({ success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 })
      }
      if (!validSeverities.includes(severity)) {
        return NextResponse.json({ success: false, error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` }, { status: 400 })
      }
      if (metadata && typeof metadata !== 'object') {
        return NextResponse.json({ success: false, error: 'metadata must be an object' }, { status: 400 })
      }
      const decision = await makeDecision({ category, severity, trigger, reasoning, action: decisionAction, metadata })
      return NextResponse.json({ success: true, decision, timestamp: new Date().toISOString() })
    }

    if (action === 'resolve') {
      const { decisionId, outcome } = body
      if (!decisionId || !outcome) {
        return NextResponse.json({ success: false, error: 'Missing decisionId or outcome' }, { status: 400 })
      }
      const validOutcomes = ['success', 'failed', 'pending', 'escalated']
      if (!validOutcomes.includes(outcome)) {
        return NextResponse.json({ success: false, error: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}` }, { status: 400 })
      }
      await resolveDecision(decisionId, outcome)
      return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('AI decisions POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}