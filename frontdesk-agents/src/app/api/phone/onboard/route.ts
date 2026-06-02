// Phone Onboarding API Route
// POST /api/phone/onboard - Provision phone services for a new customer

import { NextRequest, NextResponse } from 'next/server'
import { phoneOnboardingService, type PhoneOnboardingConfig } from '@/lib/communication/phone-provisioning'
import { getCustomerSession } from '@/lib/customer-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getCustomerSession()
    if (!session?.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const {
      businessName,
      industry,
      ownerPhone,
      ownerEmail,
      desiredAreaCode,
      enableVoicemail = true,
      enableSMS = true,
      enableRecording = true,
      enableForwarding = false,
      forwardToNumber,
      welcomeMessage
    } = body

    if (!businessName || !industry || !ownerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, industry, ownerPhone' },
        { status: 400 }
      )
    }

    // Build onboarding configuration
    const config: PhoneOnboardingConfig = {
      customerId: session.id,
      businessName,
      industry: industry || 'default',
      plan: session.plan || 'starter',
      ownerPhone,
      ownerEmail: ownerEmail || session.email,
      desiredAreaCode,
      enableVoicemail,
      enableSMS,
      enableRecording,
      enableForwarding,
      forwardToNumber,
      welcomeMessage
    }

    console.log(`[PhoneOnboard API] Starting phone provision for ${businessName}`)

    // Provision phone services
    const result = await phoneOnboardingService.provisionPhoneServices(config)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Phone provisioning failed',
          details: result.errors,
          partialResult: result
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phone services provisioned successfully',
      data: {
        customerId: result.customerId,
        provisionedPhones: result.provisionedPhones,
        configuredServices: result.configuredServices,
        estimatedMonthlyCost: result.estimatedMonthlyCost,
        setupCompletedAt: result.setupCompletedAt
      }
    })

  } catch (error: any) {
    console.error('[PhoneOnboard API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// GET - Get phone service status for the authenticated customer
export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession()
    if (!session?.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const status = await phoneOnboardingService.getServiceStatus(session.id)

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error: any) {
    console.error('[PhoneOnboard API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}