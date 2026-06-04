// Dashboard Leads API Route
// GET /api/dashboard/leads - Get leads for authenticated customer

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
      .from('leads')
      .select('id, name, email, phone, status, source, notes, converted_at, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(50)

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

    // Summary stats
    const totalLeads = leads.length
    const newLeads = leads.filter(l => l.status === 'new').length
    const contactedLeads = leads.filter(l => l.status === 'contacted').length
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
    const convertedLeads = leads.filter(l => l.converted).length

    return NextResponse.json(
      {
        leads,
        summary: { totalLeads, newLeads, contactedLeads, qualifiedLeads, convertedLeads }
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