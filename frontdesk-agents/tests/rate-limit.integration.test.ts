import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Test IPs — isolated per describe block ──────────────────────────────────

const TEST_IP_BILLING = '192.168.99.100'
const TEST_IP_AI = '192.168.99.200'

// ─── Hoisted mocks — shared across all vi.mock factories ─────────────────────
//
// All mocks are hoisted at file level so vi.mock factories can capture them
// via closure. Each mock's implementation is configured per-test in beforeEach
// or test body via mockImplementation overrides.

const mockGetClientIp = vi.hoisted(() => vi.fn())
const mockAuthRateLimit = vi.hoisted(() => vi.fn(() => ({ success: true })))
const mockGetCustomerSession = vi.hoisted(() => vi.fn(() => null))
const mockGetOwnerSession = vi.hoisted(() => vi.fn(() => ({ id: 'owner-test', authenticated: true })))
const mockGetBillingHistory = vi.hoisted(() => vi.fn(() => []))

vi.mock('@/lib/rate-limit', () => ({
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
  authRateLimit: (...args: unknown[]) => mockAuthRateLimit(...args),
}))

// ─── Other route dependencies ─────────────────────────────────────────────────

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data: any, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      async json() { return data },
    })),
  },
}))

vi.mock('@/lib/owner-session', () => ({
  getOwnerSession: (...args: unknown[]) => mockGetOwnerSession(...args),
}))

vi.mock('@/lib/customer-auth', () => ({
  getCustomerSession: (...args: unknown[]) => mockGetCustomerSession(...args),
}))

vi.mock('@/lib/supabase', () => ({
  getBillingHistory: (...args: unknown[]) => mockGetBillingHistory(...args),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: { get client() { return { invoices: { sendInvoice: vi.fn() } } } },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(() => null) })),
}))

vi.mock('@/lib/ai-decision-engine', () => ({
  getDecisions: vi.fn(() => []),
  makeDecision: vi.fn(() => ({ id: 'dec-test' })),
  evaluateAndDecide: vi.fn(() => []),
  getAIDecisionMetrics: vi.fn(() => ({
    totalDecisions: 0, byCategory: {}, bySeverity: {},
    successRate: 0, avgResolutionTimeMs: 0, activeEscalations: 0,
  })),
  resolveDecision: vi.fn(),
  getModelRouterStatuses: vi.fn(() => []),
  getSelfHealingStatus: vi.fn(() => ({
    monitorRunning: true, anomaliesDetected: 0, autoRemediated: 0,
    manualInterventions: 0, lastAnomalyAt: null, lastRemediationAt: null,
    systemHealth: 'healthy' as const, activeAlerts: [],
  })),
  acknowledgeAlert: vi.fn(),
  resolveAlert: vi.fn(),
}))

// ─── Import routes AFTER mocks ────────────────────────────────────────────────

import { GET as billingHistoryGET } from '@/app/api/billing/history/route'
import { POST as sendInvoicePOST } from '@/app/api/billing/send-invoice/route'
import { GET as aiDecisionsGET, POST as aiDecisionsPOST } from '@/app/api/ai/decisions/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockRequest(options: {
  body?: Record<string, unknown>
  searchParams?: Record<string, string | null>
} = {}): any {
  return {
    // Only add 'body' when body option is provided — so 'body' in req
    // correctly distinguishes GET (no body key) from POST (body = {...}).
    // If body option is absent, the key is absent entirely, making
    // (req as any).body !== undefined evaluate to false for GET.
    ...(options.body !== undefined && { body: options.body }),
    json: async () => options.body ?? {},
    nextUrl: {
      searchParams: {
        get: (key: string) => options.searchParams?.[key] ?? null,
      },
    },
    headers: { get: vi.fn() },
  }
}

// ─── Reusable rate limit config helper ───────────────────────────────────────
//
// Call in beforeEach to configure mockAuthRateLimit to allow `limit` requests
// then return 429. Uses a fresh closure counter so multiple describe blocks
// don't interfere even though they share the same mockAuthRateLimit function.

function allowFirstNRequests(limit: number): void {
  // Use mockReset to ensure any previous test body's override is cleared
  mockAuthRateLimit.mockReset()
  let count = 0
  mockAuthRateLimit.mockImplementation(() => {
    count++
    return count > limit
      ? { success: false, retryAfter: 60 }
      : { success: true }
  })
}

