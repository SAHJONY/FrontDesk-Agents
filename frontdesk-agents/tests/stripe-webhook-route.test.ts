import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.hoisted(() => vi.fn())
const mockHandleWebhookEvent = vi.hoisted(() => vi.fn())
const mockNextResponseJson = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
  handleWebhookEvent: mockHandleWebhookEvent,
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => {
      mockNextResponseJson(...args)
      return {
        status: (args[1] as { status?: number })?.status ?? 200,
        async json() { return (args[0] as object) },
      }
    },
  },
}))

// ─── Module under test ─────────────────────────────────────────────────────────

import { POST } from '@/app/api/stripe/webhook/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockRequest(overrides: {
  body?: string
  headers?: Record<string, string | null>
} = {}): Request {
  const body = overrides.body ?? '{}'
  const headers = new Map(
    Object.entries(overrides.headers ?? {}).filter(([, v]) => v !== null),
  )
  return {
    text: async () => body,
    headers: {
      get: (name: string) => headers.get(name) ?? null,
    },
  } as unknown as Request
}

// ─── Test event factories ──────────────────────────────────────────────────────

function makeCheckoutCompleted(overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_123', ...overrides } },
  }
}
function makeSubscriptionUpdated(overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type: 'customer.subscription.updated',
    data: { object: { id: 'sub_test_123', ...overrides } },
  }
}
function makeSubscriptionDeleted(overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type: 'customer.subscription.deleted',
    data: { object: { id: 'sub_test_123', ...overrides } },
  }
}
function makePaymentSucceeded(overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type: 'invoice.payment_succeeded',
    data: { object: { id: 'in_test_123', customer: 'cus_test', amount_paid: 29900, ...overrides } },
  }
}
function makePaymentFailed(overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type: 'invoice.payment_failed',
    data: { object: { id: 'in_test_123', customer: 'cus_test', amount_due: 29900, ...overrides } },
  }
}

// ─── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret')
  mockHandleWebhookEvent.mockResolvedValue(undefined)
  mockNextResponseJson.mockClear()
})

// ─── Signature Verification ────────────────────────────────────────────────────

