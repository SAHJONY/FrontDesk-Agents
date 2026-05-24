/**
 * POST /api/harness/trigger
 * Manually trigger a harness cycle
 */

import { NextResponse } from 'next/server'
import { harness } from '@/lib/harness/engine'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { forceDeploy } = body || {}

    // Trigger one cycle
    const result = await harness.runCycle()

    return NextResponse.json({
      success: true,
      message: 'Harness cycle triggered',
      result
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
