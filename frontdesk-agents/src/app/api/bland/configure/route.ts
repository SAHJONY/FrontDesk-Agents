import { NextRequest, NextResponse } from 'next/server'

const BLAND_API_KEY = process.env.BLANDAI_API_KEY || ''
const BLAND_BASE_URL = 'https://api.bland.ai/v1'

// Environment-configured phone numbers
const INBOUND_NUMBER = process.env.BLANDAI_CALLER_ID || '' // +12164804413 - permanent caller ID
const OUTBOUND_NUMBER = process.env.BLANDAI_SALES_PHONE_NUMBER || '' // +13465214387 - sales/marketing

/**
 * GET /api/bland/configure - List current phone number configurations
 * POST /api/bland/configure - Configure inbound/outbound scripts on phone numbers
 */
export async function GET(request: NextRequest) {
  if (!BLAND_API_KEY) {
    return NextResponse.json({ error: 'BLANDAI_API_KEY not configured' }, { status: 500 })
  }

  try {
    // List inbound phone numbers
    const response = await fetch(`${BLAND_BASE_URL}/inbound`, {
      method: 'GET',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || 'Failed to fetch inbound numbers' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({
      inbound_numbers: data.inbound || [],
      configured_inbound: INBOUND_NUMBER,
      configured_outbound: OUTBOUND_NUMBER
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Configure a phone number with a pathway/script
 * Body: { phoneNumber: string, pathwayId?: string, prompt?: string, voice?: string }
 */
export async function POST(request: NextRequest) {
  if (!BLAND_API_KEY) {
    return NextResponse.json({ error: 'BLANDAI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { phoneNumber, pathwayId, prompt, voice } = body

    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber is required' }, { status: 400 })
    }

    // Configure the inbound number with pathway or prompt
    const updateData: Record<string, any> = {}
    if (pathwayId) {
      updateData.pathway_id = pathwayId
    }
    if (prompt) {
      updateData.prompt = prompt
    }
    if (voice) {
      updateData.voice = voice
    }

    // Make sure we have something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Must provide pathwayId, prompt, or voice to configure' }, { status: 400 })
    }

    const response = await fetch(`${BLAND_BASE_URL}/inbound/${phoneNumber}`, {
      method: 'POST',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || 'Failed to configure phone number' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}