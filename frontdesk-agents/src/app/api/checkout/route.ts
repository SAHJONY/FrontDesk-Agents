import { NextRequest, NextResponse } from 'next/server'
import { metricsEngine } from '@/lib/metrics-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, customerId, businessName, email, amount } = body

    if (!plan || !customerId || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Record the acquisition in metrics
    metricsEngine.recordAcquisition(amount, 0) // CAC tracked separately
    metricsEngine.recordRevenue('subscriptions', amount)

    return NextResponse.json({
      success: true,
      message: `Subscription created for ${businessName}`,
      metrics: metricsEngine.getMetrics(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    plans: [
      { id: 'starter', name: 'Starter', price: 99, features: ['Up to 500 calls/mo', '1 Phone Number', 'Basic Analytics', 'Email Support'] },
      { id: 'growth', name: 'Growth', price: 149, features: ['Up to 2,000 calls/mo', '3 Phone Numbers', 'Advanced Analytics', 'Priority Support', 'Custom Voice'] },
      { id: 'pro', name: 'Pro', price: 299, features: ['Unlimited calls', '10 Phone Numbers', 'Real-time Dashboard', 'API Access', 'Dedicated Support', 'Multi-language'] },
      { id: 'enterprise', name: 'Enterprise', price: 999, features: ['Everything in Pro', 'Unlimited Numbers', 'White-label', 'SLA Guarantee', 'Custom Integration', 'Account Manager'] },
    ]
  })
}
