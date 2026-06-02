import { NextRequest, NextResponse } from 'next/server'
import { getAllBillingRecords } from '@/lib/supabase'
import { authService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const offset = (page - 1) * limit

    const records = await getAllBillingRecords(limit, offset)

    return NextResponse.json({
      success: true,
      data: records,
      pagination: { page, limit, hasMore: records.length === limit },
    })
  } catch (error) {
    console.error('Owner billing API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
