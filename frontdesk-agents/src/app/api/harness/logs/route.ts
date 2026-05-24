/**
 * GET /api/harness/logs
 * Returns recent logs from the harness engine
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock logs - in production, fetch from database
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '✅ Cycle #142 completed successfully',
        details: {
          duration: 12.5,
          anomaliesDetected: 2,
          deployments: 1
        }
      },
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'info',
        message: '🚀 Deployed solution: hypothesis_anomaly_123',
        details: {
          improvement: '+18% conversion',
          canary: true
        }
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'warning',
        message: '⚠️ Detected conversion drop in signup flow',
        details: {
          type: 'conversion_drop',
          severity: 'medium',
          affectedComponent: 'signup_page'
        }
      },
      {
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'info',
        message: '🧠 Stored learning: successful_deployment',
        details: {
          pattern: 'simplify_form_fields',
          industry: 'legal'
        }
      }
    ]

    return NextResponse.json({ logs })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
