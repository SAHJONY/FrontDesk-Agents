'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Icons ─────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const HealthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
const LegalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
const DentalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
const RealEstateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const HVACIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/></svg>
const SpaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const AutoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a1 1 0 01.55-.9l4-2A1 1 0 018 6h8a1 1 0 01.45.1l4 2A1 1 0 0121 9v6a2 2 0 01-2 2"/><circle cx="7" cy="13" r="2"/><circle cx="17" cy="13" r="2"/><line x1="9" y1="6" x2="10" y2="10.5"/><line x1="15" y1="6" x2="14" y2="10.5"/></svg>
const InsuranceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>

// ─── Industry Data ─────────────────────────────────────────────────────────
const INDUSTRIES = [
  {
    name: 'Healthcare',
    icon: HealthIcon,
    emoji: '🏥',
    desc: 'HIPAA-compliant AI receptionists for medical practices, clinics, and urgent care centers.',
    features: [
      'Patient scheduling with insurance verification',
      'Prescription refill intake and routing',
      'Symptom triage with on-call escalation',
      'Appointment reminders via SMS and voice',
    ],
    highlight: 'HIPAA-compliant call handling with BAA support',
  },
  {
    name: 'Legal',
    icon: LegalIcon,
    emoji: '⚖️',
    desc: '50-state legal intake with conflict checking and statute-of-limitations tracking.',
    features: [
      '24/7 client intake with conflict-check integration',
      'Statute-of-limitations deadline tracking',
      'Emergency call routing to on-call attorneys',
      'Verbatim call transcripts for case files',
    ],
    highlight: 'Real-time case law lookup across all 94 federal districts',
  },
  {
    name: 'Dental',
    icon: DentalIcon,
    emoji: '🦷',
    desc: 'Appointment management, insurance verification, and emergency triage for dental practices.',
    features: [
      'Automated appointment booking and rescheduling',
      'Dental insurance verification and pre-auth',
      'Emergency pain triage with priority routing',
      'Hygiene recall and follow-up reminders',
    ],
    highlight: 'Emergency patients connected to on-call dentists within 90 seconds',
  },
  {
    name: 'Real Estate',
    icon: RealEstateIcon,
    emoji: '🏠',
    desc: 'Property inquiry handling, showing scheduling, and agent routing for brokerages.',
    features: [
      'Property inquiry capture with buyer qualification',
      'Showing calendar integration and scheduling',
      'Agent routing by specialty and availability',
      'Open house registration and follow-up',
    ],
    highlight: '3x more showings booked with 24/7 inquiry handling',
  },
  {
    name: 'HVAC & Home Services',
    icon: HVACIcon,
    emoji: '🔧',
    desc: 'Emergency dispatch, service scheduling, and estimate requests for contractors.',
    features: [
      'Emergency call triage with instant dispatch',
      'Service area validation and technician routing',
      'Estimate requests with job detail capture',
      'Seasonal maintenance reminder campaigns',
    ],
    highlight: 'Emergency calls routed to on-call techs in under 30 seconds',
  },
  {
    name: 'Medical Spa',
    icon: SpaIcon,
    emoji: '💆',
    desc: 'Treatment booking, consultation scheduling, and membership management for med spas.',
    features: [
      'Treatment menu navigation and booking',
      'Consultation scheduling with provider matching',
      'Membership and package upsells during calls',
      'Pre-appointment instructions and reminders',
    ],
    highlight: 'Average 34% increase in upsells during AI-handled calls',
  },
  {
    name: 'Automotive',
    icon: AutoIcon,
    emoji: '🚗',
    desc: 'Service appointment booking, sales inquiry handling, and test drive scheduling.',
    features: [
      'Service appointment booking with VIN capture',
      'Sales lead qualification and test drive scheduling',
      'Parts inquiry and availability checking',
      'Recall notification and service campaign outreach',
    ],
    highlight: 'Service bay utilization improved by 22% with automated scheduling',
  },
  {
    name: 'Insurance',
    icon: InsuranceIcon,
    emoji: '🛡️',
    desc: 'Claims intake, policy inquiry handling, and agent connection for insurance agencies.',
    features: [
      'First notice of loss (FNOL) intake automation',
      'Policy inquiry with coverage verification',
      'Agent routing by line of business',
      'Renewal reminders and cross-sell campaigns',
    ],
    highlight: 'Claims intake processed 24/7 with complete documentation',
  },
]

// ─── Animation Variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function IndustriesPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-deep-space text-white font-sans overflow-x-hidden">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-aurora-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-deep-space/80 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-display text-lg font-bold text-white hidden sm:inline">FrontDesk Agents AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/ai-receptionist" className="text-sm text-gray-300 hover:text-white transition-colors">Legal AI</a>
            <a href="/partners" className="text-sm text-gray-300 hover:text-white transition-colors">Partners</a>
            <a href="/industries" className="text-sm text-aurora-cyan hover:text-white transition-colors">Industries</a>
            <a href="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</a>
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            <Link href="/pricing" className="px-4 py-2 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">Get Started</Link>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <motion.div animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-full h-0.5 bg-white rounded-full" />
              <motion.div animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-full h-0.5 bg-white rounded-full" />
              <motion.div animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-full h-0.5 bg-white rounded-full" />
            </div>
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden overflow-hidden border-t border-white/[0.06] bg-deep-space/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-1">
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Pricing</a>
                <a href="/ai-receptionist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Legal AI</a>
                <a href="/partners" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Partners</a>
                <a href="/industries" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-aurora-cyan hover:text-white hover:bg-white/[0.05] transition-all">Industries</a>
                <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Blog</a>
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Demo</a>
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Services</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Contact</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 mt-2 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium text-center">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-aurora-cyan/10 via-transparent to-purple-600/10 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs font-medium uppercase tracking-wider mb-6">
              Industry Solutions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Built for{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-blue-400 to-purple-400 bg-clip-text text-transparent">Every Industry</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
              Purpose-built AI phone agents trained on your industry&apos;s terminology, workflows, and compliance requirements. From HIPAA to 50-state legal intake.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── INDUSTRY CARDS ─── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-aurora-cyan/30 hover:bg-white/[0.05] hover:scale-[1.02] hover:shadow-lg hover:shadow-aurora-cyan/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{ind.emoji}</span>
                  <h3 className="font-semibold text-lg">{ind.name}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{ind.desc}</p>
                <ul className="space-y-2 mb-4">
                  {ind.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-aurora-cyan mt-0.5 shrink-0"><CheckIcon /></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-aurora-cyan font-medium uppercase tracking-wider">{ind.highlight}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-purple-600/5 to-aurora-cyan/10 border border-aurora-cyan/20 rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-aurora-cyan/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">Don&apos;t See Your Industry?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                FrontDesk Agents AI adapts to any business. Our AI learns your terminology and workflows in hours, not weeks. Book a demo to see your industry in action.
              </p>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
              >
                Book Your Industry Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                  <BotIcon />
                </div>
                <span className="font-display text-lg font-bold text-white">FrontDesk Agents AI</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">AI phone agents that handle calls, book appointments, and qualify leads — automatically.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/services" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/industries" className="hover:text-white transition-colors">Industries</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/partners" className="hover:text-white transition-colors">Partners</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} FrontDesk Agents AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