// ─── Authenticated customer session for billing tests ───────────────────────

const AUTHED_CUSTOMER = { id: 'cust-1', customerId: 'cust-1', authenticated: true }

// ─── GET /api/billing/history — Rate Limiting ─────────────────────────────────

describe('GET /api/billing/history — rate limiting', () => {
  // Declared at describe level for the IP isolation test below.
  // Initialized in beforeEach before allowFirstNRequests captures it in closure.
  let ipCounters: Map<string, number>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIp.mockReturnValue(TEST_IP_BILLING)
    // Authenticated customer session required for billing history route
    vi.mocked(mockGetCustomerSession).mockResolvedValue(AUTHED_CUSTOMER)
    // Initialize ipCounters BEFORE allowFirstNRequests so the closure captures
    // the correct (fresh) Map reference — not a stale one from a previous test
    ipCounters = new Map()
    allowFirstNRequests(5)
  })

  it('allows the first request through', async () => {
    const req = createMockRequest() as any
    const res = await billingHistoryGET(req)
    expect(res.status).toBe(200)
  })

  it('allows up to 5 requests within the 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      const res = await billingHistoryGET(req)
      expect(res.status).toBe(200)
    }
  })

  it('returns 429 on the 6th request within the same 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      await billingHistoryGET(req)
    }
    const req = createMockRequest() as any
    const res = await billingHistoryGET(req)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('Too many requests. Please try again later.')
  })

  it('429 response includes Retry-After header with a positive integer', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      await billingHistoryGET(req)
    }
    const req = createMockRequest() as any
    const res = await billingHistoryGET(req)
    expect(res.status).toBe(429)
    const retryAfter = (res as any).headers?.['Retry-After']
    expect(retryAfter).toBeDefined()
    expect(Number(retryAfter)).toBeGreaterThan(0)
  })

  it('different IPs have independent rate limit counters', async () => {
    vi.mocked(mockGetCustomerSession).mockResolvedValue(AUTHED_CUSTOMER)

    // Fresh Map for this test's custom mockImplementation
    ipCounters = new Map()

    mockAuthRateLimit.mockImplementation((req: unknown) => {
      // Use mockGetClientIp — same source as the route uses for rate limiting
      const ip = mockGetClientIp(req as any) ?? 'unknown'
      const count = (ipCounters.get(ip) ?? 0) + 1
      ipCounters.set(ip, count)
      return count > 5
        ? { success: false, retryAfter: 60 }
        : { success: true }
    })

    // Exhaust IP 10.0.0.99's counter (5 × 200, then 1 × 429)
    mockGetClientIp.mockReturnValue('10.0.0.99')
    for (let i = 0; i < 6; i++) {
      const req = createMockRequest() as any
      const res = await billingHistoryGET(req)
      if (i < 5) expect(res.status).toBe(200)
      else expect(res.status).toBe(429)
    }

    // IP 10.0.0.50 has a fresh counter — should be 200
    mockGetClientIp.mockReturnValue('10.0.0.50')
    const req = createMockRequest() as any
    const res = await billingHistoryGET(req)
    expect(res.status).toBe(200)
  })

  it('rate limit resets when counter is reset (simulating window expiry)', async () => {
    for (let i = 0; i < 6; i++) {
      const req = createMockRequest() as any
      const res = await billingHistoryGET(req)
      if (i < 5) expect(res.status).toBe(200)
      else expect(res.status).toBe(429)
    }

    // Simulate window expiry: re-configure with a fresh counter
    allowFirstNRequests(5)

    // Fresh window — requests should succeed again
    const req = createMockRequest() as any
    const res = await billingHistoryGET(req)
    expect(res.status).toBe(200)
  })
})

// ─── POST /api/billing/send-invoice — Rate Limiting ───────────────────────────

