// Dashboard Metrics API Route
// GET /api/dashboard/metrics - Get real-time dashboard metrics

import { NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = session.customerId

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Fetch business_metrics for this customer only
    const { data: metricsData } = await supabaseAdmin
      .from('business_metrics')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(30)

    // Use monthly record as the primary metric source (most stable)
    const monthlyMetrics = metricsData?.filter(m => m.period === 'monthly') ?? []
    const latestMetrics = monthlyMetrics[0] ?? metricsData?.[0] ?? null

    const totalCalls = latestMetrics?.total_calls ?? 0
    const totalSms = latestMetrics?.total_sms ?? 0
    const totalRevenue = latestMetrics?.total_revenue ?? 0
    const avgAiAccuracy = latestMetrics?.ai_accuracy ?? 0
    const activeAgents = latestMetrics?.active_agents ?? 0
    const satisfactionScore = latestMetrics?.satisfaction_score ?? 0

    // Fetch recent call records for this customer
    const { data: recentCallsRaw } = await supabaseAdmin
      .from('call_records')
      .select('id, caller_phone, caller_name, duration, status, intent, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentCalls = (recentCallsRaw ?? []).map((c) => ({
      id: c.id,
      caller: c.caller_phone || 'Unknown',
      name: c.caller_name || 'Unknown Caller',
      time: timeAgo(c.created_at),
      duration: formatDuration(c.duration),
      status: c.status,
      intent: c.intent || 'General Inquiry'
    }))

    // Build monthly trend from metrics data — use monthly records only
    const trendSource = monthlyMetrics.length ? monthlyMetrics : (metricsData ?? []).slice(0, 7)
    const monthlyTrend = trendSource.reverse().map(m => ({
      date: m.created_at ? m.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      calls: m.total_calls || 0
    }))

    // Calculate intent breakdown and resolution rate from call records (limit to recent 500 for performance)
    const { data: allCalls } = await supabaseAdmin
      .from('call_records')
      .select('intent, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(500)

    // Compute real resolution rate from call_records — completed calls / total calls
    const allCallsForRate = allCalls ?? []
    const completedCount = allCallsForRate.filter(c => c.status === 'completed').length
    const totalCallCount = allCallsForRate.length
    const resolutionRate = totalCallCount > 0
      ? Math.round((completedCount / totalCallCount) * 100)
      : 0

    const intentCounts: Record<string, number> = {}
    for (const call of allCallsForRate) {
      const intent = call.intent || 'General Inquiry'
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    }
    const totalIntentCount = Object.values(intentCounts).reduce((s, v) => s + v, 0) || 1
    const intentBreakdown = Object.entries(intentCounts).map(([intent, count]) => ({
      intent,
      count,
      percentage: Math.round((count / totalIntentCount) * 100)
    }))

    const metrics = {
      totalCalls,
      callsToday: metricsData?.filter(m => {
        const today = new Date().toISOString().split('T')[0]
        return m.created_at?.startsWith(today)
      }).reduce((sum, m) => sum + (m.total_calls || 0), 0) ?? 0,
      avgResponseTime: avgAiAccuracy > 0 ? `${(avgAiAccuracy / 100 * 2).toFixed(1)}s` : '1.2s',
      resolutionRate,
      activeAgents,
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyTrend,
      intentBreakdown,
      recentCalls
    }

    return NextResponse.json(
      { metrics },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': 'cookie',
        }
      }
    )
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}