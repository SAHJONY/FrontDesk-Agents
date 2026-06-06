import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// ─── Set env vars BEFORE importing the module under test ──────────────────────
// email.ts checks RESEND_API_KEY at module load time, so the env var must be
// set before the import() call in each test.
const RESEND_API_KEY = 're_test_abc123'
const OWNER_EMAIL = 'owner@frontdeskagents.com'
process.env.RESEND_API_KEY = RESEND_API_KEY
process.env.OWNER_EMAIL = OWNER_EMAIL

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockEmailsSend = vi.fn()

// Use a proper constructor function (not arrow) so `new Resend(...)` works
function MockResend(this: { emails: { send: typeof mockEmailsSend } }) {
  this.emails = { send: mockEmailsSend }
}

vi.mock('resend', () => ({
  Resend: vi.fn(MockResend as any),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockSendSuccess(data = { id: 'email_123' }) {
  mockEmailsSend.mockResolvedValue({ data, error: null })
}

function mockSendError(message = 'Send failed') {
  mockEmailsSend.mockResolvedValue({ data: null, error: { message } })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('sendInvoiceEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends an email with raw html when html param is provided (backward compat)', async () => {
    const { sendInvoiceEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendInvoiceEmail({
      to: 'customer@example.com',
      subject: 'Invoice #12345',
      html: '<p>Raw HTML invoice content</p>',
    })

    expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    const call = mockEmailsSend.mock.calls[0][0]
    expect(call.from).toBe('noreply@frontdeskagents.com')
    expect(call.to).toEqual(['customer@example.com'])
    expect(call.subject).toBe('Invoice #12345')
    expect(call.html).toBe('<p>Raw HTML invoice content</p>')
  })

  it('renders InvoiceEmail template when html param is omitted (structured path)', async () => {
    const { sendInvoiceEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendInvoiceEmail({
      to: 'customer@example.com',
      subject: 'Invoice #12345',
      invoiceId: 'INV-001',
      amount: '$150.00',
      dueDate: 'January 15, 2026',
      description: 'Professional Plan - Monthly',
      status: 'pending',
      customerName: 'Acme Corp',
      businessName: 'Frontdesk Agents',
    })

    expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    const call = mockEmailsSend.mock.calls[0][0]
    expect(call.from).toBe('noreply@frontdeskagents.com')
    expect(call.to).toEqual(['customer@example.com'])
    expect(call.subject).toBe('Invoice #12345')
    expect(typeof call.html).toBe('string')
    expect(call.html.length).toBeGreaterThan(0)
    expect(call.html).toContain('INV-001')
    expect(call.html).toContain('$150.00')
  })

  it('uses EMAIL_FROM env var when set', async () => {
    const original = process.env.EMAIL_FROM
    process.env.EMAIL_FROM = 'billing@frontdeskagents.com'
    const { sendInvoiceEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendInvoiceEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>test</p>',
    })

    expect(mockEmailsSend.mock.calls[0][0].from).toBe('billing@frontdeskagents.com')
    process.env.EMAIL_FROM = original
  })

  it('throws when Resend returns an error', async () => {
    const { sendInvoiceEmail } = await import('@/lib/email')
    mockSendError('Invalid recipient')

    await expect(
      sendInvoiceEmail({ to: 'bad@example.com', subject: 'Test', html: '<p>Hi</p>' })
    ).rejects.toThrow('Resend error: Invalid recipient')
  })

  it('accepts all status variants: paid, pending, overdue', async () => {
    const { sendInvoiceEmail } = await import('@/lib/email')
    for (const status of ['paid', 'pending', 'overdue'] as const) {
      vi.clearAllMocks()
      mockSendSuccess()

      await sendInvoiceEmail({
        to: 'test@example.com',
        subject: `Invoice ${status}`,
        invoiceId: `INV-${status}`,
        amount: '$100',
        status,
      })

      expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    }
  })

  it('applies default values when optional fields are missing (structured path)', async () => {
    const { sendInvoiceEmail } = await import('@/lib/email')
    mockSendSuccess()

    // No customerName, no dueDate, no description
    await sendInvoiceEmail({
      to: 'test@example.com',
      subject: 'Minimal invoice',
      invoiceId: 'INV-MIN',
      amount: '$50',
    })

    expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    const call = mockEmailsSend.mock.calls[0][0]
    expect(call.html).toContain('INV-MIN')
    expect(call.html).toContain('$50')
  })
})

describe('sendAIAlertEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends to OWNER_EMAIL env var', async () => {
    const { sendAIAlertEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendAIAlertEmail({
      severity: 'high',
      title: 'High CPU usage',
      description: 'CPU usage exceeded 90%',
    })

    expect(mockEmailsSend.mock.calls[0][0].to).toEqual(['owner@frontdeskagents.com'])
  })

  it('uses default owner email when OWNER_EMAIL env var is not set', async () => {
    const original = process.env.OWNER_EMAIL
    delete process.env.OWNER_EMAIL
    const { sendAIAlertEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendAIAlertEmail({
      severity: 'low',
      title: 'Info alert',
      description: 'Some info',
    })

    expect(mockEmailsSend.mock.calls[0][0].to).toEqual(['admin@frontdeskagents.com'])
    process.env.OWNER_EMAIL = original
  })

  it('subject includes severity prefix', async () => {
    const { sendAIAlertEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendAIAlertEmail({
      severity: 'critical',
      title: 'Database down',
      description: 'Primary DB unreachable',
    })

    expect(mockEmailsSend.mock.calls[0][0].subject).toBe('[CRITICAL] Database down')
  })

  it('renders AIAlertEmail template with all provided fields', async () => {
    const { sendAIAlertEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendAIAlertEmail({
      severity: 'high',
      title: 'Churn risk detected',
      description: 'Customer health score dropped below 40',
      category: 'retain',
      trigger: 'healthScore < 40',
      reasoning: 'Customer has not called in 21+ days',
      recommendedAction: 'Send retention offer',
      metadata: { customerId: 'cust-123', plan: 'starter' },
      timestamp: '2026-01-15T10:00:00Z',
    })

    const call = mockEmailsSend.mock.calls[0][0]
    expect(typeof call.html).toBe('string')
    expect(call.html.length).toBeGreaterThan(0)
    expect(call.html).toContain('Churn risk detected')
    expect(call.html).toContain('healthScore &lt; 40')
    expect(call.html).toContain('Customer has not called in 21+ days')
  })

  it('throws when Resend returns an error', async () => {
    const { sendAIAlertEmail } = await import('@/lib/email')
    mockSendError('Rate limit exceeded')

    await expect(
      sendAIAlertEmail({ severity: 'low', title: 'Test', description: 'Test desc' })
    ).rejects.toThrow('Resend error: Rate limit exceeded')
  })

  it('accepts all severity variants', async () => {
    const { sendAIAlertEmail } = await import('@/lib/email')
    for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
      vi.clearAllMocks()
      mockSendSuccess()

      await sendAIAlertEmail({
        severity,
        title: `Test ${severity}`,
        description: `Test description for ${severity}`,
      })

      expect(mockEmailsSend).toHaveBeenCalledTimes(1)
      expect(mockEmailsSend.mock.calls[0][0].subject).toBe(`[${severity.toUpperCase()}] Test ${severity}`)
    }
  })
})

describe('sendEmail (generic)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends to a single recipient as array', async () => {
    const { sendEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendEmail({
      to: 'single@example.com',
      subject: 'Generic email',
      html: '<p>Hello</p>',
    })

    expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    expect(mockEmailsSend.mock.calls[0][0].to).toEqual(['single@example.com'])
  })

  it('sends to multiple recipients', async () => {
    const { sendEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendEmail({
      to: ['one@example.com', 'two@example.com'],
      subject: 'Bulk email',
      html: '<p>Bulk content</p>',
    })

    expect(mockEmailsSend.mock.calls[0][0].to).toEqual(['one@example.com', 'two@example.com'])
  })

  it('includes replyTo when provided', async () => {
    const { sendEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendEmail({
      to: 'recipient@example.com',
      subject: 'Reply test',
      html: '<p>Content</p>',
      replyTo: 'replies@frontdeskagents.com',
    })

    expect(mockEmailsSend.mock.calls[0][0].replyTo).toBe('replies@frontdeskagents.com')
  })

  it('omits replyTo when not provided', async () => {
    const { sendEmail } = await import('@/lib/email')
    mockSendSuccess()

    await sendEmail({
      to: 'recipient@example.com',
      subject: 'No reply-to',
      html: '<p>Content</p>',
    })

    const call = mockEmailsSend.mock.calls[0][0]
    expect(call.replyTo).toBeUndefined()
  })

  it('throws when Resend returns an error', async () => {
    const { sendEmail } = await import('@/lib/email')
    mockSendError('Invalid API key')

    await expect(
      sendEmail({ to: 'bad@example.com', subject: 'Test', html: '<p>Hi</p>' })
    ).rejects.toThrow('Resend error: Invalid API key')
  })
})