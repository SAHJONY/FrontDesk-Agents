/**
 * Integration tests for Stripe webhook event handlers
 *
 * Tests handleWebhookEvent and all 5 event handlers:
 *   1. checkout.session.completed
 *   2. customer.subscription.updated
 *   3. customer.subscription.deleted
 *   4. invoice.payment_succeeded
 *   5. invoice.payment_failed
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type Stripe from 'stripe'

// -- Mocks (vi.hoisted ensures availability before vi.mock hoisting) --------
const {
  mockUpdateCustomer,
  mockGetBySubId,
  mockGetByCustId,
  mockCreateBilling,
  mockSendSMS,
} = vi.hoisted(() => ({
  mockUpdateCustomer: vi.fn().mockResolvedValue({}),
  mockGetBySubId: vi.fn().mockResolvedValue(null),
  mockGetByCustId: vi.fn().mockResolvedValue(null),
  mockCreateBilling: vi.fn().mockResolvedValue({}),
  mockSendSMS: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/supabase', () => ({
  updateCustomer: mockUpdateCustomer,
  getCustomerByStripeSubscriptionId: mockGetBySubId,
  getCustomerByStripeCustomerId: mockGetByCustId,
  createBillingRecord: mockCreateBilling,
}))

vi.mock('@/lib/communication/twilioService', () => ({
  twilioService: { sendSMS: mockSendSMS },
}))

import { handleWebhookEvent } from '@/lib/stripe'

// -- Helpers ---------------------------------------------------------------
const MOCK_CUSTOMER = {
  id: 'cust-db-001',
  email: 'test@example.com',
  phone: '+15551234567',
  plan: 'starter',
  status: 'active',
  stripe_customer_id: 'cus_stripe123',
  stripe_subscription_id: 'sub_stripe123',
}

function makeEvent(
  type: string,
  data: Record<string, unknown>,
  overrides?: Partial<Stripe.Event>
): Stripe.Event {
  return {
    id: 'evt_' + Date.now(),
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type: type as Stripe.Event.Type,
    data: { object: data as Stripe.Event.Data.Object },
    ...overrides,
  } as Stripe.Event
}

// -- Tests -----------------------------------------------------------------
describe('handleWebhookEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // 1. checkout.session.completed
  describe('checkout.session.completed', () => {
    const validSession = {
      id: 'cs_test_001',
      client_reference_id: 'cust-db-001',
      customer: 'cus_stripe123',
      subscription: 'sub_stripe123',
      metadata: { plan: 'professional', planName: 'Growth' },
      amount_total: 31410,
      currency: 'usd',
    }

    it('updates customer and creates billing record', async () => {
      await handleWebhookEvent(makeEvent('checkout.session.completed', validSession))

      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001', {
        stripe_customer_id: 'cus_stripe123',
        stripe_subscription_id: 'sub_stripe123',
        plan: 'professional',
        status: 'active',
      })
      expect(mockCreateBilling).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'cust-db-001',
          invoice_id: 'cs_test_001',
          amount: 31410,
          currency: 'usd',
          status: 'succeeded',
        })
      )
    })

    it('defaults plan to starter when metadata.plan is missing', async () => {
      await handleWebhookEvent(
        makeEvent('checkout.session.completed', { ...validSession, metadata: {} })
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001',
        expect.objectContaining({ plan: 'starter' })
      )
    })

    it.each([
      ['client_reference_id', null],
      ['subscription', null],
      ['customer', null],
    ])('skips when %s is missing', async (field, value) => {
      await handleWebhookEvent(
        makeEvent('checkout.session.completed', { ...validSession, [field]: value })
      )
      expect(mockUpdateCustomer).not.toHaveBeenCalled()
      expect(mockCreateBilling).not.toHaveBeenCalled()
    })

    it('throws when createBillingRecord fails (triggers Stripe retry)', async () => {
      mockCreateBilling.mockRejectedValueOnce(new Error('DB write failed'))
      await expect(
        handleWebhookEvent(makeEvent('checkout.session.completed', validSession))
      ).rejects.toThrow('DB write failed')
    })
  })

  // 2. customer.subscription.updated
  describe('customer.subscription.updated', () => {
    beforeEach(() => {
      mockGetBySubId.mockResolvedValue(MOCK_CUSTOMER)
    })

    it.each([
      ['active', 'active'],
      ['trialing', 'active'],
      ['past_due', 'past_due'],
      ['canceled', 'past_due'],
      ['unpaid', 'past_due'],
    ])('maps Stripe status %s to local status %s', async (stripeStatus, expectedLocal) => {
      await handleWebhookEvent(
        makeEvent('customer.subscription.updated', {
          id: 'sub_stripe123',
          status: stripeStatus,
          metadata: { plan: 'professional' },
        })
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001',
        expect.objectContaining({ status: expectedLocal, plan: 'professional' })
      )
    })

    it('falls back to existing customer plan when metadata.plan is missing', async () => {
      await handleWebhookEvent(
        makeEvent('customer.subscription.updated', {
          id: 'sub_stripe123',
          status: 'active',
          metadata: {},
        })
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001',
        expect.objectContaining({ plan: 'starter' })
      )
    })

    it('logs error and exits when customer is not found', async () => {
      mockGetBySubId.mockResolvedValueOnce(null)
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await handleWebhookEvent(
        makeEvent('customer.subscription.updated', {
          id: 'sub_nonexistent',
          status: 'active',
          metadata: {},
        })
      )
      expect(mockUpdateCustomer).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  // 3. customer.subscription.deleted
  describe('customer.subscription.deleted', () => {
    it('downgrades customer to starter with cancelled status', async () => {
      mockGetBySubId.mockResolvedValueOnce({
        ...MOCK_CUSTOMER,
        plan: 'enterprise',
        status: 'active',
      })

      await handleWebhookEvent(
        makeEvent('customer.subscription.deleted', { id: 'sub_stripe123' })
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001', {
        stripe_subscription_id: null,
        plan: 'starter',
        status: 'cancelled',
      })
    })

    it('logs error and exits when customer is not found', async () => {
      mockGetBySubId.mockResolvedValueOnce(null)
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await handleWebhookEvent(
        makeEvent('customer.subscription.deleted', { id: 'sub_nonexistent' })
      )
      expect(mockUpdateCustomer).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  // 4. invoice.payment_succeeded
  describe('invoice.payment_succeeded', () => {
    const validInvoice = {
      id: 'inv_test_001',
      customer: 'cus_stripe123',
      amount_paid: 31410,
      currency: 'usd',
      billing_reason: 'subscription_cycle',
      invoice_pdf: 'https://invoice.stripe.com/pdf/001',
      period_start: 1700000000,
      period_end: 1702592000,
    }

    it('creates billing record for recurring payment', async () => {
      mockGetByCustId.mockResolvedValueOnce(MOCK_CUSTOMER)

      await handleWebhookEvent(
        makeEvent('invoice.payment_succeeded', validInvoice)
      )
      expect(mockCreateBilling).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'cust-db-001',
          invoice_id: 'inv_test_001',
          amount: 31410,
          currency: 'usd',
          status: 'succeeded',
        })
      )
    })

    it('skips subscription_create billing reason', async () => {
      await handleWebhookEvent(
        makeEvent('invoice.payment_succeeded', {
          ...validInvoice,
          billing_reason: 'subscription_create',
        })
      )
      expect(mockGetByCustId).not.toHaveBeenCalled()
      expect(mockCreateBilling).not.toHaveBeenCalled()
    })

    it('restores past_due customer to active', async () => {
      mockGetByCustId.mockResolvedValueOnce({ ...MOCK_CUSTOMER, status: 'past_due' })

      await handleWebhookEvent(
        makeEvent('invoice.payment_succeeded', validInvoice)
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001',
        expect.objectContaining({ status: 'active' })
      )
    })

    it('does not update status for already-active customer', async () => {
      mockGetByCustId.mockResolvedValueOnce(MOCK_CUSTOMER)

      await handleWebhookEvent(
        makeEvent('invoice.payment_succeeded', validInvoice)
      )
      expect(mockUpdateCustomer).not.toHaveBeenCalled()
    })

    it('throws when createBillingRecord fails (triggers Stripe retry)', async () => {
      mockGetByCustId.mockResolvedValueOnce(MOCK_CUSTOMER)
      mockCreateBilling.mockRejectedValueOnce(new Error('DB write failed'))

      await expect(
        handleWebhookEvent(makeEvent('invoice.payment_succeeded', validInvoice))
      ).rejects.toThrow('DB write failed')
    })
  })

  // 5. invoice.payment_failed
  describe('invoice.payment_failed', () => {
    beforeEach(() => {
      process.env.TWILIO_PHONE_NUMBER = '+15559876543'
    })

    afterEach(() => {
      delete process.env.TWILIO_PHONE_NUMBER
    })

    const failedInvoice = {
      id: 'inv_fail_001',
      customer: 'cus_stripe123',
      attempt_count: 1,
    }

    it('flags customer as past_due', async () => {
      mockGetByCustId.mockResolvedValueOnce(MOCK_CUSTOMER)

      await handleWebhookEvent(
        makeEvent('invoice.payment_failed', failedInvoice)
      )
      expect(mockUpdateCustomer).toHaveBeenCalledWith('cust-db-001',
        expect.objectContaining({ status: 'past_due' })
      )
    })

    it('sends SMS when customer has phone', async () => {
      mockGetByCustId.mockResolvedValueOnce(MOCK_CUSTOMER)

      await handleWebhookEvent(
        makeEvent('invoice.payment_failed', failedInvoice)
      )
      expect(mockSendSMS).toHaveBeenCalledWith(
        '+15551234567',
        expect.any(String),
        expect.stringContaining('payment')
      )
    })

    it('does not send SMS when customer has no phone', async () => {
      mockGetByCustId.mockResolvedValueOnce({ ...MOCK_CUSTOMER, phone: null })

      await handleWebhookEvent(
        makeEvent('invoice.payment_failed', failedInvoice)
      )
      expect(mockUpdateCustomer).toHaveBeenCalled()
      expect(mockSendSMS).not.toHaveBeenCalled()
    })

    it('does not throw when SMS sending fails', async () => {
      mockGetByCustId.mockResolvedValueOnce(MOCK_CUSTOMER)
      mockSendSMS.mockRejectedValueOnce(new Error('Twilio error'))
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        handleWebhookEvent(makeEvent('invoice.payment_failed', failedInvoice))
      ).resolves.not.toThrow()
      spy.mockRestore()
    })

    it('logs error and exits when customer is not found', async () => {
      mockGetByCustId.mockResolvedValueOnce(null)
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await handleWebhookEvent(
        makeEvent('invoice.payment_failed', failedInvoice)
      )
      expect(mockUpdateCustomer).not.toHaveBeenCalled()
      expect(mockSendSMS).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  // Unknown event types
  describe('unknown event types', () => {
    it('handles unrecognized event types gracefully', async () => {
      await expect(
        handleWebhookEvent(
          makeEvent('customer.updated', { id: 'cus_stripe123', email: 'new@example.com' })
        )
      ).resolves.not.toThrow()

      expect(mockUpdateCustomer).not.toHaveBeenCalled()
      expect(mockCreateBilling).not.toHaveBeenCalled()
      expect(mockSendSMS).not.toHaveBeenCalled()
    })
  })
})
