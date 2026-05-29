// Phone Services Configuration API Route
// PATCH /api/phone/services - Update specific service configuration

import { NextRequest, NextResponse } from 'next/server'
import { phoneOnboardingService } from '@/lib/communication/phone-provisioning'
import { getCustomerSession } from '@/lib/customer-auth'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCustomerSession()
    if (!session?.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phoneNumber, service, config } = body

    if (!phoneNumber || !service) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, service' },
        { status: 400 }
      )
    }

    const result = await phoneOnboardingService.updateServiceConfig(
      session.id,
      phoneNumber,
      service,
      config
    )

    if (!result.success) {
      return NextResponse.json(
        { error: 'Service update failed', message: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${service} configuration updated successfully`
    })

  } catch (error: any) {
    console.error('[PhoneServices API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}