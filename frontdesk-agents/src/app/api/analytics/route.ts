import { NextResponse } from 'next/server'

// Store recent analytics events in memory (use database in production)
const recentEvents: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Store event
    recentEvents.push({
      ...body,
      timestamp: new Date().toISOString(),
    })

    // Keep only last 1000 events in memory
    if (recentEvents.length > 1000) {
      recentEvents.shift()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    events: recentEvents.slice(-100), // Return last 100 events
  })
}
