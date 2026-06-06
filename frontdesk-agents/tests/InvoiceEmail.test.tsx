import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import { InvoiceEmail } from '@/lib/emails/InvoiceEmail'

describe('InvoiceEmail', () => {
  describe('rendering', () => {
    it('renders without crashing with required props', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$150.00' }))
      expect(typeof html).toBe('string')
      expect(html.length).toBeGreaterThan(0)
    })

    it('renders without crashing with all optional props', async () => {
      const html = await render(InvoiceEmail({
        customerName: 'Acme Corp',
        businessName: 'Frontdesk Agents',
        invoiceId: 'INV-999',
        amount: '$500.00',
        dueDate: 'January 31, 2026',
        description: 'Enterprise Plan - Annual',
        status: 'paid',
      }))
      expect(typeof html).toBe('string')
      expect(html.length).toBeGreaterThan(0)
    })

    it('renders an Html and Body element', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).toContain('<html')
      expect(html).toContain('<body')
    })

    it('includes a Preview element with invoice context', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-123', amount: '$200', status: 'pending' }))
      expect(html).toContain('Invoice INV-123')
      expect(html).toContain('Payment Due')
    })

    it('shows "Paid" in preview when status is paid', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-123', amount: '$200', status: 'paid' }))
      expect(html).toContain('Paid')
    })

    it('shows "Overdue" in preview when status is overdue', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-123', amount: '$200', status: 'overdue' }))
      expect(html).toContain('Overdue')
    })
  })

  describe('business name and header', () => {
    it('displays the businessName in the header', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', businessName: 'Acme Corp' }))
      expect(html).toContain('Acme Corp')
    })

    it('uses default businessName when not provided', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).toContain('Frontdesk Agents')
    })

    it('displays the invoice ID in the header', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-999', amount: '$100' }))
      expect(html).toContain('INV-999')
    })
  })

  describe('amount display', () => {
    it('displays the amount prominently', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$1,234.56' }))
      expect(html).toContain('$1,234.56')
    })
  })

  describe('customer information', () => {
    it('displays customerName in the bill-to section', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', customerName: 'John Smith' }))
      expect(html).toContain('John Smith')
    })

    it('uses default customerName when not provided', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).toContain('Valued Customer')
    })

    it('displays dueDate when provided', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', dueDate: 'February 1, 2026' }))
      expect(html).toContain('February 1, 2026')
    })

    it('does not render due date section when dueDate is omitted', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).not.toContain('DUE DATE')
    })
  })

  describe('description', () => {
    it('displays description when provided', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', description: 'Monthly retainer' }))
      expect(html).toContain('Monthly retainer')
    })

    it('does not render description section when omitted', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).not.toContain('DESCRIPTION')
    })
  })

  describe('status badge', () => {
    it('renders status=paid with green color in inline style', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', status: 'paid' }))
      expect(html).toContain('#16a34a')
      expect(html).toContain('PAID')
    })

    it('renders status=pending with blue color in inline style', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', status: 'pending' }))
      expect(html).toContain('#2563eb')
      expect(html).toContain('PENDING')
    })

    it('renders status=overdue with red color in inline style', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', status: 'overdue' }))
      expect(html).toContain('#dc2626')
      expect(html).toContain('OVERDUE')
    })

    it('defaults to pending when status is omitted', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).toContain('#2563eb') // blue = pending default
      expect(html).toContain('PENDING')
    })
  })

  describe('footer', () => {
    it('includes the business name in the footer', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100', businessName: 'Frontdesk Agents' }))
      expect(html).toContain('Frontdesk Agents')
    })

    it('includes powered-by footer text', async () => {
      const html = await render(InvoiceEmail({ invoiceId: 'INV-001', amount: '$100' }))
      expect(html).toContain('Powered by Frontdesk Agents')
    })
  })
})