import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ─────────────────────────────────────────────────────────────────────
//
// Pattern: mock supabaseAdmin.from at the entry point and configure per-test.
// supabaseAdmin.from.mockImplementation(table => mockFrom(table, data, count))
// makes from() return a proper chain where .then() properly calls onfulfilled.
//
// mockFrom('table', data, count) builds the chain: from → select → eq → order → range → then
// Each .then() properly invokes onfulfilled({ count, data, error }) so await resolves.

const mockRequireCustomerAuth = vi.hoisted(() => vi.fn())

vi.mock('@/lib/customer-auth', () => ({
  requireCustomerAuth: mockRequireCustomerAuth,
}))

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      async json() { return data },
    })),
  },
}))

// mockFromFn is an object { from: vi.fn() } — use mockFromFn.from.mockImplementation(...)
const mockFromFn = vi.hoisted(() => ({ from: vi.fn() as unknown }))

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: { get from() { return mockFromFn.from } },
}))

// ─── Imports (after mocks) ─────────────────────────────────────────────────────

import { GET as recentCallsGET } from '@/app/api/dashboard/recent-calls/route'
import { GET as leadsGET } from '@/app/api/dashboard/leads/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockRequest(url: string): any {
  // The route does new URL(request.url) — url must be absolute
  const base = url.startsWith('http') ? url : `http://test.example${url}`
  return {
    url: base,
    nextUrl: { searchParams: new URL(base).searchParams },
  }
}

const ACME_SESSION = {
  id: 'user-acme', email: 'jane@acmecorp.com',
  customerId: 'cust-acme-001', authenticated: true,
}

const TECHSTART_SESSION = {
  id: 'user-tech', email: 'mike@techstart.io',
  customerId: 'cust-tech-001', authenticated: true,
}

