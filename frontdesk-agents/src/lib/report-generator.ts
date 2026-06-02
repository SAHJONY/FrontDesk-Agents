import { v4 as uuidv4 } from 'uuid'
import { salesEngine } from '@/lib/sales-engine/index'
import { metricsEngine } from '@/lib/metrics-engine/index'
import { retentionEngine } from '@/lib/retention-engine/index'
import { supabaseAdmin } from '@/lib/supabase'
import { CustomerHealth } from '@/lib/retention-engine/index'

// ── Types ──────────────────────────────────────────────

export type ReportFrequency = 'daily' | 'weekly' | 'monthly'

export interface ReportMeta {
  id: string
  businessId: string
  businessName: string
  frequency: ReportFrequency
  generatedAt: string
  filePath: string
  storageUrl: string
  sizeBytes: number
}

interface ReportData {
  business: {
    id: string
    name: string
    email: string
    plan: string
    mrr: number
  }
  health: {
    score: number
    status: string
    satisfactionScore: number
    supportTicketsOpen: number
    daysSinceLastCall: number
    callVolumeTrend: string
    onboardingCompleted: boolean
    upsellPotential: string
    recommendedActions: string[]
  }
  callAnalytics: {
    totalCalls4Weeks: number
    weeklyBuckets: { label: string; total: number }[]
    maxWeeklyCalls: number
  }
  lead: {
    score: number
    tier: string
    qualified: boolean
    conversionProbability: number
    recommendedAction: string
  } | null
  platformMetrics: {
    mrr: number
    monthlyChurnRate: number
    cac: number
    ltv: number
    customerCount: number
  }
}

// ── Seed Engines ───────────────────────────────────────

