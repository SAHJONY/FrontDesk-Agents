/**
 * POST /api/harness/trigger
 * Manually trigger a harness cycle
 */

import { NextResponse } from 'next/server'
import { getHarness } from '@/lib/harness/engine'

export async function POST() {
  try {
    const harness = getHarness()
    const result = await harness.runCycle()

    return NextResponse.json({
      success: true,
      message: `Harness cycle #${result.cycle} completed`,
      cycle: result.cycle,
      timestamp: result.timestamp,
      durationSeconds: result.durationSeconds,
      anomaliesDetected: result.anomaliesDetected.length,
      deploymentsApplied: result.deployments.length,
      learnings: result.learnings.length
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger harness cycle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
