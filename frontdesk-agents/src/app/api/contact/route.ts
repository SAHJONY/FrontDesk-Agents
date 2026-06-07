import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

function escapeHtml(str: string | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, companySize, industry, service, message } = body

    // Validate required fields
    const errors: string[] = []
    if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push('Name is required')
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required')
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) errors.push('Phone number is required')
    if (!company || typeof company !== 'string' || company.trim().length < 1) errors.push('Company name is required')
    if (!message || typeof message !== 'string' || message.trim().length < 10) errors.push('Message must be at least 10 characters')

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    // Send email to sales
    const salesEmail = process.env.SALES_EMAIL || 'sales@frontdeskagents.com'
    const html = `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Company</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(company)}</td></tr>
        ${companySize ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Company Size</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(companySize)}</td></tr>` : ''}
        ${industry ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Industry</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(industry)}</td></tr>` : ''}
        ${service ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Service Interest</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(service)}</td></tr>` : ''}
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Message</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(message).replace(/\n/g, '<br>')}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">Submitted at ${new Date().toISOString()}</p>
    `

    console.log(`[contact] Sending to ${salesEmail} from ${process.env.EMAIL_FROM || 'noreply@frontdeskagents.com'}`)

    await sendEmail({
      to: salesEmail,
      subject: `[FrontDesk Agents] New inquiry from ${name} at ${company}`,
      html,
      replyTo: email,
    })

    return NextResponse.json({ success: true, message: 'Your inquiry has been submitted. We will respond within 2 hours.' })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[contact] Full error:', err.message, err.stack)
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 })
  }
}
