/**
 * Integration tests for POST /api/create-checkout-session
 *
 * Covers:
 *   - Plan validation (missing, invalid, all 4 valid plans)
 *   - Early-bird coupon application
 *   - Origin header handling (request header → env var → localhost fallback)
 *   - Session config (line_items, metadata, success/cancel URLs)
 *   - Error handling (Stripe API failures)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type Stripe from 'stripe'

// -- Mocks (vi.hoisted ensures availability before vi.mock hoisting) --------
const {
  mockCreate,
  mockResponseJson,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockResponseJson: vi.fn(),
}))

// Mock the Stripe client
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  },
}))

// Mock NextResponse to capture response data
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: mockResponseJson,
    },
  }
})

import { PLANS } from '@/lib/plans'

// -- Helpers ---------------------------------------------------------------

/**
 * Build a mock NextRequest with JSON body and optional headers.
 */
function makePostRequest(
  body: Record<string, unknown>,
  headers?: Record<string, string>
): Request {
  const headerStore = new Map<string, string>()
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      headerStore.set(k.toLowerCase(), v)
    }
  }
  return {
    async json() {
      return body
    },
    headers: {
      get(key: string) {
        return headerStore.get(key.toLowerCase()) ?? null
      },
    },
  } as unknown as Request
}

// -- Tests -----------------------------------------------------------------

