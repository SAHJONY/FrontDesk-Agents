'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Icons ───────────────────────────────────────────────────────────────────

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8"/>
  </svg>
)

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
)

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
)

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
  </svg>
)

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17h14M5 17a2 2 0 01-2-2V9a1 1 0 01.55-.9l4-2A1 1 0 018 6h8a1 1 0 01.45.1l4 2A1 1 0 0121 9v6a2 2 0 01-2 2"/><circle cx="7" cy="13" r="2"/><circle cx="17" cy="13" r="2"/>
  </svg>
)

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
  </svg>
)

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
)

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── Practice Areas Data ─────────────────────────────────────────────────────

const PRACTICE_AREAS = [
  {
    id: 'personal-injury',
    name: 'Personal Injury',
    icon: HeartIcon,
    color: 'from-rose-500 to-red-600',
    accentColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    description: 'Comprehensive AI handling for car accidents, slip and fall, medical malpractice, and workplace injuries.',
    features: [
      '24/7 accident claim intake with severity triage',
      'Insurance company negotiation handling',
      'Medical records collection and organization',
      'Client status updates and appointment scheduling',
      'Settlement payment processing inquiries',
      'Medical expert referral coordination',
      'Liens and subrogation handling',
    ],
    compliance: ['Attorney-client privilege', 'HIPAA-compliant medical intake', 'Evidence chain of custody'],
  },
  {
    id: 'family-law',
    name: 'Family Law',
    icon: UsersIcon,
    color: 'from-purple-500 to-violet-600',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Sensitive handling of divorce, custody, child support, and domestic violence matters.',
    features: [
      'Initial consultation scheduling with attorney matching',
      'Custody arrangement inquiries and modifications',
      'Child support calculation requests',
      'Court date confirmations and reminders',
      'Emergency protective order referrals',
      'Mediation appointment coordination',
      'Asset division preliminary intake',
    ],
    compliance: ['Confidential family matters', 'Secure document handling', 'ROC-compliant intake'],
  },
  {
    id: 'criminal-defense',
    name: 'Criminal Defense',
    icon: ShieldIcon,
    color: 'from-slate-500 to-slate-700',
    accentColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    description: 'Strategic intake for felonies, misdemeanors, DUI, and white-collar crime defense.',
    features: [
      'Bond/bail hearing scheduling',
      'Court appearance reminders and confirmations',
      'Attorney-client meeting coordination',
      'Case status inquiries for existing clients',
      'Public defender referral services',
      'Pretrial motion deadline tracking',
      'Sentencing guideline explanations',
    ],
    compliance: ['Attorney-client privilege', 'Innocent until proven guilty', 'Evidence handling protocols'],
  },
  {
    id: 'real-estate-law',
    name: 'Real Estate Law',
    icon: HomeIcon,
    color: 'from-amber-500 to-orange-600',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'End-to-end support for property transactions, disputes, and landlord-tenant matters.',
    features: [
      'Property closing appointment scheduling',
      'Title search and insurance inquiries',
      'Landlord-tenant dispute intake',
      'Zoning and permit consultation booking',
      'Lease agreement review requests',
      'Easement and covenant inquiries',
      'Foreclosure defense consultation',
    ],
    compliance: ['Fair housing laws', 'Closing disclosure requirements', 'RESPA compliance'],
  },
  {
    id: 'business-law',
    name: 'Business Law',
    icon: BuildingIcon,
    color: 'from-blue-600 to-indigo-700',
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/20',
    description: 'Corporate counsel coverage for formation, contracts, disputes, and M&A activities.',
    features: [
      'LLC/Corporation formation consultation booking',
      'Contract review request intake',
      'Business dispute preliminary assessment',
      'Trademark and IP consultation scheduling',
      'M&A due diligence inquiry handling',
      'Shareholder meeting coordination',
      'Compliance deadline reminders',
    ],
    compliance: ['Corporate governance', 'Securities regulations', 'Board resolution protocols'],
  },
  {
    id: 'immigration',
    name: 'Immigration Law',
    icon: GlobeIcon,
    color: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'Expert handling of visas, citizenship, deportation defense, and work permits.',
    features: [
      'Visa application status inquiries',
      'Citizenship test appointment scheduling',
      'Deportation defense consultation booking',
      'Work permit renewal reminders',
      'Immigration court date notifications',
      'BIA appeal coordination',
      'Consular processing updates',
    ],
    compliance: ['ICE compliance', 'Asylum applicant confidentiality', 'Visa petition processing'],
  },
  {
    id: 'estate-planning',
    name: 'Estate Planning',
    icon: BriefcaseIcon,
    color: 'from-cyan-500 to-blue-600',
    accentColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    description: 'Compassionate intake for wills, trusts, probate, and healthcare directives.',
    features: [
      'Will and trust consultation scheduling',
      'Probate case status inquiries',
      'Power of attorney document requests',
      'Healthcare directive planning appointments',
      'Estate tax consultation booking',
      'Trust administration coordination',
      'Beneficiary update intake',
    ],
    compliance: ['Fiduciary duty', 'Beneficiary confidentiality', 'Estate tax filing deadlines'],
  },
  {
    id: 'dui-defense',
    name: 'DUI Defense',
    icon: CarIcon,
    color: 'from-yellow-500 to-amber-600',
    accentColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    description: 'Urgent response AI for DUI/DWI charges, license hearings, and breathalyzer disputes.',
    features: [
      'Immediate attorney connection for arrests',
      'DMV hearing scheduling and preparation',
      'Bail hearing coordination',
      'Trial preparation appointments',
      'License reinstatement consultation',
      'Plea bargain option explanations',
      'Ignition interlock device inquiries',
    ],
    compliance: ['Attorney-client privilege', 'DUI statutory deadlines', 'DMV administrative procedures'],
  },
]

