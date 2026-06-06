import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Shared mocks (hoisted before vi.mock) ────────────────────────────────────

const mockUpdateCustomer = vi.hoisted(() => vi.fn())
const mockGetCustomerByStripeSubscriptionId = vi.hoisted(() => vi.fn())
const mockGetCustomerByStripeCustomerId = vi.hoisted(() => vi.fn())
const mockCreateBillingRecord = vi.hoisted(() => vi.fn())
const mockSendSMS = vi.hoisted(() => vi.fn())

// ─── Supabase mock ─────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase', () => ({
  updateCustomer: mockUpdateCustomer,
  getCustomerByStripeSubscriptionId: mockGetCustomerByStripeSubscriptionId,
  getCustomerByStripeCustomerId: mockGetCustomerByStripeCustomerId,
  createBillingRecord: mockCreateBillingRecord,
}))

// ─── TwilioService mock ────────────────────────────────────────────────────────

vi.mock('@/lib/communication/twilioService', () => ({
  twilioService: {
    sendSMS: mockSendSMS,
  },
}))

// ─── Stripe mock (minimal — only the parts used by stripe.ts handlers) ─────────

const mockStripeWebhookConstructEvent = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', async () => {
  const actual = await vi.importActual('@/lib/stripe') as any
  return {
    ...actual,
    stripe: {
      webhooks: {
        constructEvent: mockStripeWebhookConstructEvent,
      },
    },
  }
})

// ─── Import the module under test ──────────────────────────────────────────────

// We test the exported handlers directly by testing handleWebhookEvent's behavior
// through the Stripe webhook route POST handler, since the handlers are not exported
// separately. We use a hybrid approach: test the route + mock handleWebhookEvent
// internals to isolate the billing-specific behavior.
//
// For unit-testing the internal logic (handleCheckoutComplete, handlePaymentSucceeded,
// handlePaymentFailed) we import stripe.ts directly via vi.mock leakage + re-import.

import { handleWebhookEvent, stripe } from '@/lib/stripe'

// ─── Test event factories ──────────────────────────────────────────────────────

function makeCheckoutSession(overrides: Record<string, unknown> = {}) {
  return {
    id: `cs_${Date.now()}`,
    object: 'checkout.session',
    client_reference_id: overrides.client_reference_id ?? 'cust_test_123',
    subscription: overrides.subscription ?? 'sub_test_456',
    customer: overrides.customer ?? 'cus_test_789',
    amount_total: overrides.amount_total ?? 29900,
    currency: overrides.currency ?? 'usd',
    metadata: overrides.metadata ?? { plan: 'professional' },
    invoice_pdf: overrides.invoice_pdf ?? null,
    ...overrides,
  }
}

function makeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: overrides.id ?? 'sub_test_456',
    object: 'subscription',
    status: overrides.status ?? 'active',
    metadata: overrides.metadata ?? { plan: 'professional', customerId: 'cust_test_123' },
    current_period_start: overrides.current_period_start ?? 1719792000,
    current_period_end: overrides.current_period_end ?? 1722470400,
    ...overrides,
  }
}

function makeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: `in_${Date.now()}`,
    object: 'invoice',
    customer: overrides.customer ?? 'cus_test_789',
    amount_paid: overrides.amount_paid ?? 29900,
    amount_due: overrides.amount_due ?? 29900,
    currency: overrides.currency ?? 'usd',
    billing_reason: overrides.billing_reason ?? 'subscription_cycle',
    invoice_pdf: overrides.invoice_pdf ?? null,
    period_start: overrides.period_start ?? 1719792000,
    period_end: overrides.period_end ?? 1722470400,
    ...overrides,
  }
}

// ─── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret')
  vi.stubEnv('TWILIO_PHONE_NUMBER', '+15550000000') // default for SMS tests
})

// ─── handleCheckoutComplete tests ─────────────────────────────────────────────

