'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── SVG Icons ──────────────────────────────────────────

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
)

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? 'text-amber-400' : 'text-gray-600'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

// ─── Data Constants ─────────────────────────────────────

const CONTACT_METHODS = [
  {
    icon: PhoneIcon,
    title: 'Phone',
    value: '+1 (888) 555-AGENTS',
    subtitle: 'Available 24/7',
    gradient: 'from-aurora-cyan to-blue-500',
  },
  {
    icon: MailIcon,
    title: 'Email',
    value: 'hello@frontdeskagents.com',
    subtitle: 'We respond within 2 hours',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: MapPinIcon,
    title: 'Office',
    value: 'San Francisco, CA',
    subtitle: 'Remote-first team',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: ClockIcon,
    title: 'Hours',
    value: 'Mon–Fri, 9 AM–6 PM PST',
    subtitle: 'Support available 24/7',
    gradient: 'from-amber-400 to-orange-500',
  },
]

const FAQ_ITEMS = [
  {
    question: 'How quickly can I get started with FrontDesk Agents AI?',
    answer: 'Most businesses are up and running within 24 hours. Our onboarding team guides you through setup, customization, and testing. You can try a free demo before committing.',
  },
  {
    question: 'Do I need any technical expertise to set up your AI agents?',
    answer: 'No technical expertise required. Our platform is designed for business owners and operators. We handle the AI configuration, phone number provisioning, and integration setup for you.',
  },
  {
    question: 'Can your AI agents integrate with my existing CRM or tools?',
    answer: 'Yes! We integrate with major CRMs (Salesforce, HubSpot), scheduling platforms (Calendly), payment processors (Stripe, Square), and communication tools. Custom integrations are also available.',
  },
  {
    question: 'What languages do your AI phone agents support?',
    answer: 'Our agents support over 50 languages including English, Spanish, French, German, Mandarin, Japanese, Arabic, and Portuguese. The AI can detect and switch languages mid-conversation.',
  },
  {
    question: 'Is my data secure with FrontDesk Agents AI?',
    answer: 'Absolutely. We employ enterprise-grade encryption (AES-256), SOC 2 compliance practices, and strict data handling policies. Your call data is never used to train public models.',
  },
  {
    question: 'What happens if my call volume exceeds my plan limits?',
    answer: 'We handle overflow seamlessly. You will be notified as you approach your limit, and we can instantly upgrade your plan to accommodate higher volume without any service interruption.',
  },
]

const SERVICE_OPTIONS = [
  'AI Phone Agent',
  'Call Answering',
  'Appointment Booking',
  'Lead Qualification',
  'Multi-language Support',
  'Custom Integration',
  'Enterprise Plan',
  'Other',
]

const INDUSTRY_OPTIONS = [
  'Healthcare',
  'Dental',
  'Legal',
  'Real Estate',
  'HVAC',
  'E-commerce',
  'Hospitality',
  'Automotive',
  'Insurance',
  'Other',
]

const COMPANY_SIZE_OPTIONS = [
  'Just me (1)',
  'Small (2–10)',
  'Medium (11–50)',
  'Large (51–200)',
  'Enterprise (200+)',
]

const TESTIMONIALS = [
  { name: 'Dr. Sarah Chen', role: 'Medical Practice Owner', company: 'Chen Family Medicine', text: 'FrontDesk Agents AI handles over 200 patient calls daily. Appointment booking is seamless and our patients love the instant responses.', rating: 5 },
  { name: 'Michael Torres', role: 'Broker/Owner', company: 'Torres Realty Group', text: 'Our AI agent qualifies leads 24/7. We\'ve seen a 40% increase in qualified appointments since switching from a human receptionist.', rating: 5 },
  { name: 'James Wilson', role: 'Managing Partner', company: 'Wilson & Associates Law', text: 'The AI handles intake calls with precision and sensitivity. It\'s like having a full-time paralegal answering phones around the clock.', rating: 5 },
  { name: 'Lisa Park', role: 'CEO', company: 'Park Dental Care', text: 'Setup was incredibly easy — we were live in under 24 hours. The AI handles scheduling, reminders, and even handles insurance questions.', rating: 5 },
]

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM',
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
        <div className="pb-5 px-1 text-gray-400 text-sm leading-relaxed">{answer}</div>
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

