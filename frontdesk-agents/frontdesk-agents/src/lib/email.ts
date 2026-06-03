import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// SMTP Configuration (for nodemailer-style sending via custom SMTP)
interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

// Call summary email data
export interface CallSummaryEmail {
  to: string | string[]
  callId: string
  callerNumber: string
  duration: number
  transcript?: string
  summary?: string
  recordingUrl?: string
  timestamp: Date
}

// Send email using Resend
export async function sendEmailViaResend(
  to: string | string[],
  subject: string,
  html: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'GlobalVoice AI <noreply@globalvoice.ai>'

    const result = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Resend email error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

// Format call duration in minutes:seconds
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

// Generate HTML for call summary email
export function generateCallSummaryHtml(data: CallSummaryEmail): string {
  const {
    callId,
    callerNumber,
    duration,
    transcript,
    summary,
    recordingUrl,
    timestamp,
  } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Call Summary - ${callId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111119; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
    .info-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 16px; font-weight: 500; color: #00d4ff; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .transcript-box { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; max-height: 200px; overflow-y: auto; }
    .summary-box { background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin-top: 16px; }
    .footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📞 Call Summary</h1>
      <p>GlobalVoice AI Receptionist</p>
    </div>
    <div class="content">
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Call ID</div>
          <div class="info-value">${callId}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Caller</div>
          <div class="info-value">${callerNumber}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Duration</div>
          <div class="info-value">${formatDuration(duration)}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Time</div>
          <div class="info-value">${timestamp.toLocaleString()}</div>
        </div>
      </div>

      ${summary ? `
      <div class="section">
        <div class="section-title">AI Summary</div>
        <div class="summary-box">${summary}</div>
      </div>
      ` : ''}

      ${transcript ? `
      <div class="section">
        <div class="section-title">Transcript</div>
        <div class="transcript-box">${transcript}</div>
      </div>
      ` : ''}

      ${recordingUrl ? `
      <a href="${recordingUrl}" class="cta-button">🎧 Listen to Recording</a>
      ` : ''}
    </div>
    <div class="footer">
      Sent by GlobalVoice AI · This is an automated message
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Send call summary email
export async function sendCallSummaryEmail(data: CallSummaryEmail): Promise<{ success: boolean; error?: string }> {
  const subject = `Call Summary - ${data.callerNumber} (${data.timestamp.toLocaleString()})`
  const html = generateCallSummaryHtml(data)

  return sendEmailViaResend(data.to, subject, html)
}

// ─── Customer Onboarding Email Templates ───────────────────────────────────

interface WelcomeEmailData {
  to: string
  customerName: string
  businessName: string
  planName: string
  trialEndDate: Date
  dashboardUrl: string
}

// Generate HTML for welcome email
export function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  const { customerName, businessName, planName, trialEndDate, dashboardUrl } = data
  const trialDays = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GlobalVoice AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111119; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .greeting { font-size: 18px; margin-bottom: 16px; }
    .highlight-box { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .highlight-box h3 { margin: 0 0 12px; color: #00d4ff; font-size: 16px; }
    .highlight-box ul { margin: 0; padding-left: 20px; }
    .highlight-box li { margin: 8px 0; color: #ccc; font-size: 14px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .info-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; text-align: center; }
    .info-value { font-size: 24px; font-weight: 600; color: #00d4ff; }
    .info-label { font-size: 12px; color: #888; margin-top: 4px; }
    .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to GlobalVoice AI!</h1>
      <p>Your AI receptionist is ready to go</p>
    </div>
    <div class="content">
      <p class="greeting">Hi ${customerName},</p>
      <p>Welcome aboard! Your AI receptionist for <strong>${businessName}</strong> is now set up and ready to handle calls 24/7.</p>
      
      <div class="highlight-box">
        <h3>📋 Your ${planName} Plan includes:</h3>
        <ul>
          <li>14-day free trial (no credit card required)</li>
          <li>Automatic phone number provisioning</li>
          <li>AI-powered call handling with natural voice</li>
          <li>Call recordings and transcripts</li>
        </ul>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-value">${trialDays}</div>
          <div class="info-label">Days in Trial</div>
        </div>
        <div class="info-card">
          <div class="info-value">${trialEndDate.toLocaleDateString()}</div>
          <div class="info-label">Trial Ends</div>
        </div>
      </div>

      <center>
        <a href="${dashboardUrl}" class="cta-button">Go to Your Dashboard →</a>
      </center>

      <p style="font-size: 14px; color: #888; margin-top: 24px;">
        Need help getting started? Reply to this email or visit our <a href="${dashboardUrl}" style="color: #00d4ff;">support portal</a>.
      </p>
    </div>
    <div class="footer">
      GlobalVoice AI · Your AI Receptionist · This is an automated message
    </div>
  </div>
</body>
</html>
  `.trim()
}

interface UpgradeEmailData {
  to: string
  customerName: string
  businessName: string
  previousTier: string
  newTier: string
  newFeatures: string[]
  dashboardUrl: string
}

// Generate HTML for tier upgrade notification
export function generateUpgradeEmailHtml(data: UpgradeEmailData): string {
  const { customerName, businessName, previousTier, newTier, newFeatures, dashboardUrl } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Upgraded!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111119; border-radius: 16px; border: 1px solid rgba(0,255,136,0.3); overflow: hidden; }
    .header { background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; color: #000; }
    .header p { margin: 8px 0 0; opacity: 0.8; font-size: 16px; color: #000; }
    .content { padding: 32px; }
    .celebration { font-size: 64px; text-align: center; margin-bottom: 16px; }
    .tier-change { text-align: center; margin: 24px 0; padding: 20px; background: rgba(0,255,136,0.1); border-radius: 12px; }
    .tier-change .from { font-size: 14px; color: #888; text-decoration: line-through; }
    .tier-change .arrow { font-size: 24px; color: #00d4ff; margin: 8px 0; }
    .tier-change .to { font-size: 24px; font-weight: 600; color: #00ff88; }
    .features-list { margin: 24px 0; }
    .features-list h3 { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .feature-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin: 8px 0; }
    .feature-item .icon { font-size: 20px; }
    .feature-item .text { font-size: 14px; color: #ccc; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); color: #000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 You've Been Upgraded!</h1>
      <p>Congratulations, ${customerName}!</p>
    </div>
    <div class="content">
      <div class="celebration">🚀</div>
      
      <p style="text-align: center; font-size: 16px; color: #ccc;">
        Thanks to your success with ${businessName}, you've automatically unlocked the <strong>${newTier}</strong> tier!
      </p>

      <div class="tier-change">
        <div class="from">${previousTier}</div>
        <div class="arrow">↓</div>
        <div class="to">${newTier}</div>
      </div>

      <div class="features-list">
        <h3>Your New Features:</h3>
        ${newFeatures.map(f => `<div class="feature-item"><span class="icon">✨</span><span class="text">${f}</span></div>`).join('\n')}
      </div>

      <center>
        <a href="${dashboardUrl}" class="cta-button">Explore Your New Features →</a>
      </center>
    </div>
    <div class="footer">
      GlobalVoice AI · Your AI Receptionist · This is an automated message
    </div>
  </div>
</body>
</html>
  `.trim()
}

interface VerificationEmailData {
  to: string
  customerName: string
  verificationCode: string
  expiryMinutes: number
}

// Generate HTML for email verification
export function generateVerificationEmailHtml(data: VerificationEmailData): string {
  const { customerName, verificationCode, expiryMinutes } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #111119; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; text-align: center; }
    .code-box { background: rgba(0,212,255,0.1); border: 2px dashed rgba(0,212,255,0.5); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00d4ff; font-family: monospace; }
    .expiry { font-size: 12px; color: #888; margin-top: 12px; }
    .note { font-size: 13px; color: #666; margin-top: 20px; }
    .footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Verify Your Email</h1>
    </div>
    <div class="content">
      <p style="color: #ccc;">Hi ${customerName},</p>
      <p style="color: #ccc;">Please enter this code to verify your email address:</p>
      <div class="code-box">
        <div class="code">${verificationCode}</div>
        <div class="expiry">Expires in ${expiryMinutes} minutes</div>
      </div>
      <p class="note">If you didn't request this code, you can safely ignore this email.</p>
    </div>
    <div class="footer">GlobalVoice AI · This is an automated message</div>
  </div>
</body>
</html>
  `.trim()
}

// ─── Email Sending Functions ───────────────────────────────────────────────

// Send welcome email
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  const subject = `Welcome to GlobalVoice AI, ${data.customerName}! 🎉`
  const html = generateWelcomeEmailHtml(data)
  return sendEmailViaResend(data.to, subject, html)
}

// Send tier upgrade notification
export async function sendUpgradeEmail(data: UpgradeEmailData): Promise<{ success: boolean; error?: string }> {
  const subject = `🎊 Congratulations! You've been upgraded to ${data.newTier}`
  const html = generateUpgradeEmailHtml(data)
  return sendEmailViaResend(data.to, subject, html)
}

// Send verification email
export async function sendVerificationEmail(data: VerificationEmailData): Promise<{ success: boolean; error?: string }> {
  const subject = 'Verify your GlobalVoice AI email'
  const html = generateVerificationEmailHtml(data)
  return sendEmailViaResend(data.to, subject, html)
}

// Simple email notification for new lead/call
export async function sendNotificationEmail(
  to: string | string[],
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #111119; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 24px; }
    .header { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #00d4ff; }
    .message { font-size: 14px; line-height: 1.6; color: #ccc; }
    .badge { display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">GlobalVoice AI <span class="badge">Notification</span></div>
    <div class="message">${message}</div>
  </div>
</body>
</html>
  `.trim()

  return sendEmailViaResend(to, subject, html)
}

// Validate email address format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}