describe('handleCheckoutComplete', () => {

  it('creates a billing_history record with session.id as invoice_id', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123', plan: 'professional' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_rec_1' } as any)

    const session = makeCheckoutSession({
      client_reference_id: 'cust_test_123',
      subscription: 'sub_test_456',
      customer: 'cus_test_789',
      amount_total: 29900,
      currency: 'usd',
      metadata: { plan: 'professional' },
    })

    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).toHaveBeenCalledTimes(1)
    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.invoice_id).toBe(session.id)
    expect(recordArg.customer_id).toBe('cust_test_123')
    expect(recordArg.subscription_id).toBe('sub_test_456')
    expect(recordArg.amount).toBe(29900)
    expect(recordArg.currency).toBe('usd')
    expect(recordArg.status).toBe('succeeded')
    expect(recordArg.billing_reason).toBe('initial')
    expect(recordArg.description).toContain('professional')
  })

  it('uses amount_total from session as amount (in cents)', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_2' } as any)

    const session = makeCheckoutSession({
      amount_total: 79900, // $799 in cents
      client_reference_id: 'cust_ent',
    })

    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.amount).toBe(79900)
  })

  it('throws Error when createBillingRecord returns null (billing record creation fails)', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue(null) // failure

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const session = makeCheckoutSession({
      client_reference_id: 'cust_test_123',
      subscription: 'sub_test_456',
      customer: 'cus_test_789',
    })

    const event = { type: 'checkout.session.completed', data: { object: session } } as any

    await expect(handleWebhookEvent(event)).rejects.toThrow('CRITICAL')
    consoleSpy.mockRestore()
  })

  it('throws Error when createBillingRecord throws (database error)', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockRejectedValue(new Error('Database constraint violation'))

    const session = makeCheckoutSession({ client_reference_id: 'cust_test_123' })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any

    await expect(handleWebhookEvent(event)).rejects.toThrow('Database constraint violation')
  })

  it('does NOT create billing record when client_reference_id is missing', async () => {
    mockUpdateCustomer.mockResolvedValue(null)

    const session = makeCheckoutSession({ client_reference_id: null as any })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('does NOT create billing record when subscription is missing', async () => {
    const session = makeCheckoutSession({ subscription: null as any })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })

  it('does NOT create billing record when stripe_customer_id is missing', async () => {
    const session = makeCheckoutSession({ customer: null as any })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('does NOT create billing record when updateCustomer returns null (customer not found)', async () => {
    mockUpdateCustomer.mockResolvedValue(null) // customer not found

    const session = makeCheckoutSession({ client_reference_id: 'nonexistent_customer' })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('uses plan from session.metadata when available', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_3' } as any)

    const session = makeCheckoutSession({
      metadata: { plan: 'enterprise' },
      client_reference_id: 'cust_ent',
    })

    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_ent', expect.objectContaining({
      plan: 'enterprise',
    }))

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.description).toContain('enterprise')
  })

  it('defaults to starter plan when metadata.plan is missing', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_4' } as any)

    const session = makeCheckoutSession({
      metadata: {},
      client_reference_id: 'cust_new',
    })

    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_new', expect.objectContaining({
      plan: 'starter',
    }))
  })

  it('sets status to active on the customer record', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_5' } as any)

    const session = makeCheckoutSession({ client_reference_id: 'cust_active' })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_active', expect.objectContaining({
      status: 'active',
    }))
  })

  it('sets stripe_customer_id and stripe_subscription_id on the customer', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_stripe' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_6' } as any)

    const session = makeCheckoutSession({
      client_reference_id: 'cust_stripe',
      subscription: 'sub_abc_123',
      customer: 'cus_xyz_456',
    })

    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_stripe', expect.objectContaining({
      stripe_customer_id: 'cus_xyz_456',
      stripe_subscription_id: 'sub_abc_123',
    }))
  })

  it('handles null invoice_pdf gracefully', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_7' } as any)

    const session = makeCheckoutSession({ invoice_pdf: null })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.invoice_pdf_url).toBe(null)
  })

  it('handles missing amount_total (undefined) by passing 0', async () => {
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_test_123' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_8' } as any)

    const session = makeCheckoutSession({ amount_total: undefined as any })
    const event = { type: 'checkout.session.completed', data: { object: session } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.amount).toBe(0)
  })
})