// ─── Industries Served ───────────────────────────────────────────────────────

const INDUSTRIES = [
  { name: 'Healthcare', icon: '🏥', desc: 'Medical malpractice, HIPAA compliance, patient disputes, malpractice claims' },
  { name: 'Real Estate', icon: '🏠', desc: 'Property transactions, landlord-tenant disputes, title issues, zoning' },
  { name: 'Automotive', icon: '🚗', desc: 'Dealership fraud, lemon law claims, accident liability, insurance disputes' },
  { name: 'Financial Services', icon: '💰', desc: 'Investment fraud, embezzlement, regulatory compliance, securities violations' },
  { name: 'Construction', icon: '🏗️', desc: 'Contractor disputes, mechanic liens, injury claims, bid protests' },
  { name: 'Hospitality', icon: '🏨', desc: 'Slip and fall claims, negligence liability, guest injury disputes' },
  { name: 'Retail', icon: '🛒', desc: 'Product liability, customer injuries, contract breaches, ADA compliance' },
  { name: 'Technology', icon: '💻', desc: 'IP theft, contract breaches, partnership disputes, data privacy violations' },
  { name: 'Manufacturing', icon: '🏭', desc: 'Product defects, workplace safety violations, environmental compliance' },
  { name: 'Insurance', icon: '🛡️', desc: 'Bad faith claims, coverage disputes, claims handling, policy cancellations' },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Partner, Mitchell & Associates',
    firm: 'Personal Injury Law',
    text: 'Our intake conversion rate jumped 45% since deploying the AI receptionist. Potential clients can schedule consultations 24/7, even when our offices are closed.',
    cases: '200+ cases handled monthly',
  },
  {
    name: 'David Chen',
    role: 'Managing Attorney',
    firm: 'Family Law Practice',
    text: 'The AI handles sensitive family law inquiries with the discretion our clients expect. It screens for emergencies and routes urgent matters instantly.',
    cases: '50+ consultations per week',
  },
  {
    name: 'Rachel Torres',
    role: 'Solo Practitioner',
    firm: 'Criminal Defense',
    text: 'As a solo attorney, I was missing calls during court. Now every potential client gets immediate attention and the AI captures all case details before I call back.',
    cases: '30+ new client intakes monthly',
  },
]

// ─── Key Features ─────────────────────────────────────────────────────────────

