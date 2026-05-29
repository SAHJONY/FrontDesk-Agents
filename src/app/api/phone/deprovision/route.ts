// Phone Deprovisioning API Route
// DELETE /api/phone/deprovision - Remove all phone services for a customer

import { NextRequest, NextResponse } from 'next/server'
import { phoneOnboardingService } from '@/lib/communication/phone-provisioning'
import { getCustomerSession } from '@/lib/customer-auth'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCustomerSession()
    if (!session?.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await phoneOnboardingService.deprovisionPhoneServices(session.id)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Deprovisioning failed', message: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'All phone services have been removed'
    })

  } catch (error: any) {
    console.error('[PhoneDeprovision API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}