describe('POST /api/create-checkout-session', () => {
  const DEFAULT_SESSION_URL = 'https://checkout.stripe.com/c/pay/cs_test_abc123'

  let capturedResponses: Array<{ data: unknown; status: number }>
  let originalEarlyBirdEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    capturedResponses = []

    // Set up mock response
    mockResponseJson.mockImplementation((data: unknown, opts?: { status?: number }) => {
      capturedResponses.push({ data, status: opts?.status ?? 200 })
      return { data, status: opts?.status ?? 200 }
    })

    // Default Stripe session creation returns a URL
    mockCreate.mockResolvedValue({ url: DEFAULT_SESSION_URL } as Stripe.Checkout.Session)

    // Save and clear the early-bird env var
    originalEarlyBirdEnv = process.env.STRIPE_EARLYBIRD_COUPON_ID
    delete process.env.STRIPE_EARLYBIRD_COUPON_ID
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore the early-bird env var
    if (originalEarlyBirdEnv !== undefined) {
      process.env.STRIPE_EARLYBIRD_COUPON_ID = originalEarlyBirdEnv
    } else {
      delete process.env.STRIPE_EARLYBIRD_COUPON_ID
    }
  })

  // Dynamically import the route to ensure fresh module with current env
  async function getRoute() {
    return await import('@/app/api/create-checkout-session/route')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Plan Validation
  // ─────────────────────────────────────────────────────────────────────────
  describe('plan validation', () => {
    it('returns 400 when planId is missing', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({}) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 400,
        data: { error: 'Invalid plan ID' },
      })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns 400 when planId is null', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: null }) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 400,
        data: { error: 'Invalid plan ID' },
      })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns 400 when planId is empty string', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: '' }) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 400,
        data: { error: 'Invalid plan ID' },
      })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns 400 when planId is not a valid plan', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'nonexistent' }) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 400,
        data: { error: 'Invalid plan ID' },
      })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it.each(['starter', 'professional', 'enterprise', 'ultimate'] as const)(
      'accepts valid planId: %s',
      async (planId) => {
        const { POST } = await getRoute()
        await POST(makePostRequest({ planId }) as never)

        expect(mockCreate).toHaveBeenCalledTimes(1)
        expect(capturedResponses).toHaveLength(1)
        expect(capturedResponses[0].data).toMatchObject({ url: DEFAULT_SESSION_URL })
      }
    )
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Session Config — line_items, metadata, URLs
  // ─────────────────────────────────────────────────────────────────────────
  describe('session configuration', () => {
    it('creates session in subscription mode', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.mode).toBe('subscription')
    })

    it('configures line_items with correct plan price and name', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'professional' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.line_items).toHaveLength(1)
      expect(config.line_items[0]).toMatchObject({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `FrontDesk Agents AI - ${PLANS.professional.name}`,
            description: expect.stringContaining('$349'),
          },
          unit_amount: PLANS.professional.price,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      })
    })

    it.each([
      ['starter', 11900, '$119', 'Starter'],
      ['professional', 34900, '$349', 'Growth'],
      ['enterprise', 119900, '$1199', 'Pro'],
      ['ultimate', 159900, '$1599', 'Premium'],
    ] as const)(
      'sets correct price and product name for %s plan',
      async (planId, unitAmount, displayPrice, planName) => {
        const { POST } = await getRoute()
        await POST(makePostRequest({ planId }) as never)

        const config = mockCreate.mock.calls[0][0]
        expect(config.line_items[0].price_data.unit_amount).toBe(unitAmount)
        expect(config.line_items[0].price_data.product_data.name).toBe(
          `FrontDesk Agents AI - ${planName}`
        )
        expect(config.line_items[0].price_data.product_data.description).toContain(displayPrice)
      }
    )

    it('sets metadata with planId and planName', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'enterprise' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.metadata).toEqual({
        planId: 'enterprise',
        planName: 'Pro',
      })
    })

    it('uses origin header for success_url and cancel_url', async () => {
      const { POST } = await getRoute()
      await POST(
        makePostRequest({ planId: 'starter' }, { origin: 'https://frontdeskagents.com' }) as never
      )

      const config = mockCreate.mock.calls[0][0]
      expect(config.success_url).toBe(
        'https://frontdeskagents.com/pricing?success=true&plan=starter'
      )
      expect(config.cancel_url).toBe('https://frontdeskagents.com/pricing?canceled=true')
    })

    it('falls back to NEXT_PUBLIC_APP_URL when origin header is missing', async () => {
      const original = process.env.NEXT_PUBLIC_APP_URL
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.success_url).toContain('https://app.example.com')
      expect(config.cancel_url).toContain('https://app.example.com')

      if (original !== undefined) {
        process.env.NEXT_PUBLIC_APP_URL = original
      } else {
        delete process.env.NEXT_PUBLIC_APP_URL
      }
    })

    it('falls back to localhost when no origin header or env var', async () => {
      const original = process.env.NEXT_PUBLIC_APP_URL
      delete process.env.NEXT_PUBLIC_APP_URL

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.success_url).toContain('http://localhost:3000')
      expect(config.cancel_url).toContain('http://localhost:3000')

      if (original !== undefined) {
        process.env.NEXT_PUBLIC_APP_URL = original
      }
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Early-bird Coupon
  // ─────────────────────────────────────────────────────────────────────────
  describe('early-bird coupon', () => {
    it('applies coupon when STRIPE_EARLYBIRD_COUPON_ID is set', async () => {
      process.env.STRIPE_EARLYBIRD_COUPON_ID = 'coupon_earlybird123'

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.discounts).toEqual([{ coupon: 'coupon_earlybird123' }])
    })

    it('does not apply discounts when STRIPE_EARLYBIRD_COUPON_ID is not set', async () => {
      delete process.env.STRIPE_EARLYBIRD_COUPON_ID

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.discounts).toBeUndefined()
    })

    it('coupon value is correctly passed to Stripe', async () => {
      process.env.STRIPE_EARLYBIRD_COUPON_ID = 'promo_10pct_off'

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'professional' }) as never)

      const config = mockCreate.mock.calls[0][0]
      expect(config.discounts).toEqual([{ coupon: 'promo_10pct_off' }])
      expect(config.discounts[0].coupon).toBe('promo_10pct_off')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Success Response
  // ─────────────────────────────────────────────────────────────────────────
  describe('success response', () => {
    it('returns the session URL on success', async () => {
      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 200,
        data: { url: DEFAULT_SESSION_URL },
      })
    })

    it('returns a different URL when Stripe returns a different session', async () => {
      mockCreate.mockResolvedValueOnce({
        url: 'https://checkout.stripe.com/c/pay/cs_test_custom',
      } as Stripe.Checkout.Session)

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      expect(capturedResponses[0]).toMatchObject({
        data: { url: 'https://checkout.stripe.com/c/pay/cs_test_custom' },
      })
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────────────────────────────────────
  describe('error handling', () => {
    it('returns 500 when Stripe API throws', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Stripe API unavailable'))

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 500,
        data: { error: 'Failed to create checkout session' },
      })
    })

    it('returns 500 when request.json() throws (malformed body)', async () => {
      const badRequest = {
        async json() {
          throw new SyntaxError('Unexpected token')
        },
        headers: { get: () => null },
      } as unknown as Request

      const { POST } = await getRoute()
      await POST(badRequest)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 500,
        data: { error: 'Failed to create checkout session' },
      })
    })

    it('returns 500 when Stripe returns a rate limit error', async () => {
      const rateLimitError = Object.assign(new Error('Rate limit exceeded'), {
        type: 'StripeRateLimitError',
        statusCode: 429,
      })
      mockCreate.mockRejectedValueOnce(rateLimitError)

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'enterprise' }) as never)

      expect(capturedResponses).toHaveLength(1)
      expect(capturedResponses[0]).toMatchObject({
        status: 500,
        data: { error: 'Failed to create checkout session' },
      })
    })

    it('logs the error to console', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockCreate.mockRejectedValueOnce(new Error('Test error'))

      const { POST } = await getRoute()
      await POST(makePostRequest({ planId: 'starter' }) as never)

      expect(spy).toHaveBeenCalledWith(
        'Create checkout session error:',
        expect.any(Error)
      )
      spy.mockRestore()
    })
  })
})
