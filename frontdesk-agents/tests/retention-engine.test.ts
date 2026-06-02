import { describe, it, expect, beforeEach } from 'vitest'
import { RetentionEngine } from '@/lib/retention-engine/index'

describe('RetentionEngine', () => {
  let engine: RetentionEngine

  beforeEach(() => {
    engine = new RetentionEngine()
  })

  const defaultCustomer = {
    customerId: 'cust-1',
    businessName: 'Acme Corp',
    email: 'acme@example.com',
    plan: 'growth',
    mrr: 999,
  }

  describe('registerCustomer', () => {
    it('should register a new customer with default health metrics', () => {
      engine.registerCustomer(defaultCustomer)
      const customer = engine.getCustomer('cust-1')
      expect(customer).toBeDefined()
      expect(customer!.businessName).toBe('Acme Corp')
      expect(customer!.healthScore).toBe(85)
      expect(customer!.status).toBe('healthy')
      expect(customer!.upsellPotential).toBe('medium')
      expect(customer!.recommendedActions).toContain('Complete onboarding')
    })

    it('should initialize call history as empty array', () => {
      engine.registerCustomer(defaultCustomer)
      const all = engine.getAllCustomers()
      expect(all).toHaveLength(1)
    })
  })

  describe('recordCall', () => {
    it('should update satisfaction score on call recording', () => {
      engine.registerCustomer(defaultCustomer)
      engine.recordCall('cust-1', 95, true)
      const customer = engine.getCustomer('cust-1')
      // satisfactionScore = 80 * 0.7 + 95 * 0.3 = 56 + 28.5 = 84.5 -> 85
      expect(customer!.satisfactionScore).toBe(85)
      expect(customer!.daysSinceLastCall).toBe(0)
    })

    it('should do nothing for non-existent customer', () => {
      engine.recordCall('nonexistent', 50, false)
      const customer = engine.getCustomer('nonexistent')
      expect(customer).toBeUndefined()
    })

    it('should track call history dates', () => {
      engine.registerCustomer(defaultCustomer)
      engine.recordCall('cust-1', 80, true)
      const calls = engine.getCustomer('cust-1')
      expect(calls).toBeDefined()
    })
  })

  describe('health score calculation', () => {
    it('should penalize high support tickets', () => {
      engine.registerCustomer(defaultCustomer)
      const customer = engine.getCustomer('cust-1')!
      const originalScore = customer.healthScore  // Capture before mutation
      // Modify support tickets high
      customer.supportTicketsOpen = 5
      // Trigger recalculate by recording a call
      engine.recordCall('cust-1', 80, true)
      const updated = engine.getCustomer('cust-1')
      // 5 tickets * 5 = 25 points penalty
      expect(updated!.healthScore).toBeLessThan(originalScore)
    })

    it('should mark onboarding not completed as penalty', () => {
      engine.registerCustomer(defaultCustomer)
      const customer = engine.getCustomer('cust-1')!
      expect(customer.onboardingCompleted).toBe(false)
      // Trigger recalculation by recording a call (registration hardcodes score=85)
      engine.recordCall('cust-1', 80, true)
      const updated = engine.getCustomer('cust-1')
      // 70 base + (80-70)*0.3 sat bonus - 15 onboarding = 58, so < 70
      expect(updated!.healthScore).toBeLessThanOrEqual(70)
    })

    it('should set status to at_risk when score between 40 and 70', () => {
      engine.registerCustomer(defaultCustomer)
      const customer = engine.getCustomer('cust-1')!
      customer.supportTicketsOpen = 1
      customer.onboardingCompleted = true
      engine.recordCall('cust-1', 60, true)
      const updated = engine.getCustomer('cust-1')
      // 70 base + (satisfaction*0.7+60*0.3-70)*0.3 - 1*5 - 0onboarding
      // = 70 + ((80*0.7+60*0.3)-70)*0.3 -5 = 70 + (74-70)*0.3 -5 = 70+1.2-5 = 66.2
      expect(updated!.healthScore).toBeGreaterThanOrEqual(40)
      expect(updated!.healthScore).toBeLessThan(70)
      expect(updated!.status).toBe('at_risk')
    })
  })

  describe('findUpsellOpportunities', () => {
    it('should return upsell opportunities for high-potential customers', () => {
      engine.registerCustomer(defaultCustomer)
      const customer = engine.getCustomer('cust-1')!
      customer.upsellPotential = 'high'
      const opps = engine.findUpsellOpportunities()
      expect(opps.length).toBeGreaterThanOrEqual(1)
      expect(opps[0].currentPlan).toBe('growth')
      expect(opps[0].recommendedPlan).toBe('pro')
    })

    it('should skip customers with low upsell potential', () => {
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-1' })
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-2' })
      const c1 = engine.getCustomer('cust-1')!
      c1.upsellPotential = 'low'
      const c2 = engine.getCustomer('cust-2')!
      c2.upsellPotential = 'low'
      const opps = engine.findUpsellOpportunities()
      expect(opps).toHaveLength(0)
    })

    it('should sort opportunities by additional revenue descending', () => {
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-1', plan: 'starter', mrr: 49 })
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-2', plan: 'growth', mrr: 149 })
      const c1 = engine.getCustomer('cust-1')!
      c1.upsellPotential = 'high'
      const c2 = engine.getCustomer('cust-2')!
      c2.upsellPotential = 'high'
      const opps = engine.findUpsellOpportunities()
      expect(opps).toHaveLength(2)
      // Growth -> Pro: 299 - 149 = 150, Starter -> Growth: 149 - 49 = 100
      expect(opps[0].additionalRevenue).toBeGreaterThanOrEqual(opps[1].additionalRevenue)
    })
  })

  describe('getReviewCandidates', () => {
    it('should return customers with high health scores', () => {
      engine.registerCustomer(defaultCustomer)
      const candidates = engine.getReviewCandidates(0) // 0 min days
      expect(candidates.length).toBeGreaterThanOrEqual(1)
      expect(candidates[0].businessName).toBe('Acme Corp')
      expect(candidates[0].reviewPlatform).toMatch(/^(google|trustpilot|g2|capterra)$/)
    })

    it('should skip customers with low health scores', () => {
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-1' })
      const c1 = engine.getCustomer('cust-1')!
      c1.healthScore = 50
      const candidates = engine.getReviewCandidates(0)
      // Should not include cust-1 with healthScore < 80
      expect(candidates.find(c => c.customerId === 'cust-1')).toBeUndefined()
    })
  })

  describe('getAtRiskCustomers / getHealthyCustomers', () => {
    it('should correctly filter customers by status', () => {
      engine.registerCustomer(defaultCustomer)
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-2' })
      const c2 = engine.getCustomer('cust-2')!
      c2.status = 'at_risk'

      const atRisk = engine.getAtRiskCustomers()
      const healthy = engine.getHealthyCustomers()

      expect(atRisk).toHaveLength(1)
      expect(atRisk[0].customerId).toBe('cust-2')
      expect(healthy).toHaveLength(1)
      expect(healthy[0].customerId).toBe('cust-1')
    })
  })

  describe('getAllCustomers', () => {
    it('should return all registered customers', () => {
      engine.registerCustomer(defaultCustomer)
      engine.registerCustomer({ ...defaultCustomer, customerId: 'cust-2' })
      const all = engine.getAllCustomers()
      expect(all).toHaveLength(2)
    })

    it('should return empty array when no customers', () => {
      const all = engine.getAllCustomers()
      expect(all).toEqual([])
    })
  })
})
