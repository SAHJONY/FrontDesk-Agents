import { NextRequest, NextResponse } from 'next/server'
import { partnerEngine } from '@/lib/partner-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const referral = partnerEngine.trackReferral({
      partnerId: body.partnerId,
      businessName: body.businessName,
      email: body.email,
      dealValue: body.dealValue,
    })
    if (!referral) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, referral })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const partnerId = request.nextUrl.searchParams.get('partnerId')
    const referrals = partnerEngine.getReferrals(partnerId ?? undefined)
    return NextResponse.json({ referrals })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
