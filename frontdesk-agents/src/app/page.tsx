'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'

// ─── Icons ─────────────────────────────────────────────────────────────────
const Bot = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect width='16' height='16' x='4' y='4' rx='2'/><path d='M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8'/></svg>
const Globe = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'/></svg>
const Clock = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>
const Headphones = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 18v-6a9 9 0 0118 0v6'/><path d='M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z'/></svg>
const Star = () => <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
const Check = () => <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M20 6L9 17l-5-5'/></svg>
const X = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M18 6L6 18M6 6l12 12'/></svg>
const PhoneIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z'/></svg>
const QuoteIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='currentColor' opacity='0.15'><path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z'/></svg>

// ─── Data ───────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Globe, title: '200+ Languages', desc: 'Native-level understanding in every major language worldwide' },
  { icon: Clock, title: '24/7/365 Availability', desc: 'Never miss a call — holidays, weekends, midnight — we are always on' },
  { icon: Headphones, title: 'Human-like Voice', desc: 'Advanced neural voices customers cannot distinguish from humans' },
  { icon: Bot, title: 'Smart Escalation', desc: 'Instantly transfers to your team when a human touch is needed' },
]

const HealthIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M22 12h-4l-3 9L9 3l-3 9H2'/></svg>
const LegalIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>
const DentalIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M8 14s1.5 2 4 2 4-2 4-2'/><line x1='9' y1='9' x2='9.01' y2='9'/><line x1='15' y1='9' x2='15.01' y2='9'/></svg>
const RealEstateIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>
const HVACIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 2v20M2 12h20'/><circle cx='12' cy='12' r='4'/><circle cx='12' cy='12' r='8'/></svg>
const SpaIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>
const AutoIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M5 17h14M5 17a2 2 0 01-2-2V9a1 1 0 01.55-.9l4-2A1 1 0 018 6h8a1 1 0 01.45.1l4 2A1 1 0 0121 9v6a2 2 0 01-2 2'/><circle cx='7' cy='13' r='2'/><circle cx='17' cy='13' r='2'/><line x1='9' y1='6' x2='10' y2='10.5'/><line x1='15' y1='6' x2='14' y2='10.5'/></svg>
const InsuranceIcon = () => <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/><path d='M9 12l2 2 4-4'/></svg>

const INDUSTRIES = [
  { name: 'Healthcare', icon: HealthIcon, desc: 'Patient scheduling, prescription refills, insurance verification' },
  { name: 'Legal', icon: LegalIcon, desc: 'Client intake, case status updates, consultation booking' },
  { name: 'Dental', icon: DentalIcon, desc: 'Appointment management, insurance checks, emergency triage' },
  { name: 'Real Estate', icon: RealEstateIcon, desc: 'Property inquiries, showing scheduling, agent routing' },
  { name: 'HVAC', icon: HVACIcon, desc: 'Emergency dispatch, service scheduling, estimate requests' },
  { name: 'Medical Spa', icon: SpaIcon, desc: 'Booking management, treatment info, follow-up calls' },
  { name: 'Automotive', icon: AutoIcon, desc: 'Service appointments, sales inquiries, test drive booking' },
  { name: 'Insurance', icon: InsuranceIcon, desc: 'Claims intake, policy inquiries, agent connection' },
]

const PRICING_PLANS = [
  { name: 'Starter', price: '$99', desc: 'Perfect for small businesses', features: ['500 calls/month', '1 phone number', 'Basic analytics', 'Email support'], cta: 'Start Free Trial', popular: false },
  { name: 'Growth', price: '$149', desc: 'For growing businesses', features: ['2,000 calls/month', '3 phone numbers', 'Advanced analytics', 'Priority support', 'Custom voice'], cta: 'Start Free Trial', popular: true },
  { name: 'Pro', price: '$299', desc: 'For high-volume businesses', features: ['Unlimited calls', '10 phone numbers', 'Real-time dashboard', 'API access', 'Dedicated support', 'Multi-language'], cta: 'Start Free Trial', popular: false },
]

