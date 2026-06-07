'use client'

import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

// ─── SVG Icons ──────────────────────────────────────────

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? 'text-amber-400' : 'text-gray-600'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// ─── Comparison Data ────────────────────────────────────

const COMPETITOR_ROWS = [
  {
    category: 'Coverage',
    rows: [
      { feature: '24/7 Availability', human: '✗', otherAI: '✓', frontDesk: '✓' },
      { feature: 'Zero Hold Time', human: '✗', otherAI: 'Partial', frontDesk: '✓' },
      { feature: 'Simultaneous Calls', human: '1 per person', otherAI: 'Limited', frontDesk: 'Unlimited' },
      { feature: 'Languages Supported', human: '1–2', otherAI: '5–50', frontDesk: '200+' },
    ],
  },
  {
    category: 'Cost & Efficiency',
    rows: [
      { feature: 'Monthly Cost', human: '$3,500–$4,500', otherAI: '$150–$500', frontDesk: '$99–$299' },
      { feature: 'Cost per Call', human: '$5–$8', otherAI: '$0.15–$0.50', frontDesk: '$0.05–$0.12' },
      { feature: 'Setup Time', human: '2–4 weeks', otherAI: '1–2 weeks', frontDesk: 'Hours' },
      { feature: 'Training Required', human: 'Extensive', otherAI: 'Moderate', frontDesk: 'Minimal' },
      { feature: 'Scaling Cost', human: 'Per hire', otherAI: 'Per call', frontDesk: 'Fixed plan' },
    ],
  },
  {
    category: 'Capabilities',
    rows: [
      { feature: 'Case Law Lookup', human: '✗', otherAI: '✗', frontDesk: '✓ Real-time' },
      { feature: 'Win Probability Scoring', human: '✗', otherAI: '✗', frontDesk: '✓ AI-Powered' },
      { feature: '50-State Statutes', human: '✗', otherAI: '✗', frontDesk: '✓ Trained' },
      { feature: '94 Federal Districts', human: '✗', otherAI: '✗', frontDesk: '✓ Pre-configured' },
      { feature: 'Call Transcription', human: '✗', otherAI: '✓', frontDesk: '✓ Real-time' },
      { feature: 'Smart Appointment Booking', human: 'Manual', otherAI: 'Basic', frontDesk: '✓' },
      { feature: 'Lead Qualification', human: 'Manual', otherAI: 'Basic', frontDesk: '✓ AI-scored' },
      { feature: 'CRM Integration', human: 'Manual entry', otherAI: 'Some', frontDesk: '✓ Auto-sync' },
      { feature: 'Real-time Analytics', human: '✗', otherAI: 'Basic', frontDesk: '✓ Advanced' },
      { feature: 'Custom Voice Training', human: 'N/A', otherAI: 'Limited', frontDesk: '✓' },
      { feature: 'SMS Integration', human: '✗', otherAI: 'Some', frontDesk: '✓' },
      { feature: 'Sentiment Analysis', human: 'N/A', otherAI: 'Limited', frontDesk: '✓' },
    ],
  },
  {
    category: 'Reliability',
    rows: [
      { feature: 'Uptime Guarantee', human: 'Business hours', otherAI: '99.5%', frontDesk: '99.9%' },
      { feature: 'Call Recording', human: '✗', otherAI: '✓', frontDesk: '✓' },
      { feature: 'Data Encryption', human: 'Varies', otherAI: 'Standard', frontDesk: 'AES-256' },
      { feature: 'Automatic Backup', human: '✗', otherAI: '✓', frontDesk: '✓' },
    ],
  },
]

const COMPETITOR_SCORES = [
  { name: 'FrontDesk Agents AI', score: 96, gradient: 'from-aurora-cyan to-blue-500' },
  { name: 'Other AI Tools', score: 72, gradient: 'from-gray-400 to-gray-500' },
  { name: 'Human Receptionist', score: 45, gradient: 'from-rose-400 to-rose-600' },
]

