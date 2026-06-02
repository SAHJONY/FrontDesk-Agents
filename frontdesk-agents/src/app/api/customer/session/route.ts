// Customer Session API Route
// GET /api/customer/session - Get current session

import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const session = await getCustomerSession()

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      session
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}