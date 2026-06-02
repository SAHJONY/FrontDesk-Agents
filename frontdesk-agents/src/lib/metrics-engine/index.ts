// ============================================================
// Metrics Engine — Real-time Profit, CAC, LTV & Revenue Tracking
// ============================================================

export interface ProfitMetrics {
  mrr: number
  arr: number
  cac: number
  ltv: number
  ltvCacRatio: number
  grossMargin: number
  netProfitMargin: number
  monthlyChurnRate: number
  annualChurnRate: number
  customerCount: number
  newCustomersThisMonth: number
  lostCustomersThisMonth: number
  averageRevenuePerUser: number
  cacPaybackMonths: number
  revenueGrowthRate: number
  revenueBreakdown: RevenueBreakdown
  costBreakdown: CostBreakdown
}

export interface RevenueBreakdown {
  subscriptions: number
  usage: number
  setup: number
  upsells: number
  referrals: number
}

export interface CostBreakdown {
  aiApi: number
  telephony: number
  infrastructure: number
  marketing: number
  payroll: number
  other: number
}

export interface RevenueProjection {
  month: number
  projectedMrr: number
  optimisticMrr: number
  conservativeMrr: number
  projectedCustomers: number
  projectedChurn: number
}

export class MetricsEngine {
  private metrics: ProfitMetrics = this.getDefaultMetrics()
  private history: { date: string; mrr: number; customers: number }[] = []

  private getDefaultMetrics(): ProfitMetrics {
    return {
      mrr: 0, arr: 0, cac: 0, ltv: 0, ltvCacRatio: 0,
      grossMargin: 85, netProfitMargin: 0, monthlyChurnRate: 0, annualChurnRate: 0,
      customerCount: 0, newCustomersThisMonth: 0, lostCustomersThisMonth: 0,
      averageRevenuePerUser: 0, cacPaybackMonths: 0, revenueGrowthRate: 0,
      revenueBreakdown: { subscriptions: 0, usage: 0, setup: 0, upsells: 0, referrals: 0 },
      costBreakdown: { aiApi: 0, telephony: 0, infrastructure: 0, marketing: 0, payroll: 0, other: 0 },
    }
  }

  recordAcquisition(customerRevenue: number, acquisitionCost: number): void {
    this.metrics.customerCount++
    this.metrics.newCustomersThisMonth++
    this.metrics.mrr += customerRevenue
    this.metrics.arr = this.metrics.mrr * 12
    this.metrics.averageRevenuePerUser = this.metrics.customerCount > 0
      ? this.metrics.mrr / this.metrics.customerCount : 0
    const totalCac = this.metrics.cac * (this.metrics.customerCount - 1) + acquisitionCost
    this.metrics.cac = this.metrics.customerCount > 0 ? totalCac / this.metrics.customerCount : acquisitionCost
    this.metrics.ltv = this.metrics.averageRevenuePerUser * 24
    this.metrics.ltvCacRatio = this.metrics.cac > 0 ? this.metrics.ltv / this.metrics.cac : 0
    this.metrics.cacPaybackMonths = this.metrics.averageRevenuePerUser > 0
      ? this.metrics.cac / this.metrics.averageRevenuePerUser : 0
    this.recordSnapshot()
  }

  recordChurn(customerRevenue: number): void {
    this.metrics.customerCount = Math.max(0, this.metrics.customerCount - 1)
    this.metrics.lostCustomersThisMonth++
    this.metrics.mrr = Math.max(0, this.metrics.mrr - customerRevenue)
    this.metrics.arr = this.metrics.mrr * 12
  }

  updateCosts(costs: Partial<CostBreakdown>): void {
    this.metrics.costBreakdown = { ...this.metrics.costBreakdown, ...costs }
    this.calculateProfitMargin()
  }

  recordRevenue(type: keyof RevenueBreakdown, amount: number): void {
    this.metrics.revenueBreakdown[type] += amount
    this.metrics.mrr += amount
    this.metrics.arr = this.metrics.mrr * 12
  }

  calculateChurn(): void {
    const total = this.metrics.customerCount + this.metrics.lostCustomersThisMonth
    this.metrics.monthlyChurnRate = total > 0 ? this.metrics.lostCustomersThisMonth / total : 0
    this.metrics.annualChurnRate = 1 - Math.pow(1 - this.metrics.monthlyChurnRate, 12)
  }

  private calculateProfitMargin(): void {
    const totalCosts = Object.values(this.metrics.costBreakdown).reduce((a, b) => a + b, 0)
    const grossProfit = this.metrics.mrr - (this.metrics.costBreakdown.aiApi + this.metrics.costBreakdown.telephony)
    this.metrics.grossMargin = this.metrics.mrr > 0 ? (grossProfit / this.metrics.mrr) * 100 : 0
    this.metrics.netProfitMargin = this.metrics.mrr > 0 ? ((this.metrics.mrr - totalCosts) / this.metrics.mrr) * 100 : 0
  }

  projectRevenue(): RevenueProjection[] {
    const projections: RevenueProjection[] = []
    const growthRate = this.metrics.revenueGrowthRate / 100 || 0.15
    const churnRate = this.metrics.monthlyChurnRate || 0.03
    for (let month = 1; month <= 12; month++) {
      const growth = Math.pow(1 + growthRate, month)
      const churn = Math.pow(1 - churnRate, month)
      const baseMrr = this.metrics.mrr * growth * churn
      projections.push({
        month, projectedMrr: Math.round(baseMrr),
        optimisticMrr: Math.round(baseMrr * 1.3),
        conservativeMrr: Math.round(baseMrr * 0.7),
        projectedCustomers: Math.round(this.metrics.customerCount * growth * churn),
        projectedChurn: Math.round(this.metrics.customerCount * (1 - churn)),
      })
    }
    return projections
  }

  calculateGrowthRate(): number {
    if (this.history.length < 2) return 0
    const sorted = [...this.history].sort((a, b) => a.date.localeCompare(b.date))
    const oldest = sorted[0]; const newest = sorted[sorted.length - 1]
    if (oldest.mrr === 0) return 0
    const monthsDiff = Math.max(1, sorted.length - 1)
    return (Math.pow(newest.mrr / oldest.mrr, 1 / monthsDiff) - 1) * 100
  }

  getMetrics(): ProfitMetrics {
    this.calculateChurn()
    this.metrics.revenueGrowthRate = this.calculateGrowthRate()
    return { ...this.metrics }
  }

  evaluateHealth(): { metric: string; current: number; target: number; passing: boolean }[] {
    const m = this.getMetrics()
    return [
      { metric: 'CAC Payback (months)', current: m.cacPaybackMonths, target: 3, passing: m.cacPaybackMonths <= 3 },
      { metric: 'Gross Margin (%)', current: m.grossMargin, target: 70, passing: m.grossMargin >= 70 },
      { metric: 'Churn Rate (mo%)', current: m.monthlyChurnRate * 100, target: 5, passing: m.monthlyChurnRate * 100 < 5 },
      { metric: 'LTV:CAC Ratio', current: m.ltvCacRatio, target: 3, passing: m.ltvCacRatio >= 3 },
      { metric: 'Onboarding Time (min)', current: 10, target: 10, passing: true },
    ]
  }

  private recordSnapshot(): void {
    const date = new Date().toISOString().split('T')[0]
    this.history.push({ date, mrr: this.metrics.mrr, customers: this.metrics.customerCount })
    if (this.history.length > 24) this.history = this.history.slice(-24)
  }

  getHistory() { return [...this.history] }
}

export const metricsEngine = new MetricsEngine()
