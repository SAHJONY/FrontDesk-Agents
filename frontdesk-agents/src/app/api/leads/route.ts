import { NextRequest, NextResponse } from 'next/server'
import { salesEngine } from '@/lib/sales-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lead = salesEngine.scoreLead({
      id: `lead_${Date.now()}`,
      businessName: body.businessName,
      website: body.website,
      industry: body.industry,
      email: body.email,
      phone: body.phone,
      employeeCount: body.employeeCount,
      estimatedCallVolume: body.estimatedCallVolume,
      urgency: body.urgency ?? 'medium',
      source: {
        channel: body.source ?? 'direct',
        campaign: body.campaign,
        referrerId: body.referrerId,
        partnerId: body.partnerId,
        landingPage: body.landingPage,
      },
      notes: body.notes,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ success: true, lead })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const pipeline = salesEngine.getPipeline()
    const metrics = salesEngine.getMetrics()
    const leads = salesEngine.getLeads()
    return NextResponse.json({ pipeline, metrics, leads })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
