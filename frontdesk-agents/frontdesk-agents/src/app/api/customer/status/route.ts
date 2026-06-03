import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null

// Profit thresholds for tier auto-upgrade
const UPGRADE_THRESHOLDS: Record<string, { profit: number; newTier: string }> = {
  starter: { profit: 3000, newTier: 'growth' },
  growth: { profit: 10000, newTier: 'pro' },
}

// Plan features
const PLAN_FEATURES: Record<string, {
  callsLimit: number
  phoneNumbersLimit: number
  priceMonthly: number
  priceYearly: number
  features: string[]
}> = {
  starter: {
    callsLimit: 500,
    phoneNumbersLimit: 1,
    priceMonthly: 99,
    priceYearly: 79,
    features: ['500 calls/month', '1 Phone Number', 'Basic Analytics', 'Email Support', 'Standard Voice', 'Appointment Booking'],
  },
  growth: {
    callsLimit: 2000,
    phoneNumbersLimit: 3,
    priceMonthly: 149,
    priceYearly: 119,
    features: ['2,000 calls/month', '3 Phone Numbers', 'Advanced Analytics', 'Priority Support', 'Custom Voice', '24/7 Coverage', 'SMS Integration', 'Multi-language (5)'],
  },
  pro: {
    callsLimit: -1, // unlimited
    phoneNumbersLimit: 10,
    priceMonthly: 299,
    priceYearly: 239,
    features: ['Unlimited Calls', '10 Phone Numbers', 'Real-time Dashboard', 'API Access', 'Dedicated Support', 'Custom Voice', '200+ Languages', 'CRM Integration'],
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Mock customer data (in production, fetch from database)
    const customerData = {
      id: customerId,
      email: 'demo@business.com',
      businessName: 'GlobalVoice Demo Business',
      planTier: 'growth',
      profitGenerated: 12450,
      totalRevenue: 45890,
      totalCalls: 1270,
      phoneNumbersCount: 2,
      billingCycle: 'monthly',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }

    // Check if customer qualifies for upgrade
    const upgradeInfo = checkAutoUpgrade(customerData.planTier, customerData.profitGenerated)

    return NextResponse.json({
      success: true,
      customer: customerData,
      features: PLAN_FEATURES[customerData.planTier],
      upgradeAvailable: upgradeInfo.eligible,
      upgradeInfo: upgradeInfo.eligible ? {
        currentTier: customerData.planTier,
        newTier: upgradeInfo.newTier,
        profitRequired: UPGRADE_THRESHOLDS[customerData.planTier]?.profit || 0,
        profitGenerated: customerData.profitGenerated,
      } : null,
    })
  } catch (error: any) {
    console.error('Customer status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get customer status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, action, data } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'update_profit':
        // Update profit generated (called when customer earns revenue)
        return await handleProfitUpdate(customerId, data)
      
      case 'check_upgrade':
        // Check if customer qualifies for tier upgrade
        return await handleUpgradeCheck(customerId)
      
      case 'process_upgrade':
        // Process automatic tier upgrade
        return await handleUpgrade(customerId, data?.newTier)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Customer status action error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process action' },
      { status: 500 }
    )
  }
}

function checkAutoUpgrade(currentTier: string, profitGenerated: number): { eligible: boolean; newTier: string | null } {
  const threshold = UPGRADE_THRESHOLDS[currentTier]
  
  if (!threshold) {
    return { eligible: false, newTier: null } // Already at max tier
  }

  if (profitGenerated >= threshold.profit) {
    return { eligible: true, newTier: threshold.newTier }
  }

  return { eligible: false, newTier: null }
}

async function handleProfitUpdate(customerId: string, data: { profitAmount: number; revenueType: string }) {
  // In production, update profit in database
  // Also trigger revenue tracking event
  
  // Check if this profit triggers an upgrade
  // (In production, fetch current tier from database)
  const upgradeInfo = checkAutoUpgrade('growth', data.profitAmount)

  return NextResponse.json({
    success: true,
    profitUpdated: true,
    newProfitTotal: data.profitAmount,
    upgradeAvailable: upgradeInfo.eligible,
    message: upgradeInfo.eligible 
      ? `Congratulations! You've qualified for ${upgradeInfo.newTier} tier!`
      : 'Profit recorded successfully.',
  })
}

async function handleUpgradeCheck(customerId: string) {
  // In production, fetch customer from database
  const currentTier = 'growth'
  const profitGenerated = 12450 // Mock data

  const upgradeInfo = checkAutoUpgrade(currentTier, profitGenerated)

  return NextResponse.json({
    success: true,
    eligible: upgradeInfo.eligible,
    currentTier,
    newTier: upgradeInfo.newTier,
    threshold: UPGRADE_THRESHOLDS[currentTier]?.profit || 0,
    profitGenerated,
    features: upgradeInfo.eligible ? PLAN_FEATURES[upgradeInfo.newTier!] : null,
  })
}

async function handleUpgrade(customerId: string, newTier: string) {
  // Validate upgrade path
  const validTiers = ['starter', 'growth', 'pro']
  if (!validTiers.includes(newTier)) {
    return NextResponse.json(
      { error: 'Invalid tier' },
      { status: 400 }
    )
  }

  // In production, fetch current tier from database
  const previousTier = 'growth' // Mock - would fetch from DB

  // In production:
  // 1. Verify customer qualifies for upgrade
  // 2. Update tier in database
  // 3. Update Stripe subscription if applicable
  // 4. Send upgrade notification email
  // 5. Log upgrade event

  return NextResponse.json({
    success: true,
    upgraded: true,
    previousTier,
    newTier,
    effectiveDate: new Date().toISOString(),
    message: `Successfully upgraded from ${previousTier} to ${newTier}. Enjoy your new features!`,
    newFeatures: PLAN_FEATURES[newTier].features,
  })
}