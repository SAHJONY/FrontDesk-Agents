import { NextRequest, NextResponse } from 'next/server'
import { partnerEngine } from '@/lib/partner-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const partner = partnerEngine.registerPartner({
      name: body.name,
      email: body.email,
      type: body.type ?? 'referral',
      promoCode: body.promoCode,
    })
    return NextResponse.json({ success: true, partner })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const metrics = partnerEngine.getMetrics()
    const partners = partnerEngine.getPartners()
    return NextResponse.json({ metrics, partners })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
