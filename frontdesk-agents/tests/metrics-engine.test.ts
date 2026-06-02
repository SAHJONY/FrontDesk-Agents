import { describe, it, expect, beforeEach } from 'vitest'
import { MetricsEngine } from '@/lib/metrics-engine/index'

describe('MetricsEngine', () => {
  let engine: MetricsEngine

  beforeEach(() => {
    engine = new MetricsEngine()
  })

  describe('recordAcquisition', () => {
    it('should record a new customer acquisition correctly', () => {
      engine.recordAcquisition(1000, 500)
      const m = engine.getMetrics()
      expect(m.customerCount).toBe(1)
      expect(m.newCustomersThisMonth).toBe(1)
      expect(m.mrr).toBe(1000)
      expect(m.arr).toBe(12000)
      expect(m.cac).toBe(500)
      expect(m.ltv).toBeGreaterThan(0)
      expect(m.ltvCacRatio).toBeGreaterThan(0)
    })

    it('should accumulate MRR and recalculate averages over multiple acquisitions', () => {
      engine.recordAcquisition(1000, 500)
      engine.recordAcquisition(2000, 600)
      const m = engine.getMetrics()
      expect(m.customerCount).toBe(2)
      expect(m.mrr).toBe(3000)
      expect(m.arr).toBe(36000)
      expect(m.averageRevenuePerUser).toBe(1500)
      expect(m.cac).toBe(550)
    })

    it('should track snapshots in history', () => {
      engine.recordAcquisition(1000, 500)
      const history = engine.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].mrr).toBe(1000)
      expect(history[0].customers).toBe(1)
    })
  })

  describe('recordChurn', () => {
    it('should reduce customer count and MRR on churn', () => {
      engine.recordAcquisition(1000, 500)
      engine.recordChurn(1000)
      const m = engine.getMetrics()
      expect(m.customerCount).toBe(0)
      expect(m.mrr).toBe(0)
      expect(m.lostCustomersThisMonth).toBe(1)
    })

    it('should not go below zero customers or MRR', () => {
      engine.recordChurn(500)
      const m = engine.getMetrics()
      expect(m.customerCount).toBe(0)
      expect(m.mrr).toBe(0)
    })

    it('should track churn over multiple events', () => {
      engine.recordAcquisition(1000, 500)
      engine.recordAcquisition(2000, 600)
      engine.recordChurn(1000)
      const m = engine.getMetrics()
      expect(m.customerCount).toBe(1)
      expect(m.lostCustomersThisMonth).toBe(1)
      expect(m.mrr).toBe(2000)
    })
  })

  describe('updateCosts', () => {
    it('should update cost breakdown and recalculate margins', () => {
      engine.recordAcquisition(5000, 1000)
      engine.updateCosts({ aiApi: 500, telephony: 300, infrastructure: 200, marketing: 400, payroll: 1000, other: 100 })
      const m = engine.getMetrics()
      expect(m.costBreakdown.aiApi).toBe(500)
      expect(m.costBreakdown.marketing).toBe(400)
      // Gross margin = (5000 - (500+300)) / 5000 * 100 = 84%
      expect(m.grossMargin).toBeCloseTo(84, 0)
      // Net profit margin = (5000 - 2500) / 5000 * 100 = 50%
      expect(m.netProfitMargin).toBeCloseTo(50, 0)
    })

    it('should partially update costs without resetting existing', () => {
      engine.updateCosts({ aiApi: 300, telephony: 200 })
      engine.updateCosts({ marketing: 500 })
      const m = engine.getMetrics()
      expect(m.costBreakdown.aiApi).toBe(300)
      expect(m.costBreakdown.marketing).toBe(500)
      // telephony should still be 200
      expect(m.costBreakdown.telephony).toBe(200)
    })
  })

  describe('recordRevenue', () => {
    it('should record revenue by type and update MRR', () => {
      engine.recordRevenue('subscriptions', 3000)
      engine.recordRevenue('upsells', 500)
      const m = engine.getMetrics()
      expect(m.revenueBreakdown.subscriptions).toBe(3000)
      expect(m.revenueBreakdown.upsells).toBe(500)
      expect(m.mrr).toBe(3500)
    })
  })

  describe('calculateChurn', () => {
    it('should calculate monthly and annual churn rates', () => {
      engine.recordAcquisition(1000, 500)
      engine.recordAcquisition(1000, 500)
      engine.recordAcquisition(1000, 500)
      engine.recordChurn(1000)
      engine.calculateChurn()
      const m = engine.getMetrics()
      // 1 churned out of 3 total (2 active after churn + 1 churned) = 33%
      expect(m.monthlyChurnRate).toBeCloseTo(0.3333, 2)
      expect(m.annualChurnRate).toBeGreaterThan(0)
    })

    it('should return 0 churn when no customers', () => {
      engine.calculateChurn()
      const m = engine.getMetrics()
      expect(m.monthlyChurnRate).toBe(0)
      expect(m.annualChurnRate).toBe(0)
    })
  })

  describe('projectRevenue', () => {
    it('should generate 12-month projections', () => {
      engine.recordAcquisition(10000, 2000)
      const projections = engine.projectRevenue()
      expect(projections).toHaveLength(12)
      expect(projections[0].month).toBe(1)
      expect(projections[11].month).toBe(12)
      expect(projections[0].projectedMrr).toBeGreaterThan(0)
      expect(projections[0].optimisticMrr).toBeGreaterThan(projections[0].projectedMrr)
      expect(projections[0].conservativeMrr).toBeLessThan(projections[0].projectedMrr)
    })
  })

  describe('evaluateHealth', () => {
    it('should evaluate health metrics against targets', () => {
      engine.recordAcquisition(10000, 500)
      const health = engine.evaluateHealth()
      expect(health).toHaveLength(5)
      expect(health[0].metric).toBe('CAC Payback (months)')
      expect(health[1].metric).toBe('Gross Margin (%)')
      expect(health[2].metric).toBe('Churn Rate (mo%)')
      expect(health[3].metric).toBe('LTV:CAC Ratio')
      expect(health[4].metric).toBe('Onboarding Time (min)')
    })

    it('should identify when targets are not met', () => {
      engine.recordAcquisition(500, 5000)
      const health = engine.evaluateHealth()
      // CAC payback should fail - cac=5000, arpu=500, payback=10mo
      const cacHealth = health[0]
      expect(cacHealth.passing).toBe(false)
    })
  })

  describe('calculateGrowthRate', () => {
    it('should calculate positive growth rate', () => {
      engine.recordAcquisition(1000, 500)
      engine.recordAcquisition(1500, 600)
      const m = engine.getMetrics()
      expect(m.revenueGrowthRate).toBeGreaterThan(0)
    })

    it('should return 0 with insufficient history', () => {
      const m = engine.getMetrics()
      expect(m.revenueGrowthRate).toBe(0)
    })
  })

  describe('getMetrics', () => {
    it('should return a clean copy of metrics', () => {
      engine.recordAcquisition(1000, 500)
      const m1 = engine.getMetrics()
      const m2 = engine.getMetrics()
      // Calling getMetrics again should return the same state
      expect(m1.customerCount).toBe(m2.customerCount)
      expect(m1.mrr).toBe(m2.mrr)
    })

    it('should reflect default state', () => {
      const m = engine.getMetrics()
      expect(m.customerCount).toBe(0)
      expect(m.mrr).toBe(0)
      expect(m.arr).toBe(0)
      expect(m.cac).toBe(0)
    })
  })
})
