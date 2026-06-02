import { NextResponse } from 'next/server'
import { salesEngine } from '@/lib/sales-engine/index'
import { metricsEngine } from '@/lib/metrics-engine/index'
import { retentionEngine } from '@/lib/retention-engine/index'
import { partnerEngine } from '@/lib/partner-engine/index'

export const dynamic = 'force-dynamic'

function seedEngines() {
  // Already seeded (engines are process-wide singletons)
  if (salesEngine.getLeads().length > 0) return

  // Seed metrics engine with realistic data
  metricsEngine.recordAcquisition(999, 1200)
  metricsEngine.recordAcquisition(1499, 800)
  metricsEngine.recordAcquisition(2999, 1500)
  metricsEngine.recordAcquisition(999, 900)
  metricsEngine.recordAcquisition(1499, 1100)
  metricsEngine.recordAcquisition(2999, 1300)
  metricsEngine.recordAcquisition(999, 700)
  metricsEngine.updateCosts({ aiApi: 1200, telephony: 800, infrastructure: 400, marketing: 2000, payroll: 5000, other: 300 })

  // Seed sales engine with diverse leads
  const leads = [
    { id: 'lead-1', businessName: 'Sunrise Medical Center', email: 'contact@sunrisemed.com', industry: 'healthcare', employeeCount: 120, estimatedCallVolume: 800, urgency: 'urgent' as const, source: { channel: 'seo' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-2', businessName: 'Premier Legal Group', email: 'info@premierlegal.com', industry: 'legal', employeeCount: 45, estimatedCallVolume: 300, urgency: 'high' as const, source: { channel: 'referral' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-3', businessName: 'Elite Dental Care', email: 'hello@elitedental.com', industry: 'dental', employeeCount: 15, estimatedCallVolume: 200, urgency: 'medium' as const, source: { channel: 'paid' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-4', businessName: 'Luxury Hotel Group', email: 'reservations@luxuryhotels.com', industry: 'hospitality', employeeCount: 200, estimatedCallVolume: 1500, urgency: 'urgent' as const, source: { channel: 'demo' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-5', businessName: 'AutoNation Dealers', email: 'sales@autonation.com', industry: 'automotive', employeeCount: 80, estimatedCallVolume: 600, urgency: 'high' as const, source: { channel: 'outbound' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-6', businessName: 'Home Plus Services', email: 'info@homeplus.com', industry: 'home_services', employeeCount: 30, estimatedCallVolume: 150, urgency: 'medium' as const, source: { channel: 'seo' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-7', businessName: 'AllState Insurance', email: 'agents@allstate.com', industry: 'insurance', employeeCount: 60, estimatedCallVolume: 400, urgency: 'medium' as const, source: { channel: 'partner' as const }, createdAt: new Date().toISOString() },
    { id: 'lead-8', businessName: 'Quick Mart Retail', email: 'store@quickmart.com', industry: 'retail', employeeCount: 8, estimatedCallVolume: 50, urgency: 'low' as const, source: { channel: 'organic' as const }, createdAt: new Date().toISOString() },
  ]
  leads.forEach(l => salesEngine.scoreLead(l))

  // Seed retention engine with customers
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

  // Seed call history for each customer (simulate past 4 weeks of calls)
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

  // Seed partner engine
  const p1 = partnerEngine.registerPartner({ name: 'TechFlow Agency', email: 'partner@techflow.com', type: 'agency' as const })
  const p2 = partnerEngine.registerPartner({ name: 'Growth Consulting', email: 'hello@growthconsult.com', type: 'consultant' as const })
  partnerEngine.activatePartner(p1.id)
  partnerEngine.activatePartner(p2.id)
  const r1 = partnerEngine.trackReferral({ partnerId: p1.id, businessName: 'CloudBase Inc', email: 'info@cloudbase.com', dealValue: 2999 })
  const r2 = partnerEngine.trackReferral({ partnerId: p2.id, businessName: 'DataSync Corp', email: 'contact@datasync.com', dealValue: 1499 })
  if (r1) partnerEngine.convertReferral(r1.id, 2999)
  if (r2) partnerEngine.convertReferral(r2.id, 1499)
}

let seeded = false
function ensureSeeded() {
  if (!seeded) {
    seedEngines()
    seeded = true
  }
}

export async function GET() {
  try {
    ensureSeeded()

    const metrics = metricsEngine.getMetrics()
    const sales = {
      pipeline: salesEngine.getPipeline(),
      salesMetrics: salesEngine.getMetrics(),
      leadsByTier: {
        hot: salesEngine.getLeadsByTier('hot').length,
        warm: salesEngine.getLeadsByTier('warm').length,
        cold: salesEngine.getLeadsByTier('cold').length,
      },
      leads: salesEngine.getLeads(),
    }
    const health = {
      customers: retentionEngine.getAllCustomers().map(c => ({
        ...c,
        healthStatus: c.status,
        callHistory: retentionEngine.getCallHistory?.(c.customerId) ?? [],
      })),
      healthyCount: retentionEngine.getHealthyCustomers().length,
      atRiskCount: retentionEngine.getAtRiskCustomers().length,
      totalCustomers: retentionEngine.getAllCustomers().length,
      upsellOpportunities: retentionEngine.findUpsellOpportunities(),
      reviewCandidates: retentionEngine.getReviewCandidates(),
      healthChecks: metricsEngine.evaluateHealth(),
    }
    const partners = partnerEngine.getMetrics()

        // Generate revenue trend data (12 months)
    const revenueTrend = [
      { month: 'Jun', revenue: 8700 },
      { month: 'Jul', revenue: 9200 },
      { month: 'Aug', revenue: 9650 },
      { month: 'Sep', revenue: 10200 },
      { month: 'Oct', revenue: 10800 },
      { month: 'Nov', revenue: 11400 },
      { month: 'Dec', revenue: 11800 },
      { month: 'Jan', revenue: 12300 },
      { month: 'Feb', revenue: 12900 },
      { month: 'Mar', revenue: 13400 },
      { month: 'Apr', revenue: 14100 },
      { month: 'May', revenue: 14700 },
    ]

    // Generate churn history data (12 months)
    const churnHistory = [
      { month: 'Jun', churnRate: 0.076 },
      { month: 'Jul', churnRate: 0.068 },
      { month: 'Aug', churnRate: 0.072 },
      { month: 'Sep', churnRate: 0.061 },
      { month: 'Oct', churnRate: 0.055 },
      { month: 'Nov', churnRate: 0.052 },
      { month: 'Dec', churnRate: 0.048 },
      { month: 'Jan', churnRate: 0.045 },
      { month: 'Feb', churnRate: 0.043 },
      { month: 'Mar', churnRate: 0.041 },
      { month: 'Apr', churnRate: 0.038 },
      { month: 'May', churnRate: 0.035 },
    ]

    return NextResponse.json({ metrics, sales, health, partners, projections: metricsEngine.projectRevenue(), charts: { revenueTrend, churnHistory } })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
