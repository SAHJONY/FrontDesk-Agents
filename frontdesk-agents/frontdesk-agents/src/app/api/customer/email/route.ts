import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendUpgradeEmail, sendVerificationEmail, isValidEmail } from '@/lib/email'

// Email types supported
type EmailType = 'welcome' | 'upgrade' | 'verification'

interface EmailRequest {
  type: EmailType
  to: string
  customerName: string
  businessName?: string
  planName?: string
  previousTier?: string
  newTier?: string
  newFeatures?: string[]
  verificationCode?: string
  trialEndDate?: string
  dashboardUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { type, to, customerName, businessName, planName, previousTier, newTier, newFeatures, verificationCode, trialEndDate, dashboardUrl } = body

    // Validate required fields
    if (!type || !to || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to, customerName' },
        { status: 400 }
      )
    }

    // Validate email address
    if (!isValidEmail(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Default dashboard URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'
    const defaultDashboardUrl = `${appUrl}/customer/dashboard`

    let result: { success: boolean; error?: string }

    switch (type) {
      case 'welcome':
        if (!businessName || !planName || !trialEndDate) {
          return NextResponse.json(
            { error: 'Welcome email requires: businessName, planName, trialEndDate' },
            { status: 400 }
          )
        }
        result = await sendWelcomeEmail({
          to,
          customerName,
          businessName,
          planName,
          trialEndDate: new Date(trialEndDate),
          dashboardUrl: dashboardUrl || defaultDashboardUrl,
        })
        break

      case 'upgrade':
        if (!previousTier || !newTier || !newFeatures) {
          return NextResponse.json(
            { error: 'Upgrade email requires: previousTier, newTier, newFeatures' },
            { status: 400 }
          )
        }
        result = await sendUpgradeEmail({
          to,
          customerName,
          businessName: businessName || 'Your Business',
          previousTier,
          newTier,
          newFeatures,
          dashboardUrl: dashboardUrl || defaultDashboardUrl,
        })
        break

      case 'verification':
        if (!verificationCode) {
          return NextResponse.json(
            { error: 'Verification email requires: verificationCode' },
            { status: 400 }
          )
        }
        result = await sendVerificationEmail({
          to,
          customerName,
          verificationCode,
          expiryMinutes: 15,
        })
        break

      default:
        return NextResponse.json(
          { error: `Invalid email type: ${type}. Must be one of: welcome, upgrade, verification` },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully`,
        sentTo: to,
      })
    } else {
      return NextResponse.json(
        { error: result.error || `Failed to send ${type} email` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error(`Customer email error:`, error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: 'POST /api/customer/email',
    description: 'Send customer onboarding emails (welcome, upgrade, verification)',
    supportedTypes: ['welcome', 'upgrade', 'verification'],
    examples: {
      welcome: {
        type: 'welcome',
        to: 'customer@example.com',
        customerName: 'John',
        businessName: 'Acme Corp',
        planName: 'Growth',
        trialEndDate: '2024-12-31T23:59:59Z',
      },
      upgrade: {
        type: 'upgrade',
        to: 'customer@example.com',
        customerName: 'John',
        previousTier: 'growth',
        newTier: 'pro',
        newFeatures: ['Unlimited Calls', '10 Phone Numbers'],
      },
      verification: {
        type: 'verification',
        to: 'customer@example.com',
        customerName: 'John',
        verificationCode: '123456',
      },
    },
  })
}