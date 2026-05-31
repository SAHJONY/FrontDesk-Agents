import os

BASE = os.getcwd()

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)

# =============================================================
# CHANGE 1: Create API route /api/billing/send-invoice
# =============================================================
api_route = '''import { NextRequest, NextResponse } from 'next/server'
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
    await stripe.invoices.sendInvoice(invoiceId)

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
'''

write('src/app/api/billing/send-invoice/route.ts', api_route)
print("CHANGE 1 OK: Created send-invoice API route")

# =============================================================
# CHANGE 2: Add Send Invoice button to customer billing page
# =============================================================
customer = read('src/app/customer/billing/page.tsx')

# Add Mail icon to lucide-react import
old_import = "ChevronDown, ChevronUp, Search,"
new_import = "ChevronDown, ChevronUp, Mail, Search,"

if old_import in customer:
    customer = customer.replace(old_import, new_import, 1)
    print("CHANGE 2a OK: Added Mail import to customer page")
else:
    print("CHANGE 2a FAIL: Could not add Mail import")

# Find the invoice PDF link section and add a Send Invoice button after it
old_invoice_section = """                            {record.invoice_pdf_url && (
                                <div className=\"col-span-full\">
                                  <a href={record.invoice_pdf_url} target=\"_blank\" rel=\"noopener noreferrer\" className=\"inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-xs\">
                                    <FileText className=\"w-3.5 h-3.5\" />
                                    View Invoice PDF
                                  </a>
                                </div>
                              )}"""

new_invoice_section = """                            {record.invoice_pdf_url && (
                                <div className=\"col-span-full\">
                                  <div className=\"flex items-center gap-3\">
                                    <a href={record.invoice_pdf_url} target=\"_blank\" rel=\"noopener noreferrer\" className=\"inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-xs\">
                                      <FileText className=\"w-3.5 h-3.5\" />
                                      View Invoice PDF
                                    </a>
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch('/api/billing/send-invoice', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ invoiceId: record.invoice_id }),
                                          })
                                          const json = await res.json()
                                          if (json.success) {
                                            alert('Invoice sent to your email!')
                                          } else {
                                            alert(json.error || 'Failed to send invoice')
                                          }
                                        } catch {
                                          alert('Network error. Please try again.')
                                        }
                                      }}
                                      className=\"inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs\"
                                    >
                                      <Mail className=\"w-3.5 h-3.5\" />
                                      Email Invoice
                                    </button>
                                  </div>
                                </div>
                              )}"""

if old_invoice_section in customer:
    customer = customer.replace(old_invoice_section, new_invoice_section, 1)
    print("CHANGE 2b OK: Added Email Invoice button to customer page")
else:
    print("CHANGE 2b FAIL: Could not find invoice PDF section in customer page")

write('src/app/customer/billing/page.tsx', customer)
print("CHANGE 2 OK: Customer billing page updated")

# =============================================================
# CHANGE 3: Add Send Invoice button to owner billing page
# =============================================================
owner = read('src/app/owner/billing/page.tsx')

# Mail is already imported in the owner page, so no need to add it

# Find the invoice PDF link section and add a Send Invoice button
old_owner_invoice = """                            {record.invoice_pdf_url && (
                              <div className=\"col-span-full\">
                                <a
                                  href={record.invoice_pdf_url}
                                  target=\"_blank\"
                                  rel=\"noopener noreferrer\"
                                  className=\"inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors\"
                                >
                                  <FileText className=\"w-3.5 h-3.5\" />
                                  View Invoice PDF
                                </a>
                              </div>
                            )}"""

new_owner_invoice = """                            {record.invoice_pdf_url && (
                              <div className=\"col-span-full\">
                                <div className=\"flex items-center gap-3\">
                                  <a
                                    href={record.invoice_pdf_url}
                                    target=\"_blank\"
                                    rel=\"noopener noreferrer\"
                                    className=\"inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors\"
                                  >
                                    <FileText className=\"w-3.5 h-3.5\" />
                                    View Invoice PDF
                                  </a>
                                  <button
                                    onClick={async () => {
                                      // Store original text temporarily
                                      const btn = (event.target as HTMLElement).closest('button')
                                      if (btn) {
                                        const originalHTML = btn.innerHTML
                                        btn.innerHTML = '<span class=\"flex items-center gap-1\"><svg class=\"animate-spin w-3 h-3\" viewBox=\"0 0 24 24\" fill=\"none\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"/><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z\"/></svg> Sending...</span>'
                                        btn.setAttribute('disabled', 'true')
                                        try {
                                          const res = await fetch('/api/billing/send-invoice', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ invoiceId: record.invoice_id }),
                                          })
                                          const json = await res.json()
                                          if (json.success) {
                                            btn.innerHTML = '<span class=\"flex items-center gap-1 text-green-400\">Sent!</span>'
                                            setTimeout(() => { btn.innerHTML = originalHTML; btn.removeAttribute('disabled') }, 2500)
                                          } else {
                                            btn.innerHTML = `<span class=\"flex items-center gap-1 text-red-400\">${json.error || 'Failed'}</span>`
                                            setTimeout(() => { btn.innerHTML = originalHTML; btn.removeAttribute('disabled') }, 3000)
                                          }
                                        } catch {
                                          btn.innerHTML = '<span class=\"flex items-center gap-1 text-red-400\">Error</span>'
                                          setTimeout(() => { btn.innerHTML = originalHTML; btn.removeAttribute('disabled') }, 3000)
                                        }
                                      }
                                    }}
                                    className=\"inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs\"
                                    title=\"Send invoice to customer's email\"
                                  >
                                    <Mail className=\"w-3.5 h-3.5\" />
                                    Send Invoice
                                  </button>
                                </div>
                              </div>
                            )}"""

if old_owner_invoice in owner:
    owner = owner.replace(old_owner_invoice, new_owner_invoice, 1)
    print("CHANGE 3a OK: Added Send Invoice button to owner page")
else:
    print("CHANGE 3a FAIL: Could not find invoice PDF section in owner page")
    # Debug
    idx = owner.find('invoice_pdf_url')
    if idx >= 0:
        print(f"Found at idx {idx}: {repr(owner[idx:idx+200])}")

write('src/app/owner/billing/page.tsx', owner)
print("CHANGE 3 OK: Owner billing page updated")

print("\nAll changes applied successfully!")
