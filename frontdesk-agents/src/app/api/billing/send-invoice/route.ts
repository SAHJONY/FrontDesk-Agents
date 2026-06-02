import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCustomerSession } from '@/lib/customer-auth'
import { authService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId } = body

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid invoiceId' },
        { status: 400 }
      )
    }

    // Try owner auth first, then customer auth
    let session = null
    try {
      session = await authService.getSession()
    } catch {
      // Not an owner session, try customer
    }

    if (!session) {
      try {
        session = await getCustomerSession()
      } catch {
        // Not authenticated at all
      }
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Send the invoice via Stripe
    await stripe.client.invoices.sendInvoice(invoiceId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send invoice API error:', error)

    // Provide user-friendly error messages
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