// ─── handlePaymentSucceeded tests ─────────────────────────────────────────────

describe('handlePaymentSucceeded', () => {

  it('creates a billing_history record for a subscription_cycle invoice', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_cycle',
      stripe_subscription_id: 'sub_recurring',
      status: 'active',
    } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_cycle_1' } as any)

    const invoice = makeInvoice({
      id: 'in_recurring_123',
      customer: 'cus_cycle',
      billing_reason: 'subscription_cycle',
      amount_paid: 2990, // 2990 cents = $29.90
    })

    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).toHaveBeenCalledTimes(1)
    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.invoice_id).toBe('in_recurring_123')
    expect(recordArg.customer_id).toBe('cust_cycle')
    expect(recordArg.subscription_id).toBe('sub_recurring')
    expect(recordArg.amount).toBe(2990)
    expect(recordArg.status).toBe('succeeded')
    expect(recordArg.billing_reason).toBe('subscription_cycle')
    expect(recordArg.description).toContain('29.90')
    expect(recordArg.description).toContain('USD')
  })

  it('skips billing record creation for subscription_create invoices (initial payment)', async () => {
    // No need to mock customer lookup — the function should return early
    mockGetCustomerByStripeCustomerId.mockResolvedValue(null)

    const invoice = makeInvoice({
      id: 'in_initial_456',
      billing_reason: 'subscription_create',
      amount_paid: 29900,
    })

    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    // Customer lookup should NOT be called because we skip on subscription_create
    expect(mockGetCustomerByStripeCustomerId).not.toHaveBeenCalled()
    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('skips for subscription_create even when billing_reason is the exact string', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue(null)

    const invoice = makeInvoice({ billing_reason: 'subscription_create' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('creates billing record for manualbilling (another non-initial reason)', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({ id: 'cust_manual', status: 'active' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_manual_1' } as any)

    const invoice = makeInvoice({ billing_reason: 'manual' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).toHaveBeenCalledTimes(1)
  })

  it('throws Error when createBillingRecord returns null', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_fail',
      stripe_subscription_id: 'sub_fail',
      status: 'active',
    } as any)
    mockCreateBillingRecord.mockResolvedValue(null)

    const invoice = makeInvoice({ billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any

    await expect(handleWebhookEvent(event)).rejects.toThrow('CRITICAL')
  })

  it('throws Error when createBillingRecord throws', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({ id: 'cust_err', status: 'active' } as any)
    mockCreateBillingRecord.mockRejectedValue(new Error('Network timeout'))

    const invoice = makeInvoice({ billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any

    await expect(handleWebhookEvent(event)).rejects.toThrow('Network timeout')
  })

  it('does not create billing record when customer is not found by stripe customer ID', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue(null)

    const invoice = makeInvoice({
      customer: 'cus_nonexistent',
      billing_reason: 'subscription_cycle',
    })

    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('restores past_due customer to active after successful payment', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_pastdue',
      stripe_subscription_id: 'sub_restore',
      status: 'past_due',
    } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_restore_1' } as any)

    const invoice = makeInvoice({ billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_pastdue', { status: 'active' })
  })

  it('does NOT restore customer if status is not past_due', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_active',
      stripe_subscription_id: 'sub_active',
      status: 'active', // already active
    } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_active_1' } as any)

    const invoice = makeInvoice({ billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    // updateCustomer should NOT have been called (only for past_due → active restore)
    // Note: handleCheckoutComplete calls updateCustomer but this test is for handlePaymentSucceeded
    // handlePaymentSucceeded calls updateCustomer only when status === 'past_due'
    const updateCalls = mockUpdateCustomer.mock.calls.filter(
      ([id, updates]) => id === 'cust_active' && updates.status === 'active'
    )
    expect(updateCalls).toHaveLength(0)
  })

  it('handles period_start = 0 (epoch) by passing null to createBillingRecord', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({ id: 'cust_zero', status: 'active' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_zero_1' } as any)

    const invoice = makeInvoice({ period_start: 0, period_end: 0, billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.period_start).toBe(null)
    expect(recordArg.period_end).toBe(null)
  })

  it('handles period_start = null by passing null to createBillingRecord', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({ id: 'cust_null', status: 'active' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_null_1' } as any)

    const invoice = makeInvoice({ period_start: null as any, period_end: null as any, billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.period_start).toBe(null)
    expect(recordArg.period_end).toBe(null)
  })

  it('converts period_start and period_end from Unix seconds to ISO strings', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({ id: 'cust_convert', status: 'active' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_convert_1' } as any)

    // 1719705600 → 2024-06-30T00:00:00.000Z
    // 1719792000 → 2024-07-01T00:00:00.000Z
    const invoice = makeInvoice({ period_start: 1719705600, period_end: 1719792000, billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.period_start).toBe('2024-06-30T00:00:00.000Z')
    expect(recordArg.period_end).toBe('2024-07-01T00:00:00.000Z')
  })

  it('uses customer.stripe_subscription_id when available', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_subid',
      stripe_subscription_id: 'sub_used_in_record',
      status: 'active',
    } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_subid_1' } as any)

    const invoice = makeInvoice({ billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.subscription_id).toBe('sub_used_in_record')
  })

  it('passes null for subscription_id when customer.stripe_subscription_id is null', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_nosub',
      stripe_subscription_id: null,
      status: 'active',
    } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_nosub_1' } as any)

    const invoice = makeInvoice({ billing_reason: 'subscription_cycle' })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.subscription_id).toBe(null)
  })

  it('falls back to subscription_cycle when billing_reason is null', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({ id: 'cust_noreason', status: 'active' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_noreason_1' } as any)

    const invoice = makeInvoice({ billing_reason: null as any })
    const event = { type: 'invoice.payment_succeeded', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    const recordArg = mockCreateBillingRecord.mock.calls[0][0]
    expect(recordArg.description).toContain('subscription')
  })
})

// ─── handleSubscriptionUpdated tests ──────────────────────────────────────────

describe('handleSubscriptionUpdated', () => {

  it('maps Stripe active status to our active status', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 'cust_sub_active',
      plan: 'starter',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_sub_active' } as any)

    const subscription = makeSubscription({ status: 'active' })
    const event = { type: 'customer.subscription.updated', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_sub_active', expect.objectContaining({
      status: 'active',
    }))
  })

  it('maps Stripe past_due status to our past_due status', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 'cust_sub_pastdue',
      plan: 'professional',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_sub_pastdue' } as any)

    const subscription = makeSubscription({ status: 'past_due' })
    const event = { type: 'customer.subscription.updated', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_sub_pastdue', expect.objectContaining({
      status: 'past_due',
    }))
  })

  it('maps Stripe canceled status to our past_due status', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 'cust_sub_canceled',
      plan: 'enterprise',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_sub_canceled' } as any)

    const subscription = makeSubscription({ status: 'canceled' })
    const event = { type: 'customer.subscription.updated', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_sub_canceled', expect.objectContaining({
      status: 'past_due',
    }))
  })

  it('does not call updateCustomer when customer is not found', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue(null)

    const subscription = makeSubscription({ id: 'sub_notfound' })
    const event = { type: 'customer.subscription.updated', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })

  it('uses plan from subscription metadata when available', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 'cust_meta_plan',
      plan: 'starter', // old plan
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_meta_plan' } as any)

    const subscription = makeSubscription({
      metadata: { plan: 'enterprise', customerId: 'cust_meta_plan' },
    })
    const event = { type: 'customer.subscription.updated', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_meta_plan', expect.objectContaining({
      plan: 'enterprise',
    }))
  })

  it('falls back to customer.plan when subscription metadata.plan is missing', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 'cust_no_meta',
      plan: 'professional',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_no_meta' } as any)

    const subscription = makeSubscription({ metadata: {} })
    const event = { type: 'customer.subscription.updated', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_no_meta', expect.objectContaining({
      plan: 'professional',
    }))
  })
})

