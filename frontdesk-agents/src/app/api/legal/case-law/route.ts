// Case Law Research API Route
// GET /api/legal/case-law?query=...&courtType=family|immigration|bankruptcy

import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/owner-session'
import { caseLawResearchAgent } from '@/lib/agents/legal-research/case-law-research'
import type { CourtType } from '@/lib/agents/legal-research/types'

export const dynamic = 'force-dynamic'

// GET /api/legal/case-law
export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session?.authenticated) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const courtType = (searchParams.get('courtType') || 'family') as CourtType
    const action = searchParams.get('action') || 'search'

    if (!['family', 'immigration', 'bankruptcy'].includes(courtType)) {
      return NextResponse.json({
        success: false, error: 'Invalid court type'
      }, { status: 400 })
    }

    if (action === 'recent') {
      const limit = parseInt(searchParams.get('limit') || '5', 10)
      const results = caseLawResearchAgent.getRecentUpdates(courtType, limit)
      return NextResponse.json({ success: true, courtType, recentUpdates: results })
    }

    if (action === 'analyzeTheory') {
      if (!query) {
        return NextResponse.json({ success: false, error: 'query parameter required for analyzeTheory action' }, { status: 400 })
      }
      const analysis = caseLawResearchAgent.analyzeLegalTheory(query, courtType)
      return NextResponse.json({ success: true, courtType, analysis })
    }

    if (action === 'issue') {
      if (!query) {
        return NextResponse.json({ success: false, error: 'query parameter required for issue action' }, { status: 400 })
      }
      const results = caseLawResearchAgent.getPrecedentsForIssue(query)
      return NextResponse.json({ success: true, issue: query, results })
    }

    // Default search action
    if (!query) {
      return NextResponse.json({ success: false, error: 'query parameter required' }, { status: 400 })
    }

    const result = caseLawResearchAgent.search(query, courtType)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Case law research error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}