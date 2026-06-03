// AI Model Routing Status API Route
// GET /api/ai/model-routing - Get live AI model routing statuses

import { NextResponse } from 'next/server'
import { getModelRouterStatuses } from '@/lib/ai-decision-engine'
import { getOwnerSession } from '@/lib/owner-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const statuses = getModelRouterStatuses()

    // Calculate aggregate health
    const avgHealth = statuses.reduce((sum, s) => sum + s.healthScore, 0) / statuses.length
    const activeCount = statuses.filter(s => s.status === 'active').length
    const totalRpm = statuses.reduce((sum, s) => sum + s.requestsPerMinute, 0)
    const avgLatency = Math.round(statuses.reduce((sum, s) => sum + s.latencyMs, 0) / statuses.length)

    // Determine overall routing status
    const primaryProvider = statuses.find(s => s.provider === 'hermes') || statuses[0]
    const fallbackProvider = statuses.find(s => s.provider === 'nvidia')

    return NextResponse.json({
      success: true,
      statuses,
      aggregate: {
        avgHealthScore: Math.round(avgHealth * 10) / 10,
        activeProviders: activeCount,
        totalRequestsPerMinute: totalRpm,
        avgLatencyMs: avgLatency,
        primaryModel: primaryProvider?.model || 'hermes-autonomous-router',
        fallbackModel: fallbackProvider?.model || 'qwen3-next-80b',
        routingStrategy: avgHealth > 90 ? 'performance' : avgHealth > 70 ? 'balanced' : 'conservative',
        costPer1kTokens: (statuses.reduce((sum, s) => sum + s.costPer1kTokens, 0) / statuses.length).toFixed(4),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Model routing API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}