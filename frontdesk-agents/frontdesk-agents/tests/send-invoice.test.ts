import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock variables — vi.hoisted() ensures these are defined before vi.mock
// ---------------------------------------------------------------------------

const mockSendInvoice = vi.hoisted(() => vi.fn())
const mockGetSession = vi.hoisted(() => vi.fn())
const mockGetCustomerSession = vi.hoisted(() => vi.fn())

// ---------------------------------------------------------------------------
// Module mocks — must mirror the real imports in route.ts exactly
// ---------------------------------------------------------------------------

vi.mock('@/lib/stripe', () => ({
  stripe: {
    get client() {
      return {
        invoices: {
          sendInvoice: mockSendInvoice,
        },
      }
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  authService: {
    getSession: mockGetSession,
  },
}))

vi.mock('@/lib/customer-auth', () => ({
  getCustomerSession: mockGetCustomerSession,
}))

vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn((data: any, init?: { status?: number }) => {
        const body = JSON.stringify(data)
        return {
          status: init?.status ?? 200,
          async text() {
            return body
          },
          async json() {
            return data
          },
        }
      }),
    },
  }
})

// ---------------------------------------------------------------------------
// Module under test — import after vi.mock calls
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/billing/send-invoice/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(body: any) {
  return {
    json: async () => body,
  } as any
}

async function parseResponse(res: any) {
  const text = await res.text()
  return { data: JSON.parse(text), status: res.status }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/billing/send-invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendInvoice.mockResolvedValue(undefined)
    mockGetSession.mockRejectedValue(new Error('No owner session'))
    mockGetCustomerSession.mockResolvedValue({ id: 'cust_123' })
  })

  // -----------------------------------------------------------------------
  // Input validation
  // -----------------------------------------------------------------------

  describe('input validation', () => {
    it('returns 400 when invoiceId is missing', async () => {
      const req = createRequest({})
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is not a string', async () => {
      const req = createRequest({ invoiceId: 123 })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is an empty string', async () => {
      const req = createRequest({ invoiceId: '' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Authentication
  // -----------------------------------------------------------------------

  describe('authentication', () => {
    it('proceeds with owner auth when owner session exists', async () => {
      mockGetSession.mockResolvedValue({ id: 'owner_1' })

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockGetSession).toHaveBeenCalled()
      expect(mockGetCustomerSession).not.toHaveBeenCalled()
    })

    it('falls back to customer auth when owner auth throws', async () => {
      mockGetSession.mockRejectedValue(new Error('Not authenticated'))
      mockGetCustomerSession.mockResolvedValue({ id: 'cust_456' })

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockGetSession).toHaveBeenCalled()
      expect(mockGetCustomerSession).toHaveBeenCalled()
    })

    it('does not try customer auth when owner auth succeeds', async () => {
      mockGetSession.mockResolvedValue({ id: 'owner_1' })

      const req = createRequest({ invoiceId: 'in_abc123' })
      await POST(req)

      expect(mockGetCustomerSession).not.toHaveBeenCalled()
    })

    it('returns 401 when neither owner nor customer auth succeeds', async () => {
      mockGetSession.mockRejectedValue(new Error('Not authenticated'))
      mockGetCustomerSession.mockRejectedValue(new Error('No customer session'))

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Not authenticated')
    })
  })

  // -----------------------------------------------------------------------
  // Stripe invoice sending
  // -----------------------------------------------------------------------

  describe('Stripe invoice sending', () => {
    it('returns success when Stripe sendInvoice succeeds', async () => {
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('passes the invoiceId to Stripe correctly', async () => {
      const req = createRequest({ invoiceId: 'in_xyz789' })
      await POST(req)

      expect(mockSendInvoice).toHaveBeenCalledTimes(1)
      expect(mockSendInvoice).toHaveBeenCalledWith('in_xyz789')
    })
  })

  // -----------------------------------------------------------------------
  // Stripe error handling
  // -----------------------------------------------------------------------

  describe('Stripe error handling', () => {
    it('returns user-friendly message when invoice was already sent', async () => {
      const stripeError = new Error('This invoice has already been sent.')
      ;(stripeError as any).type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(stripeError)

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('already been sent')
    })

    it('returns message when invoice status is invalid for sending', async () => {
      const stripeError = new Error('This invoice is not in a sendable status.')
      ;(stripeError as any).type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(stripeError)

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('finalized or paid')
    })

    it('returns message when invoice status must be draft', async () => {
      const stripeError = new Error('Invoice status must be draft to send.')
      ;(stripeError as any).type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(stripeError)

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('finalized or paid')
    })

    it('returns generic Stripe error message for unknown Stripe errors', async () => {
      const stripeError = new Error('Some other Stripe error')
      ;(stripeError as any).type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(stripeError)

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Stripe error')
    })

    it('returns 500 for unknown non-Stripe errors', async () => {
      mockSendInvoice.mockRejectedValue(new Error('Something went wrong'))

      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)

      expect(status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('try again')
    })
  })
})
