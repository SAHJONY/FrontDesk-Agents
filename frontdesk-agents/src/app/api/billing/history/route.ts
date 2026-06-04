export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { getBillingHistory } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    let session
    try {
      session = await getCustomerSession()
    } catch {
      session = null
    }
    if (!session?.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)

    const allRecords = (await getBillingHistory(session.customerId, limit * page)) ?? []
    const start = (page - 1) * limit
    const data = allRecords.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: allRecords.length,
        hasMore: allRecords.length > start + limit,
      },
    })
  } catch (error) {
    console.error('Billing history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing history' },
      { status: 500 }
    )
  }
}
