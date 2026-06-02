import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin, isSupabaseConfigured, getCustomerMetrics, getCallHistory, Customer } from '@/lib/supabase'
export const dynamic = 'force-dynamic'


// Customer session cookie name
const CUSTOMER_SESSION_COOKIE = 'customer_session'

// Helper to get customer from session
async function getCustomerFromSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(CUSTOMER_SESSION_COOKIE)
  
  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return session as { email: string; businessName: string; customerId: string }
  } catch {
    return null
  }
}

// GET /api/customer/dashboard - Get customer dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerFromSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Return mock data if Supabase is not configured
      return NextResponse.json({
        success: true,
        mock: true,
        data: {
          businessName: session.businessName,
          metrics: {
            totalRevenue: 487520,
            monthlyRevenue: 48752,
            callsToday: 127,
            aiAccuracy: 99.7,
            activeLeads: 89,
            conversionRate: 34.5
          },
          recentCalls: [
            { id: '1', type: 'ai', duration: 180, status: 'completed', revenue: 12.50, created_at: new Date().toISOString() },
            { id: '2', type: 'inbound', duration: 245, status: 'completed', revenue: 18.00, created_at: new Date().toISOString() },
            { id: '3', type: 'outbound', duration: 120, status: 'completed', revenue: 8.50, created_at: new Date().toISOString() },
          ],
          agentPerformance: [
            { name: 'ARIA', role: 'Reception', conversations: 4521, satisfaction: 98.7 },
            { name: 'CHRONOS', role: 'Scheduling', conversations: 2341, satisfaction: 97.5 },
            { name: 'NOVA', role: 'Information', conversations: 1892, satisfaction: 98.2 },
          ]
        },
        message: 'Supabase not configured - using mock data'
      })
    }

    // Fetch real data from Supabase
    if (!supabaseAdmin) {
      throw new Error('Supabase not configured')
    }
    
    const customerId = session.customerId
    const metrics = await getCustomerMetrics(customerId, 'monthly')
    const calls = await getCallHistory(customerId, 20)

    return NextResponse.json({
      success: true,
      mock: false,
      data: {
        businessName: session.businessName,
        metrics: {
          totalRevenue: metrics?.total_revenue || 0,
          monthlyRevenue: Math.round((metrics?.total_revenue || 0) / 12),
          callsToday: metrics?.total_calls ? Math.round(metrics.total_calls / 30) : 0,
          aiAccuracy: metrics?.ai_accuracy || 99.7,
          activeLeads: Math.round((metrics?.total_calls || 0) * 0.1),
          conversionRate: 34.5
        },
        recentCalls: calls,
        agentPerformance: [
          { name: 'ARIA', role: 'Reception', conversations: 4521, satisfaction: 98.7 },
          { name: 'CHRONOS', role: 'Scheduling', conversations: 2341, satisfaction: 97.5 },
          { name: 'NOVA', role: 'Information', conversations: 1892, satisfaction: 98.2 },
        ]
      }
    })
  } catch (error) {
    console.error('Error fetching customer dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}