const TESTIMONIALS = [
  { name: 'Dr. Sarah Chen', role: 'Dental Practice Owner', text: 'GlobalVoice handles 200+ patient calls daily. Our front desk can finally focus on patient care instead of the phone.', rating: 5, company: 'BrightSmile Dental' },
  { name: 'Mike Rodriguez', role: 'Law Firm Partner', text: 'We never miss a potential client call. The AI qualifies leads with uncanny accuracy before they even reach us.', rating: 5, company: 'Rodriguez & Associates' },
  { name: 'James Wilson', role: 'HVAC Company Owner', text: 'Emergency calls get routed instantly to our on-call team. Revenue increased 40% since we deployed GlobalVoice.', rating: 5, company: 'Wilson HVAC Services' },
  { name: 'Lisa Park', role: 'Real Estate Broker', text: 'Property inquiries are handled 24/7. We book 3x more showings now — even while we sleep.', rating: 5, company: 'Park Realty Group' },
  { name: 'Dr. Amir Patel', role: 'Medical Practice Owner', text: 'Patient satisfaction scores jumped 25 points. The AI handles scheduling, refills, and FAQs flawlessly.', rating: 5, company: 'Patel Medical Clinic' },
  { name: 'Tom Harrison', role: 'Insurance Agency Owner', text: 'Claims intake is fully automated. Our agents only take calls that need a human touch. Game changer.', rating: 5, company: 'Harrison Insurance' },
]

const METRICS = [
  { value: '25M+', suffix: '', label: 'Calls Handled', decimals: 0 },
  { value: '10K+', suffix: '', label: 'Active Businesses', decimals: 0 },
  { value: '200+', suffix: '', label: 'Languages Supported', decimals: 0 },
  { value: '4.9', suffix: '/5', label: 'Average Rating', decimals: 1 },
]

const TRUST_CLIENTS = [
  'TechCorp', 'MedGroup', 'LawFirm+', 'RealtyHub', 'DentalPro', 'InsureCo',
  'CloudBase', 'GreenLeaf', 'PrimeAuto', 'EliteSpa', 'BuildRight', 'SwiftLogistics',
]

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', decimals = 0, prefix = '' }: { target: string; suffix?: string; decimals?: number; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  const numericPart = parseFloat(target.replace(/[^0-9.]/g, '')) || 0
  const displaySuffix = target.replace(/[0-9.]/g, '')

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 2000
          const steps = 30
          const increment = numericPart / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= numericPart) {
              setCount(numericPart)
              clearInterval(timer)
            } else {
              setCount(current)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [numericPart, hasAnimated])

  const display = decimals === 0 ? Math.round(count) : count.toFixed(decimals)

  return (
    <div ref={ref} className='text-4xl md:text-5xl font-bold'>
      <span className='bg-gradient-to-r from-aurora-cyan via-aurora-cyan/80 to-aurora-cyan/60 bg-clip-text text-transparent'>
        {prefix}{display}{displaySuffix}{suffix}
      </span>
    </div>
  )
}

function ScrollReveal({ children, className = '', direction = 'up', delay = 0 }: { children: React.ReactNode; className?: string; direction?: 'up' | 'left' | 'right' | 'scale'; delay?: number }) {
  const variants = {
    up: fadeUp,
    left: fadeLeft,
    right: fadeRight,
    scale: scaleIn,
  }
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-80px' }}
      variants={variants[direction]}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-60px' }}
      className='text-center mb-14 md:mb-16'
    >
      <motion.h2 variants={sectionTitleVariants} className='text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4'>
        {title}
      </motion.h2>
      <motion.p variants={sectionTitleVariants} className='text-gray-400 max-w-2xl mx-auto text-base md:text-lg'>
        {subtitle}
      </motion.p>
    </motion.div>
  )
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const next = useCallback(() => setCurrent(p => (p + 1) % TESTIMONIALS.length), [])
  const prev = useCallback(() => setCurrent(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), [])

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(next, 4500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, next])

  return (
    <div
      className='relative max-w-3xl mx-auto'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='overflow-hidden rounded-2xl'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className='p-8 md:p-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl'
          >
            <QuoteIcon />
            <p className='text-base md:text-lg text-gray-200 leading-relaxed mb-6 italic'>
              &ldquo;{TESTIMONIALS[current].text}&rdquo;
            </p>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex gap-1 mb-1'>
                  {Array.from({ length: TESTIMONIALS[current].rating }).map((_, j) => (
                    <span key={j} className='text-hollywood-gold'><Star /></span>
                  ))}
                </div>
                <div className='font-semibold text-sm'>{TESTIMONIALS[current].name}</div>
                <div className='text-xs text-gray-500'>{TESTIMONIALS[current].role} · {TESTIMONIALS[current].company}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className='flex items-center justify-center gap-2 mt-6'>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-aurora-cyan w-6'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button onClick={prev} className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-aurora-cyan/30 transition-all' aria-label='Previous testimonial'>
        <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 18l-6-6 6-6'/></svg>
      </button>
      <button onClick={next} className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-aurora-cyan/30 transition-all' aria-label='Next testimonial'>
        <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M9 18l6-6-6-6'/></svg>
      </button>
    </div>
  )
}

