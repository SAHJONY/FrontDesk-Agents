// Dashboard Metrics API Route
// GET /api/dashboard/metrics - Get real-time dashboard metrics

import { NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

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

    // Calculate aggregates from real data
    const totalCalls = metricsData?.reduce((sum, m) => sum + (m.total_calls || 0), 0) ?? 0
    const totalSms = metricsData?.reduce((sum, m) => sum + (m.total_sms || 0), 0) ?? 0
    const totalRevenue = metricsData?.reduce((sum, m) => sum + (m.total_revenue || 0), 0) ?? 0
    const avgAiAccuracy = metricsData?.length
      ? metricsData.reduce((sum, m) => sum + (m.ai_accuracy || 0), 0) / metricsData.length
      : 0
    const activeAgents = metricsData?.[0]?.active_agents ?? 0
    const satisfactionScore = metricsData?.[0]?.satisfaction_score ?? 0

    // Fetch recent call records for this customer
    const { data: recentCallsRaw } = await supabaseAdmin
      .from('call_records')
      .select('id, caller_phone, caller_name, duration, status, intent, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentCalls = (recentCallsRaw ?? []).map((c, i) => ({
      id: c.id,
      caller: c.caller_phone || 'Unknown',
      name: c.caller_name || 'Unknown Caller',
      time: timeAgo(c.created_at),
      duration: formatDuration(c.duration),
      status: c.status,
      intent: c.intent || 'General Inquiry'
    }))

    // Build monthly trend from metrics data
    const monthlyTrend = (metricsData ?? []).slice(0, 7).reverse().map(m => ({
      date: m.created_at ? m.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      calls: m.total_calls || 0
    }))

    // Calculate intent breakdown from call records (limit to recent 500 for performance)
    const { data: allCalls } = await supabaseAdmin
      .from('call_records')
      .select('intent')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(500)

    const intentCounts: Record<string, number> = {}
    for (const call of (allCalls ?? [])) {
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
      callsToday: recentCallsRaw?.filter(c => {
        const today = new Date().toISOString().split('T')[0]
        return c.created_at?.startsWith(today)
      }).length ?? 0,
      avgResponseTime: '1.2s',
      resolutionRate: 94,
      activeAgents,
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyTrend,
      intentBreakdown,
      recentCalls
    }

    return NextResponse.json({ metrics })
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