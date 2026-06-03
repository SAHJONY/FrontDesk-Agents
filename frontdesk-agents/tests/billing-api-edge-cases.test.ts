import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks for send-invoice route ─────────────────────────────────────────────

const mockSendInvoice = vi.hoisted(() => vi.fn())
const mockGetOwnerSession = vi.hoisted(() => vi.fn())
const mockGetCustomerSession = vi.hoisted(() => vi.fn())
const mockCookiesGet = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', () => ({
  stripe: {
    get client() {
      return {
        invoices: { sendInvoice: mockSendInvoice },
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
  cookies: vi.fn(() => ({ get: mockCookiesGet })),
}))

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status ?? 200,
      async json() { return data },
    })),
  },
}))

// ─── Mocks for billing-history route ─────────────────────────────────────────

const mockGetBillingHistory = vi.hoisted(() => vi.fn())
const mockBillingHistoryCustomerSession = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase', () => ({
  getBillingHistory: mockGetBillingHistory,
}))

vi.mock('@/lib/customer-auth', () => ({
  getCustomerSession: mockBillingHistoryCustomerSession,
}))

// ─── Imports ──────────────────────────────────────────────────────────────────

import { POST as sendInvoicePOST } from '@/app/api/billing/send-invoice/route'
import { GET as billingHistoryGET } from '@/app/api/billing/history/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockRequest(body: Record<string, unknown> = {}): any {
  return {
    json: async () => body,
    nextUrl: { searchParams: { get: (key: string) => (body[key] as string) ?? null } },
  }
}

// ─── Shared auth setup ────────────────────────────────────────────────────────

const AUTHED_OWNER = { id: 'owner-1', authenticated: true }
const AUTHED_CUSTOMER = { id: 'cust-1', customerId: 'cust-1', authenticated: true }

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // Default send-invoice mocks
  mockGetOwnerSession.mockResolvedValue(null)
  mockGetCustomerSession.mockResolvedValue(null)
  mockCookiesGet.mockReturnValue(null)
  mockSendInvoice.mockResolvedValue(undefined)
  // Default billing-history mocks
  mockBillingHistoryCustomerSession.mockResolvedValue(null)
  mockGetBillingHistory.mockResolvedValue([])
})

// ─── POST /api/billing/send-invoice — Edge Cases ──────────────────────────────

