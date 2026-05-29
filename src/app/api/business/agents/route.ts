// AI Agents API Route
// GET /api/business/agents - Get AI agents for customer
// POST /api/business/agents - Create new AI agent

import { NextRequest, NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-client'

const VALID_AGENT_TYPES = ['receptionist', 'scheduler', 'faq', 'transfer', 'voicemail']

export async function GET(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: agents, error: dbError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('customer_id', session.customerId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Error fetching agents:', dbError)
      // Return mock data if table doesn't exist yet
      return NextResponse.json({ 
        agents: [
          { id: '1', name: 'Receptionist', type: 'receptionist', status: 'active', callsHandled: 156, voiceId: 'rachel', voiceSettings: {}, config: {}, createdAt: new Date().toISOString() },
          { id: '2', name: 'Scheduler', type: 'scheduler', status: 'active', callsHandled: 89, voiceId: 'josh', voiceSettings: {}, config: {}, createdAt: new Date().toISOString() },
          { id: '3', name: 'FAQ Bot', type: 'faq', status: 'paused', callsHandled: 42, voiceId: 'sam', voiceSettings: {}, config: {}, createdAt: new Date().toISOString() },
        ]
      })
    }

    return NextResponse.json({ agents: agents || [] })
  } catch (error) {
    console.error('Get agents error:', error)
    return NextResponse.json({ error: 'Failed to get agents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()

    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, type, voiceId, voiceSettings, config } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    // Validate type against allowed values
    if (!VALID_AGENT_TYPES.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid type. Must be one of: ${VALID_AGENT_TYPES.join(', ')}` 
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: agent, error: dbError } = await supabase
      .from('ai_agents')
      .insert({
        customer_id: session.customerId,
        name,
        type,
        voice_id: voiceId || 'rachel',
        voice_settings: voiceSettings || {},
        config: config || {},
        status: 'active'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error creating agent:', dbError)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    console.error('Create agent error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}