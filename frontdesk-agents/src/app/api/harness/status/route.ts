/**
 * GET /api/harness/status
 * Returns current status of the autonomous harness engine
 */

import { NextResponse } from 'next/server'
import { getHarness } from '@/lib/harness/engine'

export async function GET() {
  try {
    const harness = getHarness()
    const status = harness.getStatus()
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get harness status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