describe('POST /api/stripe/webhook — signature verification', () => {

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = createMockRequest({
      body: JSON.stringify(makeCheckoutCompleted()),
      headers: {},
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('stripe-signature')
    expect(mockConstructEvent).not.toHaveBeenCalled()
  })

  it('returns 400 when stripe-signature header is empty string', async () => {
    const req = createMockRequest({
      body: JSON.stringify(makeCheckoutCompleted()),
      headers: { 'stripe-signature': '' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('stripe-signature')
  })

  it('returns 500 when STRIPE_WEBHOOK_SECRET env var is not set', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '')

    const req = createMockRequest({
      body: JSON.stringify(makeCheckoutCompleted()),
      headers: { 'stripe-signature': 'sig_test_123' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toContain('not configured')
  })

  it('returns 400 when constructEvent throws SignatureVerificationError', async () => {
    const err = new Error('No signatures found matching the expected payload') as Error & { type?: string }
    err.type = 'StripeSignatureVerificationError'
    mockConstructEvent.mockImplementation(() => { throw err })

    const req = createMockRequest({
      body: JSON.stringify(makeCheckoutCompleted()),
      headers: { 'stripe-signature': 'sig_invalid' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(400)
    // constructEvent was called (the mock throws, so it must have been invoked)
    expect(mockConstructEvent).toHaveBeenCalled()
    // and handleWebhookEvent was NOT called (event never got constructed)
    expect(mockHandleWebhookEvent).not.toHaveBeenCalled()
  })

  it('returns 400 when constructEvent throws generic Error (not Stripe type)', async () => {
    // Even a non-Stripe error in signature verification should result in 400.
    // Mock console.error so Vitest doesn't report the catch-block's log as unhandled.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockConstructEvent.mockImplementation(() => { throw new Error('Unexpected error') })

    const req = createMockRequest({
      body: JSON.stringify(makeCheckoutCompleted()),
      headers: { 'stripe-signature': 'sig_bad' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Webhook handler failed')
    consoleSpy.mockRestore()
  })

  it('calls constructEvent with raw body, signature, and webhook secret', async () => {
    const event = makeCheckoutCompleted({ id: 'cs_verify_test' })
    mockConstructEvent.mockReturnValue(event)

    const rawBody = JSON.stringify(event)

    const req = createMockRequest({
      body: rawBody,
      headers: { 'stripe-signature': 'sig_valid_abc123' },
    })

    await POST(req as unknown as Request)

    expect(mockConstructEvent).toHaveBeenCalledTimes(1)
    expect(mockConstructEvent).toHaveBeenCalledWith(
      rawBody,
      'sig_valid_abc123',
      'whsec_test_secret',
    )
  })

  it('passes verified event to handleWebhookEvent and returns { received: true }', async () => {
    const event = makeCheckoutCompleted()
    mockConstructEvent.mockReturnValue(event)
    mockHandleWebhookEvent.mockResolvedValue(undefined)

    const req = createMockRequest({
      body: JSON.stringify(event),
      headers: { 'stripe-signature': 'sig_valid' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
    const data = await res.json()
    expect(data).toEqual({ received: true })
  })

  it('logs error and returns 400 when handleWebhookEvent throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const event = makeCheckoutCompleted()
    mockConstructEvent.mockReturnValue(event)
    mockHandleWebhookEvent.mockRejectedValue(new Error('Database connection failed'))

    const req = createMockRequest({
      body: JSON.stringify(event),
      headers: { 'stripe-signature': 'sig_valid' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Webhook handler failed')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Webhook error:',
      expect.objectContaining({ message: expect.any(String) }),
    )
    // Verify it was actually an Error instance (Error.message is non-enumerable,
    // so objectContaining won't directly match it — check via arguments)
    const errorArg = (consoleErrorSpy.mock.calls[0] as unknown[])[1] as Error
    expect(errorArg).toBeInstanceOf(Error)
    expect(errorArg.message).toBe('Database connection failed')

    consoleErrorSpy.mockRestore()
  })
})

// ─── Raw body handling ─────────────────────────────────────────────────────────

describe('POST /api/stripe/webhook — raw body handling', () => {

  it('uses request.text() so raw body is preserved for signature verification', async () => {
    const event = makeCheckoutCompleted()
    mockConstructEvent.mockReturnValue(event)

    // Simulate a request with a specific raw body (important for Stripe signature)
    const rawBody = JSON.stringify(event)

    const req = createMockRequest({
      body: rawBody,
      headers: { 'stripe-signature': 'sig_raw_body_test' },
    })

    await POST(req as unknown as Request)

    // constructEvent must receive the EXACT same string that was signed by Stripe
    expect(mockConstructEvent).toHaveBeenCalledWith(
      rawBody,          // must be the raw string, not parsed JSON
      'sig_raw_body_test',
      'whsec_test_secret',
    )
  })

  it('handles empty body gracefully', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Unexpected error') as Error & { type?: string }
    })

    const req = createMockRequest({
      body: '',
      headers: { 'stripe-signature': 'sig_empty' },
    })

    const res = await POST(req as unknown as Request)

    // constructEvent receives empty string — Stripe will reject it with SignatureVerificationError
    // which is caught and returns 400
    expect(res.status).toBe(400)
  })
})

// ─── All event type handlers ───────────────────────────────────────────────────

describe('POST /api/stripe/webhook — event type handlers', () => {

  async function sendEvent(event: object) {
    mockConstructEvent.mockReturnValue(event)
    const req = createMockRequest({
      body: JSON.stringify(event),
      headers: { 'stripe-signature': 'sig_valid' },
    })
    return POST(req as unknown as Request)
  }

  it('routes checkout.session.completed to handleWebhookEvent', async () => {
    const event = makeCheckoutCompleted({
      client_reference_id: 'cust_abc',
      subscription: 'sub_123',
      customer: 'cus_xyz',
      metadata: { plan: 'professional' },
    })

    const res = await sendEvent(event)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('routes customer.subscription.updated to handleWebhookEvent', async () => {
    const event = makeSubscriptionUpdated({
      id: 'sub_updated_123',
      status: 'active',
      metadata: { plan: 'enterprise', customerId: 'cust_abc' },
    })

    const res = await sendEvent(event)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('routes customer.subscription.deleted to handleWebhookEvent', async () => {
    const event = makeSubscriptionDeleted({ id: 'sub_deleted_123' })

    const res = await sendEvent(event)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('routes invoice.payment_succeeded to handleWebhookEvent', async () => {
    const event = makePaymentSucceeded({
      id: 'in_paid_456',
      customer: 'cus_test_789',
      amount_paid: 79900,
      currency: 'usd',
      billing_reason: 'subscription_cycle',
    })

    const res = await sendEvent(event)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('routes invoice.payment_failed to handleWebhookEvent', async () => {
    const event = makePaymentFailed({
      id: 'in_failed_789',
      customer: 'cus_test_abc',
      amount_due: 29900,
      currency: 'usd',
    })

    const res = await sendEvent(event)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('passes unrecognized event types through without error', async () => {
    const event = {
      id: `evt_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    }

    const res = await sendEvent(event)

    // handleWebhookEvent has a switch with no default — unknown types silently return
    // The route returns 200 as long as constructEvent succeeds
    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })
})

// ─── Edge cases ────────────────────────────────────────────────────────────────

describe('POST /api/stripe/webhook — edge cases', () => {

  it('returns 400 when stripe-signature header is only whitespace', async () => {
    // '   ' is truthy — passes the `if (!signature)` check.
    // Stripe constructEvent throws because the payload doesn't match the signature.
    // The route catches the error and returns 400.
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected payload') as Error & { type?: string }
    })

    const req = createMockRequest({
      body: JSON.stringify(makeCheckoutCompleted()),
      headers: { 'stripe-signature': '   ' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(400)
    expect(mockConstructEvent).toHaveBeenCalled()
  })

  it('does not crash when event object is deeply nested', async () => {
    const event = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_deep',
          client_reference_id: 'cust_deep',
          subscription: 'sub_deep',
          customer: 'cus_deep',
          metadata: {
            plan: 'enterprise',
            internal: { ref: 'abc123', nested: { value: 42 } },
          },
        },
      },
    }
    mockConstructEvent.mockReturnValue(event)

    const req = createMockRequest({
      body: JSON.stringify(event),
      headers: { 'stripe-signature': 'sig_deep' },
    })

    const res = await POST(req as unknown as Request)

    expect(res.status).toBe(200)
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('rejects signature header with null value', async () => {
    const req = {
      body: JSON.stringify(makeCheckoutCompleted()),
      text: async () => JSON.stringify(makeCheckoutCompleted()),
    headers: { get: (name: string) => name === 'stripe-signature' ? null : null },
    } as unknown as Request

    const res = await POST(req)

    // Map with null value gets filtered out, so stripe-signature is missing → 400
    expect(res.status).toBe(400)
  })

  it('logs the full error object on handler failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const event = makeCheckoutCompleted()
    mockConstructEvent.mockReturnValue(event)
    mockHandleWebhookEvent.mockRejectedValue(new Error('Database connection failed'))

    const req = createMockRequest({
      body: JSON.stringify(event),
      headers: { 'stripe-signature': 'sig_handler_fail' },
    })

    await POST(req as unknown as Request)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Webhook error:',
      expect.objectContaining({ message: expect.any(String) }),
    )
    // Verify it was actually an Error instance (Error.message is non-enumerable,
    // so objectContaining won't directly match it — check via arguments)
    const errorArg = (consoleErrorSpy.mock.calls[0] as unknown[])[1] as Error
    expect(errorArg).toBeInstanceOf(Error)
    expect(errorArg.message).toBe('Database connection failed')

    consoleErrorSpy.mockRestore()
  })
})