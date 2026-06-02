'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── ICONS ──────────────────────────────────────────

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
)
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
)
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
)
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
)
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
)
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
)
const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
)

// ─── DATA ───────────────────────────────────────────

const PARTNER_TIERS = [
  {
    name: 'Bronze',
    icon: '🥉',
    commission: '10%',
    minRevenue: '$0',
    gradient: 'from-amber-600 to-amber-800',
    features: ['Standard commission rate', 'Partner dashboard access', 'Email support', 'Co-branded landing page', 'Monthly partner newsletter'],
  },
  {
    name: 'Silver',
    icon: '🥈',
    commission: '15%',
    minRevenue: '$5,000',
    gradient: 'from-gray-300 to-gray-500',
    features: ['Everything in Bronze', 'Priority support', 'Dedicated partner manager', 'Co-branded case studies', 'Joint webinar opportunities', 'Lead sharing program'],
  },
  {
    name: 'Gold',
    icon: '🥇',
    commission: '20%',
    minRevenue: '$20,000',
    gradient: 'from-amber-400 to-yellow-600',
    features: ['Everything in Silver', 'White-label option', 'Custom demo environment', 'Market development funds', 'Exclusive territory rights', 'Quarterly business reviews'],
  },
  {
    name: 'Platinum',
    icon: '💎',
    commission: '25%',
    minRevenue: '$50,000',
    gradient: 'from-aurora-cyan to-blue-600',
    features: ['Everything in Gold', 'Full white-label with your brand', 'API access for custom integrations', 'Co-development opportunities', 'Revenue sharing on renewals', 'VIP partner events access'],
  },
]

const PARTNER_TYPES = [
  {
    icon: '⚖️',
    name: 'Legal Tech Agencies',
    desc: 'Marketing agencies and consultants serving law firms. White-label our FrontDesk Agents AI as your own AI receptionist — covering 50 states and 94 federal districts.',
    opportunity: '20+ law firm clients/year',
  },
  {
    icon: '🏢',
    name: 'Law Firm Consultants',
    desc: 'Practice management consultants who advise law firms on operations. Add AI receptionist to your service portfolio with zero technical overhead.',
    opportunity: '10–15 firms/year',
  },
  {
    icon: '🤝',
    name: 'SaaS Onboarding Firms',
    desc: 'Companies specializing in legal tech implementation. Integrate FrontDesk Agents AI into your onboarding stack — we handle the AI, you handle the client.',
    opportunity: '15–30 clients/year',
  },
  {
    icon: '📱',
    name: 'Individual Affiliates',
    desc: 'Law firm owners, attorneys, and legal influencers. Refer firms in your network and earn commission on every signup — no minimum commitment.',
    opportunity: 'Unlimited referrals',
  },
]

const BENEFITS = [
  { icon: DollarIcon, title: 'Tiered Commissions', desc: 'Earn 10–25% recurring commission based on your partner tier. Commission paid monthly with transparent reporting.' },
  { icon: ShieldIcon, title: 'White-Label Ready', desc: 'Gold and Platinum partners get fully white-labeled AI receptionists with your brand, logo, and custom domain.' },
  { icon: TrendingUpIcon, title: 'Co-Branded Materials', desc: 'Sales decks, case studies, demo videos, and landing pages — all co-branded and ready to use in your outreach.' },
  { icon: UsersIcon, title: 'Dedicated Support', desc: 'Silver+ partners get a dedicated partner manager. Priority email, chat, and quarterly strategy reviews.' },
  { icon: GlobeIcon, title: 'Market Development', desc: 'Gold+ partners receive market development funds for joint events, webinars, and co-marketing campaigns.' },
  { icon: BotIcon, title: 'Demo Environment', desc: 'Access to custom demo accounts pre-loaded with legal scenarios, so you can showcase the AI in action to prospects.' },
]

const REFERRAL_INFO = [
  { title: 'Cash Payouts', desc: 'Earn $1,000 cash for every law firm you refer that signs up for an annual plan.' },
  { title: 'Service Credits', desc: 'Or choose 3 months of free service on your own account — perfect for firms already using FrontDesk Agents AI.' },
  { title: 'Tracked Automatically', desc: 'Use your unique referral link or promo code. Our system tracks conversions and pays out automatically.' },
  { title: 'Top Referrer Recognition', desc: 'Featured in case studies, partner spotlights, and our monthly newsletter. Build your authority in legal tech.' },
]

// ─── ANIMATION ──────────────────────────────────────

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] } }) }

// ─── PAGE ───────────────────────────────────────────