const COMPETITOR_HIGHLIGHTS = [
  { icon: ShieldIcon, text: '10x more languages than other AI tools' },
  { icon: CpuIcon, text: '80% cheaper than a human receptionist' },
  { icon: ZapIcon, text: 'Setup in hours, not weeks' },
  { icon: GlobeIcon, text: 'Unlimited simultaneous calls — no hold queues' },
]

// ─── Data Constants ─────────────────────────────────────

// UI-only metadata per plan — business data (id, name, price, features) comes from PLANS in stripe.ts
const PLAN_UI: Record<string, { yearlyPrice: number; desc: string; cta: string; popular: boolean; gradient: string }> = {
  starter: {
    yearlyPrice: 79,
    desc: 'Perfect for small businesses getting started with AI receptionist.',
    cta: 'Start Free Trial',
    popular: false,
    gradient: 'from-gray-500 to-gray-400',
  },
  professional: {
    yearlyPrice: 239,
    desc: 'For growing businesses that need more capacity and features.',
    cta: 'Start Free Trial',
    popular: true,
    gradient: 'from-aurora-cyan to-blue-600',
  },
  enterprise: {
    yearlyPrice: 639,
    desc: 'For established businesses requiring advanced capabilities.',
    cta: 'Start Free Trial',
    popular: false,
    gradient: 'from-purple-500 to-pink-500',
  },
  ultimate: {
    yearlyPrice: 1599,
    desc: 'For high-volume businesses demanding the absolute best.',
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-amber-500 to-orange-500',
  },
}

// Derived from PLANS (single source of truth) + PLAN_UI (presentation only)
const MONTHLY_PLANS = Object.entries(PLANS).map(([key, plan]) => ({
  ...plan,
  price: plan.price / 100,
  ...PLAN_UI[key],
}))

const COMPARISON_ROWS = [
  ['Monthly Calls', '100', '1,000', 'Unlimited', 'Unlimited'],
  ['Phone Numbers', '1', '3', '10', '25+'],
  ['Languages', '1', '5', '200+', 'All'],
  ['SMS Integration', '—', '✓', '✓', '✓'],
  ['API Access', '—', '—', '✓', '✓'],
  ['Custom Voice', '—', '✓', '✓', '✓'],
  ['Dedicated Support', '—', '—', '✓', '✓'],
  ['CRM Integration', '—', '—', '✓', '✓'],
  ['Analytics', 'Basic', 'Advanced', 'Advanced', 'Real-time'],
]

const GUARANTEES = [
  {
    icon: ShieldIcon,
    title: '99.9% Uptime SLA',
    desc: 'Enterprise-grade reliability with automatic failover. Your AI receptionist is always available.',
  },
  {
    icon: ZapIcon,
    title: 'Transparent Pricing',
    desc: 'No hidden fees, no surprise charges, no revenue share. What we quote is what you pay.',
  },
  {
    icon: CpuIcon,
    title: '14-Day Free Trial',
    desc: 'Full access to all features with no credit card required. Cancel with one click.',
  },
  {
    icon: GlobeIcon,
    title: 'Data Ownership',
    desc: 'You own all call recordings, transcripts, and customer data. Export anytime with no lock-in.',
  },
]

const FAQS = [
  { q: 'How does the free trial work?', a: 'You get 14 days free with full access to all Pro features. No credit card required. Cancel anytime — no questions asked.' },
  { q: 'Can I keep my existing phone number?', a: 'Yes! You can port your existing business number to FrontDesk Agents AI, or we can provide a new one. The porting process takes less than 24 hours.' },
  { q: 'What happens if I exceed my call limit?', a: 'We never drop calls. If you exceed your plan limits, we handle the overflow seamlessly and notify you. You can upgrade instantly without interruption.' },
  { q: 'What languages do you support?', a: 'We support 200+ languages with native-level understanding and natural-sounding neural voice synthesis in every major language.' },
  { q: 'How does the AI handle complex calls?', a: 'The AI handles scheduling, FAQs, intake, qualification, and routing autonomously. For complex issues requiring human judgment, it seamlessly transfers with full conversation context.' },
  { q: 'Is my data secure?', a: 'Absolutely. We employ enterprise-grade encryption (AES-256), SOC 2 compliance practices, and strict data handling policies. Your call data is never used to train public models.' },
]

