import { NextRequest, NextResponse } from 'next/server'
import { metricsEngine } from '@/lib/metrics-engine'
import { salesEngine } from '@/lib/sales-engine'

export async function GET() {
  const profitMetrics = metricsEngine.getMetrics()
  const health = metricsEngine.evaluateHealth()
  const salesMetrics = salesEngine.getMetrics()
  const pipeline = salesEngine.getPipeline()
  const projections = metricsEngine.projectRevenue()
  return NextResponse.json({ profitMetrics, health, salesMetrics, pipeline, projections })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.type === 'acquisition') {
      metricsEngine.recordAcquisition(body.customerRevenue, body.acquisitionCost)
    } else if (body.type === 'churn') {
      metricsEngine.recordChurn(body.customerRevenue)
    } else if (body.type === 'costs') {
      metricsEngine.updateCosts(body.costs)
    } else if (body.type === 'revenue') {
      metricsEngine.recordRevenue(body.revenueType, body.amount)
    } else {
      return NextResponse.json({ success: false, error: 'Invalid type. Must be: acquisition, churn, costs, or revenue' }, { status: 400 })
    }
    return NextResponse.json({ success: true, metrics: metricsEngine.getMetrics() })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
