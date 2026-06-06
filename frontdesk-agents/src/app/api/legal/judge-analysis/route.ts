// Judge Win-Rate Analysis API Route
// GET /api/legal/judge-analysis?judgeName=...&courtType=family|immigration|bankruptcy
// POST /api/legal/judge-analysis/compare - Compare multiple judges

import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/owner-session'
import { judgeWinRateAgent } from '@/lib/agents/legal-research/judge-analysis'
import type { CourtType } from '@/lib/agents/legal-research/types'

export const dynamic = 'force-dynamic'

// GET /api/legal/judge-analysis
export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session?.authenticated) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const judgeName = searchParams.get('judgeName') || ''
    const courtType = (searchParams.get('courtType') || 'family') as CourtType
    const action = searchParams.get('action') || 'analyze'

    if (!['family', 'immigration', 'bankruptcy'].includes(courtType)) {
      return NextResponse.json({
        success: false, error: 'Invalid court type. Must be family, immigration, or bankruptcy'
      }, { status: 400 })
    }

    if (action === 'list') {
      const judges = judgeWinRateAgent.listJudges(courtType)
      return NextResponse.json({ success: true, courtType, judges })
    }

    if (action === 'findBest') {
      const minWinRate = parseInt(searchParams.get('minWinRate') || '0', 10)
      const maxDispositionDays = parseInt(searchParams.get('maxDispositionDays') || '0', 10)
      const results = judgeWinRateAgent.findBestJudge(courtType, {
        minWinRate: minWinRate || undefined,
        maxDispositionDays: maxDispositionDays || undefined,
      })
      return NextResponse.json({ success: true, courtType, results })
    }

    // Default: analyze single judge
    if (!judgeName) {
      return NextResponse.json({ success: false, error: 'judgeName parameter required' }, { status: 400 })
    }

    const result = judgeWinRateAgent.analyzeJudge(judgeName, courtType)
    return NextResponse.json({ success: true, analysis: result })
  } catch (error) {
    console.error('Judge analysis error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/legal/judge-analysis/compare
export async function POST(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session?.authenticated) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { judgeNames, courtType } = body

    if (!Array.isArray(judgeNames) || judgeNames.length < 2) {
      return NextResponse.json({
        success: false, error: 'judgeNames must be an array of at least 2 names'
      }, { status: 400 })
    }

    if (!['family', 'immigration', 'bankruptcy'].includes(courtType)) {
      return NextResponse.json({
        success: false, error: 'Invalid court type'
      }, { status: 400 })
    }

    const results = judgeWinRateAgent.compareJudges(judgeNames, courtType)
    return NextResponse.json({ success: true, comparisons: results })
  } catch (error) {
    console.error('Judge comparison error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}