const CHAT_MESSAGES = [
  { role: 'bot', text: 'Hi there! 👋 Welcome to FrontDesk Agents AI.' },
  { role: 'bot', text: 'Curious how our AI phone agents can help your business?' },
  { role: 'bot', text: 'We handle calls, book appointments, and qualify leads — automatically. Want to see a quick demo?' },
]

// ─── Sub-components ──────────────────────────────────

function FaqItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left hover:bg-white/[0.02] transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-white/90 font-medium pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500 shrink-0"
        >
          <ChevronDownIcon />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="pb-5 px-1 text-gray-400 text-sm leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </div>
  )
}

function AnimatedCountUp({ target, displaySuffix = '', label }: { target: string; displaySuffix?: string; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  const numericPart = parseFloat(target.replace(/[^0-9.]/g, '')) || 0
  const suffixStr = displaySuffix || target.replace(/[0-9.]/g, '')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 2000
          const steps = 60
          const increment = numericPart / steps
          let current = 0
          const interval = setInterval(() => {
            current += increment
            if (current >= numericPart) {
              setCount(numericPart)
              clearInterval(interval)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [numericPart, hasAnimated])

  const display = numericPart % 1 === 0 ? count : count.toFixed(1)

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold font-display bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
        {display}{suffixStr}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function PricingToggle({ yearly, onToggle }: { yearly: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-10">
      <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          yearly ? 'bg-aurora-cyan' : 'bg-white/[0.12]'
        }`}
        aria-label="Toggle yearly pricing"
      >
        <motion.div
          className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: yearly ? 28 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${yearly ? 'text-white' : 'text-gray-500'}`}>
        Yearly
        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
          Save 20%
        </span>
      </span>
    </div>
  )
}

function LiveChatPreview() {
  const [isOpen, setIsOpen] = useState(false)
  const [showMessage, setShowMessage] = useState(true)
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)

  const openChat = useCallback(() => {
    setIsOpen(true)
    setShowMessage(false)
    setMessages([])
    setStep(0)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
    setShowMessage(true)
    setMessages([])
    setStep(0)
  }, [])

  // Auto-advance chat messages
  useEffect(() => {
    if (!isOpen || step >= CHAT_MESSAGES.length) return

    setIsTyping(true)
    const typingTimer = setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, CHAT_MESSAGES[step]])
      setStep(s => s + 1)
    }, step === 0 ? 800 : 1500)

    return () => clearTimeout(typingTimer)
  }, [isOpen, step])

  // Auto-hide the initial bubble after 10s
  useEffect(() => {
    if (!showMessage) return
    const timer = setTimeout(() => setShowMessage(false), 10000)
    return () => clearTimeout(timer)
  }, [showMessage])

  return (
    <>
      {/* Floating chat bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showMessage && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl rounded-br-sm px-4 py-3 max-w-[240px] shadow-xl"
            >
              <p className="text-sm text-white/90">
                Need help choosing a plan? 💬
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-gray-500">Online now</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat button */}
        <motion.button
          onClick={isOpen ? closeChat : openChat}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
            isOpen
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-gradient-to-br from-aurora-cyan to-blue-600 hover:shadow-lg hover:shadow-aurora-cyan/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <XIcon /> : <MessageIcon />}
        </motion.button>
      </div>

      {/* Chat popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-white/[0.08] bg-[#0A0A0F]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-aurora-cyan/20 to-blue-600/20 border-b border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-cyan to-blue-600 flex items-center justify-center">
                  <BotIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">FrontDesk Agents AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-emerald-400">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={closeChat} className="text-gray-500 hover:text-white transition-colors p-1">
                <XIcon />
              </button>
            </div>

            {/* Messages */}
            <div className="px-4 py-4 min-h-[260px] max-h-[320px] overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'bot'
                      ? 'bg-white/[0.06] text-white/90 rounded-tl-sm'
                      : 'bg-aurora-cyan/20 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step >= CHAT_MESSAGES.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-2"
                >
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs px-3 py-2 rounded-xl bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/20 hover:bg-aurora-cyan/25 transition-all">
                      Yes, show me!
                    </button>
                    <button className="flex-1 text-xs px-3 py-2 rounded-xl bg-white/[0.05] text-gray-400 border border-white/[0.1] hover:bg-white/[0.1] transition-all">
                      No thanks
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-3 flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-gray-500">
                Type a message...
              </div>
              <button className="w-9 h-9 rounded-xl bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan hover:bg-aurora-cyan/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main Page Component ────────────────────────────────

