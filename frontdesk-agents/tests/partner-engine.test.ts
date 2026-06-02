import { describe, it, expect, beforeEach } from 'vitest'
import { PartnerEngine } from '@/lib/partner-engine/index'

describe('PartnerEngine', () => {
  let engine: PartnerEngine

  beforeEach(() => {
    engine = new PartnerEngine()
  })

  describe('registerPartner', () => {
    it('should register a new partner with pending status', () => {
      const p = engine.registerPartner({name: 'Test Agency',email: 'agency@test.com',type: 'agency'})
      expect(p.name).toBe('Test Agency')
      expect(p.tier).toBe('bronze')
      expect(p.status).toBe('pending')
      expect(p.commissionRate).toBe(0.15)
      expect(p.id).toMatch(/^prt_/)
      expect(p.promoCode).toMatch(/^GV-/)
      expect(p.dashboardAccess).toBe(true)
    })
    it('should accept custom promo code', () => {
      const p = engine.registerPartner({name: 'Custom',email: 'c@t.com',type: 'affiliate',promoCode: 'MYCODE123'})
      expect(p.promoCode).toBe('MYCODE123')
    })
    it('should retrieve partner via getPartner', () => {
      const r = engine.registerPartner({name: 'Find Me',email: 'f@t.com',type: 'consultant'})
      expect(engine.getPartner(r.id)!.name).toBe('Find Me')
    })
  })

  describe('activatePartner', () => {
    it('should activate a pending partner', () => {
      const p = engine.registerPartner({name: 'Activate',email: 'a@t.com',type: 'referral'})
      expect(p.status).toBe('pending')
      expect(engine.activatePartner(p.id)).toBe(true)
      expect(engine.getPartner(p.id)!.status).toBe('active')
    })
    it('should return false for non-existent', () => {
      expect(engine.activatePartner('nonexistent')).toBe(false)
    })
  })

  describe('trackReferral', () => {
    it('should track a referral for an active partner', () => {
      const p = engine.registerPartner({name: 'R',email: 'r@t.com',type: 'affiliate'})
      engine.activatePartner(p.id)
      const ref = engine.trackReferral({partnerId: p.id,businessName: 'Biz',email: 'b@t.com',dealValue: 5000})
      expect(ref).not.toBeNull()
      expect(ref!.status).toBe('pending')
      expect(ref!.id).toMatch(/^ref_/)
    })
    it('should return null for non-existent partner', () => {
      expect(engine.trackReferral({partnerId: 'nonexistent',businessName: 'N',email: 'n@t.com'})).toBeNull()
    })
    it('should increment partner referral count', () => {
      const p = engine.registerPartner({name: 'C',email: 'c@t.com',type: 'referral'})
      engine.activatePartner(p.id)
      engine.trackReferral({partnerId: p.id,businessName: 'B1',email: 'b1@t.com'})
      engine.trackReferral({partnerId: p.id,businessName: 'B2',email: 'b2@t.com'})
      expect(engine.getPartner(p.id)!.totalReferrals).toBe(2)
    })
  })

  describe('convertReferral', () => {
    it('should calculate commission at 15%', () => {
      const p = engine.registerPartner({name: 'Comm',email: 'c@t.com',type: 'agency'})
      engine.activatePartner(p.id)
      const ref = engine.trackReferral({partnerId: p.id,businessName: 'CB',email: 'cb@t.com',dealValue: 10000})
      const conv = engine.convertReferral(ref!.id, 10000)
      expect(conv!.status).toBe('converted')
      expect(conv!.commissionEarned).toBe(1500)
    })
    it('should return null for non-existent referral', () => {
      expect(engine.convertReferral('nonexistent', 5000)).toBeNull()
    })
    it('should update partner revenue', () => {
      const p = engine.registerPartner({name: 'E',email: 'e@t.com',type: 'consultant'})
      engine.activatePartner(p.id)
      const ref = engine.trackReferral({partnerId: p.id,businessName: 'EB',email: 'eb@t.com'})
      engine.convertReferral(ref!.id, 15000)
      expect(engine.getPartner(p.id)!.totalRevenue).toBe(15000)
      expect(engine.getPartner(p.id)!.totalCommissionPaid).toBe(2250)
    })
  })

  describe('evaluateTier', () => {
    it('should promote to silver at 5k revenue', () => {
      const p = engine.registerPartner({name: 'C',email: 'c@t.com',type: 'agency'})
      engine.activatePartner(p.id)
      const ref = engine.trackReferral({partnerId: p.id,businessName: 'B',email: 'b@t.com'})
      engine.convertReferral(ref!.id, 5000)
      expect(engine.getPartner(p.id)!.tier).toBe('silver')
    })
    it('should promote to gold at 20k revenue', () => {
      const p = engine.registerPartner({name: 'G',email: 'g@t.com',type: 'reseller'})
      engine.activatePartner(p.id)
      const ref = engine.trackReferral({partnerId: p.id,businessName: 'BD',email: 'bd@t.com'})
      engine.convertReferral(ref!.id, 25000)
      expect(engine.getPartner(p.id)!.tier).toBe('gold')
      expect(engine.getPartner(p.id)!.commissionRate).toBe(0.20)
    })
    it('should promote to platinum at 50k revenue', () => {
      const p = engine.registerPartner({name: 'P',email: 'p@t.com',type: 'agency'})
      engine.activatePartner(p.id)
      const ref = engine.trackReferral({partnerId: p.id,businessName: 'M',email: 'm@t.com'})
      engine.convertReferral(ref!.id, 60000)
      expect(engine.getPartner(p.id)!.tier).toBe('platinum')
      expect(engine.getPartner(p.id)!.commissionRate).toBe(0.25)
    })
  })

  describe('getMetrics', () => {
    it('should return accurate aggregate metrics', () => {
      const p1 = engine.registerPartner({name: 'P1',email: 'p1@t.com',type: 'agency'})
      engine.activatePartner(p1.id)
      const p2 = engine.registerPartner({name: 'P2',email: 'p2@t.com',type: 'affiliate'})
      engine.activatePartner(p2.id)
      const r1 = engine.trackReferral({partnerId: p1.id,businessName: 'B1',email: 'b1@t.com',dealValue: 10000})
      engine.convertReferral(r1!.id, 10000)
      const r2 = engine.trackReferral({partnerId: p2.id,businessName: 'B2',email: 'b2@t.com',dealValue: 5000})
      engine.convertReferral(r2!.id, 5000)
      const m = engine.getMetrics()
      expect(m.totalPartners).toBe(2)
      expect(m.activePartners).toBe(2)
      expect(m.totalReferrals).toBe(2)
      expect(m.conversionRate).toBe(1)
      expect(m.totalRevenueGenerated).toBe(15000)
      expect(m.averageDealSize).toBe(7500)
    })
    it('should return empty metrics for no partners', () => {
      expect(engine.getMetrics().totalPartners).toBe(0)
      expect(engine.getMetrics().topPerformingPartners).toEqual([])
    })
  })

  describe('validatePromoCode', () => {
    it('should find active partner by promo code', () => {
      const p = engine.registerPartner({name: 'Pr',email: 'pr@t.com',type: 'affiliate'})
      engine.activatePartner(p.id)
      expect(engine.validatePromoCode(p.promoCode!)!.id).toBe(p.id)
    })
    it('should return null for pending partner code', () => {
      const p = engine.registerPartner({name: 'Pd',email: 'pd@t.com',type: 'affiliate'})
      expect(engine.validatePromoCode(p.promoCode!)).toBeNull()
    })
    it('should return null for non-existent code', () => {
      expect(engine.validatePromoCode('FAKE123')).toBeNull()
    })
  })

  describe('getReferrals', () => {
    it('should return all or filter by partner', () => {
      const p1 = engine.registerPartner({name: 'P1',email: 'p1@t.com',type: 'agency'})
      engine.activatePartner(p1.id)
      const p2 = engine.registerPartner({name: 'P2',email: 'p2@t.com',type: 'affiliate'})
      engine.activatePartner(p2.id)
      engine.trackReferral({partnerId: p1.id,businessName: 'B1',email: 'b1@t.com'})
      engine.trackReferral({partnerId: p2.id,businessName: 'B2',email: 'b2@t.com'})
      expect(engine.getReferrals()).toHaveLength(2)
      expect(engine.getReferrals(p1.id)).toHaveLength(1)
    })
  })

  describe('getPartners', () => {
    it('should return all registered partners', () => {
      engine.registerPartner({name: 'P1',email: 'p1@t.com',type: 'agency'})
      expect(engine.getPartners()).toHaveLength(1)
    })
    it('should return empty when no partners', () => {
      expect(new PartnerEngine().getPartners()).toEqual([])
    })
  })
})
