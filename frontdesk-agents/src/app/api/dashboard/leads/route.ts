// Dashboard Leads API Route
// GET /api/dashboard/leads?page=1&limit=50 - Get paginated leads for authenticated customer

import { NextRequest, NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = session.customerId
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10)), 100)
    const offset = (page - 1) * limit

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get total count for pagination metadata
    const { count: totalCount } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)

    // Fetch paginated leads
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, phone, status, source, notes, converted_at, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Leads error:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    const leads = (data ?? []).map(l => ({
      id: l.id,
      name: l.name,
      email: l.email || '',
      phone: l.phone || '',
      status: l.status,
      source: l.source || '',
      notes: l.notes || '',
      converted: l.converted_at ? true : false,
      createdAt: l.created_at
    }))

    // Summary stats — computed from returned page (summary for current view)
    // Note: for all-time summary counts, consider caching in business_metrics
    const totalLeads = totalCount ?? 0
    const newLeads = leads.filter(l => l.status === 'new').length
    const contactedLeads = leads.filter(l => l.status === 'contacted').length
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
    const convertedLeads = leads.filter(l => l.converted).length

    const total = totalCount ?? 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        leads,
        summary: { totalLeads, newLeads, contactedLeads, qualifiedLeads, convertedLeads },
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': 'cookie',
        }
      }
    )
  } catch (error) {
    console.error('Dashboard leads error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}