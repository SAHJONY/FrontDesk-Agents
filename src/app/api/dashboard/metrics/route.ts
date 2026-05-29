// Dashboard Metrics API Route
// GET /api/dashboard/metrics - Get real-time dashboard metrics

import { NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In production, fetch from database
    // For now, return realistic mock metrics
    const metrics = {
      totalCalls: 247,
      callsToday: 23,
      avgResponseTime: '1.2s',
      resolutionRate: 94,
      activeAgents: 3,
      satisfactionScore: 4.8,
      totalRevenue: 12499.50,
      monthlyTrend: [
        { date: '2026-05-01', calls: 45 },
        { date: '2026-05-02', calls: 52 },
        { date: '2026-05-03', calls: 38 },
        { date: '2026-05-04', calls: 61 },
        { date: '2026-05-05', calls: 55 },
        { date: '2026-05-06', calls: 41 },
        { date: '2026-05-07', calls: 48 },
      ],
      intentBreakdown: [
        { intent: 'Schedule Appointment', count: 89, percentage: 36 },
        { intent: 'General Inquiry', count: 67, percentage: 27 },
        { intent: 'Speak to Representative', count: 45, percentage: 18 },
        { intent: 'Leave Voicemail', count: 32, percentage: 13 },
        { intent: 'Billing Question', count: 14, percentage: 6 }
      ],
      recentCalls: [
        { id: '1', caller: '+1 (555) 123-4567', name: 'Sarah Johnson', time: '2 min ago', duration: '4:32', status: 'completed', intent: 'Schedule Appointment' },
        { id: '2', caller: '+1 (555) 987-6543', name: 'Michael Chen', time: '8 min ago', duration: '2:15', status: 'transferred', intent: 'Speak to Representative' },
        { id: '3', caller: '+1 (555) 456-7890', name: 'Emily Davis', time: '15 min ago', duration: '5:01', status: 'voicemail', intent: 'Leave Message' },
      ]
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}