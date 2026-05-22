import { NextRequest, NextResponse } from 'next/server'
import { customerAuthService } from '@/lib/auth/customerAuth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('customer_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    const session = customerAuthService.validateCustomerSession(sessionToken)

    if (!session || session.type !== 'customer') {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        email: session.email,
        businessName: session.businessName,
        industry: session.industry,
        plan: session.plan
      }
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}