// ─── handleSubscriptionDeleted tests ──────────────────────────────────────────

describe('handleSubscriptionDeleted', () => {

  it('sets customer plan to starter and status to cancelled', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 'cust_deleted',
      plan: 'enterprise',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_deleted' } as any)

    const subscription = makeSubscription({ id: 'sub_deleted_123' })
    const event = { type: 'customer.subscription.deleted', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_deleted', {
      stripe_subscription_id: null,
      plan: 'starter',
      status: 'cancelled',
    })
  })

  it('does not call updateCustomer when customer is not found', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValue(null)

    const subscription = makeSubscription({ id: 'sub orphan' })
    const event = { type: 'customer.subscription.deleted', data: { object: subscription } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })
})

// ─── handlePaymentFailed tests ─────────────────────────────────────────────────

describe('handlePaymentFailed', () => {

  it('sets customer status to past_due', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_failed',
      phone: '+1234567890',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_failed' } as any)
    mockSendSMS.mockResolvedValue(undefined)

    const invoice = makeInvoice({
      id: 'in_failed_123',
      customer: 'cus_failed',
      amount_due: 29900,
      currency: 'usd',
    })
    const event = { type: 'invoice.payment_failed', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust_failed', { status: 'past_due' })
  })

  it('sends SMS notification to customer with valid phone', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_sms',
      phone: '+1234567890',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_sms' } as any)
    mockSendSMS.mockResolvedValue(undefined)

    const invoice = makeInvoice({
      id: 'in_failed_sms',
      customer: 'cus_sms',
      amount_due: 1990, // 1990 cents = $19.90
      currency: 'usd',
    })
    const event = { type: 'invoice.payment_failed', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockSendSMS).toHaveBeenCalledWith(
      '+1234567890',
      expect.any(String),
      expect.stringContaining('19.90'),
    )
  })

  it('does not send SMS when TWILIO_PHONE_NUMBER env var is not set', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_no_twilio',
      phone: '+1234567890',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_no_twilio' } as any)
    // Override the default stubbed value for this test
    vi.stubEnv('TWILIO_PHONE_NUMBER', '')

    const invoice = makeInvoice({ customer: 'cus_no_twilio', amount_due: 29900 })
    const event = { type: 'invoice.payment_failed', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockSendSMS).not.toHaveBeenCalled()
  })

  it('does not send SMS when customer has no phone', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_nophone',
      phone: '',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_nophone' } as any)
    vi.stubEnv('TWILIO_PHONE_NUMBER', '+15550000000')

    const invoice = makeInvoice({ customer: 'cus_nophone', amount_due: 29900 })
    const event = { type: 'invoice.payment_failed', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockSendSMS).not.toHaveBeenCalled()
  })

  it('does not update customer when customer is not found', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue(null)

    const invoice = makeInvoice({ customer: 'cus_notfound', amount_due: 29900 })
    const event = { type: 'invoice.payment_failed', data: { object: invoice } } as any
    await handleWebhookEvent(event)

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })

  it('handles SMS sending failure gracefully (does not throw)', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_sms_fail',
      phone: '+1234567890',
    } as any)
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_sms_fail' } as any)
    mockSendSMS.mockRejectedValue(new Error('Twilio rate limit'))
    vi.stubEnv('TWILIO_PHONE_NUMBER', '+15550000000')

    const invoice = makeInvoice({ customer: 'cus_sms_fail', amount_due: 29900 })
    const event = { type: 'invoice.payment_failed', data: { object: invoice } } as any

    // Should not throw — error is caught and logged
    await expect(handleWebhookEvent(event)).resolves.toBeUndefined()
    expect(mockUpdateCustomer).toHaveBeenCalled() // customer update still succeeded
  })
})