function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <section ref={ref} className='relative py-20 md:py-28 px-4 overflow-hidden'>
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className='absolute inset-0'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-aurora-cyan/8 via-transparent to-transparent' />
        <div className='absolute top-1/2 left-1/3 w-64 h-64 bg-aurora-cyan/5 rounded-full blur-3xl' />
        <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl' />
      </motion.div>

      <div className='max-w-6xl mx-auto relative'>
        <SectionHeading title='Trusted by Thousands' subtitle='Real results from businesses around the world' />

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'
        >
          {METRICS.map((m, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] } },
              }}
              className='text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:border-aurora-cyan/20 hover:bg-white/[0.05] transition-all duration-500'
            >
              <AnimatedCounter target={m.value} suffix={m.suffix} decimals={m.decimals} />
              <div className='text-sm text-gray-400 mt-2 font-medium tracking-wide uppercase'>{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TrustBar() {
  return (
    <section className='py-14 border-y border-white/5 overflow-hidden'>
      <p className='text-center text-sm text-gray-500 mb-8 tracking-widest uppercase'>Trusted by leading businesses worldwide</p>
      <div className='relative'>
        {/* Gradient fade edges */}
        <div className='absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-deep-space to-transparent z-10' />
        <div className='absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-deep-space to-transparent z-10' />
        <div className='flex carousel-track' style={{ width: `${TRUST_CLIENTS.length * 2 * 8}rem` }}>
          {[...TRUST_CLIENTS, ...TRUST_CLIENTS].map((name, i) => (
            <div
              key={i}
              className='flex-shrink-0 w-32 flex items-center justify-center'
            >
              <span className='text-sm md:text-lg font-bold text-gray-500/40 hover:text-gray-400/60 transition-colors whitespace-nowrap'>
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [leadFormData, setLeadFormData] = useState({ name: '', email: '', phone: '', business: '', industry: '', employees: '' })
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [leadScore, setLeadScore] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { language, setLanguage, languages } = useTranslation()

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLeadSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: leadFormData.business,
          email: leadFormData.email,
          phone: leadFormData.phone,
          industry: leadFormData.industry,
          employeeCount: parseInt(leadFormData.employees) || 0,
          source: 'organic',
          urgency: 'medium',
        }),
      })
      const data = await res.json()
      setLeadScore(data.lead?.score ?? null)
      setLeadSubmitted(true)
    } catch {
      setLeadSubmitted(true)
    }
  }, [leadFormData])

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showMobileMenu])

  return (
    <div className='min-h-screen bg-deep-space text-white font-body'>
      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center'>
              <Bot />
            </div>
            <span className='font-bold text-lg hidden sm:inline'>GlobalVoice AI</span>
          </div>

          {/* Desktop nav */}
          <div className='hidden md:flex items-center gap-8'>
            <a href='#industries' className='text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full'>Industries</a>
            <a href='#features' className='text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full'>Features</a>
            <a href='#pricing' className='text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full'>Pricing</a>
            <a href='/demo' className='text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full'>Demo</a>
            <a href='/services' className='text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full'>Services</a>
            <a href='/contact' className='text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full'>Contact</a>
            <a href='/pricing' className='px-5 py-2.5 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all hover:scale-105'>
              Get Started
            </a>
          </div>

          <div className='flex items-center gap-3'>
            <select value={language} onChange={e => setLanguage(e.target.value as any)} className='bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white' aria-label='Select language'>
              {Object.values(languages).map((l: any) => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
            </select>

            {/* Hamburger */}
            <button onClick={() => setShowMobileMenu(true)} className='md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors' aria-label='Open menu'>
              <span className='w-5 h-px bg-white/70 rounded-full' />
              <span className='w-5 h-px bg-white/70 rounded-full' />
              <span className='w-5 h-px bg-white/70 rounded-full' />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 bg-black/95 backdrop-blur-xl md:hidden'
              onClick={() => setShowMobileMenu(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className='flex flex-col items-center justify-center h-full gap-8'
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setShowMobileMenu(false)} className='absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white' aria-label='Close menu'>
                  <X />
                </button>
                <a href='#industries' onClick={() => setShowMobileMenu(false)} className='text-xl text-gray-300 hover:text-white transition-colors'>Industries</a>
                <a href='#features' onClick={() => setShowMobileMenu(false)} className='text-xl text-gray-300 hover:text-white transition-colors'>Features</a>
                <a href='#pricing' onClick={() => setShowMobileMenu(false)} className='text-xl text-gray-300 hover:text-white transition-colors'>Pricing</a>
                <a href='/demo' onClick={() => setShowMobileMenu(false)} className='text-xl text-gray-300 hover:text-white transition-colors'>Demo</a>
                <a href='/services' onClick={() => setShowMobileMenu(false)} className='text-xl text-gray-300 hover:text-white transition-colors'>Services</a>
                <a href='/contact' onClick={() => setShowMobileMenu(false)} className='text-xl text-gray-300 hover:text-white transition-colors'>Contact</a>
                <a href='/pricing' onClick={() => setShowMobileMenu(false)} className='px-8 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold'>
                  Get Started
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ───── */}
      <section ref={heroRef} className='relative min-h-screen flex items-center pt-20 pb-20 px-4 overflow-hidden'>
        {/* Parallax gradient orbs */}
        <motion.div style={{ y: heroParallaxY }} className='absolute inset-0'>
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-cyan/20 via-transparent to-transparent' />
          <div className='absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-aurora-cyan/12 rounded-full blur-3xl animate-float' />
          <div className='absolute bottom-1/3 right-1/4 w-[24rem] h-[24rem] bg-neon-purple/8 rounded-full blur-3xl animate-float' style={{ animationDelay: '-3s' }} />
          <div className='absolute top-1/3 right-1/3 w-48 h-48 bg-aurora-cyan/6 rounded-full blur-2xl animate-pulse-gold' />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className='max-w-5xl mx-auto text-center relative'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-sm text-aurora-cyan/80 mb-8'
            >
              <span className='w-2 h-2 rounded-full bg-emerald-400 animate-glow' />
              AI Receptionist — Available Now
            </motion.div>

            <h1 className='text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.05] mb-6'>
              Never Miss Another{' '}
              <span className='bg-gradient-to-r from-aurora-cyan via-aurora-cyan/70 to-aurora-cyan/40 bg-clip-text text-transparent'>Call</span>
              <br />
              <span className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-400 font-normal'>
                With Your AI Receptionist
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className='text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed'
            >
              GlobalVoice AI answers every call 24/7 in 200+ languages, routes intelligently,
              and books appointments automatically. Your business never sleeps.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className='flex flex-col sm:flex-row gap-4 justify-center items-center'
            >
              <button
                onClick={() => setShowLeadForm(true)}
                className='group relative px-8 py-4 rounded-full font-semibold text-lg overflow-hidden'
              >
                <span className='absolute inset-0 bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 transition-transform group-hover:scale-105' />
                <span className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-aurora-cyan via-cyan-400 to-aurora-cyan/80 animate-gradient-shift' />
                <span className='relative z-10'>Get Started Free</span>
              </button>
              <button
                onClick={() => setShowDemo(true)}
                className='px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300 flex items-center gap-2 group'
              >
                <span className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-aurora-cyan/20 transition-colors'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='currentColor'><polygon points='5 3 19 12 5 21 5 3' /></svg>
                </span>
                Watch Demo
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className='absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2'
        >
          <span className='text-xs text-gray-600 tracking-widest uppercase'>Scroll</span>
          <div className='w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5'>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className='w-1 h-1.5 rounded-full bg-aurora-cyan/60'
            />
          </div>
        </motion.div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <TrustBar />

      {/* ─── METRICS ─── */}
      <MetricsSection />

      {/* ─── INDUSTRIES ─── */}
      <section id='industries' className='py-20 md:py-28 px-4'>
        <div className='max-w-7xl mx-auto'>
          <SectionHeading title='Built for Every Industry' subtitle='Industry-specific AI agents trained on your terminology, workflows, and compliance requirements.' />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
          >
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                }}
                className='group p-6 rounded-2xl border border-white/[0.06] hover:border-aurora-cyan/30 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:scale-[1.02] hover:shadow-lg hover:shadow-aurora-cyan/5 transition-all duration-300 cursor-pointer'
              >
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-3 text-aurora-cyan group-hover:scale-110 transition-transform duration-300'>
                  <ind.icon />
                </div>
                <h3 className='font-semibold mb-1'>{ind.name}</h3>
                <p className='text-sm text-gray-500 group-hover:text-gray-400 transition-colors'>{ind.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id='features' className='py-20 md:py-28 px-4 bg-white/[0.02]'>
        <div className='max-w-7xl mx-auto'>
          <SectionHeading title='Why GlobalVoice AI?' subtitle='Enterprise-grade AI receptionist technology that rivals human operators.' />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
          >
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                  }}
                  className='group p-6 rounded-2xl border border-white/[0.06] hover:border-aurora-cyan/30 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:scale-[1.02] hover:shadow-lg hover:shadow-aurora-cyan/5 transition-all duration-300'
                >
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-4 text-aurora-cyan group-hover:scale-110 transition-transform duration-300'>
                    <Icon />
                  </div>
                  <h3 className='font-semibold mb-2'>{feat.title}</h3>
                  <p className='text-sm text-gray-500 group-hover:text-gray-400 transition-colors'>{feat.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id='pricing' className='py-20 md:py-28 px-4'>
        <div className='max-w-7xl mx-auto'>
          <SectionHeading title='Simple, Transparent Pricing' subtitle='Start with a 14-day free trial. No credit card required. Cancel anytime.' />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'
          >
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                }}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'border-aurora-cyan/40 bg-aurora-cyan/5 shadow-xl shadow-aurora-cyan/10'
                    : 'border-white/[0.06] bg-white/[0.03] backdrop-blur-xl'
                } hover:border-aurora-cyan/50 hover:scale-[1.02] hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-xs font-semibold shadow-lg shadow-aurora-cyan/20'
                  >
                    Most Popular
                  </motion.div>
                )}
                <h3 className='text-xl font-bold mb-1'>{plan.name}</h3>
                <div className='text-3xl font-bold mb-2'>{plan.price}<span className='text-sm font-normal text-gray-500'>/mo</span></div>
                <p className='text-sm text-gray-500 mb-6'>{plan.desc}</p>
                <ul className='space-y-3 mb-8'>
                  {plan.features.map((f, j) => (
                    <li key={j} className='flex items-center gap-2 text-sm text-gray-300'>
                      <span className='text-green-400 flex-shrink-0'><Check /></span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href='/pricing'
                  className={`block text-center py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white hover:shadow-lg hover:shadow-aurora-cyan/20'
                      : 'border border-white/20 text-white hover:bg-white/5 hover:border-aurora-cyan/30'
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className='py-20 md:py-28 px-4 bg-white/[0.02]'>
        <div className='max-w-5xl mx-auto text-center'>
          <SectionHeading title='Loved by Business Owners' subtitle='Hear from businesses that transformed their phone operations.' />
          <TestimonialCarousel />
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className='relative py-24 md:py-32 px-4 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-aurora-cyan/10 via-transparent to-transparent' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-aurora-cyan/5 rounded-full blur-3xl' />

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          className='max-w-3xl mx-auto text-center relative'
        >
          <motion.h2 variants={fadeUp} className='text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-6'>
            Ready to Never Miss a Call Again?
          </motion.h2>
          <motion.p variants={fadeUp} className='text-gray-400 mb-10 text-lg'>
            Join 10,000+ businesses using GlobalVoice AI. Start your 14-day free trial today.
          </motion.p>
          <motion.div variants={fadeUp}>
            <button
              onClick={() => setShowLeadForm(true)}
              className='px-10 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105'
            >
              Start Free Trial
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className='py-14 px-4 border-t border-white/10'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-10'>
            <div className='col-span-2 md:col-span-1'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center'>
                  <Bot />
                </div>
                <span className='font-bold'>GlobalVoice AI</span>
              </div>
              <p className='text-sm text-gray-500 max-w-xs'>The world&apos;s most advanced AI receptionist platform. Available 24/7 in 200+ languages.</p>
            </div>
            <div>
              <h4 className='font-semibold mb-3 text-sm'>Product</h4>
              <ul className='space-y-2 text-sm text-gray-500'>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Features</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Industries</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Pricing</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Demo</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-3 text-sm'>Company</h4>
              <ul className='space-y-2 text-sm text-gray-500'>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>About</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Blog</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Careers</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-3 text-sm'>Legal</h4>
              <ul className='space-y-2 text-sm text-gray-500'>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Privacy</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Terms</li>
                <li className='hover:text-gray-300 transition-colors cursor-pointer'>Security</li>
              </ul>
            </div>
          </div>
          <div className='pt-8 border-t border-white/5 text-center text-sm text-gray-600'>
            &copy; {new Date().getFullYear()} GlobalVoice AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ─── LEAD FORM MODAL ─── */}
      <AnimatePresence>
        {showLeadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md'
            onClick={() => { if (!leadSubmitted) setShowLeadForm(false) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='bg-deep-space/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/[0.06] shadow-2xl'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-xl font-bold'>{leadSubmitted ? 'Thank You!' : 'Get Started Free'}</h3>
                <button onClick={() => { setShowLeadForm(false); setLeadSubmitted(false); setLeadScore(null) }} className='text-gray-500 hover:text-white transition-colors' aria-label='Close lead form'><X /></button>
              </div>
              {leadSubmitted ? (
                <div className='text-center py-6'>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className='text-5xl mb-4'
                  >
                    🎉
                  </motion.div>
                  <p className='text-gray-300 mb-4'>We received your information! Our team will reach out shortly.</p>
                  {leadScore !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-sm'
                    >
                      Lead Score: <span className='font-bold text-aurora-cyan'>{leadScore}/100</span>
                      <span className='text-xs text-gray-500'>({leadScore >= 70 ? 'Hot!' : leadScore >= 40 ? 'Warm' : 'Nurture'})</span>
                    </motion.div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className='space-y-4'>
                  <input placeholder='Business Name *' required className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan transition-colors' value={leadFormData.business} onChange={e => setLeadFormData(p => ({ ...p, business: e.target.value }))} />
                  <input placeholder='Email *' type='email' required className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan transition-colors' value={leadFormData.email} onChange={e => setLeadFormData(p => ({ ...p, email: e.target.value }))} />
                  <input placeholder='Phone Number' className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan transition-colors' value={leadFormData.phone} onChange={e => setLeadFormData(p => ({ ...p, phone: e.target.value }))} />
                  <select className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan transition-colors' value={leadFormData.industry} onChange={e => setLeadFormData(p => ({ ...p, industry: e.target.value }))}>
                    <option value='' className='bg-deep-space'>Select Industry</option>
                    <option value='healthcare' className='bg-deep-space'>Healthcare</option>
                    <option value='legal' className='bg-deep-space'>Legal</option>
                    <option value='dental' className='bg-deep-space'>Dental</option>
                    <option value='real_estate' className='bg-deep-space'>Real Estate</option>
                    <option value='hvac' className='bg-deep-space'>HVAC / Home Services</option>
                    <option value='automotive' className='bg-deep-space'>Automotive</option>
                    <option value='other' className='bg-deep-space'>Other</option>
                  </select>
                  <input placeholder='Number of Employees' type='number' className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan transition-colors' value={leadFormData.employees} onChange={e => setLeadFormData(p => ({ ...p, employees: e.target.value }))} />
                  <button type='submit' className='w-full py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all'>
                    Submit
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DEMO MODAL ─── */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md'
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='bg-deep-space/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-white/[0.06] shadow-2xl'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-bold'>How GlobalVoice AI Works</h3>
                <button onClick={() => setShowDemo(false)} className='text-gray-500 hover:text-white transition-colors' aria-label='Close demo modal'><X /></button>
              </div>
              <div className='aspect-video rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center border border-white/10'>
                <div className='text-center'>
                  <div className='text-5xl mb-4'>🎥</div>
                  <p className='text-gray-400 text-sm'>Demo video showcasing AI receptionist capabilities</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