describe('POST /api/billing/send-invoice — edge cases', () => {

  describe('invoiceId validation edge cases', () => {
    it('returns 400 when invoiceId is null', async () => {
      const req = createMockRequest({ invoiceId: null })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is a boolean', async () => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
      const reqTrue = createMockRequest({ invoiceId: true })
      const resTrue = await sendInvoicePOST(reqTrue as any)
      expect(resTrue.status).toBe(400)

      const reqFalse = createMockRequest({ invoiceId: false })
      const resFalse = await sendInvoicePOST(reqFalse as any)
      expect(resFalse.status).toBe(400)
    })

    it('returns 400 when invoiceId is an array', async () => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
      const req = createMockRequest({ invoiceId: ['in_abc123'] })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is an object', async () => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
      const req = createMockRequest({ invoiceId: { value: 'in_abc123' } })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('invoiceId')
    })

    it('returns 400 when invoiceId is whitespace-only (Stripe rejects it)', async () => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
      // Whitespace passes JS validation but Stripe rejects with StripeInvalidRequestError
      const err = new Error('No such invoice: \"   \"') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)

      const req = createMockRequest({ invoiceId: '   ' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(400)
    })

    it('accepts a valid invoiceId and calls Stripe', async () => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
      const req = createMockRequest({ invoiceId: 'in_valid_123' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSendInvoice).toHaveBeenCalledWith('in_valid_123')
    })
  })

  describe('Stripe error edge cases', () => {
    beforeEach(() => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
    })

    it('returns 400 when invoice does not exist in Stripe', async () => {
      const err = new Error('No such invoice: in_nonexistent') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)

      const req = createMockRequest({ invoiceId: 'in_nonexistent' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toContain('Stripe error')
    })

    it('returns 400 for expired card on invoice', async () => {
      const err = new Error('This invoice has an expired card. Update the payment method.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)

      const req = createMockRequest({ invoiceId: 'in_expired_card' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toContain('Stripe error')
      expect(data.error).toContain('expired')
    })

    it('returns 400 for authorization error from Stripe', async () => {
      const err = new Error('Your account does not have permission to send this invoice.') as Error & { type: string }
      err.type = 'StripeInvalidRequestError'
      mockSendInvoice.mockRejectedValue(err)

      const req = createMockRequest({ invoiceId: 'in_unauthorized' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toContain('Stripe error')
      expect(data.error).toContain('permission')
    })

    it('returns 500 for non-Stripe errors', async () => {
      const err = new Error('Database connection timeout') as Error & { type: string }
      err.type = 'SomeOtherError' // not StripeInvalidRequestError
      mockSendInvoice.mockRejectedValue(err)

      const req = createMockRequest({ invoiceId: 'in_timeout' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toContain('try again')
    })

    it('returns 500 when Stripe throws a string', async () => {
      mockSendInvoice.mockRejectedValue('string error not an object')
      const req = createMockRequest({ invoiceId: 'in_string_err' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(500)
    })

    it('returns 500 when Stripe throws undefined', async () => {
      mockSendInvoice.mockRejectedValue(undefined)
      const req = createMockRequest({ invoiceId: 'in_undefined_err' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(500)
    })
  })

  describe('auth edge cases', () => {
    it('returns 401 when owner session exists but authenticated is false', async () => {
      mockGetOwnerSession.mockResolvedValue({ id: 'owner-1', authenticated: false })
      const req = createMockRequest({ invoiceId: 'in_auth_false' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(401)
    })

    it('returns 401 when customer cookie has authenticated=false', async () => {
      mockGetOwnerSession.mockResolvedValue(null)
      mockCookiesGet.mockReturnValue({
        value: JSON.stringify({ id: 'cust_456', authenticated: false }),
      })
      const req = createMockRequest({ invoiceId: 'in_cookie_not_authed' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(401)
    })

    it('returns 401 when getCustomerSession throws unexpectedly', async () => {
      mockGetOwnerSession.mockResolvedValue(null)
      mockCookiesGet.mockReturnValue(null)
      mockGetCustomerSession.mockRejectedValue(new Error('Unexpected session error'))
      const req = createMockRequest({ invoiceId: 'in_session_err' })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })
  })

  describe('request body edge cases', () => {
    beforeEach(() => {
      mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
    })

    it('returns 400 when body is empty object', async () => {
      const req = createMockRequest({})
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('invoiceId')
    })

    it('ignores extra fields in request body', async () => {
      mockSendInvoice.mockResolvedValue(undefined)
      const req = createMockRequest({
        invoiceId: 'in_extra_fields',
        customerId: 'cust_extra',
        extraData: 12345,
      })
      const res = await sendInvoicePOST(req as any)
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSendInvoice).toHaveBeenCalledWith('in_extra_fields')
    })
  })
})

// ─── GET /api/billing/history — Edge Cases ────────────────────────────────────

describe('GET /api/billing/history — edge cases', () => {

  describe('authentication edge cases', () => {
    it('returns 401 when session is null', async () => {
      // Override beforeEach auth setup — must be BEFORE the test runs
      mockBillingHistoryCustomerSession.mockResolvedValue(null)
      mockGetBillingHistory.mockResolvedValue([])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()
      expect(res.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Not authenticated')
    })

    it('returns 401 when session authenticated is false', async () => {
      mockBillingHistoryCustomerSession.mockResolvedValue({
        id: 'cust_123',
        email: 'test@test.com',
        authenticated: false,
      })
      mockGetBillingHistory.mockResolvedValue([])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()
      expect(res.status).toBe(401)
    })

    it('returns 401 when getCustomerSession throws', async () => {
      mockBillingHistoryCustomerSession.mockRejectedValue(new Error('Session error'))
      mockGetBillingHistory.mockResolvedValue([])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()
      expect(res.status).toBe(401)
    })
  })

  describe('pagination edge cases', () => {
    beforeEach(() => {
      mockBillingHistoryCustomerSession.mockResolvedValue(AUTHED_CUSTOMER)
    })

    it('uses default limit of 50 when no limit param', async () => {
      const records = Array(100).fill(null).map((_, i) => ({ id: `record_${i}`, amount: 1000 + i }))
      mockGetBillingHistory.mockResolvedValue(records)

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.pagination.limit).toBe(50)
      expect(mockGetBillingHistory).toHaveBeenCalledWith('cust-1', 50)
    })

    it('caps limit at 100', async () => {
      mockGetBillingHistory.mockResolvedValue([])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '500' : null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(data.pagination.limit).toBe(100)
      expect(mockGetBillingHistory).toHaveBeenCalledWith('cust-1', 100)
    })

    it('uses minimum limit of 1 for zero value', async () => {
      mockGetBillingHistory.mockResolvedValue([{ id: 'record_1' }])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '0' : null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(data.pagination.limit).toBe(1)
      expect(mockGetBillingHistory).toHaveBeenCalledWith('cust-1', 1)
    })

    it('uses default page of 1 when no page param', async () => {
      mockGetBillingHistory.mockResolvedValue([{ id: 'record_1' }])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(data.pagination.page).toBe(1)
    })

    it('uses minimum page of 1 for negative values', async () => {
      mockGetBillingHistory.mockResolvedValue([])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = (k: string) => k === 'page' ? '-5' : null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(data.pagination.page).toBe(1)
    })

    it('returns 500 for non-numeric limit (NaN causes DB error)', async () => {
      mockGetBillingHistory.mockRejectedValue(new Error('Invalid limit value'))

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = (k: string) => k === 'limit' ? 'abc' : null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      // parseInt('abc') = NaN; Math.min(Math.max(NaN,1),100) = NaN;
      // getBillingHistory(custId, NaN) → DB error → 500
      expect(res.status).toBe(500)
    })

    it('correctly slices data for page 2 with limit 10', async () => {
      const allRecords = Array(25).fill(null).map((_, i) => ({
        id: `record_${i}`,
        amount: (i + 1) * 1000,
      }))
      mockGetBillingHistory.mockResolvedValue(allRecords)

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = (k: string) =>
        k === 'limit' ? '10' : k === 'page' ? '2' : null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(25)
      expect(data.pagination.hasMore).toBe(true)
      expect(data.data).toHaveLength(10)
      expect(data.data[0].id).toBe('record_10')
      expect(data.data[9].id).toBe('record_19')
    })

    it('hasMore is false on last page', async () => {
      const allRecords = Array(15).fill(null).map((_, i) => ({ id: `record_${i}` }))
      mockGetBillingHistory.mockResolvedValue(allRecords)

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = (k: string) =>
        k === 'limit' ? '10' : k === 'page' ? '2' : null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(data.pagination.hasMore).toBe(false)
    })
  })

  describe('empty and error state edge cases', () => {
    beforeEach(() => {
      mockBillingHistoryCustomerSession.mockResolvedValue(AUTHED_CUSTOMER)
    })

    it('returns empty array and hasMore=false when no billing history', async () => {
      mockGetBillingHistory.mockResolvedValue([])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.pagination.hasMore).toBe(false)
      expect(data.pagination.total).toBe(0)
    })

    it('returns 500 when getBillingHistory throws', async () => {
      mockGetBillingHistory.mockRejectedValue(new Error('Database error'))

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch billing history')
    })

    it('returns 500 when getBillingHistory returns null', async () => {
      mockGetBillingHistory.mockResolvedValue(null)

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      const data = await res.json()

      // null.slice(...) → TypeError → caught → 500
      expect(res.status).toBe(500)
    })
  })

  describe('customerId edge cases', () => {
    beforeEach(() => {
      mockBillingHistoryCustomerSession.mockResolvedValue(AUTHED_CUSTOMER)
    })

    it('passes customerId from session to getBillingHistory', async () => {
      mockGetBillingHistory.mockResolvedValue([{ id: 'record_1' }])

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      await billingHistoryGET(req)

      expect(mockGetBillingHistory).toHaveBeenCalledWith('cust-1', expect.any(Number))
    })

    it('returns 500 when session has no customerId field', async () => {
      mockBillingHistoryCustomerSession.mockResolvedValue({
        id: 'cust_no_customerid',
        authenticated: true,
        // customerId is missing → getBillingHistory gets undefined → throws → 500
      })
      mockGetBillingHistory.mockRejectedValue(new Error('Invalid customer ID'))

      const req = createMockRequest({}) as any
      req.nextUrl.searchParams.get = () => null

      const res = await billingHistoryGET(req)
      expect(res.status).toBe(500)
    })
  })
})