export default function PricingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [yearly, setYearly] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCheckout = async (planId: string) => {
    setLoading(planId)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing: yearly ? 'yearly' : 'monthly' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout')
        setLoading(null)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(null)
    }
  }

  const plans = MONTHLY_PLANS.map(plan => ({
    ...plan,
    displayPrice: yearly ? plan.yearlyPrice : plan.price,
  }))

  return (
    <div className="min-h-screen bg-deep-space text-white font-sans overflow-x-hidden">
      {/* Floating Background Orbs */}
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
            <span className="font-display text-lg font-bold text-white hidden sm:inline">
              FrontDesk Agents AI
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/ai-receptionist" className="text-sm text-gray-300 hover:text-white transition-colors">Legal AI</a>
            <a href="/partners" className="text-sm text-gray-300 hover:text-white transition-colors">Partners</a>
            <a href="/industries" className="text-sm text-gray-300 hover:text-white transition-colors">Industries</a>
            <a href="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</a>
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/pricing" className="text-sm text-aurora-cyan hover:text-white transition-colors">Pricing</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            <Link href="/pricing" className="px-4 py-2 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <motion.div
                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white rounded-full"
              />
              <motion.div
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-white rounded-full"
              />
              <motion.div
                animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white rounded-full"
              />
            </div>
          </button>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-white/[0.06] bg-deep-space/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1">
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Services</a>
                <a href="/ai-receptionist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Legal AI</a>
                <a href="/partners" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Partners</a>
                <a href="/industries" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Industries</a>
                <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Blog</a>
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Demo</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-aurora-cyan hover:text-white hover:bg-white/[0.05] transition-all">Pricing</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Contact</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 mt-2 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium text-center">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-aurora-cyan/10 via-transparent to-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 border border-aurora-cyan/20 rounded-full"
          animate={{ y: [0, -20, 0], rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-16 h-16 border border-purple-500/20 rounded-lg rotate-45"
          animate={{ y: [0, 15, 0], rotate: [45, 405] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Simple, Transparent Pricing — No Hidden Fees
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              AI Phone Agents{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                for Every Budget
              </span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Start with a 14-day free trial. No credit card required. Cancel anytime.{' '}
              Just a real AI receptionist that works.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#plans" className="px-6 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">
                View Plans
              </a>
              <Link href="/demo" className="px-6 py-3 rounded-full border border-white/[0.12] text-gray-300 font-medium hover:bg-white/[0.05] hover:text-white transition-all">
                Live Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF COUNTERS ─── */}
      <section className="py-16 px-4 bg-white/[0.02] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-gray-500 text-sm">Join thousands of companies automating their phone systems with AI</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { target: '25M+', displaySuffix: 'M+', label: 'Calls Handled' },
              { target: '10K+', displaySuffix: 'K+', label: 'Active Businesses' },
              { target: '200+', label: 'Languages Supported' },
              { target: '4.9', displaySuffix: '/5', label: 'Average Rating' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] text-center group hover:border-aurora-cyan/20 transition-all duration-300"
              >
                {/* Decorative gradient orb */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-aurora-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <AnimatedCountUp target={stat.target} displaySuffix={stat.displaySuffix} label={stat.label} />
                  {/* Star rating for the average rating */}
                  {stat.label === 'Average Rating' && (
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <StarIcon key={s} filled={s <= 4} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(2.4K+ reviews)</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-10 pt-8 border-t border-white/[0.04]"
          >
            <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-4">Featured In</p>
            <div className="overflow-hidden">
              <div className="carousel-track flex items-center gap-12 sm:gap-20">
                {/* First set */}
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">TechCrunch</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Forbes</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">VentureBeat</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Business Insider</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">ZDNet</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">The Verge</span>
                {/* Duplicate for seamless loop */}
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">TechCrunch</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Forbes</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">VentureBeat</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Business Insider</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">ZDNet</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">The Verge</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING PLANS ─── */}
      <section id="plans" className="py-20 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PricingToggle yearly={yearly} onToggle={() => setYearly(!yearly)} />
          </motion.div>

          {error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col ${
                  plan.popular
                    ? 'border-aurora-cyan/30 bg-gradient-to-b from-aurora-cyan/5 to-transparent scale-[1.02] lg:scale-105'
                    : 'border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-aurora-cyan/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-xs font-semibold text-white whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {yearly && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 whitespace-nowrap">
                    Save ~20%
                  </div>
                )}

                <h3 className="text-2xl font-display font-bold mb-1">{plan.name}</h3>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={yearly ? 'yearly' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-bold font-display mb-1"
                    >
                      ${plan.displayPrice}
                      <span className="text-base font-normal text-gray-500">
                        {yearly ? '/mo (billed annually)' : '/mo'}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  {yearly && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-500 line-through"
                    >
                      ${plan.price}/mo
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-6 mt-2">{plan.desc}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.05 }}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <span className="text-emerald-400 shrink-0"><CheckIcon /></span>
                      {f}
                    </motion.li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full text-center py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-gradient-to-r from-aurora-cyan to-blue-600 text-white hover:shadow-lg hover:shadow-aurora-cyan/25'
                      : 'border border-white/20 text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {loading === plan.id ? 'Redirecting...' : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Enterprise Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-10 max-w-3xl mx-auto text-center p-8 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]"
          >
            <h3 className="text-xl font-display font-bold mb-2">Need a Custom Enterprise Plan?</h3>
            <p className="text-gray-400 text-sm mb-4 max-w-xl mx-auto">
              For large organizations with custom requirements — dedicated infrastructure, custom integrations,
              white-label options, and volume discounts.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 text-aurora-cyan font-medium text-sm hover:underline">
              Contact Sales →
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURE COMPARISON TABLE ─── */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Full Feature Comparison</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See exactly what you get with each plan. No surprises — just capabilities that grow with your business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 px-4 font-semibold text-gray-300">Feature</th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-300">Starter</th>
                  <th className="text-center py-4 px-3 font-semibold text-aurora-cyan bg-aurora-cyan/[0.03]">Professional</th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-300">Enterprise</th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-300">Ultimate</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="py-3.5 px-3 font-medium text-gray-200">{row[0]}</td>
                    <td className="text-center py-3.5 px-3 text-gray-400">{row[1]}</td>
                    <td className="text-center py-3.5 px-3 text-gray-300 bg-aurora-cyan/[0.02]">{row[2]}</td>
                    <td className="text-center py-3.5 px-3 text-gray-400">{row[3]}</td>
                    <td className="text-center py-3.5 px-3 text-gray-400">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ─── VS COMPETITORS ─── */}
      <section className="py-20 md:py-28 px-4 bg-deep-space">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              FrontDesk Agents AI{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-blue-400 to-purple-400 bg-clip-text text-transparent">
                vs. The Alternatives
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See how FrontDesk Agents AI compares to a traditional human receptionist and other AI phone tools.
              The differences are stark — and the savings are real.
            </p>
          </motion.div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {COMPETITOR_SCORES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-6 rounded-2xl border overflow-hidden ${
                  i === 0
                    ? 'border-aurora-cyan/30 bg-gradient-to-b from-aurora-cyan/[0.06] to-transparent scale-[1.02]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                {i === 0 && (
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-aurora-cyan/10 rounded-full blur-2xl" />
                )}
                <div className="relative z-10">
                  <p className="text-sm text-gray-500 mb-1">{item.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-4xl font-bold font-display bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                      {item.score}
                    </span>
                    <span className="text-sm text-gray-600 mb-1">/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
          >
            {COMPETITOR_HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon />
                  </div>
                  <p className="text-xs text-emerald-300/90 leading-snug">{h.text}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Full Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-4 px-5 font-semibold text-gray-300 w-[30%]">Feature</th>
                    <th className="text-center py-4 px-5 font-semibold text-rose-400 w-[23%]">Human Receptionist</th>
                    <th className="text-center py-4 px-5 font-semibold text-gray-400 w-[23%]">Other AI Tools</th>
                    <th className="text-center py-4 px-5 font-semibold text-aurora-cyan bg-aurora-cyan/[0.03] w-[24%]">FrontDesk Agents AI</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITOR_ROWS.map((section, si) => (
                    <Fragment key={si}>
                      {/* Category header */}
                      <tr className="border-b border-white/[0.04] bg-white/[0.03]">
                        <td colSpan={4} className="py-2.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                          {section.category}
                        </td>
                      </tr>
                      {/* Feature rows */}
                      {section.rows.map((row, ri) => (
                        <tr
                          key={ri}
                          className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                            ri % 2 === 1 ? 'bg-white/[0.01]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-5 font-medium text-gray-200">{row.feature}</td>
                          <td className="text-center py-3.5 px-5 text-gray-400">
                            {row.human === '✗' ? (
                              <span className="text-rose-500/60">✗</span>
                            ) : (
                              <span className="text-rose-400/80">{row.human}</span>
                            )}
                          </td>
                          <td className="text-center py-3.5 px-5 text-gray-400">
                            {row.otherAI === '✓' ? (
                              <span className="text-emerald-400/60">✓</span>
                            ) : (
                              <span>{row.otherAI}</span>
                            )}
                          </td>
                          <td className="text-center py-3.5 px-5 bg-aurora-cyan/[0.02]">
                            {row.frontDesk === '✓' ? (
                              <span className="text-emerald-400 font-medium">✓</span>
                            ) : (
                              <span className="text-white font-medium">{row.frontDesk}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── GUARANTEES ─── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Our Commitments to You</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We believe in radical transparency — no hidden fees, no locked-in contracts, no fine print.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUARANTEES.map((g, i) => {
              const Icon = g.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.05] hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-4 text-aurora-cyan">
                    <Icon />
                  </div>
                  <h3 className="font-semibold mb-2">{g.title}</h3>
                  <p className="text-sm text-gray-500">{g.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">
              Still have questions?{' '}
              <a href="/contact" className="text-aurora-cyan hover:underline">Contact our team</a>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-6"
          >
            {FAQS.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaqIndex === index}
                onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
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
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                Ready to Transform Your Business Communications?
              </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-3xl mx-auto">
          Join thousands of businesses using FrontDesk Agents AI. Start your 14-day free trial today.{' '}
          <span className="text-aurora-cyan">Know a law firm that needs AI reception? </span>
          <Link href="/partners#referral" className="text-aurora-cyan underline hover:text-white transition-colors">Refer them and earn $1,000.</Link>
        </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#plans" className="px-8 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">
                  Start Free Trial
                </a>
                <Link href="/demo" className="px-8 py-3 rounded-full border border-white/[0.12] text-gray-300 font-medium hover:bg-white/[0.05] hover:text-white transition-all">
                  Book a Demo
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Free 14-day trial &middot; No credit card required &middot; Cancel anytime
              </p>
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
              <p className="text-gray-500 text-sm leading-relaxed">
                AI phone agents that handle calls, book appointments, and qualify leads — automatically.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="/ai-receptionist" className="hover:text-white transition-colors">Legal AI</a></li>
                <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="/industries" className="hover:text-white transition-colors">Industries</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="hover:text-white transition-colors cursor-default">About Us</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Blog</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Careers</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Partners</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><span className="hover:text-white transition-colors cursor-default">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} FrontDesk Agents AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white transition-colors cursor-default">Twitter</span>
              <span className="hover:text-white transition-colors cursor-default">LinkedIn</span>
              <span className="hover:text-white transition-colors cursor-default">GitHub</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── LIVE CHAT PREVIEW ─── */}
      <LiveChatPreview />
    </div>
  )
}
