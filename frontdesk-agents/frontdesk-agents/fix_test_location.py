import sys
sys.stdout.reconfigure(encoding='utf-8')

test_content = r'''import { describe, it, expect, vi, beforeEach } from 'vitest'

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
// Module under test — import must come after vi.mock calls
// ---------------------------------------------------------------------------

const { handleWebhookEvent } = await import('@/lib/stripe')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEvent(type: string, dataObject: Record<string, unknown>): any {
  return {
    id: `evt_${Date.now()}`,
    type,
    data: { object: dataObject },
  }
}

function createCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cust-001',
    email: 'test@example.com',
    business_name: 'Test Business',
    owner_name: 'Test Owner',
    phone: '+12025551234',
    industry: 'real-estate',
    plan: 'starter' as const,
    status: 'active' as const,
    onboarding_status: 'completed' as const,
    stripe_customer_id: 'cus_stripe123',
    stripe_subscription_id: 'sub_stripe123',
    ...overrides,
  }
}

function billingRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'bill-001',
    customer_id: 'cust-001',
    invoice_id: 'in_abc123',
    subscription_id: 'sub_stripe123',
    amount: 2999,
    currency: 'usd',
    status: 'succeeded' as const,
    description: 'Payment of 29.99 USD for subscription_cycle',
    billing_reason: 'subscription_cycle',
    invoice_pdf_url: 'https://invoice.stripe.com/in_abc123',
    period_start: '2026-01-01T00:00:00.000Z',
    period_end: '2026-02-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  process.env.TWILIO_PHONE_NUMBER = '+15551234567'
})

// ============================================================================
// checkout.session.completed
// ============================================================================

describe('checkout.session.completed', () => {
  it('provisions a customer with the purchased plan', async () => {
    mockUpdateCustomer.mockResolvedValueOnce(createCustomer({ plan: 'professional', status: 'active' }))

    const session = {
      id: 'cs_test_123',
      client_reference_id: 'cust-001',
      subscription: 'sub_new123',
      customer: 'cus_new456',
      metadata: { plan: 'professional' },
    }

    await handleWebhookEvent(createEvent('checkout.session.completed', session))

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-001', {
      stripe_customer_id: 'cus_new456',
      stripe_subscription_id: 'sub_new123',
      plan: 'professional',
      status: 'active',
    })
  })

  it('defaults plan to starter when metadata is missing', async () => {
    mockUpdateCustomer.mockResolvedValueOnce(createCustomer({ plan: 'starter', status: 'active' }))

    const session = {
      id: 'cs_test_124',
      client_reference_id: 'cust-002',
      subscription: 'sub_new124',
      customer: 'cus_new457',
      metadata: {},
    }

    await handleWebhookEvent(createEvent('checkout.session.completed', session))

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-002', {
      stripe_customer_id: 'cus_new457',
      stripe_subscription_id: 'sub_new124',
      plan: 'starter',
      status: 'active',
    })
  })

  it('returns early when client_reference_id is missing', async () => {
    const session = {
      id: 'cs_test_125',
      client_reference_id: null,
      subscription: 'sub_new125',
      customer: 'cus_new458',
      metadata: { plan: 'enterprise' },
    }

    await handleWebhookEvent(createEvent('checkout.session.completed', session))

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })

  it('returns early when subscription or customer is missing', async () => {
    const session = {
      id: 'cs_test_126',
      client_reference_id: 'cust-003',
      subscription: null,
      customer: null,
      metadata: { plan: 'starter' },
    }

    await handleWebhookEvent(createEvent('checkout.session.completed', session))

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })
})

// ============================================================================
// customer.subscription.updated
// ============================================================================

describe('customer.subscription.updated', () => {
  it('syncs active status and plan from subscription metadata', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
      createCustomer({ plan: 'starter', status: 'active' })
    )
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ plan: 'professional', status: 'active' })
    )

    const subscription = {
      id: 'sub_stripe123',
      status: 'active',
      metadata: { plan: 'professional' },
    }

    await handleWebhookEvent(createEvent('customer.subscription.updated', subscription))

    expect(mockGetCustomerByStripeSubscriptionId).toHaveBeenCalledWith('sub_stripe123')
    expect(mockUpdateCustomer).toHaveBeenCalledWith(
      'cust-001',
      expect.objectContaining({
        plan: 'professional',
        status: 'active',
        stripe_subscription_id: 'sub_stripe123',
      })
    )
  })

  it('maps past_due status correctly', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
      createCustomer({ plan: 'professional', status: 'active' })
    )
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ plan: 'professional', status: 'past_due' })
    )

    const subscription = {
      id: 'sub_stripe123',
      status: 'past_due',
      metadata: {},
    }

    await handleWebhookEvent(createEvent('customer.subscription.updated', subscription))

    expect(mockUpdateCustomer).toHaveBeenCalledWith(
      'cust-001',
      expect.objectContaining({ status: 'past_due' })
    )
  })

  it('maps canceled status to cancelled', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
      createCustomer({ plan: 'enterprise', status: 'active' })
    )
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ plan: 'enterprise', status: 'cancelled' })
    )

    const subscription = {
      id: 'sub_stripe123',
      status: 'canceled',
      metadata: {},
    }

    await handleWebhookEvent(createEvent('customer.subscription.updated', subscription))

    expect(mockUpdateCustomer).toHaveBeenCalledWith(
      'cust-001',
      expect.objectContaining({ status: 'cancelled' })
    )
  })

  it('maps unpaid status to past_due', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
      createCustomer({ plan: 'professional', status: 'active' })
    )
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ plan: 'professional', status: 'past_due' })
    )

    const subscription = {
      id: 'sub_stripe123',
      status: 'unpaid',
      metadata: {},
    }

    await handleWebhookEvent(createEvent('customer.subscription.updated', subscription))

    expect(mockUpdateCustomer).toHaveBeenCalledWith(
      'cust-001',
      expect.objectContaining({ status: 'past_due' })
    )
  })

  it('falls back to customer.plan when subscription metadata has no plan', async () => {
    const existing = createCustomer({ plan: 'enterprise', status: 'active' })
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(existing)
    mockUpdateCustomer.mockResolvedValueOnce({ ...existing, status: 'active' })

    const subscription = {
      id: 'sub_stripe123',
      status: 'active',
      metadata: {},
    }

    await handleWebhookEvent(createEvent('customer.subscription.updated', subscription))

    expect(mockUpdateCustomer).toHaveBeenCalledWith(
      'cust-001',
      expect.objectContaining({ plan: 'enterprise', status: 'active' })
    )
  })

  it('does nothing when customer is not found', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(null)

    const subscription = {
      id: 'sub_unknown',
      status: 'active',
      metadata: {},
    }

    await handleWebhookEvent(createEvent('customer.subscription.updated', subscription))

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })
})

// ============================================================================
// customer.subscription.deleted
// ============================================================================

describe('customer.subscription.deleted', () => {
  it('clears subscription ID and marks customer as cancelled', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(
      createCustomer({ plan: 'professional', status: 'active' })
    )
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ plan: 'starter', status: 'cancelled', stripe_subscription_id: null })
    )

    const subscription = { id: 'sub_stripe123' }

    await handleWebhookEvent(createEvent('customer.subscription.deleted', subscription))

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-001', {
      stripe_subscription_id: null,
      plan: 'starter',
      status: 'cancelled',
    })
  })

  it('does nothing when customer is not found', async () => {
    mockGetCustomerByStripeSubscriptionId.mockResolvedValueOnce(null)

    const subscription = { id: 'sub_unknown' }

    await handleWebhookEvent(createEvent('customer.subscription.deleted', subscription))

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })
})

// ============================================================================
// invoice.payment_failed
// ============================================================================

describe('invoice.payment_failed', () => {
  it('flags customer as past_due and sends SMS notification', async () => {
    const customer = createCustomer({ phone: '+12025551234', status: 'active' })
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(customer)
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ ...customer, status: 'past_due' })
    )

    const invoice = {
      id: 'in_fail001',
      customer: 'cus_stripe123',
      amount_due: 2999,
      currency: 'usd',
    }

    await handleWebhookEvent(createEvent('invoice.payment_failed', invoice))

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-001', {
      status: 'past_due',
    })

    expect(mockSendSMS).toHaveBeenCalledWith(
      '+12025551234',
      '+15551234567',
      expect.stringContaining('29.99 USD')
    )
  })

  it('skips SMS when customer has no phone number', async () => {
    const customer = createCustomer({ phone: '', status: 'active' })
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(customer)
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ ...customer, status: 'past_due' })
    )

    const invoice = {
      id: 'in_fail002',
      customer: 'cus_stripe123',
      amount_due: 4999,
      currency: 'eur',
    }

    await handleWebhookEvent(createEvent('invoice.payment_failed', invoice))

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-001', { status: 'past_due' })
    expect(mockSendSMS).not.toHaveBeenCalled()
  })

  it('skips SMS when TWILIO_PHONE_NUMBER is not set', async () => {
    delete process.env.TWILIO_PHONE_NUMBER

    const customer = createCustomer({ phone: '+12025551234', status: 'active' })
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(customer)
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ ...customer, status: 'past_due' })
    )

    const invoice = {
      id: 'in_fail003',
      customer: 'cus_stripe123',
      amount_due: 1500,
      currency: 'usd',
    }

    await handleWebhookEvent(createEvent('invoice.payment_failed', invoice))

    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-001', { status: 'past_due' })
    expect(mockSendSMS).not.toHaveBeenCalled()
  })

  it('handles customer not found gracefully', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(null)

    const invoice = {
      id: 'in_fail004',
      customer: 'cus_unknown',
      amount_due: 2000,
      currency: 'usd',
    }

    await handleWebhookEvent(createEvent('invoice.payment_failed', invoice))

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
    expect(mockSendSMS).not.toHaveBeenCalled()
  })
})

// ============================================================================
// invoice.payment_succeeded
// ============================================================================

describe('invoice.payment_succeeded', () => {
  it('records billing history entry', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(
      createCustomer({ status: 'active' })
    )
    mockCreateBillingRecord.mockResolvedValueOnce(
      billingRecord({ invoice_id: 'in_succ001' })
    )

    const invoice = {
      id: 'in_succ001',
      customer: 'cus_stripe123',
      amount_paid: 2999,
      currency: 'usd',
      billing_reason: 'subscription_cycle',
      invoice_pdf: 'https://invoice.stripe.com/in_succ001',
      period_start: 1767225600,
      period_end: 1769904000,
    }

    await handleWebhookEvent(createEvent('invoice.payment_succeeded', invoice))

    expect(mockGetCustomerByStripeCustomerId).toHaveBeenCalledWith('cus_stripe123')
    expect(mockCreateBillingRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: 'cust-001',
        invoice_id: 'in_succ001',
        subscription_id: 'sub_stripe123',
        amount: 2999,
        currency: 'usd',
        status: 'succeeded',
        billing_reason: 'subscription_cycle',
        invoice_pdf_url: 'https://invoice.stripe.com/in_succ001',
      })
    )

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })

  it('restores past_due customer to active after successful payment', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(
      createCustomer({ status: 'past_due' })
    )
    mockCreateBillingRecord.mockResolvedValueOnce(
      billingRecord({ invoice_id: 'in_succ002' })
    )
    mockUpdateCustomer.mockResolvedValueOnce(
      createCustomer({ status: 'active' })
    )

    const invoice = {
      id: 'in_succ002',
      customer: 'cus_stripe123',
      amount_paid: 2999,
      currency: 'usd',
      billing_reason: 'subscription_cycle',
      invoice_pdf: null,
      period_start: 1767225600,
      period_end: 1769904000,
    }

    await handleWebhookEvent(createEvent('invoice.payment_succeeded', invoice))

    expect(mockCreateBillingRecord).toHaveBeenCalled()
    expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-001', { status: 'active' })
  })

  it('handles customer not found gracefully', async () => {
    mockGetCustomerByStripeCustomerId.mockResolvedValueOnce(null)

    const invoice = {
      id: 'in_succ003',
      customer: 'cus_unknown',
      amount_paid: 2999,
      currency: 'usd',
    }

    await handleWebhookEvent(createEvent('invoice.payment_succeeded', invoice))

    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
    expect(mockUpdateCustomer).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Unknown event types (edge case)
// ============================================================================

describe('unknown event type', () => {
  it('silently ignores unhandled event types', async () => {
    const event = createEvent('charge.succeeded', { id: 'ch_123' })

    await expect(handleWebhookEvent(event)).resolves.toBeUndefined()

    expect(mockUpdateCustomer).not.toHaveBeenCalled()
    expect(mockGetCustomerByStripeCustomerId).not.toHaveBeenCalled()
    expect(mockGetCustomerByStripeSubscriptionId).not.toHaveBeenCalled()
    expect(mockCreateBillingRecord).not.toHaveBeenCalled()
    expect(mockSendSMS).not.toHaveBeenCalled()
  })
})
'''

# Write to the CORRECT path matching all other test files
target = r'C:\Users\juani\frontdesk-agents\frontdesk-agents\tests\stripe-webhooks.test.ts'
with open(target, 'w', encoding='utf-8') as f:
    f.write(test_content)

print(f'OK: Written to {target}')

# Also delete the wrong-location file
import os
wrong = r'C:\Users\juani\frontdesk-agents\frontdesk-agents\frontdesk-agents\tests\stripe-webhooks.test.ts'
if os.path.exists(wrong):
    os.remove(wrong)
    print(f'Removed wrong-location file: {wrong}')