export default function PartnersPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTier, setActiveTier] = useState(3) // Platinum by default

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-deep-space text-white font-body overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-aurora-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-bold text-lg hidden sm:inline">FrontDesk Agents AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/ai-receptionist" className="text-sm text-gray-300 hover:text-white transition-colors">Legal AI</a>
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/partners" className="text-sm text-aurora-cyan hover:text-white transition-colors">Partners</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            <Link href="/pricing" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all hover:scale-105">
              Get Started
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="Open menu">
            <span className="w-5 h-px bg-white/70 rounded-full" /><span className="w-5 h-px bg-white/70 rounded-full" /><span className="w-5 h-px bg-white/70 rounded-full" />
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl md:hidden" onClick={() => setMobileMenuOpen(false)}>
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="flex flex-col items-center justify-center h-full gap-8" onClick={e => e.stopPropagation()}>
                <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white" aria-label="Close menu"><XIcon /></button>
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Services</a>
                <a href="/ai-receptionist" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Legal AI</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="/partners" onClick={() => setMobileMenuOpen(false)} className="text-xl text-aurora-cyan transition-colors">Partners</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Contact</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold">Get Started</Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-cyan/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-aurora-cyan/8 rounded-full blur-3xl animate-float" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Partner & Reseller Program
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              Grow With{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-aurora-cyan/70 to-aurora-cyan/40 bg-clip-text text-transparent">
                FrontDesk Agents AI
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Join our partner ecosystem and earn up to 25% recurring commission. White-label FrontDesk Agents AI
              — the AI receptionist built for law firms, covering all 50 states and 94 federal districts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#apply" className="px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
                Apply as Partner
              </a>
              <a href="#referral" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300">
                Refer a Firm → $1,000
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PARTNER METRICS ─── */}
      <section className="py-14 px-4 bg-white/[0.02] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '25%', label: 'Max Commission' },
              { value: '4', label: 'Partner Tiers' },
              { value: '$50K+', label: 'Top Partner Earnings' },
              { value: '30-Day', label: 'Payout Cycle' },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center p-4">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-aurora-cyan via-aurora-cyan/80 to-aurora-cyan/60 bg-clip-text text-transparent">{m.value}</div>
                <div className="text-sm text-gray-400 mt-2 font-medium tracking-wide uppercase">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMISSION TIERS ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">Commission Tiers</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto">
              Earn more as you grow. Our tiered commission structure rewards partners who bring the most value.
            </motion.p>
          </motion.div>

          {/* Tier Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {PARTNER_TIERS.map((tier, i) => (
              <button key={i} onClick={() => setActiveTier(i)} className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTier === i
                  ? `bg-gradient-to-r ${tier.gradient} text-white shadow-lg scale-105`
                  : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}>
                {tier.icon} {tier.name}
              </button>
            ))}
          </div>

          {/* Active Tier Card */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto p-8 rounded-2xl border border-aurora-cyan/20 bg-gradient-to-br from-aurora-cyan/[0.04] via-transparent to-purple-600/[0.02]">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${PARTNER_TIERS[activeTier].gradient} flex items-center justify-center text-4xl shrink-0`}>
                  {PARTNER_TIERS[activeTier].icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold font-display">{PARTNER_TIERS[activeTier].name}</h3>
                    <span className="px-3 py-1 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-xs text-aurora-cyan">{activeTier === 3 ? 'Top Tier' : `Tier ${activeTier + 1}`}</span>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-aurora-cyan to-aurora-cyan/60 bg-clip-text text-transparent mb-2">{PARTNER_TIERS[activeTier].commission}</div>
                  <div className="text-sm text-gray-500 mb-4">Commission rate · Min revenue: {PARTNER_TIERS[activeTier].minRevenue}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PARTNER_TIERS[activeTier].features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckIcon /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── WHO SHOULD PARTNER ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">Who Should Partner With Us</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto">
              Our program is built for professionals who serve the legal industry. Bring our AI to your existing client base.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {PARTNER_TYPES.map((pt, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">{pt.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold font-display mb-2">{pt.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{pt.desc}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                      <TrendingUpIcon /> {pt.opportunity}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">Partner Benefits</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto">Everything you need to succeed — from white-label infrastructure to co-branded sales materials.</motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                  className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 hover:scale-[1.01] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-4 text-aurora-cyan group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  <h3 className="font-semibold font-display mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{b.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── REFERRAL PROGRAM ─── */}
      <section id="referral" className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Refer a Law Firm — Earn $1,000
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto">
              Not ready for a full partnership? Refer law firms in your network and earn cash for every signup.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {REFERRAL_INFO.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
                    <CheckIcon />
                  </div>
                  <h3 className="font-semibold font-display">{r.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 p-8 rounded-2xl border border-aurora-cyan/20 bg-gradient-to-br from-aurora-cyan/5 to-transparent text-center">
            <h3 className="text-2xl font-bold font-display mb-2">Referral leads convert at 40%+</h3>
            <p className="text-gray-400 mb-6">Our highest-ROI channel. Referred firms onboard faster, stay longer, and upgrade sooner.</p>
            <a href="#apply" className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
              Refer a Firm Now
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── APPLY ─── */}
      <section id="apply" className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">Apply to Partner</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400">Fill out the form below and our partnership team will reach out within 24 hours.</motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
            <form onSubmit={e => e.preventDefault()} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-all" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Company Name *</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-all" placeholder="Your company" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email *</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-all" placeholder="you@company.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Partner Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-aurora-cyan/50 transition-all">
                    <option value="" className="bg-deep-space">Select type</option>
                    <option value="agency" className="bg-deep-space">Legal Tech Agency</option>
                    <option value="consultant" className="bg-deep-space">Law Firm Consultant</option>
                    <option value="reseller" className="bg-deep-space">SaaS Onboarding / Reseller</option>
                    <option value="affiliate" className="bg-deep-space">Individual Affiliate</option>
                    <option value="referral" className="bg-deep-space">Referral Only ($1,000)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tell us about your business and existing client base</label>
                <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-all resize-none" placeholder="How many law firms do you serve? What services do you currently provide?" />
              </div>
              <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all">
                Submit Application
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-14 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center"><BotIcon /></div>
                <span className="font-bold font-display">FrontDesk Agents AI</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">The world&apos;s most advanced AI receptionist platform. Available 24/7 in 200+ languages.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/ai-receptionist" className="hover:text-white transition-colors">Legal AI</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/partners" className="hover:text-aurora-cyan transition-colors">Partners</Link></li>
                <li className="hover:text-gray-300 transition-colors cursor-default">About</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} FrontDesk Agents AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
