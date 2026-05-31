import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendInvoice = vi.hoisted(() => vi.fn())
const mockGetSession = vi.hoisted(() => vi.fn())
const mockGetCustomerSession = vi.hoisted(() => vi.fn())

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
      json: vi.fn((data, init) => {
        const body = JSON.stringify(data)
        return {
          status: init?.status ?? 200,
          async text() { return body },
          async json() { return data },
        }
      }),
    },
  }
})

import { POST } from '@/app/api/billing/send-invoice/route'

function createRequest(body: Record<string, unknown>): any {
  return { json: async () => body }
}

async function parseResponse(res: { text: () => Promise<string>; status: number }) {
  const text = await res.text()
  return { data: JSON.parse(text), status: res.status }
}

describe('POST /api/billing/send-invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendInvoice.mockResolvedValue(undefined)
    mockGetSession.mockRejectedValue(new Error('No owner session'))
    mockGetCustomerSession.mockResolvedValue({ id: 'cust_123' })
  })

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

    it('returns 400 when invoiceId is empty', async () => {
      const req = createRequest({ invoiceId: '' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('authentication', () => {
    it('proceeds with owner auth when session exists', async () => {
      mockGetSession.mockResolvedValue({ id: 'owner_1' })
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.success).toBe(true)
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

    it('returns 401 when both auths fail', async () => {
      mockGetSession.mockRejectedValue(new Error('Not authenticated'))
      mockGetCustomerSession.mockRejectedValue(new Error('No session'))
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Not authenticated')
    })
  })

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

  describe('Stripe error handling', () => {
    it('handles already-sent invoice', async () => {
      const err = new Error('This invoice has already been sent.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('already been sent')
    })

    it('handles invalid invoice status', async () => {
      const err = new Error('This invoice is not in a sendable status.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('finalized or paid')
    })

    it('handles draft-only status message', async () => {
      const err = new Error('Invoice status must be draft to send.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('finalized or paid')
    })

    it('returns generic Stripe error for unknown Stripe errors', async () => {
      const err = new Error('Some other error') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Stripe error')
    })

    it('returns 500 for non-Stripe errors', async () => {
      mockSendInvoice.mockRejectedValue(new Error('Something went wrong'))
      const req = createRequest({ invoiceId: 'in_abc123' })
      const res = await POST(req)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(500)
      expect(data.error).toContain('try again')
    })
  })
})
