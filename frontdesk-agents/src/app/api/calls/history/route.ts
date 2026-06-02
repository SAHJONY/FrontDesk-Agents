// Call History API Route
// GET /api/calls/history - Get customer's call history

import { NextRequest, NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { authorized, session, error } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    const { supabaseAdmin } = await import('@/lib/supabase')
    
    if (!supabaseAdmin) {
      // Return mock data if Supabase not configured
      return NextResponse.json({
        calls: getMockCalls(),
        total: 247,
        limit,
        offset
      })
    }

    let query = supabaseAdmin
      .from('call_records')
      .select('*', { count: 'exact' })
      .eq('customer_id', session.customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error: dbError, count } = await query

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch call history' }, { status: 500 })
    }

    return NextResponse.json({
      calls: data || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Call history error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

function getMockCalls() {
  return [
    { id: '1', caller: '+1 (555) 123-4567', name: 'Sarah Johnson', time: '2 min ago', duration: '4:32', status: 'completed', intent: 'Schedule Appointment' },
    { id: '2', caller: '+1 (555) 987-6543', name: 'Michael Chen', time: '8 min ago', duration: '2:15', status: 'transferred', intent: 'Speak to Representative' },
    { id: '3', caller: '+1 (555) 456-7890', name: 'Emily Davis', time: '15 min ago', duration: '5:01', status: 'voicemail', intent: 'Leave Message' },
  ]
}