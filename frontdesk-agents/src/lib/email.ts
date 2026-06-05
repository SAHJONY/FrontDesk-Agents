import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Configure your verified sending domain in the Resend dashboard:
// https://resend.com/domains
// Override via EMAIL_FROM env var (e.g. EMAIL_FROM=alerts@yourdomain.com)
const FROM = process.env.EMAIL_FROM ?? 'noreply@frontdeskagents.com'

// ─── Invoice / Billing Emails ───────────────────────────────────────────────

export async function sendInvoiceEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// ─── AI Decision Engine Alert Emails ───────────────────────────────────────

export async function sendAIAlertEmail({
  severity,
  title,
  description,
  metadata,
}: {
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  metadata?: Record<string, unknown>
}) {
  const severityColor =
    severity === 'critical'
      ? '#dc2626'
      : severity === 'high'
        ? '#f97316'
        : severity === 'medium'
          ? '#eab308'
          : '#6b7280'

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <div style="border-left: 4px solid ${severityColor}; padding-left: 16px;">
        <h2 style="margin: 0 0 8px; color: ${severityColor};">[${severity.toUpperCase()}] ${title}</h2>
        <p style="margin: 0 0 16px; color: #374151;">${description}</p>
        ${
          metadata
            ? `<pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto;">${JSON.stringify(metadata, null, 2)}</pre>`
            : ''
        }
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Sent by Frontdesk Agents AI Decision Engine</p>
      </div>
    </div>
  `

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [process.env.OWNER_EMAIL ?? 'admin@frontdeskagents.com'],
    subject: `[${severity.toUpperCase()}] ${title}`,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// ─── Generic send ───────────────────────────────────────────────────────────

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
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}