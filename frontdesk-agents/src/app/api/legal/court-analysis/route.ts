// Court Procedures API Route
// GET /api/legal/court-analysis?court=...&courtType=family|immigration|bankruptcy

import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/owner-session'
import { courtProceduresAgent } from '@/lib/agents/legal-research/court-procedures'
import type { CourtType } from '@/lib/agents/legal-research/types'

export const dynamic = 'force-dynamic'

// GET /api/legal/court-analysis
export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session?.authenticated) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courtName = searchParams.get('court') || ''
    const courtType = (searchParams.get('courtType') || 'family') as CourtType
    const action = searchParams.get('action') || 'procedures'

    if (!['family', 'immigration', 'bankruptcy'].includes(courtType)) {
      return NextResponse.json({
        success: false, error: 'Invalid court type'
      }, { status: 400 })
    }

    if (action === 'deadlines') {
      const results = courtProceduresAgent.getDeadlines(courtName, courtType)
      return NextResponse.json({ success: true, courtType, courtName, deadlines: results })
    }

    if (action === 'filingRequirements') {
      const results = courtProceduresAgent.getFilingRequirements(courtType)
      return NextResponse.json({ success: true, courtType, filingRequirements: results })
    }

    if (action === 'judge') {
      const judgeName = searchParams.get('judge') || ''
      if (!judgeName) {
        return NextResponse.json({ success: false, error: 'judge parameter required for judge action' }, { status: 400 })
      }
      const results = courtProceduresAgent.getJudgeProcedures(judgeName, courtType)
      return NextResponse.json({ success: true, courtType, judge: results })
    }

    // Default: get procedures
    const procedures = courtProceduresAgent.getProcedures(courtName, courtType)
    return NextResponse.json({ success: true, procedures })
  } catch (error) {
    console.error('Court procedures error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}