import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

// ---------------------------------------------------------------------------
// Guard — skip all tests if no Stripe test key is available
// ---------------------------------------------------------------------------

const hasStripeKey = !!process.env.STRIPE_SECRET_KEY

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted() ensures these are defined before vi.mock factories run
// ---------------------------------------------------------------------------

const mockUpdateCustomer = vi.hoisted(() => vi.fn())
const mockGetCustomerByStripeCustomerId = vi.hoisted(() => vi.fn())
const mockGetCustomerByStripeSubscriptionId = vi.hoisted(() => vi.fn())
const mockCreateBillingRecord = vi.hoisted(() => vi.fn())
const mockSendSMS = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase', () => ({
  updateCustomer: mockUpdateCustomer,
  getCustomerByStripeCustomerId: mockGetCustomerByStripeCustomerId,
  getCustomerByStripeSubscriptionId: mockGetCustomerByStripeSubscriptionId,
  createBillingRecord: mockCreateBillingRecord,
}))

vi.mock('@/lib/communication/twilioService', () => ({
  twilioService: {
    sendSMS: mockSendSMS,
  },
}))

// ---------------------------------------------------------------------------
// Module under test — import after vi.mock
// ---------------------------------------------------------------------------

const { handleWebhookEvent, getStripe } = await import('@/lib/stripe')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEvent(type: string, dataObject: Record<string, unknown>): any {
  return {
    id: `evt_test_${Date.now()}`,
    type,
    data: { object: dataObject },
  }
}

function createCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'int-cust-001',
    email: 'integration@test.com',
    business_name: 'Integration Test Biz',
    owner_name: 'Integration Tester',
    phone: '+12025551234',
    industry: 'real-estate',
    plan: 'starter' as const,
    status: 'active' as const,
    onboarding_status: 'completed' as const,
    stripe_customer_id: '',
    stripe_subscription_id: '',
    ...overrides,
  }
}

function billingRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'int-bill-001',
    customer_id: 'int-cust-001',
    invoice_id: 'in_test_001',
    subscription_id: 'sub_test_001',
    amount: 1999,
    currency: 'usd',
    status: 'succeeded' as const,
    description: 'Integration test payment',
    billing_reason: 'subscription_cycle',
    invoice_pdf_url: null,
    period_start: new Date().toISOString(),
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Real Stripe test resources (created once, cleaned up after all tests)
// ---------------------------------------------------------------------------

interface TestResources {
  productId: string
  priceId: string
  stripeCustomerId: string
  subscriptionId: string
  invoiceId: string | null
}

let resources: TestResources | null = null

const TEST_PREFIX = 'frontdesk-int-test'

beforeAll(async () => {
  if (!hasStripeKey) return

  const stripe = getStripe()
  const uniqueId = `${TEST_PREFIX}-${Date.now()}`

  // 1. Create a test product
  const product = await stripe.products.create({
    name: `${TEST_PREFIX} Product ${uniqueId}`,
    metadata: { test_id: uniqueId },
  })

  // 2. Create a test price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 1999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { test_id: uniqueId },
  })

  // 3. Create a test customer
  const customer = await stripe.customers.create({
    email: `${uniqueId}@test.frontdesk.com`,
    name: 'Integration Test Customer',
    metadata: { test_id: uniqueId },
  })

  // 4. Create a test payment method (Visa — succeeds)
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: { token: 'tok_visa' },
  })
  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id })

  // 5. Create a subscription (this generates an initial invoice)
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    default_payment_method: paymentMethod.id,
    metadata: { plan: 'professional', test_id: uniqueId },
    off_session: true,
  })

  // 6. Retrieve the latest invoice
  const invoices = await stripe.invoices.list({
    customer: customer.id,
    limit: 1,
    status: 'paid',
  })
  const invoiceId = invoices.data[0]?.id || null

  resources = {
    productId: product.id,
    priceId: price.id,
    stripeCustomerId: customer.id,
    subscriptionId: subscription.id,
    invoiceId,
  }
}, 30_000) // 30s timeout for Stripe API calls

afterAll(async () => {
  if (!resources || !hasStripeKey) return

  const stripe = getStripe()

  // Cancel subscription
  try {
    await stripe.subscriptions.cancel(resources.subscriptionId)
  } catch {
    // May already be canceled or incomplete
  }

  // Detach payment methods
  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      resources.stripeCustomerId,
    )
    for (const pm of paymentMethods.data) {
      await stripe.paymentMethods.detach(pm.id)
    }
  } catch {
    // Best-effort cleanup
  }

  // Delete customer
  try {
    await stripe.customers.del(resources.stripeCustomerId)
  } catch {
    // Best-effort cleanup
  }

  // Deactivate price and product
  try {
    await stripe.prices.update(resources.priceId, { active: false })
  } catch {
    // Best-effort cleanup
  }
  try {
    await stripe.products.del(resources.productId)
  } catch {
    // Best-effort cleanup
  }
}, 15_000)

// ============================================================================
// Integration Tests
// ============================================================================

