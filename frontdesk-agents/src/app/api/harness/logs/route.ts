/**
 * GET /api/harness/logs
 * Returns recent logs from the harness engine
 */

import { NextResponse } from 'next/server'
import { getHarness } from '@/lib/harness/engine'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const harness = getHarness()
    const logs = harness.getLogs(limit)

    return NextResponse.json({ logs })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
