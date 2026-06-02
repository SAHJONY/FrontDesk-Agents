// ============================================================
// Retention Engine — Customer Health, Upsells & Review Generation
// ============================================================

export interface CustomerHealth {
  customerId: string
  businessName: string
  email: string
  plan: string
  mrr: number
  healthScore: number
  status: 'healthy' | 'at_risk' | 'churned'
  daysSinceLastCall: number
  joinedAt: number
  callVolumeTrend: 'growing' | 'stable' | 'declining'
  satisfactionScore: number
  supportTicketsOpen: number
  onboardingCompleted: boolean
  daysSinceOnboarding: number
  upsellPotential: 'high' | 'medium' | 'low'
  recommendedActions: string[]
}

export interface UpsellOpportunity {
  customerId: string
  businessName: string
  currentPlan: string
  recommendedPlan: string
  additionalRevenue: number
  reason: string
  healthScore: number
}

export interface ReviewRequest {
  customerId: string
  businessName: string
  email: string
  daysSinceOnboarding: number
  reviewPlatform: 'google' | 'trustpilot' | 'g2' | 'capterra'
  reviewLink: string
}

const PLATFORMS = ['google', 'trustpilot', 'g2', 'capterra'] as const

export class RetentionEngine {
  private customers = new Map<string, CustomerHealth>()
  private callHistory = new Map<string, { date: string; count: number }[]>()

  registerCustomer(data: { customerId: string; businessName: string; email: string; plan: string; mrr: number }): void {
    const joinedAt = new Date().getTime()
    this.customers.set(data.customerId, {
      customerId: data.customerId, businessName: data.businessName, email: data.email,
      plan: data.plan, mrr: data.mrr, healthScore: 85, status: 'healthy',
      daysSinceLastCall: 0, joinedAt, callVolumeTrend: 'stable', satisfactionScore: 80,
      supportTicketsOpen: 0, onboardingCompleted: false, daysSinceOnboarding: 0,
      upsellPotential: 'medium', recommendedActions: ['Complete onboarding', 'Schedule success review'],
    })
    this.callHistory.set(data.customerId, [])
  }

  recordCall(customerId: string, sentimentScore: number, issueResolved: boolean): void {
    const customer = this.customers.get(customerId)
    if (!customer) return
    const history = this.callHistory.get(customerId) ?? []
    const today = new Date().toISOString().split('T')[0]
    if (history.length > 0 && history[history.length - 1].date === today) {
      history[history.length - 1].count++
    } else {
      history.push({ date: today, count: 1 })
    }
    this.callHistory.set(customerId, history.slice(-90))
    customer.daysSinceLastCall = 0
    customer.satisfactionScore = Math.round(customer.satisfactionScore * 0.7 + sentimentScore * 0.3)
    this.recalculateHealth(customerId)
  }

  private recalculateHealth(customerId: string): void {
    const customer = this.customers.get(customerId)
    if (!customer) return
    
    // Calculate days since onboarding dynamically
    customer.daysSinceOnboarding = Math.floor((Date.now() - customer.joinedAt) / (1000 * 60 * 60 * 24))
    
    let score = 70
    const history = this.callHistory.get(customerId) ?? []
    if (history.length >= 7) {
      const recent = history.slice(-7).reduce((s, e) => s + e.count, 0)
      const previous = history.slice(-14, -7).reduce((s, e) => s + e.count, 0)
      if (recent > previous * 1.2) { customer.callVolumeTrend = 'growing'; score += 15 }
      else if (recent < previous * 0.8) { customer.callVolumeTrend = 'declining'; score -= 10 }
      else { customer.callVolumeTrend = 'stable'; score += 5 }
    }
    score += (customer.satisfactionScore - 70) * 0.3
    score -= customer.supportTicketsOpen * 5
    if (customer.daysSinceLastCall > 30) score -= 20
    else if (customer.daysSinceLastCall > 14) score -= 10
    else if (customer.daysSinceLastCall > 7) score -= 5
    if (!customer.onboardingCompleted) score -= 15
    customer.healthScore = Math.max(0, Math.min(100, Math.round(score)))
    customer.status = customer.healthScore >= 70 ? 'healthy' : customer.healthScore >= 40 ? 'at_risk' : 'churned'
    customer.upsellPotential = customer.callVolumeTrend === 'growing' && customer.healthScore >= 80 ? 'high' : customer.healthScore >= 60 ? 'medium' : 'low'
    customer.recommendedActions = this.generateActions(customer)
  }

  private generateActions(c: CustomerHealth): string[] {
    const actions: string[] = []
    if (!c.onboardingCompleted) actions.push('Complete onboarding setup - guide customer through first integration')
    if (c.daysSinceLastCall > 14) actions.push('Re-engagement campaign - customer has low recent call volume')
    if (c.supportTicketsOpen > 2) actions.push('Proactive support outreach - multiple open tickets')
    if (c.upsellPotential === 'high') actions.push('Upsell opportunity - growing usage patterns detected')
    if (c.callVolumeTrend === 'declining') actions.push('Investigate declining usage - potential churn risk')
    if (c.healthScore >= 85 && c.daysSinceOnboarding > 30) actions.push('Request review - satisfied customer ready for testimonial')
    return actions
  }

  findUpsellOpportunities(): UpsellOpportunity[] {
    const opps: UpsellOpportunity[] = []
    const planMap: Record<string, { next: string; price: number }> = { starter: { next: 'growth', price: 149 }, growth: { next: 'pro', price: 299 }, pro: { next: 'enterprise', price: 999 } }
    for (const [, c] of this.customers) {
      if (c.upsellPotential !== 'high') continue
      const upgrade = planMap[c.plan]
      if (upgrade) opps.push({ customerId: c.customerId, businessName: c.businessName, currentPlan: c.plan, recommendedPlan: upgrade.next, additionalRevenue: upgrade.price - c.mrr, reason: 'Growing usage patterns and high satisfaction - ready for upgrade', healthScore: c.healthScore })
    }
    return opps.sort((a, b) => b.additionalRevenue - a.additionalRevenue)
  }

  getReviewCandidates(minDays: number = 30): ReviewRequest[] {
    const candidates: ReviewRequest[] = []
    for (const [, c] of this.customers) {
      if (c.healthScore < 80 || c.daysSinceOnboarding < minDays) continue
      const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]
      candidates.push({ customerId: c.customerId, businessName: c.businessName, email: c.email, daysSinceOnboarding: c.daysSinceOnboarding, reviewPlatform: platform, reviewLink: `https://${platform}.com/review/frontdesk-agents-${c.customerId}` })
    }
    return candidates
  }

  getCustomer(id: string) { return this.customers.get(id) }
  getAllCustomers() { return Array.from(this.customers.values()) }
  getAtRiskCustomers() { return this.getAllCustomers().filter(c => c.status === 'at_risk') }
  getHealthyCustomers() { return this.getAllCustomers().filter(c => c.status === 'healthy') }
  getCallHistory(customerId: string) { return this.callHistory.get(customerId) ?? [] }
}

export const retentionEngine = new RetentionEngine()
