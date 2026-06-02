// ============================================================
// Partner & Referral Engine - Multi-Channel Acquisition
// ============================================================

export interface Partner {
  id: string
  name: string
  email: string
  type: 'agency' | 'consultant' | 'reseller' | 'affiliate' | 'referral'
  commissionRate: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  status: 'active' | 'suspended' | 'pending'
  totalReferrals: number
  totalRevenue: number
  totalCommissionPaid: number
  joinedAt: string
  promoCode?: string
  dashboardAccess: boolean
}

export interface Referral {
  id: string
  partnerId: string
  referredBusinessName: string
  referredEmail: string
  status: 'pending' | 'converted' | 'lost'
  dealValue: number
  commissionEarned: number
  commissionPaid: boolean
  convertedAt?: string
  createdAt: string
}

export interface PartnerMetrics {
  totalPartners: number
  activePartners: number
  totalReferrals: number
  conversionRate: number
  totalRevenueGenerated: number
  totalCommissionPaid: number
  averageDealSize: number
  topPerformingPartners: { name: string; revenue: number; referrals: number }[]
  partnerTierBreakdown: Record<string, number>
}

const COMMISSION_RATES = {
  bronze: 0.10,
  silver: 0.15,
  gold: 0.20,
  platinum: 0.25,
}

export class PartnerEngine {
  private partners: Map<string, Partner> = new Map()
  private referrals: Referral[] = []

  registerPartner(data: {
    name: string
    email: string
    type: Partner['type']
    promoCode?: string
  }): Partner {
    const id = 'prt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    const partner: Partner = {
      id,
      name: data.name,
      email: data.email,
      type: data.type,
      commissionRate: 0.15,
      tier: 'bronze',
      status: 'pending',
      totalReferrals: 0,
      totalRevenue: 0,
      totalCommissionPaid: 0,
      joinedAt: new Date().toISOString(),
      promoCode: data.promoCode ?? 'GV-' + data.name.slice(0, 4).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      dashboardAccess: true,
    }
    this.partners.set(id, partner)
    return partner
  }

  trackReferral(data: {
    partnerId: string
    businessName: string
    email: string
    dealValue?: number
  }): Referral | null {
    const partner = this.partners.get(data.partnerId)
    if (!partner) return null

    const referral: Referral = {
      id: 'ref_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      partnerId: data.partnerId,
      referredBusinessName: data.businessName,
      referredEmail: data.email,
      status: 'pending',
      dealValue: data.dealValue ?? 0,
      commissionEarned: 0,
      commissionPaid: false,
      createdAt: new Date().toISOString(),
    }

    this.referrals.push(referral)
    partner.totalReferrals++
    return referral
  }

  convertReferral(referralId: string, dealValue: number): Referral | null {
    const referral = this.referrals.find(r => r.id === referralId)
    if (!referral) return null

    const partner = this.partners.get(referral.partnerId)
    if (!partner) return null

    referral.status = 'converted'
    referral.dealValue = dealValue
    referral.commissionEarned = dealValue * partner.commissionRate
    referral.convertedAt = new Date().toISOString()

    partner.totalRevenue += dealValue
    partner.totalCommissionPaid += referral.commissionEarned

    this.evaluateTier(partner.id)

    return referral
  }

  private evaluateTier(partnerId: string): void {
    const partner = this.partners.get(partnerId)
    if (!partner) return

    if (partner.totalRevenue >= 50000) partner.tier = 'platinum'
    else if (partner.totalRevenue >= 20000) partner.tier = 'gold'
    else if (partner.totalRevenue >= 5000) partner.tier = 'silver'
    else partner.tier = 'bronze'

    partner.commissionRate = COMMISSION_RATES[partner.tier]
  }

  getMetrics(): PartnerMetrics {
    const active = Array.from(this.partners.values()).filter(p => p.status === 'active')
    const converted = this.referrals.filter(r => r.status === 'converted')

    const tierBreakdown: Record<string, number> = {}
    for (const [, p] of this.partners) {
      tierBreakdown[p.tier] = (tierBreakdown[p.tier] ?? 0) + 1
    }

    const sortedByRevenue = [...active].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5)

    return {
      totalPartners: this.partners.size,
      activePartners: active.length,
      totalReferrals: this.referrals.length,
      conversionRate: this.referrals.length > 0 ? converted.length / this.referrals.length : 0,
      totalRevenueGenerated: active.reduce((sum, p) => sum + p.totalRevenue, 0),
      totalCommissionPaid: active.reduce((sum, p) => sum + p.totalCommissionPaid, 0),
      averageDealSize: converted.length > 0 ? converted.reduce((sum, r) => sum + r.dealValue, 0) / converted.length : 0,
      topPerformingPartners: sortedByRevenue.map(p => ({ name: p.name, revenue: p.totalRevenue, referrals: p.totalReferrals })),
      partnerTierBreakdown: tierBreakdown,
    }
  }

  getPartner(partnerId: string): Partner | undefined {
    return this.partners.get(partnerId)
  }

  getReferrals(partnerId?: string): Referral[] {
    if (partnerId) return this.referrals.filter(r => r.partnerId === partnerId)
    return [...this.referrals]
  }

  getPartners(): Partner[] {
    return Array.from(this.partners.values())
  }

  activatePartner(partnerId: string): boolean {
    const partner = this.partners.get(partnerId)
    if (!partner) return false
    partner.status = 'active'
    return true
  }

  validatePromoCode(code: string): Partner | null {
    for (const [, partner] of this.partners) {
      if (partner.promoCode === code && partner.status === 'active') return partner
    }
    return null
  }
}

export const partnerEngine = new PartnerEngine()
