import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCustomerSession } from '@/lib/customer-auth'
import { getOwnerSession } from '@/lib/owner-session'
import { sendInvoiceEmail } from '@/lib/email'
import { cookies } from 'next/headers'
import { authRateLimit, getClientIp } from '@/lib/rate-limit'
export const dynamic = 'force-dynamic'

const CUSTOMER_SESSION_COOKIE = 'customer_session'

interface CustomerSession {
  id: string; email: string; businessName: string; ownerName: string
  plan: string; customerId: string; authenticated: boolean; loginTime: string
}

async function getCustomerSessionLocal(): Promise<CustomerSession | null> {
  try {
    const store = await cookies()
    const cookie = store.get(CUSTOMER_SESSION_COOKIE)
    if (!cookie) {
      return getCustomerSession()
    }
    const session: CustomerSession = JSON.parse(cookie.value)
    return session?.authenticated ? session : null
  } catch { return null }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  const rateLimitResult = authRateLimit(clientIp)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter ?? 60) } }
    )
  }

  try {
    const body = await request.json()
    const { invoiceId, customerEmail, subject, html } = body

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid invoiceId' },
        { status: 400 }
      )
    }

    // Auth — owner first, then customer
    let session: { authenticated: boolean } | null
    try {
      session = await getOwnerSession()
      if (!session?.authenticated) {
        session = await getCustomerSessionLocal()
      }
    } catch {
      session = null
    }

    if (!session?.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Send via Stripe
    await stripe.client.invoices.sendInvoice(invoiceId)

    // Also send a styled email via Resend — all three params must be present
    if (customerEmail && subject && html) {
      try {
        await sendInvoiceEmail({ to: customerEmail, subject, html })
      } catch (emailError) {
        // Non-fatal: Stripe email already sent — log and continue
        console.error('Resend email error (non-fatal):', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send invoice API error:', error)

    if (error?.type === 'StripeInvalidRequestError') {
      const msg = error.message || ''
      if (msg.includes('already been sent')) {
        return NextResponse.json(
          { success: false, error: 'This invoice has already been sent to the customer.' },
          { status: 400 }
        )
      }
      if (msg.includes('invoice is not') || msg.includes('status must be')) {
        return NextResponse.json(
          { success: false, error: 'This invoice cannot be sent because it has already been finalized or paid. Customers can download the PDF from their account.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: `Stripe error: ${msg}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send invoice. Please try again.' },
      { status: 500 }
    )
  }
}