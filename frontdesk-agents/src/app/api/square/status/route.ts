// Square Status API Route
// GET /api/square/status - Check Square connection status

import { NextResponse } from 'next/server'
import { getSquareStatus } from '@/lib/square'

export async function GET() {
  try {
    const status = await getSquareStatus()
    
    return NextResponse.json({
      provider: 'square',
      connected: status.connected,
      environment: status.environment,
      paymentsEnabled: status.paymentsEnabled,
      subscriptionsEnabled: status.subscriptionsEnabled,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      provider: 'square',
      connected: false,
      error: error.message || 'Connection check failed',
      timestamp: new Date().toISOString()
    })
  }
}