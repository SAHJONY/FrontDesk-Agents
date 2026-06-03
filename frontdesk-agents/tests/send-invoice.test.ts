import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSendInvoice = vi.hoisted(() => vi.fn())
const mockGetOwnerSession = vi.hoisted(() => vi.fn())
const mockGetCustomerSession = vi.hoisted(() => vi.fn())
const mockCookiesGet = vi.hoisted(() => vi.fn())

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

vi.mock('@/lib/owner-session', () => ({
  getOwnerSession: mockGetOwnerSession,
}))

vi.mock('@/lib/customer-auth', () => ({
  getCustomerSession: mockGetCustomerSession,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: mockCookiesGet,
  })),
}))

vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn((data, init) => ({
        status: init?.status ?? 200,
        async json() { return data },
      })),
    },
  }
})

import { POST } from '@/app/api/billing/send-invoice/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createRequest(body: Record<string, unknown>): any {
  return { json: async () => body }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/billing/send-invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendInvoice.mockResolvedValue(undefined)
    mockGetOwnerSession.mockResolvedValue(null)
    mockGetCustomerSession.mockResolvedValue(null)
    mockCookiesGet.mockReturnValue(null)
  })

  describe('input validation', () => {
    it('returns 400 when invoiceId is missing', async () => {
      const req = createRequest({})
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is not a string', async () => {
      const req = createRequest({ invoiceId: 123 })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is empty', async () => {
      const req = createRequest({ invoiceId: '' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('authentication', () => {
    it('proceeds with owner auth when session exists', async () => {
      mockGetOwnerSession.mockResolvedValue({ id: 'owner_1', authenticated: true })
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockGetCustomerSession).not.toHaveBeenCalled()
      expect(mockCookiesGet).not.toHaveBeenCalled()
    })

    it('falls back to customer auth when owner auth returns null', async () => {
      // owner session is null, customer session is valid via cookie
      mockGetOwnerSession.mockResolvedValue(null)
      mockCookiesGet.mockReturnValue({
        value: JSON.stringify({ id: 'cust_456', authenticated: true }),
      })
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockGetOwnerSession).toHaveBeenCalled()
    })

    it('falls back to customer auth when owner session is null and cookie not present', async () => {
      // getOwnerSession returns null, getCustomerSessionLocal returns null (no cookie),
      // so route falls back to getCustomerSession which returns a valid session
      mockGetOwnerSession.mockResolvedValue(null)
      mockCookiesGet.mockReturnValue(null) // no customer_session cookie
      mockGetCustomerSession.mockResolvedValue({ id: 'cust_456', authenticated: true })
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockGetCustomerSession).toHaveBeenCalled()
    })

    it('returns 401 when both auth methods fail', async () => {
      mockGetOwnerSession.mockResolvedValue(null)
      mockCookiesGet.mockReturnValue(null)
      mockGetCustomerSession.mockResolvedValue(null)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Not authenticated')
    })
  })

  describe('Stripe invoice sending', () => {
    it('returns success when Stripe sendInvoice succeeds', async () => {
      mockGetOwnerSession.mockResolvedValue({ id: 'owner_1', authenticated: true })
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('passes the invoiceId to Stripe correctly', async () => {
      mockGetOwnerSession.mockResolvedValue({ id: 'owner_1', authenticated: true })
      const req = createRequest({ invoiceId: 'in_xyz789' })
      await POST(req)
      expect(mockSendInvoice).toHaveBeenCalledTimes(1)
      expect(mockSendInvoice).toHaveBeenCalledWith('in_xyz789')
    })
  })

  describe('Stripe error handling', () => {
    beforeEach(() => {
      mockGetOwnerSession.mockResolvedValue({ id: 'owner_1', authenticated: true })
    })

    it('handles already-sent invoice', async () => {
      const err = new Error('This invoice has already been sent.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('already been sent')
    })

    it('handles invalid invoice status', async () => {
      const err = new Error('This invoice is not in a sendable status.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('finalized or paid')
    })

    it('handles draft-only status message', async () => {
      const err = new Error('Invoice status must be draft to send.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('finalized or paid')
    })

    it('returns generic Stripe error for unknown Stripe errors', async () => {
      const err = new Error('Some other error') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('Stripe error')
    })

    it('returns 500 for non-Stripe errors', async () => {
      mockSendInvoice.mockRejectedValue(new Error('Something went wrong'))
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const data = await res.json()
      expect(res.status).toBe(500)
      expect(data.error).toContain('try again')
    })
  })
})