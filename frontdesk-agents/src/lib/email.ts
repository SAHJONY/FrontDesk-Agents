import { Resend } from 'resend'
import { render } from '@react-email/render'
import { InvoiceEmail } from './emails/InvoiceEmail'
import { AIAlertEmail } from './emails/AIAlertEmail'

// Lazy-initialize so that importing this module doesn't require RESEND_API_KEY
// (e.g. in test files that transitively pull in email.ts)
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Read per-call so tests can override EMAIL_FROM between calls
function getFromAddress() {
  return process.env.EMAIL_FROM ?? 'noreply@frontdeskagents.com'
}

// --- Invoice / Billing Emails ------------------------------------------------

// Supports two call patterns:
//   1. Raw HTML (backward compat): sendInvoiceEmail({ to, subject, html })
//   2. Structured (preferred):    sendInvoiceEmail({ to, subject, invoiceId, amount, dueDate, description, status, customerName, businessName })
export async function sendInvoiceEmail(params: {
  to: string
  subject: string
  customerName?: string
  businessName?: string
  invoiceId?: string
  amount?: string
  dueDate?: string
  description?: string
  status?: 'paid' | 'pending' | 'overdue'
  html?: string
}) {
  const { to, subject, customerName, businessName, invoiceId, amount, dueDate, description, status, html: htmlParam } = params

  const html = htmlParam
    ? htmlParam
    : await render(
        InvoiceEmail({
          customerName: customerName ?? to.split('@')[0] ?? 'Valued Customer',
          businessName: businessName ?? 'Frontdesk Agents',
          invoiceId: invoiceId ?? '',
          amount: amount ?? '$0.00',
          dueDate,
          description,
          status: status ?? 'pending',
        })
      )

  const { data, error } = await getResend().emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// --- AI Decision Engine Alert Emails ------------------------------------------

export async function sendAIAlertEmail({
  severity,
  title,
  description,
  category = 'alert',
  trigger,
  reasoning,
  action: recommendedAction,
  metadata,
  timestamp,
}: {
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  category?: string
  trigger?: string
  reasoning?: string
  action?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}) {
  const html = await render(
    AIAlertEmail({
      severity,
      title,
      description,
      category: category ?? 'alert',
      trigger: trigger ?? title,
      reasoning: reasoning ?? description,
      recommendedAction,
      metadata,
      timestamp,
    })
  )

  const { data, error } = await getResend().emails.send({
    from: getFromAddress(),
    to: [process.env.OWNER_EMAIL ?? 'admin@frontdeskagents.com'],
    subject: `[${severity.toUpperCase()}] ${title}`,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// --- Generic send -------------------------------------------------------------

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromAddress(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}