const KEY_FEATURES = [
  {
    icon: ClockIcon,
    title: '24/7 Client Intake',
    desc: 'Never miss a potential case. Our AI receptionist captures leads around the clock, including weekends and holidays.',
    highlight: '3x more inquiries handled',
  },
  {
    icon: ShieldIcon,
    title: 'Attorney-Client Privilege',
    desc: 'Every conversation is confidential. HIPAA-compliant intake forms, secure data handling, and privilege protection built in.',
    highlight: 'Zero data breaches',
  },
  {
    icon: PhoneIcon,
    title: 'Smart Case Routing',
    desc: 'Automatically route inquiries to the right practice area based on case type, jurisdiction, and attorney availability.',
    highlight: '98% routing accuracy',
  },
  {
    icon: DollarIcon,
    title: 'Cost-effective Operations',
    desc: 'Reduce receptionist costs by 60-80% while handling more inquiries. Scale operations without adding headcount.',
    highlight: '60-80% cost reduction',
  },
  {
    icon: FileTextIcon,
    title: 'Case Management Integration',
    desc: 'Seamlessly integrates with Clio, PracticePanther, LawPay, and other legal practice management software.',
    highlight: 'Native integrations',
  },
  {
    icon: UsersIcon,
    title: 'Multi-language Support',
    desc: 'Serve clients in Spanish, Mandarin, French, Vietnamese, and 200+ other languages with native-level fluency.',
    highlight: '200+ languages',
  },
]

// ─── How It Works Steps ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { step: 1, title: 'Connect Your Number', desc: 'Port your existing law firm number or get a new one. Setup takes under 2 hours with our white-glove onboarding.' },
  { step: 2, title: 'Configure Practice Areas', desc: 'Select which legal services you offer. Our AI learns your intake scripts, fee structures, and referral protocols.' },
  { step: 3, title: 'Go Live', desc: 'Start handling client inquiries immediately. Monitor performance and optimize responses from your dashboard.' },
]

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'How does the AI maintain attorney-client privilege?', a: 'All conversations are encrypted end-to-end. The AI is configured to clearly communicate that it is an AI assistant and that conversations may not be fully privileged. For highly sensitive matters, callers are immediately transferred to a human attorney. We also offer a HIPAA-compliant mode with additional security features.' },
  { q: 'Can the AI handle intake for multiple practice areas?', a: 'Yes! The AI can handle unlimited practice areas. It uses intelligent routing to match caller inquiries to the appropriate area of law based on keywords, phrases, and follow-up questions. You can also set custom rules for how different case types are routed.' },
  { q: 'Does it integrate with our case management software?', a: 'We integrate natively with Clio, PracticePanther, LawPay, Box, and Dropbox. Through Zapier and our REST API, we can connect to virtually any legal software. New client intake data flows automatically into your case management system.' },
  { q: 'How quickly can we go live?', a: 'Most firms go live within 2-4 hours. Our onboarding team handles the technical setup, trains the AI on your specific practice areas and intake scripts, and provides a test period to ensure everything works correctly.' },
  { q: 'What happens to calls outside business hours?', a: 'The AI handles all calls 24/7/365. Outside business hours, it can take detailed messages, schedule callbacks for the next business day, or connect callers to an on-call attorney if you offer emergency services. Urgent matters like DUI arrests can trigger immediate notifications.' },
]

// ─── Component ────────────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="text-center mb-12 md:mb-16"
    >
      <motion.h2 variants={sectionTitleVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
        {title}
      </motion.h2>
      <motion.p variants={sectionTitleVariants} className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
        {subtitle}
      </motion.p>
    </motion.div>
  )
}

