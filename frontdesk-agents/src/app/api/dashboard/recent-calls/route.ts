// Dashboard Recent Calls API Route
// GET /api/dashboard/recent-calls - Get recent calls for authenticated customer

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

    const { data, error } = await supabaseAdmin
      .from('call_records')
      .select('id, caller_phone, caller_name, type, direction, duration, status, revenue, intent, notes, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Recent calls error:', error)
      return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
    }

    const calls = (data ?? []).map(c => ({
      id: c.id,
      caller: c.caller_phone || 'Unknown',
      name: c.caller_name || 'Unknown Caller',
      type: c.type,
      direction: c.direction,
      duration: c.duration,
      status: c.status,
      revenue: c.revenue,
      intent: c.intent || 'General Inquiry',
      notes: c.notes || '',
      time: timeAgo(c.created_at),
      formattedDuration: formatDuration(c.duration)
    }))

    return NextResponse.json(
      { calls },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': 'cookie',
        }
      }
    )
  } catch (error) {
    console.error('Dashboard recent calls error:', error)
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