// ─── Integration-style end-to-end scenario tests ───────────────────────────────

describe('Stripe billing flow end-to-end scenarios', () => {

  it('complete new subscription flow: checkout → billing record created with session.id', async () => {
    // Step 1: checkout.session.completed — billing record with session.id
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_new', plan: 'starter' } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_new_1' } as any)

    const checkoutSession = makeCheckoutSession({
      client_reference_id: 'cust_new',
      subscription: 'sub_new_123',
      customer: 'cus_new_456',
      amount_total: 9900,
      metadata: { plan: 'starter' },
    })

    const event1 = { type: 'checkout.session.completed', data: { object: checkoutSession } } as any
    await handleWebhookEvent(event1)

    expect(mockCreateBillingRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: checkoutSession.id,
        customer_id: 'cust_new',
        amount: 9900,
        billing_reason: 'initial',
      })
    )
  })

  it('complete new subscription flow: invoice.payment_succeeded → SKIPPED (subscription_create)', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue(null)

    // The subsequent invoice.payment_succeeded for the initial charge
    // should be skipped because billing_reason === 'subscription_create'
    const initialInvoice = makeInvoice({
      id: 'in_initial_charge',
      billing_reason: 'subscription_create',
      amount_paid: 9900,
    })

    const event2 = { type: 'invoice.payment_succeeded', data: { object: initialInvoice } } as any
    await handleWebhookEvent(event2)

    expect(mockGetCustomerByStripeCustomerId).not.toHaveBeenCalled()
    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
  })

  it('recurring payment flow: invoice.payment_succeeded → billing record created with invoice.id', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_recurring',
      stripe_subscription_id: 'sub_recurring_123',
      status: 'active',
    } as any)
    mockCreateBillingRecord.mockResolvedValue({ id: 'bill_recurring_1' } as any)

    const recurringInvoice = makeInvoice({
      id: 'in_recurring_month2',
      billing_reason: 'subscription_cycle',
      amount_paid: 9900,
    })

    const event = { type: 'invoice.payment_succeeded', data: { object: recurringInvoice } } as any
    await handleWebhookEvent(event)

    expect(mockCreateBillingRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: 'in_recurring_month2', // invoice.id, NOT session.id
        customer_id: 'cust_recurring',
        amount: 9900,
        billing_reason: 'subscription_cycle',
      })
    )
  })

  it('no duplicate billing records for initial payment (subscription_create skipped)', async () => {
    // Simulates the full initial payment flow where both events fire
    // but only checkout.session.completed creates the billing record

    let billingRecordCount = 0
    mockCreateBillingRecord.mockImplementation((record: any) => {
      billingRecordCount++
      return { id: `bill_${billingRecordCount}` }
    })
    mockUpdateCustomer.mockResolvedValue({ id: 'cust_no_dup' } as any)
    mockGetCustomerByStripeCustomerId.mockResolvedValue({
      id: 'cust_no_dup',
      stripe_subscription_id: 'sub_no_dup',
      status: 'active',
    } as any)

    // Event 1: checkout.session.completed → creates billing record
    const checkoutSession = makeCheckoutSession({ client_reference_id: 'cust_no_dup' })
    await handleWebhookEvent({ type: 'checkout.session.completed', data: { object: checkoutSession } } as any)

    // Event 2: invoice.payment_succeeded (subscription_create) → skipped
    const initialInvoice = makeInvoice({ billing_reason: 'subscription_create' })
    await handleWebhookEvent({ type: 'invoice.payment_succeeded', data: { object: initialInvoice } } as any)

    // Only ONE billing record should have been created
    expect(billingRecordCount).toBe(1)
  })
})