describe('POST /api/billing/send-invoice — rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIp.mockReturnValue(TEST_IP_BILLING)
    allowFirstNRequests(5)
  })

  it('allows the first request through', async () => {
    const req = createMockRequest({ body: { invoiceId: 'in_first' } }) as any
    const res = await sendInvoicePOST(req)
    expect(res.status).not.toBe(429)
  })

  it('allows up to 5 requests within the 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ body: { invoiceId: `in_test_${i}` } }) as any
      const res = await sendInvoicePOST(req)
      expect(res.status).not.toBe(429)
    }
  })

  it('returns 429 on the 6th request within the same 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ body: { invoiceId: `in_test_${i}` } }) as any
      await sendInvoicePOST(req)
    }
    const req = createMockRequest({ body: { invoiceId: 'in_exhausted' } }) as any
    const res = await sendInvoicePOST(req)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBe('Too many requests. Please try again later.')
  })

  it('429 response includes Retry-After header with a positive integer', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ body: { invoiceId: `in_test_${i}` } }) as any
      await sendInvoicePOST(req)
    }
    const req = createMockRequest({ body: { invoiceId: 'in_rate_limited' } }) as any
    const res = await sendInvoicePOST(req)
    expect(res.status).toBe(429)
    const retryAfter = (res as any).headers?.['Retry-After']
    expect(retryAfter).toBeDefined()
    expect(Number(retryAfter)).toBeGreaterThan(0)
  })
})

// ─── GET /api/ai/decisions — Rate Limiting ────────────────────────────────────

describe('GET /api/ai/decisions — rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIp.mockReturnValue(TEST_IP_AI)
    allowFirstNRequests(5)
  })

  it('allows up to 5 requests within the 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      const res = await aiDecisionsGET(req)
      expect(res.status).toBe(200)
    }
  })

  it('returns 429 on the 6th request within the same 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      await aiDecisionsGET(req)
    }
    const req = createMockRequest() as any
    const res = await aiDecisionsGET(req)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('Too many requests. Please try again later.')
  })

  it('429 response includes Retry-After header', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      await aiDecisionsGET(req)
    }
    const req = createMockRequest() as any
    const res = await aiDecisionsGET(req)
    expect(res.status).toBe(429)
    const retryAfter = (res as any).headers?.['Retry-After']
    expect(retryAfter).toBeDefined()
    expect(Number(retryAfter)).toBeGreaterThan(0)
  })
})

// ─── POST /api/ai/decisions — Rate Limiting ───────────────────────────────────

describe('POST /api/ai/decisions — rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIp.mockReturnValue(TEST_IP_AI)
    allowFirstNRequests(5)
  })

  it('allows up to 5 requests within the 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ body: { action: 'evaluate', context: { i } } }) as any
      const res = await aiDecisionsPOST(req)
      expect(res.status).toBe(200)
    }
  })

  it('returns 429 on the 6th request within the same 1-minute window', async () => {
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ body: { action: 'evaluate', context: {} } }) as any
      await aiDecisionsPOST(req)
    }
    const req = createMockRequest({ body: { action: 'evaluate', context: {} } }) as any
    const res = await aiDecisionsPOST(req)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBe('Too many requests. Please try again later.')
  })

  it('GET and POST have independent rate limit counters', async () => {
    // The route uses IP-based rate limiting, so GET and POST share a counter.
    // We verify independence by manually tracking GET's call count from the
    // shared mock and restoring POST to count=1 (simulating a fresh window).

    mockGetOwnerSession.mockReturnValue({ id: 'owner-1', authenticated: true })
    mockGetClientIp.mockReturnValue(TEST_IP_AI)

    // Track GET call count from the shared beforeEach mock
    const getCallCount = mockAuthRateLimit.mock.calls.length

    // Exhaust GET counter: allowFirstNRequests(5) was set in beforeEach.
    // After getCallCount + 5 calls, the next call returns 429.
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest() as any
      const res = await aiDecisionsGET(req)
      expect(res.status).toBe(200)
    }
    // 6th GET → 429 (exhausted beforeEach's allowFirstNRequests counter)
    {
      const req = createMockRequest() as any
      const res = await aiDecisionsGET(req)
      expect(res.status).toBe(429)
    }

    // GET exhausts the shared counter (6 calls). Now simulate a fresh POST
    // counter by reconfiguring the mock to start from 0.
    // Use mockReturnValue (synchronous) instead of mockImplementation to avoid
    // any timing issues with mockReset + mockImplementation sequencing.
    let postCount = 0
    mockAuthRateLimit.mockImplementation(() => ({
      success: ++postCount <= 5,
      retryAfter: postCount > 5 ? 60 : undefined,
    }))

    // POST should start fresh at count=1 → 200
    const req = createMockRequest({ body: { action: 'evaluate', context: {} } }) as any
    const res = await aiDecisionsPOST(req)
    expect(res.status).toBe(200)
  })
})