function CalendarPicker({ selectedDate, selectedTime, onDateSelect, onTimeSelect }: {
  selectedDate: Date | null
  selectedTime: string | null
  onDateSelect: (d: Date) => void
  onTimeSelect: (t: string) => void
}) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1) }
    else { setViewMonth(v => v - 1) }
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1) }
    else { setViewMonth(v => v + 1) }
  }

  const isDateSelectable = (day: number) => {
    const date = new Date(viewYear, viewMonth, day)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    // Can't select past dates or today (need at least 1 day ahead)
    return date > now && date.getDay() !== 0 // No Sundays
  }

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
  }

  const dates: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) dates.push(null)
  for (let d = 1; d <= daysInMonth; d++) dates.push(d)

  return (
    <div className="space-y-4">
      {/* Month/Year nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors text-gray-400">
          <ChevronLeftIcon />
        </button>
        <span className="text-sm font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors text-gray-400">
          <ChevronRightIcon />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-600 font-medium uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {dates.map((day, i) => (
          <div key={i} className="aspect-square">
            {day ? (
              <button
                onClick={() => isDateSelectable(day) && onDateSelect(new Date(viewYear, viewMonth, day))}
                disabled={!isDateSelectable(day)}
                className={`w-full h-full rounded-lg text-xs font-medium transition-all ${
                  isSelectedDate(day)
                    ? 'bg-aurora-cyan text-white'
                    : isDateSelectable(day)
                      ? 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                      : 'text-gray-700 cursor-not-allowed'
                }`}
              >
                {day}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-white/[0.06] pt-4"
        >
          <p className="text-xs text-gray-500 mb-3 font-medium">Select a time slot</p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => onTimeSelect(slot)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedTime === slot
                    ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
                    : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function LiveChatPreview() {
  const [isOpen, setIsOpen] = useState(false)
  const [showMessage, setShowMessage] = useState(true)
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)

  const CHAT_MSGS = useMemo(() => [
    { role: 'bot', text: 'Hi there! 👋 Welcome to FrontDesk Agents AI.' },
    { role: 'bot', text: 'Have questions about our AI phone agents?' },
    { role: 'bot', text: 'We can help you choose the perfect plan and get started in under 24 hours!' },
  ], [])

  const openChat = useCallback(() => {
    setIsOpen(true); setShowMessage(false); setMessages([]); setStep(0)
  }, [])
  const closeChat = useCallback(() => {
    setIsOpen(false); setShowMessage(true); setMessages([]); setStep(0)
  }, [])

  useEffect(() => {
    if (!isOpen || step >= CHAT_MSGS.length) return
    setIsTyping(true)
    const t = setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, CHAT_MSGS[step]])
      setStep(s => s + 1)
    }, step === 0 ? 800 : 1500)
    return () => clearTimeout(t)
  }, [isOpen, step, CHAT_MSGS])

  useEffect(() => {
    if (!showMessage) return
    const t = setTimeout(() => setShowMessage(false), 10000)
    return () => clearTimeout(t)
  }, [showMessage])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showMessage && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl rounded-br-sm px-4 py-3 max-w-[240px] shadow-xl"
            >
              <p className="text-sm text-white/90">Questions? We&apos;re here to help 💬</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-gray-500">Online now</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={isOpen ? closeChat : openChat}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
            isOpen ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gradient-to-br from-aurora-cyan to-blue-600 hover:shadow-lg hover:shadow-aurora-cyan/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <XIcon /> : <MessageIcon />}
        </motion.button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-white/[0.08] bg-[#0A0A0F]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
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
              <button onClick={closeChat} className="text-gray-500 hover:text-white transition-colors p-1"><XIcon /></button>
            </div>
            <div className="px-4 py-4 min-h-[220px] max-h-[320px] overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'bot' ? 'bg-white/[0.06] text-white/90 rounded-tl-sm' : 'bg-aurora-cyan/20 text-white rounded-tr-sm'}`}>{msg.text}</div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              {step >= CHAT_MSGS.length && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                  <button className="w-full text-xs px-3 py-2 rounded-xl bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/20 hover:bg-aurora-cyan/25 transition-all">Speak with a human →</button>
                </motion.div>
              )}
            </div>
            <div className="border-t border-white/[0.06] px-4 py-3 flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-gray-500">Type a message...</div>
              <button className="w-9 h-9 rounded-xl bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan hover:bg-aurora-cyan/30 transition-all">
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main Page Component ────────────────────────────────

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [formStep, setFormStep] = useState(0)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [scheduleDemo, setScheduleDemo] = useState(false)

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    company: '', companySize: '', industry: '',
    service: '', message: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const canProceedStep = () => {
    switch (formStep) {
      case 0: return formData.name.trim() && formData.email.trim() && formData.phone.trim()
      case 1: return formData.company.trim() && formData.companySize && formData.industry
      case 2: return formData.service && formData.message.trim()
      default: return true
    }
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to send message. Please try again.')
        return
      }
      setFormSubmitted(true)
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', company: '', companySize: '', industry: '', service: '', message: '' })
    setFormStep(0)
    setFormSubmitted(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setScheduleDemo(false)
  }

  const STEP_LABELS = ['Contact Info', 'Business', 'Service', 'Review']

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
            <span className="font-display text-lg font-bold text-white hidden sm:inline">FrontDesk Agents AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/ai-receptionist" className="text-sm text-gray-300 hover:text-white transition-colors">Legal AI</a>
            <a href="/partners" className="text-sm text-gray-300 hover:text-white transition-colors">Partners</a>
            <a href="/industries" className="text-sm text-gray-300 hover:text-white transition-colors">Industries</a>
            <a href="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</a>
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/contact" className="text-sm text-aurora-cyan hover:text-white transition-colors">Contact</a>
            <Link href="/demo" className="px-4 py-2 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">Get Started</Link>
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
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Services</a>
                <a href="/ai-receptionist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Legal AI</a>
                <a href="/partners" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Partners</a>
                <a href="/industries" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Industries</a>
                <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Blog</a>
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Demo</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Pricing</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-aurora-cyan hover:text-white hover:bg-white/[0.05] transition-all">Contact</a>
                <Link href="/demo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 mt-2 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium text-center">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-aurora-cyan/10 via-transparent to-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <motion.div className="absolute top-20 left-10 w-20 h-20 border border-aurora-cyan/20 rounded-full" animate={{ y: [0, -20, 0], rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute bottom-20 right-10 w-16 h-16 border border-purple-500/20 rounded-lg rotate-45" animate={{ y: [0, 15, 0], rotate: [45, 405] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs font-medium uppercase tracking-wider mb-6">
              <BotIcon /> Get In Touch
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Let&apos;s Build Your{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">AI Phone Agent</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Ready to transform your business communications? Choose how you&apos;d like to get started — send a message, schedule a live demo, or give us a call.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#contact-form" className="px-6 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">Send a Message</a>
              <button onClick={() => setScheduleDemo(true)} className="px-6 py-3 rounded-full border border-aurora-cyan/40 text-aurora-cyan font-medium hover:bg-aurora-cyan/10 transition-all">Schedule a Demo</button>
              <a href="#faq" className="px-6 py-3 rounded-full border border-white/[0.12] text-gray-300 font-medium hover:bg-white/[0.05] hover:text-white transition-all">View FAQs</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT METHODS ─── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Ways to Reach Us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose the method that works best for you. Our team is available across multiple channels.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_METHODS.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.06] transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon />
                </div>
                <h3 className="text-lg font-semibold mb-1">{method.title}</h3>
                <p className="text-white font-medium">{method.value}</p>
                <p className="text-gray-500 text-sm mt-1">{method.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT FORM + DEMO SCHEDULER ─── */}
      <section id="contact-form" className="py-20 px-4 bg-white/[0.02] scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* LEFT — Multi-step Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Send Us a Message</h2>
              <p className="text-gray-400 mb-8">Fill out the form below and our team will get back to you within 2 hours.</p>

              {formSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><CheckIcon /></div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-gray-400 mb-6">Thank you for reaching out. We&apos;ll respond within 2 hours during business hours.</p>
                  <button onClick={resetForm} className="px-6 py-2 rounded-full bg-white/[0.08] text-white text-sm hover:bg-white/[0.12] transition-colors">Send Another Message</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step indicators */}
                  <div className="flex items-center justify-between mb-2">
                    {STEP_LABELS.map((label, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          i === formStep
                            ? 'bg-aurora-cyan text-white'
                            : i < formStep
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/[0.06] text-gray-500'
                        }`}>
                          {i < formStep ? <CheckIcon /> : i + 1}
                        </div>
                        <span className={`text-xs hidden sm:inline ${i === formStep ? 'text-white' : 'text-gray-600'}`}>{label}</span>
                        {i < STEP_LABELS.length - 1 && <div className={`w-6 h-px hidden sm:block ${i < formStep ? 'bg-emerald-500/30' : 'bg-white/[0.06]'}`} />}
                      </div>
                    ))}
                  </div>

                  {/* Step content */}
                  <AnimatePresence mode="wait">
                    {/* Step 0: Contact Info */}
                    {formStep === 0 && (
                      <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                            <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} required
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all"
                              placeholder="John Smith" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                            <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} required
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all"
                              placeholder="john@company.com" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                          <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} required
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all"
                            placeholder="+1 (555) 123-4567" />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Business Details */}
                    {formStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Company Name *</label>
                            <input type="text" value={formData.company} onChange={e => updateField('company', e.target.value)} required
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all"
                              placeholder="Your Company, Inc." />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Company Size *</label>
                            <select value={formData.companySize} onChange={e => updateField('companySize', e.target.value)} required
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all">
                              <option value="" disabled className="bg-deep-space">Select size</option>
                              {COMPANY_SIZE_OPTIONS.map(o => <option key={o} value={o} className="bg-deep-space">{o}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Industry *</label>
                          <select value={formData.industry} onChange={e => updateField('industry', e.target.value)} required
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all">
                            <option value="" disabled className="bg-deep-space">Select industry</option>
                            {INDUSTRY_OPTIONS.map(o => <option key={o} value={o} className="bg-deep-space">{o}</option>)}
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Service */}
                    {formStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Service Interested In *</label>
                          <select value={formData.service} onChange={e => updateField('service', e.target.value)} required
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all">
                            <option value="" disabled className="bg-deep-space">Select a service</option>
                            {SERVICE_OPTIONS.map(o => <option key={o} value={o} className="bg-deep-space">{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Message *</label>
                          <textarea value={formData.message} onChange={e => updateField('message', e.target.value)} required rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.06] transition-all resize-none"
                            placeholder="Tell us about your business and what you're looking for..." />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Review */}
                    {formStep === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                          {[
                            { label: 'Name', value: formData.name },
                            { label: 'Email', value: formData.email },
                            { label: 'Phone', value: formData.phone },
                            { label: 'Company', value: formData.company },
                            { label: 'Size', value: formData.companySize },
                            { label: 'Industry', value: formData.industry },
                            { label: 'Service', value: formData.service },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <p className="text-xs text-gray-500 mb-1">Message</p>
                          <p className="text-sm text-gray-300">{formData.message}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => formStep > 0 && setFormStep(s => s - 1)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        formStep > 0 ? 'text-gray-300 hover:bg-white/[0.05]' : 'text-gray-700 cursor-default'
                      }`}
                      disabled={formStep === 0}
                    >
                      <ChevronLeftIcon /> Back
                    </button>

                    {formStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => canProceedStep() && setFormStep(s => s + 1)}
                        disabled={!canProceedStep()}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-aurora-cyan to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Next <ChevronRightIcon />
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-aurora-cyan to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submitting ? 'Sending...' : <><SendIcon /> Send Message</>}
                        </button>
                        {submitError && (
                          <p className="text-red-400 text-sm mt-2">{submitError}</p>
                        )}
                      </>
                    )}
                  </div>
                </form>
              )}
            </motion.div>

            {/* RIGHT — Demo Scheduler + Info Cards */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} className="space-y-6">
              {/* Demo Scheduling Card */}
              <div className={`p-6 rounded-2xl border transition-all ${
                scheduleDemo
                  ? 'bg-gradient-to-br from-aurora-cyan/[0.06] via-transparent to-purple-600/[0.04] border-aurora-cyan/20'
                  : 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <BotIcon /> Schedule a Live Demo
                  </h3>
                  {!scheduleDemo && (
                    <button
                      onClick={() => setScheduleDemo(true)}
                      className="px-4 py-1.5 rounded-full bg-aurora-cyan/15 text-aurora-cyan text-xs font-medium border border-aurora-cyan/20 hover:bg-aurora-cyan/25 transition-all"
                    >
                      Book Now
                    </button>
                  )}
                </div>

                {scheduleDemo ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">Pick a date and time for your personalized demo. We&apos;ll prepare a walkthrough tailored to your industry.</p>
                    <CalendarPicker
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onDateSelect={d => { setSelectedDate(d); setSelectedTime(null) }}
                      onTimeSelect={setSelectedTime}
                    />
                    {selectedDate && selectedTime && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-3 border-t border-white/[0.06]"
                      >
                        <div className="flex items-center gap-2 text-sm text-emerald-400 mb-3">
                          <CheckIcon /> Demo scheduled for{' '}
                          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {selectedTime}
                        </div>
                        <button
                          onClick={() => {
                            setScheduleDemo(false)
                            setSelectedDate(null)
                            setSelectedTime(null)
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aurora-cyan to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
                        >
                          Confirm Booking
                        </button>
                      </motion.div>
                    )}
                    <button
                      onClick={() => { setScheduleDemo(false); setSelectedDate(null); setSelectedTime(null) }}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">See our AI phone agent in action with a personalized walkthrough. We&apos;ll tailor the demo to your specific industry and use case.</p>
                )}
              </div>

              {/* Why Choose Us */}
              <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><BotIcon /> Why Choose FrontDesk Agents AI?</h3>
                <ul className="space-y-3">
                  {[
                    'Enterprise-grade AI voice technology',
                    'Setup in under 24 hours',
                    '24/7 support from real humans',
                    'No long-term contracts required',
                    'SOC 2 compliant & encrypted',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-400 text-sm">
                      <span className="text-emerald-400 mt-0.5 shrink-0"><CheckIcon /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-aurora-cyan/5 via-transparent to-purple-600/5 border border-aurora-cyan/10">
                <h3 className="text-xl font-semibold mb-2">Prefer to call?</h3>
                <p className="text-gray-400 text-sm mb-4">Speak directly with our sales team. We&apos;re available Monday through Friday, 9 AM to 6 PM PST.</p>
                <a href="tel:+1888555AGENTS" className="text-2xl font-bold bg-gradient-to-r from-aurora-cyan to-blue-400 bg-clip-text text-transparent">+1 (888) 555-AGENTS</a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TRUST SIGNALS ─── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Join the growing community of businesses that trust FrontDesk Agents AI to handle their calls.</p>
          </motion.div>

          {/* Stats counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {[
              { target: '25M+', displaySuffix: 'M+', label: 'Calls Handled' },
              { target: '10K+', displaySuffix: 'K+', label: 'Active Businesses' },
              { target: '200+', label: 'Languages Supported' },
              { target: '99.9', displaySuffix: '%', label: 'Uptime Guarantee' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] text-center group hover:border-aurora-cyan/20 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-aurora-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <AnimatedCountUp target={stat.target} displaySuffix={stat.displaySuffix} label={stat.label} />
                  {stat.label === 'Average Rating' && (
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= 4} />)}
                      <span className="text-xs text-gray-500 ml-1">(2.4K+ reviews)</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
            <h3 className="text-center text-lg font-semibold mb-8">What Our Customers Say</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:border-aurora-cyan/20 transition-all"
                >
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= t.rating} />)}
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust bar */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }} className="mt-14 pt-8 border-t border-white/[0.04]">
            <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-4">Featured In</p>
            <div className="overflow-hidden">
              <div className="carousel-track flex items-center gap-12 sm:gap-20">
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">TechCrunch</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Forbes</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">VentureBeat</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Business Insider</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">ZDNet</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">The Verge</span>
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

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-4 bg-white/[0.02] scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Can&apos;t find what you&apos;re looking for? <a href="#contact-form" className="text-aurora-cyan hover:underline">Send us a message</a>.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-6">
            {FAQ_ITEMS.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} isOpen={openFaqIndex === index} onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="relative p-8 sm:p-12 rounded-3xl overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-purple-600/5 to-aurora-cyan/10 border border-aurora-cyan/20 rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-aurora-cyan/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Ready to Transform Your Business Communications?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using FrontDesk Agents AI to handle calls, book appointments, and qualify leads — automatically.{' '}
              <Link href="/partners#referral" className="text-aurora-cyan underline hover:text-white transition-colors">Refer a firm → $1,000.</Link>
            </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/pricing" className="px-8 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">View Plans & Pricing</Link>
                <Link href="/demo" className="px-8 py-3 rounded-full border border-white/[0.12] text-gray-300 font-medium hover:bg-white/[0.05] hover:text-white transition-all">Book a Demo</Link>
              </div>
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
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/ai-receptionist" className="hover:text-white transition-colors">Legal AI</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">Partners</Link></li>
                <li><Link href="/industries" className="hover:text-white transition-colors">Industries</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
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
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
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