describe.runIf(hasStripeKey)('Stripe webhook handlers (real Stripe API)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TWILIO_PHONE_NUMBER', '+15551234567')
  })

  // --------------------------------------------------------------------------
  // checkout.session.completed
  // --------------------------------------------------------------------------

  describe('checkout.session.completed', () => {
    it('provisions customer with real Stripe session data', async () => {
      const session = {
        id: `cs_test_int_${Date.now()}`,
        client_reference_id: 'int-cust-001',
        subscription: resources!.subscriptionId,
        customer: resources!.stripeCustomerId,
        metadata: { plan: 'professional' },
      }

      mockUpdateCustomer.mockResolvedValueOnce(
        createCustomer({
          plan: 'professional',
          status: 'active',
          stripe_customer_id: resources!.stripeCustomerId,
          stripe_subscription_id: resources!.subscriptionId,
        }),
      )

      await handleWebhookEvent(createEvent('checkout.session.completed', session))

      expect(mockUpdateCustomer).toHaveBeenCalledWith('int-cust-001', {
        stripe_customer_id: resources!.stripeCustomerId,
        stripe_subscription_id: resources!.subscriptionId,
        plan: 'professional',
        status: 'active',
      })
    })

    it('defaults to starter plan when metadata has no plan', async () => {
      const session = {
        id: `cs_test_int_${Date.now()}`,
        client_reference_id: 'int-cust-002',
        subscription: resources!.subscriptionId,
        customer: resources!.stripeCustomerId,
        metadata: {},
      }

      mockUpdateCustomer.mockResolvedValueOnce(
        createCustomer({ plan: 'starter' }),
      )

      await handleWebhookEvent(createEvent('checkout.session.completed', session))

      expect(mockUpdateCustomer).toHaveBeenCalledWith('int-cust-002', {
        stripe_customer_id: resources!.stripeCustomerId,
        stripe_subscription_id: resources!.subscriptionId,
        plan: 'starter',
        status: 'active',
      })
    })
  })

  // --------------------------------------------------------------------------
  // customer.subscription.updated
  // --------------------------------------------------------------------------

  describe('customer.subscription.updated', () => {
    it('syncs customer status and plan from real Stripe subscription', async () => {
      // Mock the customer lookup — the handler will check real subscription data
      mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
        createCustomer({ plan: 'starter', stripe_subscription_id: resources!.subscriptionId }),
      )
      mockUpdateCustomer.mockResolvedValueOnce(
        createCustomer({ plan: 'professional', status: 'active' }),
      )

      // Retrieve the real subscription from Stripe
      const realSubscription = await getStripe().subscriptions.retrieve(
        resources!.subscriptionId,
      )

      await handleWebhookEvent(
        createEvent('customer.subscription.updated', realSubscription as unknown as Record<string, unknown>),
      )

      // Handler should look up by real subscription ID
      expect(mockGetCustomerByStripeSubscriptionId).toHaveBeenCalledWith(
        resources!.subscriptionId,
      )

      // Plan from subscription metadata (professional) should be synced
      // For subscriptions created with metadata: { plan: 'professional' }
      const planFromMetadata = realSubscription.metadata?.plan as string | undefined
      expect(mockUpdateCustomer).toHaveBeenCalledWith(
        'int-cust-001',
        expect.objectContaining({
          stripe_subscription_id: resources!.subscriptionId,
          plan: planFromMetadata || 'starter',
          status: expect.any(String),
        }),
      )
    })

    it('falls back to customer plan when subscription metadata lacks a plan', async () => {
      const existing = createCustomer({
        plan: 'enterprise',
        stripe_subscription_id: resources!.subscriptionId,
      })
      mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(existing)
      mockUpdateCustomer.mockResolvedValueOnce(
        createCustomer({ plan: 'enterprise', status: 'active' }),
      )

      // Retrieve the real subscription and strip the plan metadata
      const realSubscription = await getStripe().subscriptions.retrieve(
        resources!.subscriptionId,
      )
      // Create a subscription-like object with no plan in metadata
      const subscriptionWithoutPlan = {
        ...realSubscription,
        metadata: { test_id: realSubscription.metadata?.test_id },
      }

      await handleWebhookEvent(
        createEvent('customer.subscription.updated', subscriptionWithoutPlan as unknown as Record<string, unknown>),
      )

      // Should fall back to customer's 'enterprise' plan
      expect(mockUpdateCustomer).toHaveBeenCalledWith(
        'int-cust-001',
        expect.objectContaining({ plan: 'enterprise' }),
      )
    })
  })

  // --------------------------------------------------------------------------
  // customer.subscription.deleted
  // --------------------------------------------------------------------------

  describe('customer.subscription.deleted', () => {
    it('processes deletion with real canceled subscription data', async () => {
      // Create a separate subscription for the deletion test
      const stripe = getStripe()
      const pm = await stripe.paymentMethods.create({
        type: 'card',
        card: { token: 'tok_visa' },
      })
      await stripe.paymentMethods.attach(pm.id, {
        customer: resources!.stripeCustomerId,
      })

      const subToDelete = await stripe.subscriptions.create({
        customer: resources!.stripeCustomerId,
        items: [{ price: resources!.priceId }],
        default_payment_method: pm.id,
        metadata: { plan: 'starter', test_id: 'for-deletion-test' },
        off_session: true,
      })

      const canceledSub = await stripe.subscriptions.cancel(subToDelete.id)

      mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
        createCustomer({
          plan: 'professional',
          stripe_subscription_id: subToDelete.id,
        }),
      )
      mockUpdateCustomer.mockResolvedValueOnce(
        createCustomer({
          plan: 'starter',
          status: 'cancelled',
          stripe_subscription_id: null,
        }),
      )

      await handleWebhookEvent(
        createEvent('customer.subscription.deleted', canceledSub as unknown as Record<string, unknown>),
      )

      expect(mockGetCustomerByStripeSubscriptionId).toHaveBeenCalledWith(
        subToDelete.id,
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('int-cust-001', {
        stripe_subscription_id: null,
        plan: 'starter',
        status: 'cancelled',
      })
    })
  })

  // --------------------------------------------------------------------------
  // invoice.payment_succeeded
  // --------------------------------------------------------------------------

  describe('invoice.payment_succeeded', () => {
    it('records billing history with real invoice data', async () => {
      if (!resources!.invoiceId) {
        console.warn('No paid invoice available — skipping test')
        return
      }

      // Retrieve the real invoice from Stripe
      const realInvoice = await getStripe().invoices.retrieve(resources!.invoiceId!)

      // Convert to a plain object that matches what the handler expects
      const invoiceData = JSON.parse(JSON.stringify(realInvoice))

      mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(
        createCustomer({
          stripe_customer_id: resources!.stripeCustomerId,
          stripe_subscription_id: resources!.subscriptionId,
        }),
      )
      mockCreateBillingRecord.mockResolvedValueOnce(
        billingRecord({ invoice_id: realInvoice.id }),
      )

      await handleWebhookEvent(
        createEvent('invoice.payment_succeeded', invoiceData),
      )

      // Should look up customer by the real Stripe customer ID
      expect(mockGetCustomerByStripeCustomerId).toHaveBeenCalledWith(
        resources!.stripeCustomerId,
      )

      // Should create billing record with real invoice data
      expect(mockCreateBillingRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'int-cust-001',
          invoice_id: realInvoice.id,
          amount: realInvoice.amount_paid,
          currency: realInvoice.currency || 'usd',
          billing_reason: realInvoice.billing_reason || null,
        }),
      )
    })
  })

  // --------------------------------------------------------------------------
  // invoice.payment_failed
  // --------------------------------------------------------------------------

  describe('invoice.payment_failed', () => {
    it('flags customer as past_due with real invoice data', async () => {
      if (!resources!.invoiceId) {
        console.warn('No invoice available — skipping test')
        return
      }

      const realInvoice = await getStripe().invoices.retrieve(resources!.invoiceId!)
      const invoiceData = {
        ...JSON.parse(JSON.stringify(realInvoice)),
        amount_due: 2999, // Override: real paid invoices have amount_due=0
        currency: 'usd',
      }

      mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(
        createCustomer({
          stripe_customer_id: resources!.stripeCustomerId,
          phone: '+12025551234',
          status: 'active',
        }),
      )
      mockUpdateCustomer.mockResolvedValueOnce(
        createCustomer({ status: 'past_due' }),
      )

      await handleWebhookEvent(
        createEvent('invoice.payment_failed', invoiceData),
      )

      // Should update customer status to past_due
      expect(mockUpdateCustomer).toHaveBeenCalledWith('int-cust-001', {
        status: 'past_due',
      })

      // Should attempt SMS with formatted amount
      expect(mockSendSMS).toHaveBeenCalledWith(
        '+12025551234',
        '+15551234567',
        expect.stringContaining('29.99'),
      )
      expect(mockSendSMS).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('USD'),
      )
    })
  })

  // --------------------------------------------------------------------------
  // Error handling
  // --------------------------------------------------------------------------

  describe('error handling', () => {
    it('handles malformed event data gracefully', async () => {
      const badEvent = createEvent('checkout.session.completed', {
        id: 'cs_bad',
        // Missing client_reference_id, subscription, customer
      })

      // Should not throw — just return early with a warning
      await expect(
        handleWebhookEvent(badEvent),
      ).resolves.toBeUndefined()

      expect(mockUpdateCustomer).not.toHaveBeenCalled()
    })
  })
})

// ---------------------------------------------------------------------------
// When no Stripe key is present, provide a clear message
// ---------------------------------------------------------------------------

describe.runIf(!hasStripeKey)('Stripe webhook handlers (real Stripe API)', () => {
  it('skipped — set STRIPE_SECRET_KEY (test mode) to run integration tests', () => {
    console.info(
      'Skipping Stripe integration tests: STRIPE_SECRET_KEY not set. ' +
      'Set it to a Stripe test-mode key to run these tests.',
    )
    expect(true).toBe(true)
  })
})
