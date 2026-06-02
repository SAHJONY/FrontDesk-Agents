// ============================================================
// Sales Engine - Lead Scoring, Qualification & Pipeline Tracking
// ============================================================

const SCORING_WEIGHTS = {
  businessSize: 0.25,
  callVolume: 0.20,
  industryFit: 0.20,
  urgency: 0.15,
  engagementLevel: 0.10,
  budgetSignal: 0.10,
}

const INDUSTRY_SCORES: Record<string, number> = {
  'healthcare': 0.95,
  'legal': 0.90,
  'dental': 0.95,
  'medical': 0.90,
  'real_estate': 0.85,
  'realestate': 0.85,
  'hospitality': 0.80,
  'automotive': 0.85,
  'home_services': 0.90,
  'hvac': 0.90,
  'plumbing': 0.90,
  'insurance': 0.85,
  'financial': 0.80,
  'retail': 0.60,
  'professional': 0.75,
}

export interface LeadSource {
  channel: 'seo' | 'outbound' | 'paid' | 'referral' | 'partner' | 'organic' | 'direct' | 'demo'
  campaign?: string
  referrerId?: string
  partnerId?: string
  landingPage?: string
}

export interface LeadData {
  id: string
  businessName: string
  website?: string
  industry?: string
  email: string
  phone?: string
  employeeCount?: number
  estimatedCallVolume?: number
  urgency?: 'low' | 'medium' | 'high' | 'urgent'
  source: LeadSource
  notes?: string
  createdAt: string
}

export interface ScoredLead extends LeadData {
  score: number
  scoreBreakdown: Record<string, number>
  tier: 'hot' | 'warm' | 'cold'
  qualified: boolean
  conversionProbability: number
  recommendedAction: string
}

export interface PipelineStage {
  name: string
  count: number
  value: number
  conversionRate: number
}

export interface SalesMetrics {
  totalLeads: number
  qualifiedLeads: number
  demoBooked: number
  demoCompleted: number
  convertedToPaid: number
  totalRevenue: number
  averageDealSize: number
  conversionRate: number
  timeToOnboard: number
  topSources: { channel: string; count: number; conversion: number }[]
}

export class SalesEngine {
  private leads: ScoredLead[] = []

  scoreLead(data: LeadData): ScoredLead {
    const breakdown: Record<string, number> = {}
    let totalScore = 0

    if (data.employeeCount) {
      const sizeScore = data.employeeCount >= 50 ? 1.0 : data.employeeCount >= 20 ? 0.8 : data.employeeCount >= 5 ? 0.5 : 0.2
      breakdown.businessSize = sizeScore * SCORING_WEIGHTS.businessSize
      totalScore += breakdown.businessSize
    }

    if (data.estimatedCallVolume) {
      const volumeScore = data.estimatedCallVolume >= 500 ? 1.0 : data.estimatedCallVolume >= 200 ? 0.8 : data.estimatedCallVolume >= 50 ? 0.5 : 0.2
      breakdown.callVolume = volumeScore * SCORING_WEIGHTS.callVolume
      totalScore += breakdown.callVolume
    }

    if (data.industry) {
      const industry = data.industry.toLowerCase().replace(/[^a-z_]/g, '')
      const fitScore = INDUSTRY_SCORES[industry] ?? 0.5
      breakdown.industryFit = fitScore * SCORING_WEIGHTS.industryFit
      totalScore += breakdown.industryFit
    }

    const urgencyMap = { low: 0.2, medium: 0.5, high: 0.8, urgent: 1.0 }
    if (data.urgency) {
      breakdown.urgency = (urgencyMap[data.urgency] ?? 0.3) * SCORING_WEIGHTS.urgency
      totalScore += breakdown.urgency
    }

    const engagementScore = data.source.channel === 'demo' ? 1.0
      : data.source.channel === 'referral' ? 0.9
      : data.source.channel === 'paid' ? 0.6
      : data.source.channel === 'seo' ? 0.4
      : data.source.channel === 'outbound' ? 0.3
      : 0.2
    breakdown.engagementLevel = engagementScore * SCORING_WEIGHTS.engagementLevel
    totalScore += breakdown.engagementLevel

    const budgetScore = (data.website ? 0.4 : 0) + ((data.employeeCount ?? 0) >= 10 ? 0.6 : 0)
    breakdown.budgetSignal = Math.min(budgetScore, 1) * SCORING_WEIGHTS.budgetSignal
    totalScore += breakdown.budgetSignal

    const normalizedScore = Math.round(Math.min(totalScore / 0.8, 1) * 100)

    const tier = normalizedScore >= 70 ? 'hot' : normalizedScore >= 40 ? 'warm' : 'cold'
    const qualified = normalizedScore >= 50
    const conversionProbability = Math.round((normalizedScore / 100) * 0.8 + 0.1 * 100) / 100

    const recommendedAction = normalizedScore >= 80 ? 'Immediate demo booking - high-value lead'
      : normalizedScore >= 60 ? 'Schedule discovery call within 24 hours'
      : normalizedScore >= 40 ? 'Send automated qualification email with case studies'
      : 'Nurture with educational content - add to drip campaign'

    const scored: ScoredLead = {
      ...data,
      score: normalizedScore,
      scoreBreakdown: breakdown,
      tier,
      qualified,
      conversionProbability,
      recommendedAction,
    }

    this.leads.push(scored)
    return scored
  }

  getPipeline(): PipelineStage[] {
    const qualified = this.leads.filter(l => l.qualified)
    const demoReady = qualified.filter(l => l.score >= 60)
    const hot = qualified.filter(l => l.tier === 'hot')

    return [
      { name: 'Leads Generated', count: this.leads.length, value: this.leads.length * 200, conversionRate: 1.0 },
      { name: 'Qualified', count: qualified.length, value: qualified.length * 200, conversionRate: this.leads.length > 0 ? qualified.length / this.leads.length : 0 },
      { name: 'Demo Ready', count: demoReady.length, value: demoReady.length * 200, conversionRate: qualified.length > 0 ? demoReady.length / qualified.length : 0 },
      { name: 'Hot Leads', count: hot.length, value: hot.length * 200, conversionRate: demoReady.length > 0 ? hot.length / demoReady.length : 0 },
    ]
  }

  getMetrics(): SalesMetrics {
    const qualified = this.leads.filter(l => l.qualified)
    const hot = this.leads.filter(l => l.tier === 'hot')

    const sourceMap = new Map<string, { count: number; converted: number }>()
    this.leads.forEach(l => {
      const ch = l.source.channel
      const current = sourceMap.get(ch) ?? { count: 0, converted: 0 }
      current.count++
      if (l.qualified) current.converted++
      sourceMap.set(ch, current)
    })

    return {
      totalLeads: this.leads.length,
      qualifiedLeads: qualified.length,
      demoBooked: 0,
      demoCompleted: 0,
      convertedToPaid: 0,
      totalRevenue: 0,
      averageDealSize: 200,
      conversionRate: this.leads.length > 0 ? qualified.length / this.leads.length : 0,
      timeToOnboard: 0,
      topSources: Array.from(sourceMap.entries()).map(([channel, data]) => ({
        channel,
        count: data.count,
        conversion: data.count > 0 ? data.converted / data.count : 0,
      })),
    }
  }

  getLeadsByTier(tier: 'hot' | 'warm' | 'cold'): ScoredLead[] {
    return this.leads.filter(l => l.tier === tier)
  }

  getLeads(): ScoredLead[] {
    return [...this.leads].sort((a, b) => b.score - a.score)
  }
}

export const salesEngine = new SalesEngine()
