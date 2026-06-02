import { describe, it, expect, beforeEach } from 'vitest'
import { SalesEngine, type LeadData } from '@/lib/sales-engine/index'

describe('SalesEngine', () => {
  let engine: SalesEngine

  beforeEach(() => {
    engine = new SalesEngine()
  })

  const baseLead = (overrides: Partial<LeadData> = {}): LeadData => ({
    id: 'lead-1',
    businessName: 'Test Business',
    email: 'test@example.com',
    source: { channel: 'seo' },
    createdAt: new Date().toISOString(),
    ...overrides,
  })

  describe('scoreLead', () => {
    it('should score a high-value lead as hot', () => {
      const scored = engine.scoreLead(baseLead({
        industry: 'healthcare', employeeCount: 100,
        estimatedCallVolume: 1000, urgency: 'urgent',
        website: 'https://example.com', source: { channel: 'demo' },
      }))
      expect(scored.score).toBeGreaterThanOrEqual(70)
      expect(scored.tier).toBe('hot')
      expect(scored.qualified).toBe(true)
    })

    it('should classify a low-information lead as cold', () => {
      const scored = engine.scoreLead(baseLead({
        industry: 'retail', employeeCount: 2,
        estimatedCallVolume: 10, urgency: 'low',
        source: { channel: 'outbound' },
      }))
      expect(scored.score).toBeLessThan(40)
      expect(scored.tier).toBe('cold')
      expect(scored.qualified).toBe(false)
    })

    it('should classify a mid-range lead as warm', () => {
      const scored = engine.scoreLead(baseLead({
        industry: 'financial', employeeCount: 8,
        estimatedCallVolume: 50, urgency: 'low',
        source: { channel: 'paid' },
      }))
      expect(scored.score).toBeGreaterThanOrEqual(40)
      expect(scored.score).toBeLessThan(70)
      expect(scored.tier).toBe('warm')
    })

    it('should use default industry score of 0.5 for unknown industries', () => {
      const scored = engine.scoreLead(baseLead({
        industry: 'unknown_niche', employeeCount: 10,
        estimatedCallVolume: 50, source: { channel: 'seo' },
      }))
      expect(scored.scoreBreakdown['industryFit']).toBeCloseTo(0.10, 2)
    })

    it('should handle missing optional fields gracefully', () => {
      const scored = engine.scoreLead(baseLead({}))
      expect(scored.score).toBeGreaterThanOrEqual(0)
      expect(typeof scored.score).toBe('number')
    })

    it('should score referral channels higher than outbound', () => {
      const referral = engine.scoreLead(baseLead({ employeeCount: 10, source: { channel: 'referral' } }))
      const outbound = engine.scoreLead(baseLead({ employeeCount: 10, source: { channel: 'outbound' } }))
      expect(referral.score).toBeGreaterThan(outbound.score)
    })

    it('should provide a detailed score breakdown', () => {
      const scored = engine.scoreLead(baseLead({
        industry: 'hvac', employeeCount: 25,
        estimatedCallVolume: 300, urgency: 'high',
        website: 'https://example.com', source: { channel: 'seo' },
      }))
      const keys = ['businessSize', 'callVolume', 'industryFit', 'urgency', 'engagementLevel', 'budgetSignal']
      keys.forEach(k => expect(scored.scoreBreakdown).toHaveProperty(k))
      const total = Object.values(scored.scoreBreakdown).reduce((a, b) => a + b, 0)
      expect(total).toBeGreaterThan(0)
    })

    it('should recommend actions matching score tier', () => {
      const hot = engine.scoreLead(baseLead({ industry: 'dental', employeeCount: 50, estimatedCallVolume: 500, urgency: 'urgent', source: { channel: 'demo' } }))
      expect(hot.recommendedAction).toContain('Immediate demo')

      const warm = engine.scoreLead(baseLead({ industry: 'professional', employeeCount: 5, estimatedCallVolume: 30, urgency: 'low', source: { channel: 'seo' } }))
      expect(warm.recommendedAction).toContain('qualification email')

      const cold = engine.scoreLead(baseLead({ industry: 'retail', employeeCount: 2, estimatedCallVolume: 5, urgency: 'low', source: { channel: 'outbound' } }))
      expect(cold.recommendedAction).toContain('Nurture')
    })
  })

  describe('getPipeline', () => {
    it('should return pipeline stages with correct counts', () => {
      engine.scoreLead(baseLead({ id: '1', industry: 'healthcare', employeeCount: 100, estimatedCallVolume: 1000, urgency: 'urgent', source: { channel: 'demo' } }))
      engine.scoreLead(baseLead({ id: '2', industry: 'real_estate', employeeCount: 15, estimatedCallVolume: 100, urgency: 'medium', source: { channel: 'seo' } }))
      engine.scoreLead(baseLead({ id: '3', industry: 'retail', employeeCount: 2, estimatedCallVolume: 10, urgency: 'low', source: { channel: 'outbound' } }))

      const pipeline = engine.getPipeline()
      expect(pipeline).toHaveLength(4)
      expect(pipeline[0].name).toBe('Leads Generated')
      expect(pipeline[0].count).toBe(3)
      expect(pipeline[1].name).toBe('Qualified')
      expect(pipeline[1].count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getMetrics', () => {
    it('should return correct metrics', () => {
      engine.scoreLead(baseLead({ id: '1', industry: 'healthcare', employeeCount: 100, source: { channel: 'demo' } }))
      engine.scoreLead(baseLead({ id: '2', industry: 'retail', employeeCount: 2, source: { channel: 'outbound' } }))

      const metrics = engine.getMetrics()
      expect(metrics.totalLeads).toBe(2)
      expect(metrics.qualifiedLeads).toBeGreaterThanOrEqual(1)
      expect(metrics.topSources).toHaveLength(2)
    })

    it('should handle zero leads', () => {
      const metrics = engine.getMetrics()
      expect(metrics.totalLeads).toBe(0)
      expect(metrics.conversionRate).toBe(0)
      expect(metrics.topSources).toEqual([])
    })
  })

  describe('getLeadsByTier', () => {
    it('should filter leads by tier', () => {
      engine.scoreLead(baseLead({ id: '1', industry: 'healthcare', employeeCount: 100, estimatedCallVolume: 1000, urgency: 'urgent', source: { channel: 'demo' } }))
      engine.scoreLead(baseLead({ id: '2', industry: 'retail', employeeCount: 2, estimatedCallVolume: 5, urgency: 'low', source: { channel: 'outbound' } }))
      expect(engine.getLeadsByTier('hot').length).toBeGreaterThanOrEqual(1)
      expect(engine.getLeadsByTier('cold').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getLeads', () => {
    it('should return leads sorted by score descending', () => {
      engine.scoreLead(baseLead({ id: '1', industry: 'healthcare', employeeCount: 100, source: { channel: 'demo' } }))
      engine.scoreLead(baseLead({ id: '2', industry: 'retail', employeeCount: 2, source: { channel: 'outbound' } }))
      const leads = engine.getLeads()
      expect(leads[0].score).toBeGreaterThanOrEqual(leads[1].score)
    })
  })
})
