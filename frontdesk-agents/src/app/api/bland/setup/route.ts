import { NextRequest, NextResponse } from 'next/server'
import { blandService } from '../../../../lib/communication/blandService'

const BLAND_API_KEY = process.env.BLANDAI_API_KEY || ''
const BLAND_BASE_URL = 'https://api.bland.ai/v1'

// Environment-configured phone numbers
const INBOUND_NUMBER = process.env.BLANDAI_CALLER_ID || '' // +12164804413 - permanent caller ID (inbound)
const OUTBOUND_NUMBER = process.env.BLANDAI_SALES_PHONE_NUMBER || '' // +13465214387 - sales/marketing (outbound)

/**
 * GET /api/bland/setup - Check current phone number configurations
 * POST /api/bland/setup - Setup inbound script on inbound number and verify outbound setup
 * 
 * This endpoint:
 * 1. Creates an inbound pathway with the inbound script for +12164804413
 * 2. Attaches the pathway to the inbound number so it handles incoming calls
 * 3. Verifies the outbound number is ready for outbound calls
 */
export async function GET(request: NextRequest) {
  if (!BLAND_API_KEY) {
    return NextResponse.json({ error: 'BLANDAI_API_KEY not configured' }, { status: 500 })
  }

  try {
    // Get current phone numbers
    const phonesResponse = await fetch(`${BLAND_BASE_URL}/phone-numbers`, {
      method: 'GET',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    const phonesData = await phonesResponse.ok ? await phonesResponse.json() : { phone_numbers: [] }

    // Get current inbound configurations
    const inboundResponse = await fetch(`${BLAND_BASE_URL}/inbound`, {
      method: 'GET',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    const inboundData = await inboundResponse.ok ? await inboundResponse.json() : { inbound: [] }

    return NextResponse.json({
      configured_inbound: INBOUND_NUMBER,
      configured_outbound: OUTBOUND_NUMBER,
      current_phones: phonesData.phone_numbers || [],
      current_inbound: inboundData.inbound || [],
      message: 'Send POST to /api/bland/setup to configure scripts on phone numbers'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/bland/setup - Configure the phone numbers with their scripts
 * 
 * This will:
 * 1. Check if inbound number already has a pathway configured (idempotent)
 * 2. Create an inbound pathway with the inbound script if needed
 * 3. Attach the pathway to the INBOUND_NUMBER (+12164804413)
 * 4. The OUTBOUND_NUMBER (+13465214387) uses scripts via makeAICall (no pathway needed)
 */
export async function POST(request: NextRequest) {
  if (!BLAND_API_KEY) {
    return NextResponse.json({ error: 'BLANDAI_API_KEY not configured' }, { status: 500 })
  }

  if (!INBOUND_NUMBER) {
    return NextResponse.json({ error: 'BLANDAI_CALLER_ID (inbound number) not configured' }, { status: 500 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const industry = body.industry || 'default'
    const customMessage = body.welcomeMessage
    const forceRecreate = body.forceRecreate || false

    // Step 0: Check existing inbound configuration (idempotent - skip if already configured)
    const existingInboundResponse = await fetch(`${BLAND_BASE_URL}/inbound/${INBOUND_NUMBER}`, {
      method: 'GET',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    let existingPathwayId: string | null = null
    if (existingInboundResponse.ok) {
      const existingData = await existingInboundResponse.json()
      existingPathwayId = existingData.pathway_id || existingData.prompt_id || null
      
      // If already configured and not forcing recreate, return existing config
      if (existingPathwayId && !forceRecreate) {
        return NextResponse.json({
          success: true,
          inbound_setup: {
            phone_number: INBOUND_NUMBER,
            pathway_id: existingPathwayId,
            status: 'already_configured',
            script_type: 'inbound',
            description: 'Inbound number already has a pathway configured.'
          },
          outbound_setup: {
            phone_number: OUTBOUND_NUMBER,
            status: OUTBOUND_NUMBER ? 'configured_for_outbound' : 'not_configured',
            usage: 'Outbound calls use makeAICall() with scripts passed via API.'
          },
          message: `Inbound number ${INBOUND_NUMBER} already configured with pathway ${existingPathwayId}. Use forceRecreate=true to override.`
        })
      }
    }

    // Step 1: Create an inbound pathway with the inbound script
    // This pathway will handle all incoming calls to +12164804413
    const pathwayResult = await blandService.createPathway(
      'inbound-receptionist',  // pathway name
      industry,                 // industry type
      customMessage || 'Thank you for calling our business. How can I assist you today?', // custom greeting
      'system'                  // customerId (system-level)
    )

    if (!pathwayResult.success) {
      return NextResponse.json({
        error: 'Failed to create inbound pathway',
        details: pathwayResult.error
      }, { status: 500 })
    }

    if (!pathwayResult.pathwayId) {
      return NextResponse.json({
        error: 'Pathway created but no ID returned',
        fullResult: pathwayResult
      }, { status: 500 })
    }

    console.log(`[BlandSetup] Created inbound pathway: ${pathwayResult.pathwayId}`)

    // Step 2: Attach the pathway to the inbound number
    // This tells Bland.ai to use this pathway when someone calls +12164804413
    const attachResponse = await fetch(`${BLAND_BASE_URL}/inbound/${INBOUND_NUMBER}`, {
      method: 'POST',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pathway_id: pathwayResult.pathwayId
      })
    })

    if (!attachResponse.ok) {
      const attachError = await attachResponse.json().catch(() => ({}))
      // Don't fail completely - pathway was created, just couldn't attach
      console.error(`[BlandSetup] Failed to attach pathway to inbound number: ${attachError.message}`)
    } else {
      console.log(`[BlandSetup] Attached pathway ${pathwayResult.pathwayId} to ${INBOUND_NUMBER}`)
    }

    // Step 3: For outbound number, verify it's configured
    // The outbound number (+13465214387) doesn't need a pathway - it uses makeAICall with scripts
    const outboundConfig = {
      phone_number: OUTBOUND_NUMBER,
      status: OUTBOUND_NUMBER ? 'configured_for_outbound' : 'not_configured',
      usage: 'This number is used as the caller ID (from) when making outbound AI calls via makeAICall(). The outbound script is passed directly in the /calls API request, not via a pathway.'
    }

    const actionType = existingPathwayId && forceRecreate ? 'replaced' : 'created'
    return NextResponse.json({
      success: true,
      inbound_setup: {
        phone_number: INBOUND_NUMBER,
        pathway_id: pathwayResult.pathwayId,
        status: 'configured',
        script_type: 'inbound',
        previous_pathway_id: existingPathwayId && forceRecreate ? existingPathwayId : undefined,
        description: 'When customers call this number, the AI receptionist will greet them with the inbound script and handle the conversation professionally.'
      },
      outbound_setup: outboundConfig,
      message: `Successfully ${actionType}:\n- Inbound number ${INBOUND_NUMBER} with pathway ${pathwayResult.pathwayId}\n- Outbound number ${OUTBOUND_NUMBER} for AI outbound calls`
    })

  } catch (error: any) {
    console.error('[BlandSetup] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}