function makeCall(overrides: Record<string, unknown> = {}) {
  return {
    id: 'call_001', caller_phone: '+15550001111', caller_name: 'John Doe',
    type: 'inbound', direction: 'inbound', duration: 180, status: 'completed',
    revenue: 25, intent: 'support', notes: '', created_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeLead(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lead_001', name: 'Rachel Green', email: 'rachel@shopify.com',
    phone: '+15550002222', status: 'new', source: 'referral',
    converted_at: null, created_at: new Date().toISOString(),
    ...overrides,
  }
}

// ─── Shared mock chain builder ─────────────────────────────────────────────────
//
// buildQueryChain(data, count) creates a proper thenable chain:
// from() → { select } → { eq } → { order } → { range } → thenable
//
// Each .then() properly calls onfulfilled(callback) so await resolves.

type QueryChain = {
  select: ReturnType<typeof vi.fn>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

function buildQueryChain(data: unknown[], count: number): QueryChain {
  const eqMock = vi.fn().mockReturnThis()
  const orderMock = vi.fn().mockReturnThis()
  const rangeMock = vi.fn().mockReturnThis()
  const selectMock = vi.fn().mockReturnValue({
    eq: eqMock,
    order: orderMock,
    range: rangeMock,
    then(onfulfilled?: (value: unknown) => unknown) {
      if (onfulfilled) onfulfilled({ count, data, error: null })
      return {
        then(onfulfilled2?: (v: unknown) => unknown) {
          if (onfulfilled2) onfulfilled2({ count, data, error: null })
          return this
        },
      }
    },
  })
  return { select: selectMock }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockFrom(tableName: string, data: unknown[], count: number): any {
  return buildQueryChain(data, count)
}

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireCustomerAuth.mockResolvedValue({ authorized: false, session: null })
  // Reset supabaseAdmin.from to a fresh function so prior implementations don't leak
  mockFromFn.from = vi.fn()
})

// ─── GET /api/dashboard/recent-calls ─────────────────────────────────────────

describe('GET /api/dashboard/recent-calls', () => {

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 401 when session authenticated is false', async () => {
      mockRequireCustomerAuth.mockResolvedValue({
        authorized: false, session: { ...ACME_SESSION, authenticated: false },
      })
      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      expect(res.status).toBe(401)
    })

    it('proceeds when session is authenticated', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('call_records', [], 0))
      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      expect(res.status).not.toBe(401)
    })
  })

  describe('pagination params', () => {
    beforeEach(() => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
    })

    it('defaults to page=1, limit=20', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataEqMock = vi.fn().mockReturnThis()
      const dataOrderMock = vi.fn().mockReturnThis()
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: dataEqMock, order: dataOrderMock, range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls')
      await recentCallsGET(req as any)

      expect(dataRangeArgs?.[0]).toBe(0)   // offset = (1-1)*20
      expect(dataRangeArgs?.[1]).toBe(19)  // offset + 20 - 1
    })

    it('respects page and limit query params', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls?page=3&limit=10')
      await recentCallsGET(req as any)

      expect(dataRangeArgs?.[0]).toBe(20)  // offset = (3-1)*10
      expect(dataRangeArgs?.[1]).toBe(29)  // offset + 10 - 1
    })

    it('clamps page minimum to 1', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls?page=0')
      await recentCallsGET(req as any)

      // page=0 → Math.max(1,0)=1 → offset=0
      expect(dataRangeArgs?.[0]).toBe(0)
    })

    it('clamps limit maximum to 100', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls?limit=500')
      await recentCallsGET(req as any)

      // limit=500 → Math.min(500,100)=100 → range(0, 99)
      expect((dataRangeArgs?.[1] ?? 0) - (dataRangeArgs?.[0] ?? 0) + 1).toBe(100)
    })
  })

  describe('multi-tenant isolation', () => {
    it('filters call records by customer_id from session', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      // Capture the data query's .eq() args since that's where customer_id is filtered
      let dataEqCallArgs: unknown[] | null = null
      const dataEqMock = vi.fn().mockImplementation((col: string, val: unknown) => {
        dataEqCallArgs = [col, val]
        return {
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: dataEqMock,
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls')
      await recentCallsGET(req as any)

      expect(dataEqCallArgs?.[0]).toBe('customer_id')
      expect(dataEqCallArgs?.[1]).toBe('cust-acme-001')
    })

    it('TechStart session uses different customer_id than Acme', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: TECHSTART_SESSION })
      let dataEqCallArgs: unknown[] | null = null
      const dataEqMock = vi.fn().mockImplementation((col: string, val: unknown) => {
        dataEqCallArgs = [col, val]
        return {
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: dataEqMock,
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls')
      await recentCallsGET(req as any)

      expect(dataEqCallArgs?.[1]).toBe('cust-tech-001')
    })

    it('returns only calls belonging to the authenticated customer', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      const acmeCall = makeCall({ id: 'call-acme-1', caller_name: 'Acme Caller' })
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('call_records', [acmeCall], 1))

      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      const data = await res.json()

      expect(data.calls).toHaveLength(1)
      expect(data.calls[0].name).toBe('Acme Caller')
    })
  })

  describe('response shape', () => {
    beforeEach(() => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
    })

    it('returns pagination metadata with all required fields', async () => {
      const calls = Array(20).fill(null).map((_, i) => makeCall({ id: `call_${i}` }))
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('call_records', calls, 25))

      const req = createMockRequest('/api/dashboard/recent-calls?page=2&limit=20')
      const res = await recentCallsGET(req as any)
      const data = await res.json()

      expect(data.pagination).toMatchObject({
        page: 2, limit: 20, total: 25, totalPages: 2,
        hasNextPage: false, hasPrevPage: true,
      })
    })

    it('hasNextPage is true when more pages exist', async () => {
      const calls = Array(20).fill(null).map((_, i) => makeCall({ id: `call_${i}` }))
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('call_records', calls, 50))

      const req = createMockRequest('/api/dashboard/recent-calls?page=1&limit=20')
      const res = await recentCallsGET(req as any)
      const data = await res.json()

      expect(data.pagination.hasNextPage).toBe(true)
      expect(data.pagination.hasPrevPage).toBe(false)
    })

    it('maps call record fields correctly', async () => {
      mockFromFn.from.mockImplementation((_table: string) =>
        mockFrom('call_records', [makeCall({
          id: 'call-map-test', caller_phone: '+15559876543',
          caller_name: 'Test User', intent: 'sales', duration: 90,
        })], 1)
      )

      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      const data = await res.json()

      expect(data.calls[0]).toMatchObject({
        id: 'call-map-test', caller: '+15559876543', name: 'Test User',
        intent: 'sales', duration: 90, formattedDuration: '1:30',
      })
      expect(data.calls[0].time).toBeDefined()
    })

    it('falls back to Unknown for missing caller_phone', async () => {
      mockFromFn.from.mockImplementation((_table: string) =>
        mockFrom('call_records', [makeCall({ caller_phone: null, caller_name: null })], 1)
      )

      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      const data = await res.json()

      expect(data.calls[0].caller).toBe('Unknown')
      expect(data.calls[0].name).toBe('Unknown Caller')
    })
  })

  describe('error handling', () => {
    it('returns 500 when supabaseAdmin is null', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      // Mutate the .from property so the getter returns null
      mockFromFn.from = null as any

      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)

      expect(res.status).toBe(500)
    })

    it('returns 500 when database query returns an error', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ data: null, error: { message: 'Database error' } })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)

      expect(res.status).toBe(500)
      const data = await res.json()
      expect(data.error).toContain('Failed to fetch calls')
    })
  })

  describe('empty states', () => {
    it('returns empty array and correct pagination when no calls exist', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('call_records', [], 0))

      const req = createMockRequest('/api/dashboard/recent-calls')
      const res = await recentCallsGET(req as any)
      const data = await res.json()

      expect(data.calls).toEqual([])
      expect(data.pagination.total).toBe(0)
      expect(data.pagination.totalPages).toBe(0)
      expect(data.pagination.hasNextPage).toBe(false)
      expect(data.pagination.hasPrevPage).toBe(false)
    })
  })
})