function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-1 max-w-3xl mx-auto">
      {FAQS.map((faq, i) => (
        <div key={i} className="border-b border-white/[0.06] last:border-b-0">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-white/[0.02] transition-colors rounded-lg"
            aria-expanded={openIndex === i}
          >
            <span className="text-white/90 font-medium pr-4">{faq.q}</span>
            <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-500 shrink-0">
              <ChevronDownIcon />
            </motion.div>
          </button>
          <motion.div
            initial={false}
            animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 px-1 text-gray-400 text-sm leading-relaxed">{faq.a}</div>
          </motion.div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LegalPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedPracticeArea, setExpandedPracticeArea] = useState<string | null>(null)

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
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-display text-lg font-bold hidden sm:inline">GlobalVoice<span className="text-purple-400"> AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            <Link href="/pricing" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="Open menu">
            <span className="w-5 h-px bg-white/70 rounded-full" /><span className="w-5 h-px bg-white/70 rounded-full" /><span className="w-5 h-px bg-white/70 rounded-full" />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="flex flex-col items-center justify-center h-full gap-8"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white" aria-label="Close menu">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Services</a>
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Demo</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Contact</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold">Get Started</Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-400 mb-6">
              <ScaleIcon />
              <span>Specialized AI for Legal Services</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              The AI Receptionist
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">
                Built for Law Firms
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Handle client intake, case routing, and appointment scheduling 24/7 while maintaining attorney-client privilege. 
              Works for any practice area — personal injury, family law, criminal defense, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center gap-2">
                <PhoneIcon />
                Try Live Demo
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-purple-500/30 transition-all duration-300">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-14 px-4 bg-white/[0.02] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '60-80%', label: 'Cost Reduction', desc: 'Vs. traditional receptionist' },
              { value: '3x', label: 'More Inquiries', desc: 'Handled with same staff' },
              { value: '24/7', label: 'Availability', desc: 'Never miss a potential case' },
              { value: '200+', label: 'Languages', desc: 'Native-level fluency' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-4"
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-white">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Why Legal Firms Choose Our AI"
            subtitle="Enterprise-grade AI receptionist technology designed specifically for law practices."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {KEY_FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                  }}
                  className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-purple-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-medium mb-2">{feature.highlight}</div>
                  <h3 className="font-semibold text-white mb-2 font-display">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Practice Areas */}
      <section id="practice-areas" className="py-20 md:py-28 px-4 bg-white/[0.02] scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Every Practice Area, Covered"
            subtitle="Pre-configured AI receptionists for the most common legal specialties. Expand to any area of law."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRACTICE_AREAS.map((area, i) => {
              const Icon = area.icon
              const isExpanded = expandedPracticeArea === area.id
              return (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true, margin: '-40px' }}
                  className={`rounded-2xl border ${area.borderColor} ${area.bgColor} backdrop-blur-xl overflow-hidden transition-all duration-300`}
                >
                  <button
                    onClick={() => setExpandedPracticeArea(isExpanded ? null : area.id)}
                    className="w-full text-left p-6 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center text-white shrink-0`}>
                          <Icon />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white font-display text-lg">{area.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">{area.description}</p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-500 shrink-0 mt-2"
                      >
                        <ChevronDownIcon />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-white/[0.06] pt-4">
                          <h4 className="text-sm font-semibold text-white mb-3">Capabilities</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            {area.features.map((feature, j) => (
                              <div key={j} className="flex items-start gap-2 text-xs text-gray-400">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <CheckIcon />
                                </div>
                                {feature}
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {area.compliance.map((comp, k) => (
                              <span key={k} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] ${area.bgColor} ${area.accentColor} border ${area.borderColor}`}>
                                <ShieldIcon />
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Legal Services for Every Industry"
            subtitle="Any business can offer legal consultation booking, case inquiries, and attorney referrals through our AI."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {INDUSTRIES.map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-purple-500/20 hover:scale-[1.02] transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-2">{industry.icon}</div>
                <h4 className="font-semibold text-sm text-white mb-1">{industry.name}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{industry.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Universal Note */}
          <ScrollReveal delay={0.3} className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/10 to-transparent border border-purple-500/20 text-center">
            <p className="text-gray-300 text-sm max-w-2xl mx-auto">
              <span className="text-purple-400 font-semibold">Universal Legal AI:</span> The same AI receptionist that handles healthcare legal inquiries can also manage real estate, automotive, and any other industry&apos;s legal needs. One AI, infinite legal applications.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="Trusted by Law Firms Nationwide"
            subtitle="Real results from attorneys who transformed their client intake with AI."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
              >
                <QuoteIcon />
                <p className="text-sm text-gray-300 italic leading-relaxed mb-4 mt-2">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-purple-400">{t.role}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.firm}</div>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px]">
                  <CheckIcon />
                  {t.cases}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="Go Live in Hours, Not Weeks"
            subtitle="Our onboarding team handles everything. You focus on practicing law."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-400">{item.step}</span>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/40 to-transparent" />}
                <h3 className="font-semibold mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our AI receptionist for legal services."
          />
          <FaqSection />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-violet-600/5 to-purple-600/10 border border-purple-500/20 rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
                Ready to Transform Your Client Intake?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of law firms using AI to capture more leads, serve clients better, and grow their practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center gap-2">
                  <PhoneIcon />
                  Try Live Demo
                </Link>
                <Link href="/pricing" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-purple-500/30 transition-all duration-300">
                  View Pricing
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Free 14-day trial &middot; No credit card required &middot; Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <BotIcon />
                </div>
                <span className="font-bold font-display">GlobalVoice AI</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">The world&apos;s most advanced AI receptionist platform for legal services.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="/legal" className="hover:text-white transition-colors">Legal Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-gray-300 transition-colors cursor-default">About</li>
                <li className="hover:text-gray-300 transition-colors cursor-default">Blog</li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="/legal" className="hover:text-white transition-colors">Legal Services</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} GlobalVoice AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}