function seedEngines() {
  if (salesEngine.getLeads().length > 0) return

  metricsEngine.recordAcquisition(999, 1200)
  metricsEngine.recordAcquisition(1499, 800)
  metricsEngine.recordAcquisition(2999, 1500)
  metricsEngine.recordAcquisition(999, 900)
  metricsEngine.recordAcquisition(1499, 1100)
  metricsEngine.recordAcquisition(2999, 1300)
  metricsEngine.recordAcquisition(999, 700)
  metricsEngine.updateCosts({ aiApi: 1200, telephony: 800, infrastructure: 400, marketing: 2000, payroll: 5000, other: 300 })

  const leads = [
    { id: 'lead-1', businessName: 'Sunrise Medical Center', email: 'contact@sunrisemed.com', industry: 'healthcare' as const, employeeCount: 120, estimatedCallVolume: 800, urgency: 'urgent' as const, source: { channel: 'seo' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-2', businessName: 'Premier Legal Group', email: 'info@premierlegal.com', industry: 'legal' as const, employeeCount: 45, estimatedCallVolume: 300, urgency: 'high' as const, source: { channel: 'referral' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-3', businessName: 'Elite Dental Care', email: 'hello@elitedental.com', industry: 'dental' as const, employeeCount: 15, estimatedCallVolume: 200, urgency: 'medium' as const, source: { channel: 'paid' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-4', businessName: 'Luxury Hotel Group', email: 'reservations@luxuryhotels.com', industry: 'hospitality' as const, employeeCount: 200, estimatedCallVolume: 1500, urgency: 'urgent' as const, source: { channel: 'demo' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-5', businessName: 'AutoNation Dealers', email: 'sales@autonation.com', industry: 'automotive' as const, employeeCount: 80, estimatedCallVolume: 600, urgency: 'high' as const, source: { channel: 'outbound' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-6', businessName: 'Home Plus Services', email: 'info@homeplus.com', industry: 'home_services' as const, employeeCount: 30, estimatedCallVolume: 150, urgency: 'medium' as const, source: { channel: 'seo' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-7', businessName: 'AllState Insurance', email: 'agents@allstate.com', industry: 'insurance' as const, employeeCount: 60, estimatedCallVolume: 400, urgency: 'medium' as const, source: { channel: 'partner' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-8', businessName: 'Quick Mart Retail', email: 'store@quickmart.com', industry: 'retail' as const, employeeCount: 8, estimatedCallVolume: 50, urgency: 'low' as const, source: { channel: 'organic' as const }, createdAt: new Date().toISOString() },
  ]
  leads.forEach(l => salesEngine.scoreLead(l))

  const customers = [
    { customerId: 'cust-1', businessName: 'Sunrise Medical Center', email: 'contact@sunrisemed.com', plan: 'pro' as const, mrr: 2999 },
    { customerId: 'cust-2', businessName: 'Premier Legal Group', email: 'info@premierlegal.com', plan: 'growth' as const, mrr: 1499 },
    { customerId: 'cust-3', businessName: 'Elite Dental Care', email: 'hello@elitedental.com', plan: 'growth' as const, mrr: 1499 },
    { customerId: 'cust-4', businessName: 'Luxury Hotel Group', email: 'reservations@luxuryhotels.com', plan: 'pro' as const, mrr: 2999 },
    { customerId: 'cust-5', businessName: 'AutoNation Dealers', email: 'sales@autonation.com', plan: 'starter' as const, mrr: 999 },
    { customerId: 'cust-6', businessName: 'Home Plus Services', email: 'info@homeplus.com', plan: 'starter' as const, mrr: 999 },
    { customerId: 'cust-7', businessName: 'AllState Insurance', email: 'agents@allstate.com', plan: 'growth' as const, mrr: 1499 },
  ]
  customers.forEach(c => retentionEngine.registerCustomer(c))

  const now = new Date()
  customers.forEach(c => {
    for (let d = 28; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 86400000).toISOString().split('T')[0]
      const callCount = Math.floor(Math.random() * 5) + 1
      for (let i = 0; i < callCount; i++) {
        retentionEngine.recordCall(c.customerId, Math.floor(Math.random() * 41) + 60, Math.random() > 0.2)
      }
    }
  })
}

// ── Data Fetching ──────────────────────────────────────

function collectReportData(businessId?: string): (ReportData & { businessId: string })[] {
  seedEngines()

  const customers = retentionEngine.getAllCustomers()
  if (customers.length === 0) return []

  const targetCustomers = businessId
    ? customers.filter(c => c.customerId === businessId)
    : customers

  return targetCustomers.map((customer) => {
    const callHistory = retentionEngine.getCallHistory(customer.customerId) || []
    const lead = salesEngine.getLeads().find(l =>
      l.businessName.toLowerCase() === customer.businessName.toLowerCase()
    ) || null

    // Compute weekly buckets
    const weeklyBuckets = (() => {
      if (callHistory.length === 0) return []
      const weeks: { label: string; total: number }[] = []
      const sorted = [...callHistory].sort((a, b) => a.date.localeCompare(b.date))
      let currentWeek: { start: string; entries: typeof callHistory } | null = null

      for (const entry of sorted) {
        const d = new Date(entry.date)
        const monday = new Date(d)
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
        const weekKey = monday.toISOString().split('T')[0]

        if (!currentWeek || currentWeek.start !== weekKey) {
          if (currentWeek) {
            weeks.push({ label: weekKey, total: currentWeek.entries.reduce((s, e) => s + e.count, 0) })
          }
          currentWeek = { start: weekKey, entries: [entry] }
        } else {
          currentWeek.entries.push(entry)
        }
      }
      if (currentWeek) {
        weeks.push({ label: currentWeek.start, total: currentWeek.entries.reduce((s, e) => s + e.count, 0) })
      }
      return weeks.slice(-8)
    })()

    const metrics = metricsEngine.getMetrics()

    return {
      businessId: customer.customerId,
      business: {
        id: customer.customerId,
        name: customer.businessName,
        email: customer.email,
        plan: customer.plan,
        mrr: customer.mrr,
      },
      health: {
        score: customer.healthScore,
        status: customer.status,
        satisfactionScore: customer.satisfactionScore,
        supportTicketsOpen: customer.supportTicketsOpen,
        daysSinceLastCall: customer.daysSinceLastCall,
        callVolumeTrend: customer.callVolumeTrend || 'stable',
        onboardingCompleted: customer.onboardingCompleted,
        upsellPotential: customer.upsellPotential,
        recommendedActions: customer.recommendedActions || [],
      },
      callAnalytics: {
        totalCalls4Weeks: callHistory.reduce((s, e) => s + e.count, 0),
        weeklyBuckets,
        maxWeeklyCalls: Math.max(...weeklyBuckets.map(w => w.total), 1),
      },
      lead: lead ? {
        score: lead.score,
        tier: lead.tier,
        qualified: lead.qualified,
        conversionProbability: lead.conversionProbability,
        recommendedAction: lead.recommendedAction,
      } : null,
      platformMetrics: {
        mrr: metrics.mrr,
        monthlyChurnRate: metrics.monthlyChurnRate,
        cac: metrics.cac,
        ltv: metrics.ltv,
        customerCount: metrics.customerCount,
      },
    }
  })
}

// ── HTML Template Builder ──────────────────────────────

function buildReportHtml(data: ReportData, frequency: ReportFrequency): string {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const labels = data.callAnalytics.weeklyBuckets.map(w => {
    const d = new Date(w.label)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  const max = data.callAnalytics.maxWeeklyCalls
  const barHeights = data.callAnalytics.weeklyBuckets.map(w =>
    Math.round((w.total / max) * 100)
  )

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${data.business.name} - ${frequency} Report</title>
<style>
  @page { margin: 20mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; color: #1a1a2e; background: #f8f9fc; padding: 20px; }
  .page { max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 4px; }
  .header .meta { color: #6b7280; font-size: 13px; display: flex; justify-content: space-between; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .badge-healthy { background: #d1fae5; color: #065f46; }
  .badge-at_risk { background: #fef3c7; color: #92400e; }
  .badge-churned { background: #fee2e2; color: #991b1b; }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 16px; color: #6366f1; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .kpi-card { background: #f3f4f6; border-radius: 8px; padding: 12px; text-align: center; }
  .kpi-card .value { font-size: 22px; font-weight: 700; color: #1a1a2e; }
  .kpi-card .label { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .health-bar { height: 10px; background: #e5e7eb; border-radius: 99px; overflow: hidden; margin: 6px 0; }
  .health-bar-fill { height: 100%; border-radius: 99px; transition: width 0.3s; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
  td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
  .chart-bar-container { display: flex; align-items: flex-end; gap: 6px; height: 120px; padding: 10px 0; }
  .chart-bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
  .chart-bar { width: 100%; max-width: 40px; background: linear-gradient(to top, #6366f1, #818cf8); border-radius: 4px 4px 0 0; min-height: 2px; }
  .chart-label { font-size: 9px; color: #6b7280; margin-top: 4px; text-align: center; }
  .action-list { list-style: none; padding: 0; }
  .action-list li { padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .action-list li:last-child { border-bottom: none; }
  .action-list li::before { content: "\\25B8 "; color: #6366f1; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
  .all-customers-table { margin-top: 16px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${data.business.name}</h1>
    <div class="meta">
      <span>${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Report</span>
      <span>${dateStr}</span>
    </div>
  </div>

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="value">${data.health.score}/100</div>
        <div class="label">Health Score</div>
        <div class="health-bar"><div class="health-bar-fill" style="width:${data.health.score}%;background:${data.health.score >= 70 ? '#10b981' : data.health.score >= 40 ? '#f59e0b' : '#ef4444'}"></div></div>
      </div>
      <div class="kpi-card">
        <div class="value">$${data.business.mrr.toLocaleString()}</div>
        <div class="label">Monthly MRR</div>
      </div>
      <div class="kpi-card">
        <div class="value"><span class="badge badge-${data.health.status}">${data.health.status}</span></div>
        <div class="label">Account Status</div>
      </div>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="value">${data.health.satisfactionScore}%</div>
        <div class="label">Satisfaction</div>
      </div>
      <div class="kpi-card">
        <div class="value">${data.callAnalytics.totalCalls4Weeks}</div>
        <div class="label">Calls (4 weeks)</div>
      </div>
      <div class="kpi-card">
        <div class="value">${data.health.upsellPotential}</div>
        <div class="label">Upsell Potential</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Call Volume (Weekly)</h2>
    <div class="chart-bar-container">
      ${data.callAnalytics.weeklyBuckets.map((w, i) => `
      <div class="chart-bar-group">
        <div style="font-size:10px;font-weight:600;color:#374151;margin-bottom:4px">${w.total}</div>
        <div class="chart-bar" style="height:${barHeights[i]}%"></div>
        <div class="chart-label">${labels[i] || w.label}</div>
      </div>`).join('')}
    </div>
  </div>

  ${data.lead ? `
  <div class="section">
    <h2>Lead Status</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Score</td><td>${data.lead.score}/100</td></tr>
      <tr><td>Tier</td><td>${data.lead.tier}</td></tr>
      <tr><td>Qualified</td><td>${data.lead.qualified ? 'Yes' : 'No'}</td></tr>
      <tr><td>Conversion Probability</td><td>${(data.lead.conversionProbability * 100).toFixed(1)}%</td></tr>
      <tr><td>Recommended Action</td><td>${data.lead.recommendedAction}</td></tr>
    </table>
  </div>` : ''}

  <div class="section">
    <h2>Platform Metrics</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Platform MRR</td><td>$${data.platformMetrics.mrr.toLocaleString()}</td></tr>
      <tr><td>Monthly Churn</td><td>${(data.platformMetrics.monthlyChurnRate * 100).toFixed(2)}%</td></tr>
      <tr><td>CAC</td><td>$${data.platformMetrics.cac.toLocaleString()}</td></tr>
      <tr><td>LTV</td><td>$${data.platformMetrics.ltv.toLocaleString()}</td></tr>
      <tr><td>Total Customers</td><td>${data.platformMetrics.customerCount}</td></tr>
    </table>
  </div>

  ${data.health.recommendedActions.length > 0 ? `
  <div class="section">
    <h2>Recommended Actions</h2>
    <ul class="action-list">
      ${data.health.recommendedActions.map(a => `<li>${a}</li>`).join('')}
    </ul>
  </div>` : ''}

  <div class="footer">
    <p>Generated by Frontdesk Agents — ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Report</p>
    <p>Report ID: ${uuidv4().slice(0, 8)}</p>
  </div>
</div>
</body>
</html>`
}

// ── PDF Generation ─────────────────────────────────────

async function generatePdfBuffer(html: string): Promise<Buffer> {
  const { default: puppeteer } = await import('puppeteer')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.emulateMediaType('print')

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      printBackground: true,
      displayHeaderFooter: false,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// ── Supabase Storage Upload ────────────────────────────

async function uploadToStorage(
  pdfBuffer: Buffer,
  businessName: string,
  frequency: ReportFrequency
): Promise<{ filePath: string; storageUrl: string } | null> {
  if (!supabaseAdmin) {
    console.warn('[report-generator] Supabase not configured — skipping storage upload')
    return null
  }

  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  const fileName = `${slug}-${frequency}-${dateStr}.pdf`
  const filePath = `${fileName}`

  const { data, error } = await supabaseAdmin.storage
    .from('reports')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) {
    console.error('[report-generator] Storage upload error:', error.message)

    // Try to create bucket if it doesn't exist
    if (error.message.includes('bucket')) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('reports', {
        public: false,
      })
      if (!createError) {
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from('reports')
          .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })
        if (retryError) {
          console.error('[report-generator] Retry upload error:', retryError.message)
          return null
        }
        const { data: urlData } = await supabaseAdmin.storage.from('reports').getPublicUrl(filePath)
        return { filePath, storageUrl: urlData.publicUrl }
      }
    }
    return null
  }

  const { data: urlData } = await supabaseAdmin.storage.from('reports').getPublicUrl(filePath)
  return { filePath, storageUrl: urlData.publicUrl }
}

// ── Public API ─────────────────────────────────────────

/**
 * generateReport - Generate a PDF report for one or all businesses.
 * Returns an array of report metadata.
 */
export async function generateReport(
  options: {
    businessId?: string
    frequency?: ReportFrequency
    upload?: boolean
  } = {}
): Promise<ReportMeta[]> {
  const { businessId, frequency = 'daily', upload = true } = options
  const results: ReportMeta[] = []

  const dataList = collectReportData(businessId)

  for (const data of dataList) {
    try {
      const html = buildReportHtml(data, frequency)
      const pdfBuffer = await generatePdfBuffer(html)
      const id = uuidv4()

      let filePath = ''
      let storageUrl = ''

      if (upload) {
        const storage = await uploadToStorage(pdfBuffer, data.business.name, frequency)
        if (storage) {
          filePath = storage.filePath
          storageUrl = storage.storageUrl
        }
      }

      results.push({
        id,
        businessId: data.businessId,
        businessName: data.business.name,
        frequency,
        generatedAt: new Date().toISOString(),
        filePath,
        storageUrl,
        sizeBytes: pdfBuffer.length,
      })
    } catch (err) {
      console.error(`[report-generator] Failed to generate report for ${data.business.name}:`, err)
    }
  }

  return results
}
