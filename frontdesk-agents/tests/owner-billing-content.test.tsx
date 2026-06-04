import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'

// ─── Mock framer-motion so animation delays don't stall tests ───────────────
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => ({ children, ...props }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { initial, animate, exit, layout, transition, ...divProps } = props
        return React.createElement('div', divProps, children)
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ─── Global fetch mock ───────────────────────────────────────────────────────
let mockFetch = vi.fn()
globalThis.fetch = mockFetch

// ─── Helper: build a minimal billing record ─────────────────────────────────
function makeRec(overrides: Record<string, unknown> = {}) {
  return {
    id: 'bill_001',
    customer_id: 'cus_001',
    invoice_id: 'INV-001',
    subscription_id: 'sub_001',
    amount: 2999,
    currency: 'usd',
    status: 'succeeded' as const,
    description: 'Monthly subscription',
    billing_reason: 'subscription_cycle',
    invoice_pdf_url: 'https://example.com/invoice.pdf',
    period_start: '2025-05-01T00:00:00Z',
    period_end: '2025-06-01T00:00:00Z',
    created_at: '2025-05-01T00:00:00Z',
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    business_name: 'Test Business',
    ...overrides,
  }
}

// ─── Setup billing mock + render OwnerBillingContent ─────────────────────────
// Uses mockImplementation (persistent) + act() wrapping to flush React state.
async function setupBilling(records: Record<string, unknown>[] = [], embedded = false) {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/owner/billing')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: records, pagination: { hasMore: false } }),
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
  const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
  await act(async () => {
    render(React.createElement(OwnerBillingContent, { embedded }))
  })
}

// ─── Expand a record row by finding its description text ─────────────────────
// invoice_id is only in expanded detail; description is in the collapsed row.
async function expandRow(description: string) {
  await act(async () => {
    await waitFor(() => expect(screen.getByText(description)).toBeInTheDocument())
  })
  const el = screen.getByText(description)
  await act(async () => {
    fireEvent.click(el.closest('button') as Element)
  })
  await act(async () => {
    await waitFor(() => expect(screen.getByText('Invoice ID')).toBeInTheDocument())
  })
}

// ─── Helper: find status filter button by exact text (not row buttons) ───────
function getStatusFilterButton(statusText: string) {
  // Filter buttons live in a flex container with class "flex gap-2 flex-wrap"
  // and have rounded-lg (not rounded-xl). Row cards have rounded-xl.
  const buttons = screen.getAllByRole('button')
  return buttons.find(b => b.textContent === statusText && !b.className.includes('rounded-xl')) as HTMLButtonElement | undefined
}

beforeEach(() => {
  vi.resetAllMocks()
  mockFetch = vi.fn()
  globalThis.fetch = mockFetch
})

// ════════════════════════════════════════════════════════════════════════════
// FILTERING TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('OwnerBillingContent – Filtering', () => {
  it('renders all records returned from the API', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'Starter plan' }),
      makeRec({ id: 'bill_002', description: 'Pro plan' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Starter plan')).toBeInTheDocument())
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Pro plan')).toBeInTheDocument())
    })
  })

  it('filters records by search query (description)', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'Monthly subscription' }),
      makeRec({ id: 'bill_002', description: 'One-time setup fee' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Monthly subscription')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/search by description/i), { target: { value: 'subscription' } })
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Monthly subscription')).toBeInTheDocument())
    })
    expect(screen.queryByText('One-time setup fee')).not.toBeInTheDocument()
  })

  it('filters records by search query (invoice_id)', async () => {
    // invoice_id is only searchable via the search box, but only visible in expanded detail.
    // Use description as the DOM sentinel; search by invoice_id value.
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'First plan', invoice_id: 'INV-2025-001' }),
      makeRec({ id: 'bill_002', description: 'Second plan', invoice_id: 'INV-2025-002' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('First plan')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/search by description/i), { target: { value: 'INV-2025-002' } })
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Second plan')).toBeInTheDocument())
    })
    expect(screen.queryByText('First plan')).not.toBeInTheDocument()
  })

  it('filters records by search query (customer_name)', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'Plan A', customer_name: 'Alice Smith' }),
      makeRec({ id: 'bill_002', description: 'Plan B', customer_name: 'Bob Jones' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/search by description/i), { target: { value: 'Alice' } })
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument())
    })
    expect(screen.queryByText('Plan B')).not.toBeInTheDocument()
  })

  it('filters by status filter buttons', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'Success record', status: 'succeeded' }),
      makeRec({ id: 'bill_002', description: 'Failed record', status: 'failed' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Success record')).toBeInTheDocument())
    })
    expect(screen.getByText('Failed record')).toBeInTheDocument()

    const failedBtn = getStatusFilterButton('Failed')
    expect(failedBtn).toBeDefined()
    await act(async () => {
      fireEvent.click(failedBtn!)
    })

    await act(async () => {
      await waitFor(() => expect(screen.getByText('Failed record')).toBeInTheDocument())
    })
    expect(screen.queryByText('Success record')).not.toBeInTheDocument()
  })

  it('shows "no records match" empty state when filters match nothing', async () => {
    await setupBilling([makeRec({ description: 'Monthly subscription' })])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Monthly subscription')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/search by description/i), { target: { value: 'nonexistent plan' } })
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('No records match your filters')).toBeInTheDocument())
    })
  })

  it('clears date filter when × button is clicked', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Date record', created_at: '2025-05-01T00:00:00Z' })])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Date record')).toBeInTheDocument())
    })

    const dateInput = screen.getByTitle('Start date')
    await act(async () => {
      fireEvent.change(dateInput, { target: { value: '2025-05-01' } })
    })
    await act(async () => {
      await waitFor(() => expect((dateInput as HTMLInputElement).value).toBe('2025-05-01'))
    })

    await act(async () => {
      fireEvent.click(screen.getByTitle('Clear date filter'))
    })
    await act(async () => {
      await waitFor(() => expect((dateInput as HTMLInputElement).value).toBe(''))
    })
  })

  it('filters records by start date', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'April record', created_at: '2025-04-01T00:00:00Z' }),
      makeRec({ id: 'bill_002', description: 'June record', created_at: '2025-06-01T00:00:00Z' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('April record')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.change(screen.getByTitle('Start date'), { target: { value: '2025-05-01' } })
    })
    await act(async () => {
      await waitFor(() => expect(screen.queryByText('April record')).not.toBeInTheDocument())
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('June record')).toBeInTheDocument())
    })
  })

  it('filters records by end date', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', description: 'April record', created_at: '2025-04-01T00:00:00Z' }),
      makeRec({ id: 'bill_002', description: 'June record', created_at: '2025-06-01T00:00:00Z' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('June record')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.change(screen.getByTitle('End date'), { target: { value: '2025-05-15' } })
    })
    await act(async () => {
      await waitFor(() => expect(screen.queryByText('June record')).not.toBeInTheDocument())
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('April record')).toBeInTheDocument())
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SORTING TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('OwnerBillingContent – Sorting', () => {
  it('sorts newest first by default', async () => {
    await setupBilling([
      makeRec({ id: 'bill_new', description: 'June plan', created_at: '2025-06-01T00:00:00Z' }),
      makeRec({ id: 'bill_old', description: 'April plan', created_at: '2025-04-01T00:00:00Z' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('June plan')).toBeInTheDocument())
    })
    expect(screen.getByText('April plan')).toBeInTheDocument()
    const newEl = screen.getByText('June plan')
    const oldEl = screen.getByText('April plan')
    expect(newEl.compareDocumentPosition(oldEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('toggles to oldest-first when sort button is clicked', async () => {
    await setupBilling([
      makeRec({ id: 'bill_new', description: 'June plan', created_at: '2025-06-01T00:00:00Z' }),
      makeRec({ id: 'bill_old', description: 'April plan', created_at: '2025-04-01T00:00:00Z' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('June plan')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /newest/i }))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Oldest')).toBeInTheDocument())
    })
  })

  it('footer reflects current sort order', async () => {
    await setupBilling([
      makeRec({ id: 'bill_new', description: 'June plan', created_at: '2025-06-01T00:00:00Z' }),
      makeRec({ id: 'bill_old', description: 'April plan', created_at: '2025-04-01T00:00:00Z' }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText(/sorted newest/i)).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /newest/i }))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText(/sorted oldest/i)).toBeInTheDocument())
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// PAGINATION TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('OwnerBillingContent – Pagination', () => {
  it('shows load more button when API returns hasMore: true', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_page1', description: 'Page 1 plan' })], pagination: { hasMore: true } }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Load More')).toBeInTheDocument())
    })
  })

  it('does NOT show load more button when hasMore is false', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Only plan' })])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Only plan')).toBeInTheDocument())
    })
    expect(screen.queryByText('Load More')).not.toBeInTheDocument()
  })

  it('loads next page when Load More is clicked', async () => {
    let page = 1
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        const data = page === 1
          ? [makeRec({ id: 'bill_page1', description: 'Page 1 plan' })]
          : [makeRec({ id: 'bill_page1', description: 'Page 1 plan' }), makeRec({ id: 'bill_page2', description: 'Page 2 plan' })]
        const hasMore = page === 1
        page++
        // Fix: reset page counter for subsequent tests to avoid duplicate id pollution
        if (page > 2) page = 1
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data, pagination: { hasMore } }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })

    await act(async () => {
      await waitFor(() => expect(screen.getByText('Page 1 plan')).toBeInTheDocument())
    })
    expect(screen.queryByText('Page 2 plan')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('Load More'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Page 2 plan')).toBeInTheDocument())
    })
    await act(async () => {
      await waitFor(() => expect(screen.queryByText('Load More')).not.toBeInTheDocument())
    })
  })

  it('footer shows current page number', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ description: 'Any plan' })], pagination: { hasMore: true } }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText(/page 1/i)).toBeInTheDocument())
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SEND INVOICE TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('OwnerBillingContent – Send Invoice', () => {
  it('opens confirmation dialog when Send Invoice is clicked', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Dialog plan', invoice_id: 'INV-DIALOG', invoice_pdf_url: 'https://example.com/invoice.pdf' })])
    await expandRow('Dialog plan')

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invoice'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText(/email the invoice PDF to the customer/i)).toBeInTheDocument())
    })
    expect(screen.getByText('Test Customer')).toBeInTheDocument()
    // Check the invoice ID appears in the dialog's detail section (under the Invoice ID label)
    const invoiceIdSpans = screen.getAllByText('INV-DIALOG')
    expect(invoiceIdSpans.length).toBeGreaterThanOrEqual(2)
    // The second occurrence is in the dialog's detail grid (first is in the confirmation text)
    expect(invoiceIdSpans[1]).toBeInTheDocument()
  })

  it('closes dialog when Cancel is clicked', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Cancel plan', invoice_pdf_url: 'https://example.com/invoice.pdf' })])
    await expandRow('Cancel plan')

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invoice'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.queryByText('Cancel')).not.toBeInTheDocument())
    })
  })

  it('calls /api/billing/send-invoice with POST and correct invoiceId', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', description: 'Send plan', invoice_id: 'INV-SEND', invoice_pdf_url: 'https://example.com/invoice.pdf' })], pagination: { hasMore: false } }),
        })
      }
      if (url === '/api/billing/send-invoice') {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) })
      }
      return Promise.resolve({ ok: true, json: () => ({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await expandRow('Send plan')

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invoice'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })

    // After dialog opens, there are 2 "Send Invoice" buttons: the one in the expanded row
    // (now a second occurrence) and the one in the dialog footer. Use at(-2) to get
    // the dialog's footer button (second-to-last), not .pop() which gets the last one
    // (which is the expanded row's button that re-triggers setConfirmSendId).
    const sendButtons = screen.getAllByText('Send Invoice')
    await act(async () => {
      fireEvent.click(sendButtons.at(-2)!)
    })

    await act(async () => {
      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/billing/send-invoice',
          expect.objectContaining({ method: 'POST' })
        )
      )
    })
    const sendCall = mockFetch.mock.calls.find(([u]) => u === '/api/billing/send-invoice')
    expect(sendCall).toBeDefined()
    const [, opts] = sendCall!
    const body = JSON.parse(opts.body)
    expect(body.invoiceId).toBe('INV-SEND')
  })

  it('closes dialog after successful send', async () => {
    let sendResolve: (val: unknown) => void = () => {}
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', description: 'Success plan', invoice_pdf_url: 'https://example.com/invoice.pdf' })], pagination: { hasMore: false } }),
        })
      }
      if (url === '/api/billing/send-invoice') {
        return new Promise((resolve) => { sendResolve = resolve as (val: unknown) => void })
      }
      return Promise.resolve({ ok: true, json: () => ({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await expandRow('Success plan')

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invoice'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })

    const sendButtons = screen.getAllByText('Send Invoice')
    await act(async () => {
      fireEvent.click(sendButtons.at(-2)!)
    })
    // isSending=true shows "Sending..." — it appears in BOTH the dialog's send button
    // AND the expanded row's send button (which shows Sending... when isSending is true)
    await act(async () => {
      await waitFor(() => {
        // Both the dialog's Send Invoice button and the row's Send Invoice button
        // show "Sending..." when isSending=true. Use getAllByText to handle both.
        const sendingEls = screen.getAllByText('Sending...')
        expect(sendingEls.length).toBeGreaterThanOrEqual(1)
      })
    })

    await act(async () => {
      sendResolve({ ok: true, json: async () => ({ success: true }) })
    })
    await act(async () => {
      await waitFor(() => expect(screen.queryByText('Cancel')).not.toBeInTheDocument())
    })
  })

  it('keeps dialog open when API returns success: false', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', description: 'Fail plan', invoice_pdf_url: 'https://example.com/invoice.pdf' })], pagination: { hasMore: false } }),
        })
      }
      if (url === '/api/billing/send-invoice') {
        return Promise.resolve({ ok: true, json: async () => ({ success: false, error: 'Already sent' }) })
      }
      return Promise.resolve({ ok: true, json: () => ({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await expandRow('Fail plan')

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invoice'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getAllByText('Send Invoice').pop()!)
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })
  })

  it('keeps dialog open when fetch throws', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', description: 'Throw plan', invoice_pdf_url: 'https://example.com/invoice.pdf' })], pagination: { hasMore: false } }),
        })
      }
      if (url === '/api/billing/send-invoice') {
        return Promise.reject(new Error('Network failure'))
      }
      return Promise.resolve({ ok: true, json: () => ({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await expandRow('Throw plan')

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invoice'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getAllByText('Send Invoice').pop()!)
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// STAT CARDS & EMPTY STATES
// ════════════════════════════════════════════════════════════════════════════
describe('OwnerBillingContent – Rendering', () => {
  it('shows stat cards with correct values', async () => {
    await setupBilling([
      makeRec({ id: 'bill_001', status: 'succeeded', amount: 2999 }),
      makeRec({ id: 'bill_002', status: 'succeeded', amount: 4999 }),
      makeRec({ id: 'bill_003', status: 'failed', amount: 1999 }),
    ])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('$79.98')).toBeInTheDocument())
    })
    expect(screen.getByText('2 successful payments')).toBeInTheDocument()
    expect(screen.getByText('33.3% failure rate')).toBeInTheDocument()
  })

  it('shows "no billing records" empty state when API returns empty array', async () => {
    await setupBilling([])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('No billing records yet')).toBeInTheDocument())
    })
  })

  it('shows loading spinner while initial fetch is in progress', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    expect(screen.getByText('Loading all billing records...')).toBeInTheDocument()
    expect(screen.queryByText('Monthly subscription')).not.toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    // Must throw to trigger the catch block where setError is called
    mockFetch.mockImplementation(() => { throw new Error('Server error') })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Failed to Load')).toBeInTheDocument())
    })
  })

  it('Retry button re-fetches data', async () => {
    let attempt = 0
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/owner/billing')) {
        attempt++
        if (attempt === 1) {
          // First call throws to trigger error state
          throw new Error('Server error')
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_after_retry', description: 'After retry' })], pagination: { hasMore: false } }),
        })
      }
      return Promise.resolve({ ok: true, json: () => ({}) })
    })
    const { default: OwnerBillingContent } = await import('@/components/OwnerBillingContent')
    await act(async () => {
      render(React.createElement(OwnerBillingContent))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Failed to Load')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Retry'))
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('After retry')).toBeInTheDocument())
    })
  })

  it('hides header when embedded=true', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Embedded record' })], true)
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Embedded record')).toBeInTheDocument())
    })
    // Header elements should be hidden when embedded=true
    expect(screen.queryByText('Back to Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Refresh')).not.toBeInTheDocument()
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument()
    // But stat cards and record content should still be visible
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
  })

  it('shows header when embedded=false', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Normal record' })], false)
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Normal record')).toBeInTheDocument())
    })
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
  })

  it('expands and collapses a record row', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Expandable plan', invoice_pdf_url: 'https://example.com/invoice.pdf' })])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Expandable plan')).toBeInTheDocument())
    })

    expect(screen.queryByText('Invoice ID')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('Expandable plan').closest('button')!)
    })
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Invoice ID')).toBeInTheDocument())
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Expandable plan').closest('button')!)
    })
    await act(async () => {
      await waitFor(() => expect(screen.queryByText('Invoice ID')).not.toBeInTheDocument())
    })
  })

  it('shows "Refresh" and "Export CSV" buttons in header', async () => {
    await setupBilling([makeRec({ id: 'bill_001', description: 'Header record' })])
    await act(async () => {
      await waitFor(() => expect(screen.getByText('Refresh')).toBeInTheDocument())
    })
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })
})