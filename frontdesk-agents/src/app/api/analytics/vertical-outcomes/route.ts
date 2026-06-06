// Vertical Case Outcomes Analytics API Route
// GET /api/analytics/vertical-outcomes - Get case outcome analytics per legal vertical
// Owner-only endpoint

import { NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/owner-session'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Vertical labels and icons for frontend display
const VERTICAL_META: Record<string, { label: string; color: string; icon: string; priority: string }> = {
  family_law: { label: 'Family Law', color: '#f472b6', icon: '👨‍👩‍👧', priority: 'high' },
  immigration: { label: 'Immigration', color: '#60a5fa', icon: '🌍', priority: 'high' },
  bankruptcy: { label: 'Bankruptcy', color: '#a78bfa', icon: '💼', priority: 'medium' },
  ip_law: { label: 'IP Law', color: '#34d399', icon: '💡', priority: 'medium' }
}

const OUTCOME_LABELS: Record<string, string> = {
  greeting_sent: 'Greeting Sent',
  case_routed: 'Case Routed',
  scheduling_initiated: 'Scheduling Initiated',
  escalation_initiated: 'Escalation Initiated',
  transfer_completed: 'Transfer Completed',
  voicemail_captured: 'Voicemail Captured',
  message_taken: 'Message Taken',
  callback_scheduled: 'Callback Scheduled'
}

// GET /api/analytics/vertical-outcomes
export async function GET() {
  try {
    // Require owner authentication
    const session = await getOwnerSession()
    if (!session?.authenticated) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 })
    }

    // Fetch call_records for all customers with legal industry
    const { data: callRecords, error } = await supabaseAdmin
      .from('call_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000)

    if (error) {
      console.error('Error fetching call records for vertical analytics:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 })
    }

    // Build per-vertical outcome counts from call_records
    const verticals = ['family_law', 'immigration', 'bankruptcy', 'ip_law']

    const verticalStats: Record<string, {
      total: number
      routed: number
      escalated: number
      scheduled: number
      completed: number
      missed: number
      avgDuration: number
      outcomes: Record<string, number>
      recentCalls: Array<{ id: string; caller: string; duration: number; status: string; created_at: string }>
    }> = {
      family_law: { total: 0, routed: 0, escalated: 0, scheduled: 0, completed: 0, missed: 0, avgDuration: 0, outcomes: {}, recentCalls: [] },
      immigration: { total: 0, routed: 0, escalated: 0, scheduled: 0, completed: 0, missed: 0, avgDuration: 0, outcomes: {}, recentCalls: [] },
      bankruptcy: { total: 0, routed: 0, escalated: 0, scheduled: 0, completed: 0, missed: 0, avgDuration: 0, outcomes: {}, recentCalls: [] },
      ip_law: { total: 0, routed: 0, escalated: 0, scheduled: 0, completed: 0, missed: 0, avgDuration: 0, outcomes: {}, recentCalls: [] }
    }

    const KEYWORD_MAP: Record<string, string[]> = {
      family_law: ['divorce', 'custody', 'child support', 'spousal', 'adoption', 'family law', 'family_law'],
      immigration: ['visa', 'green card', 'immigration', 'deportation', 'asylum', 'citizenship', 'h1b'],
      bankruptcy: ['bankruptcy', 'chapter 7', 'chapter 13', 'foreclosure', 'garnishment', 'debt', 'bankruptcy law'],
      ip_law: ['trademark', 'copyright', 'patent', 'ip law', 'intellectual property', 'cease and desist', 'licensing']
    }

    for (const record of (callRecords ?? [])) {
      const intent = (record.intent || '').toLowerCase()
      const status = record.status || 'completed'
      const duration = record.duration || 0

      let matchedVertical: string | null = null

      // Match by keywords in intent or notes
      for (const v of verticals) {
        const matchedKw = KEYWORD_MAP[v]?.find(kw => intent.includes(kw))
        if (matchedKw) {
          matchedVertical = v
          break
        }
      }

      if (matchedVertical && verticalStats[matchedVertical]) {
        const vs = verticalStats[matchedVertical]
        vs.total++
        if (vs.avgDuration === 0) {
          vs.avgDuration = duration
        } else {
          vs.avgDuration = (vs.avgDuration + duration) / 2
        }
        if (status === 'completed') vs.completed++
        else if (status === 'missed') vs.missed++

        // Classify outcome type based on status and intent
        if (intent.includes('schedule') || intent.includes('consultation') || intent.includes('appointment')) {
          vs.scheduled++
        } else if (intent.includes('speak') || intent.includes('human') || intent.includes('attorney') || intent.includes('lawyer')) {
          vs.escalated++
        } else if (status === 'transferred' || status === 'routed') {
          vs.routed++
        }

        // Track outcome distribution
        const outcomeKey = status === 'completed' ? 'greeting_sent' :
          status === 'missed' ? 'voicemail_captured' :
          status === 'transferred' ? 'case_routed' :
          status === 'escalated' ? 'escalation_initiated' : 'greeting_sent'
        vs.outcomes[outcomeKey] = (vs.outcomes[outcomeKey] || 0) + 1

        // Keep recent calls (last 5 per vertical)
        if (vs.recentCalls.length < 5) {
          vs.recentCalls.push({
            id: record.id,
            caller: record.caller_phone || record.caller_name || 'Unknown',
            duration,
            status,
            created_at: record.created_at
          })
        }
      }
    }

    // Compute resolution rate and build response
    const verticalAnalytics = verticals.map(v => {
      const stats = verticalStats[v]
      const meta = VERTICAL_META[v]
      const resolutionRate = stats.total > 0
        ? Math.round(((stats.completed + stats.routed) / stats.total) * 100)
        : 0
      const avgDurationSecs = Math.round(stats.avgDuration)

      return {
        vertical: v,
        ...meta,
        ...stats,
        resolutionRate,
        avgDurationSecs,
        avgDurationLabel: avgDurationSecs > 0 ? `${Math.floor(avgDurationSecs / 60)}m ${avgDurationSecs % 60}s` : '0s',
        outcomeLabels: OUTCOME_LABELS
      }
    })

    // Aggregate summary across all verticals
    const totalCalls = verticalAnalytics.reduce((sum, v) => sum + v.total, 0)
    const totalRouted = verticalAnalytics.reduce((sum, v) => sum + v.routed, 0)
    const totalEscalated = verticalAnalytics.reduce((sum, v) => sum + v.escalated, 0)
    const totalScheduled = verticalAnalytics.reduce((sum, v) => sum + v.scheduled, 0)
    const totalCompleted = verticalAnalytics.reduce((sum, v) => sum + v.completed, 0)
    const totalMissed = verticalAnalytics.reduce((sum, v) => sum + v.missed, 0)
    const overallResolutionRate = totalCalls > 0
      ? Math.round(((totalCompleted + totalRouted) / totalCalls) * 100)
      : 0

    return NextResponse.json({
      success: true,
      summary: {
        totalCalls,
        totalRouted,
        totalEscalated,
        totalScheduled,
        totalCompleted,
        totalMissed,
        overallResolutionRate
      },
      verticals: verticalAnalytics,
      generatedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Vary': 'cookie'
      }
    })
  } catch (error) {
    console.error('Vertical outcomes analytics error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}