// ─── GET /api/dashboard/leads ─────────────────────────────────────────────────

describe('GET /api/dashboard/leads', () => {

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 401 when session authenticated is false', async () => {
      mockRequireCustomerAuth.mockResolvedValue({
        authorized: false, session: { ...TECHSTART_SESSION, authenticated: false },
      })
      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)
      expect(res.status).toBe(401)
    })
  })

  describe('pagination params', () => {
    beforeEach(() => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
    })

    it('defaults to page=1, limit=50', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/leads')
      await leadsGET(req as any)

      // page=1, limit=50 → range(0, 49)
      expect(dataRangeArgs?.[0]).toBe(0)
      expect(dataRangeArgs?.[1]).toBe(49)
    })

    it('respects page and limit query params', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/leads?page=2&limit=25')
      await leadsGET(req as any)

      // page=2, limit=25 → range(25, 49)
      expect(dataRangeArgs?.[0]).toBe(25)
      expect(dataRangeArgs?.[1]).toBe(49)
    })

    it('clamps negative page to 1', async () => {
      let dataRangeArgs: [number, number] | null = null
      const dataRangeMock = vi.fn().mockImplementation((start: number, end: number) => {
        dataRangeArgs = [start, end]
        return {
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: dataRangeMock,
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/leads?page=-5')
      await leadsGET(req as any)

      // page=-5 → Math.max(1,-5)=1 → offset=0
      expect(dataRangeArgs?.[0]).toBe(0)
    })
  })

  describe('multi-tenant isolation', () => {
    it('filters leads by customer_id from session', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: TECHSTART_SESSION })
      let dataEqCallArgs: unknown[] | null = null
      const dataEqMock = vi.fn().mockImplementation((col: string, val: unknown) => {
        dataEqCallArgs = [col, val]
        return {
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: dataEqMock,
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/leads')
      await leadsGET(req as any)

      expect(dataEqCallArgs?.[0]).toBe('customer_id')
      expect(dataEqCallArgs?.[1]).toBe('cust-tech-001')
    })

    it('Acme session uses different customer_id than TechStart', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      let dataEqCallArgs: unknown[] | null = null
      const dataEqMock = vi.fn().mockImplementation((col: string, val: unknown) => {
        dataEqCallArgs = [col, val]
        return {
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          then(onfulfilled?: (v: unknown) => unknown) {
            if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
            return { then() { return this } }
          },
        }
      })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: dataEqMock,
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0, data: [], error: null })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/leads')
      await leadsGET(req as any)

      expect(dataEqCallArgs?.[1]).toBe('cust-acme-001')
    })

    it('returns only leads belonging to the authenticated customer', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: TECHSTART_SESSION })
      mockFromFn.from.mockImplementation((_table: string) =>
        mockFrom('leads', [makeLead({ id: 'lead-tech-1', name: 'Tech Lead' })], 1)
      )

      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)
      const data = await res.json()

      expect(data.leads).toHaveLength(1)
      expect(data.leads[0].name).toBe('Tech Lead')
      expect(data.leads[0]).not.toHaveProperty('notes')
    })
  })

  describe('response shape', () => {
    beforeEach(() => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
    })

    it('returns pagination and summary metadata', async () => {
      const leads = Array(20).fill(null).map((_, i) => makeLead({ id: `lead_${i}` }))
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('leads', leads, 47))

      const req = createMockRequest('/api/dashboard/leads?page=1&limit=20')
      const res = await leadsGET(req as any)
      const data = await res.json()

      expect(data.pagination).toMatchObject({
        page: 1, limit: 20, total: 47, totalPages: 3,
        hasNextPage: true, hasPrevPage: false,
      })
      expect(data.summary).toMatchObject({
        totalLeads: 47, newLeads: 20, contactedLeads: 0,
        qualifiedLeads: 0, convertedLeads: 0,
      })
    })

    it('hasPrevPage is true on page 2', async () => {
      const leads = Array(20).fill(null).map((_, i) => makeLead({ id: `lead_${i}` }))
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('leads', leads, 50))

      const req = createMockRequest('/api/dashboard/leads?page=2&limit=20')
      const res = await leadsGET(req as any)
      const data = await res.json()

      expect(data.pagination.hasPrevPage).toBe(true)
      expect(data.pagination.hasNextPage).toBe(true)
    })

    it('maps lead fields correctly', async () => {
      mockFromFn.from.mockImplementation((_table: string) =>
        mockFrom('leads', [makeLead({
          id: 'lead-map-test', name: 'Jane Smith',
          email: 'jane@example.com', status: 'qualified',
          source: 'website', converted_at: '2026-06-01T00:00:00Z',
        })], 1)
      )

      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)
      const data = await res.json()

      expect(data.leads[0]).toMatchObject({
        id: 'lead-map-test', name: 'Jane Smith',
        email: 'jane@example.com', status: 'qualified',
        source: 'website', converted: true,
      })
      expect(data.leads[0].phone).toBe('+15550002222')
    })

    it('computes status summary counts from returned page', async () => {
      mockFromFn.from.mockImplementation((_table: string) =>
        mockFrom('leads', [
          makeLead({ status: 'new' }),
          makeLead({ status: 'contacted' }),
          makeLead({ status: 'qualified' }),
          makeLead({ status: 'new' }),
          makeLead({ status: 'new' }),
        ], 5)
      )

      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)
      const data = await res.json()

      expect(data.summary).toMatchObject({
        totalLeads: 5, newLeads: 3, contactedLeads: 1,
        qualifiedLeads: 1, convertedLeads: 0,
      })
    })
  })

  describe('error handling', () => {
    it('returns 500 when supabaseAdmin is null', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      // Mutate the .from property so the getter returns null
      mockFromFn.from = null as any

      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)

      expect(res.status).toBe(500)
    })

    it('returns 500 when leads query returns an error', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      const countSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ count: 0 })
          return { then() { return this } }
        },
      })
      const dataSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then(onfulfilled?: (v: unknown) => unknown) {
          if (onfulfilled) onfulfilled({ data: null, error: { message: 'Table leads does not exist' } })
          return { then() { return this } }
        },
      })
      let callCount = 0
      mockFromFn.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? { select: countSelectMock } : { select: dataSelectMock }
      })

      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)

      expect(res.status).toBe(500)
      const data = await res.json()
      expect(data.error).toContain('Failed to fetch leads')
    })
  })

  describe('empty states', () => {
    it('returns empty array when no leads exist', async () => {
      mockRequireCustomerAuth.mockResolvedValue({ authorized: true, session: ACME_SESSION })
      mockFromFn.from.mockImplementation((_table: string) => mockFrom('leads', [], 0))

      const req = createMockRequest('/api/dashboard/leads')
      const res = await leadsGET(req as any)
      const data = await res.json()

      expect(data.leads).toEqual([])
      expect(data.pagination.total).toBe(0)
      expect(data.summary.totalLeads).toBe(0)
      expect(data.pagination.hasNextPage).toBe(false)
      expect(data.pagination.hasPrevPage).toBe(false)
    })
  })
})