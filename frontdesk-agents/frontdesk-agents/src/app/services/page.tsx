'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LegalServicesModal from '@/components/LegalServicesModal'

// ─── SVG Icons ──────────────────────────────────────────

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
)

const RouteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 014.48-2.04z" /><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-4.48-2.04z" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
  </svg>
)

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" /></svg>
)

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
)

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={filled ? 'text-amber-400' : 'text-gray-600'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// ─── Animation Variants ──────────────────────────────────

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

// ─── Sub-components ──────────────────────────────────────

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

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

// ─── DATA ────────────────────────────────────────────────

const CAPABILITIES_CATEGORIES = [
  {
    id: 'call-handling',
    name: 'Call Handling',
    icon: PhoneIcon,
    color: 'from-aurora-cyan to-blue-500',
    features: [
      { title: 'Neural Voice Answering', desc: 'Natural conversational AI with advanced neural voice synthesis. Handles multiple calls simultaneously with zero hold time — no busy signals, no voicemail black holes.' },
      { title: '24/7/365 Availability', desc: 'Your AI receptionist never sleeps. Answers every call — holidays, weekends, midnight, lunch breaks. Unlimited simultaneous call handling capacity.' },
      { title: 'Call Transcription & Summarization', desc: 'Every call is automatically transcribed in real-time with speaker diarization. AI-generated summaries capture key points, action items, and follow-up tasks.' },
      { title: 'Smart Call Routing', desc: 'Intent-based routing directs calls to the right department or person. Warm transfers pass full conversation context so callers never repeat themselves.' },
      { title: 'Voicemail & Message Taking', desc: 'When no one is available, the AI takes detailed messages, captures caller intent, and prioritizes urgency. Messages are delivered via SMS, email, or dashboard.' },
    ],
  },
  {
    id: 'scheduling',
    name: 'Appointment Scheduling',
    icon: CalendarIcon,
    color: 'from-emerald-400 to-teal-500',
    features: [
      { title: 'Two-Way Calendar Sync', desc: 'Seamless integration with Google Calendar, Outlook, and Calendly. The AI reads your availability, books appointments, and updates your calendar in real-time.' },
      { title: 'Intelligent Time-Slot Optimization', desc: 'AI analyzes booking patterns to suggest optimal time slots. Balances provider schedules, reduces gaps, and maximizes daily booking capacity.' },
      { title: 'Multi-Provider Scheduling', desc: 'Handle complex schedules across multiple locations and providers. The AI knows who is available, where, and for what type of appointment.' },
      { title: 'Automated Reminders', desc: 'Sends appointment reminders via SMS and email. Configurable reminder cadence (24h, 2h, 30min). Reduces no-shows by up to 60%.' },
      { title: 'Rescheduling & Cancellation', desc: 'Callers can reschedule or cancel appointments through natural conversation. The AI updates the calendar, sends confirmations, and offers alternative slots.' },
    ],
  },
  {
    id: 'qualification',
    name: 'Lead Qualification',
    icon: TargetIcon,
    color: 'from-purple-500 to-pink-500',
    features: [
      { title: 'Real-Time Lead Scoring', desc: 'AI evaluates every caller against your qualification criteria during the conversation. Scores are calculated based on intent, budget, timeline, and authority signals.' },
      { title: 'Buying Signal Detection', desc: 'Advanced NLP detects purchase intent, urgency, and interest levels. The AI recognizes keywords, tone, and sentiment to identify hot leads.' },
      { title: 'Custom Qualification Rules', desc: 'Configure your ideal customer profile. The AI asks qualifying questions, captures responses, and routes high-value leads to your team instantly.' },
      { title: 'Instant Notifications', desc: 'High-quality leads trigger immediate SMS or email alerts to your sales team. Includes full conversation summary and lead score.' },
      { title: 'CRM Integration', desc: 'Automatically creates and updates CRM contacts with enriched data from every call. Syncs with HubSpot, Salesforce, Zoho, and more.' },
    ],
  },
  {
    id: 'languages',
    name: 'Multi-Language Support',
    icon: GlobeIcon,
    color: 'from-amber-500 to-orange-500',
    features: [
      { title: '200+ Languages', desc: 'Native-level understanding and natural-sounding output in every major language worldwide. Covers dialects, regional variations, and industry-specific terminology.' },
      { title: 'Real-Time Language Detection', desc: 'The AI detects which language a caller is speaking and responds in the same language — mid-conversation switching is seamless.' },
      { title: 'Accent Adaptation', desc: 'Advanced acoustic models handle diverse accents, speech patterns, and speaking speeds. Provides optimal comprehension across global callers.' },
      { title: 'Brand Voice Localization', desc: 'Maintain consistent brand personality across all languages. Tone, formality, and messaging are preserved in every supported language.' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    icon: ChartIcon,
    color: 'from-indigo-500 to-violet-500',
    features: [
      { title: 'Real-Time Dashboard', desc: 'Live metrics dashboard showing active calls, today\'s volume, conversion rates, and sentiment trends. Drill down into individual call recordings and transcripts.' },
      { title: 'Sentiment Analysis', desc: 'Track customer sentiment over time — per call, per day, per agent. Identify satisfaction trends, recurring issues, and coaching opportunities.' },
      { title: 'Conversion Funnel Tracking', desc: 'Monitor call-to-action conversion rates. Track how many callers book appointments, get qualified, or convert to paying customers.' },
      { title: 'Custom Reports', desc: 'Exportable reports in CSV and PDF formats. Scheduled email delivery to stakeholders. Build custom dashboards for your specific KPIs.' },
    ],
  },
  {
    id: 'integrations',
    name: 'Integrations & API',
    icon: CpuIcon,
    color: 'from-rose-500 to-cinematic-red',
    features: [
      { title: 'Calendar Integration', desc: 'Google Calendar, Outlook, Calendly, iCal. Two-way sync for appointment booking and availability management.' },
      { title: 'CRM Integration', desc: 'HubSpot, Salesforce, Zoho, Pipedrive. Automatic contact creation, enrichment, and activity logging.' },
      { title: 'Telephony & Messaging', desc: 'Twilio, RingCentral, Zoom Phone, Slack. Connect your existing phone system and communication tools.' },
      { title: 'Payment Processing', desc: 'Stripe, Square integration for taking payments over the phone. PCI-compliant payment capture with tokenization.' },
      { title: 'API & Webhooks', desc: 'Full REST API and webhook support for custom integrations. Build your own workflows, triggers, and automations.' },
    ],
  },
]

const INDUSTRIES = [
  {
    name: 'Healthcare',
    icon: '🏥',
    color: 'from-emerald-400 to-emerald-600',
    compliance: 'HIPAA-compliant',
    cases: [
      '24/7 patient appointment scheduling & rescheduling with provider preferences',
      'Prescription refill request handling with pharmacy coordination',
      'Insurance verification calls — checks coverage 3x faster than manual',
      'Emergency triage — identifies urgent cases and routes to on-call staff',
      'Follow-up call automation for post-visit care instructions',
      'Lab result inquiries — notifies patients when results are ready',
      'Specialist referral coordination with multi-office scheduling',
    ],
    testimonial: 'GlobalVoice handles 200+ patient calls daily. Our front desk can finally focus on patient care instead of the phone.',
    author: 'Dr. Sarah Chen',
    authorRole: 'BrightSmile Medical Center',
  },
  {
    name: 'Dental',
    icon: '🦷',
    color: 'from-cyan-400 to-blue-500',
    compliance: 'HIPAA-compliant',
    cases: [
      'New patient onboarding — collects medical history, insurance info, and consent forms',
      'Appointment management with hygiene vs. doctor visit distinction',
      'Emergency dental triage — assesses pain level and urgency',
      'Treatment plan follow-ups for restorative work and payment coordination',
      'Insurance eligibility and benefit verification before appointments',
      'Recall/recare call automation for 6-month cleaning reminders',
      'Missed appointment rescheduling with no-show reduction workflows',
    ],
    testimonial: 'Patient satisfaction scores jumped 25 points. The AI handles scheduling, refills, and FAQs flawlessly.',
    author: 'Dr. Amir Patel',
    authorRole: 'BrightSmile Dental Group',
  },
  {
    name: 'Legal',
    icon: '⚖️',
    color: 'from-purple-500 to-indigo-600',
    compliance: 'Client confidentiality',
    cases: [
      'Client intake and consultation booking with practice area matching',
      'Case status inquiry handling for existing clients',
      'Urgent matter prioritization — identifies time-sensitive legal issues',
      'Billing and invoice inquiries with payment processing',
      'Court date reminder calls with calendar event creation',
      'Document request handling and secure upload instructions',
      'Witness and deposition scheduling coordination',
    ],
    testimonial: 'We never miss a potential client call. The AI qualifies leads with uncanny accuracy before they even reach us.',
    author: 'Mike Rodriguez',
    authorRole: 'Rodriguez & Associates',
  },
  {
    name: 'Real Estate',
    icon: '🏠',
    color: 'from-amber-500 to-orange-500',
    compliance: 'Fair housing compliant',
    cases: [
      'Property inquiry qualification — budget, timeline, must-haves',
      'Showing scheduling with agent assignment by availability and area',
      'Open house registration and follow-up call automation',
      'Market update calls to past clients and leads',
      'Mortgage pre-approval referral and lender connection',
      'Offer submission coordination with agent notification',
      'Client appreciation and referral request calls',
    ],
    testimonial: 'Property inquiries are handled 24/7. We book 3x more showings now — even while we sleep.',
    author: 'Lisa Park',
    authorRole: 'Park Realty Group',
  },
  {
    name: 'HVAC & Home Services',
    icon: '🔧',
    color: 'from-red-500 to-rose-600',
    compliance: 'Service agreements',
    cases: [
      'Emergency dispatch — 2-hour response time commitment',
      'Service scheduling with technician skill matching',
      'Seasonal maintenance reminders for AC and heating tune-ups',
      'Estimate request handling with same-day callbacks',
      'Parts ordering coordination with customer notification',
      'Customer satisfaction callbacks after service completion',
      'Membership/service plan enrollment calls',
    ],
    testimonial: 'Emergency calls get routed instantly to our on-call team. Revenue increased 40% since we deployed GlobalVoice.',
    author: 'James Wilson',
    authorRole: 'Wilson HVAC Services',
  },
  {
    name: 'Medical Spa',
    icon: '💆',
    color: 'from-pink-400 to-fuchsia-500',
    compliance: 'HIPAA-compliant',
    cases: [
      'Treatment consultation booking with provider matching',
      'Product inquiry and order handling',
      'Appointment reminder calls with pre-care instructions',
      'Post-treatment follow-ups for satisfaction and rebooking',
      'Membership plan inquiries and upgrade calls',
      'Gift certificate sales and redemption scheduling',
      'Client re-activation campaigns for lapsed visitors',
    ],
    testimonial: 'Our front desk team can focus on in-person client experience while the AI handles scheduling and follow-ups.',
    author: 'Sophia Martinez',
    authorRole: 'Elite MedSpa Boutique',
  },
  {
    name: 'Automotive',
    icon: '🚗',
    color: 'from-blue-500 to-blue-700',
    compliance: 'PCI-ready',
    cases: [
      'Service appointment scheduling with loaner car coordination',
      'Sales inquiry qualification — model, budget, timeline',
      'Test drive booking with availability confirmation',
      'Service status updates with SMS notifications',
      'Recall notification calls with appointment booking',
      'Trade-in valuation appointment scheduling',
      'Customer satisfaction surveys and review requests',
    ],
    testimonial: 'Service bay utilization went from 70% to 95%. The AI handles all inbound service calls end-to-end.',
    author: 'Tom Harrison',
    authorRole: 'Harrison Auto Group',
  },
  {
    name: 'Insurance',
    icon: '🛡️',
    color: 'from-green-500 to-emerald-600',
    compliance: 'SMS-compliant',
    cases: [
      'Claims intake with severity assessment and adjuster routing',
      'Policy inquiry handling — coverage, deductibles, premiums',
      'Agent connection based on policy type and availability',
      'Premium payment reminders with payment link delivery',
      'Renewal quote delivery and acceptance calls',
      'New quote requests with multi-carrier comparison',
      'Fraud detection escalation for suspicious claims',
    ],
    testimonial: 'Claims intake is fully automated. Our agents only take calls that need a human touch. Game changer.',
    author: 'David Kim',
    authorRole: 'Kim Insurance Agency',
  },
]

const TECHNOLOGY = [
  {
    icon: CpuIcon,
    title: 'Neural Voice Engine',
    desc: 'Advanced text-to-speech with natural prosody, emotion, and pacing. Sub-500ms response time with streaming audio processing for natural conversation flow.',
    specs: ['Sub-500ms latency', 'Streaming audio', 'Emotion-aware prosody', 'Custom voice cloning'],
  },
  {
    icon: BrainIcon,
    title: 'Large Language Models',
    desc: 'Powered by state-of-the-art LLMs fine-tuned for phone conversations. Context-aware with zero-shot learning for new scenarios.',
    specs: ['GPT-4 class models', 'Phone-conversation fine-tuned', 'Multi-turn context (1hr+)', 'Zero-shot scenario handling'],
  },
  {
    icon: ShieldIcon,
    title: 'Enterprise Security',
    desc: 'End-to-end encryption, SOC 2 compliance, HIPAA-ready infrastructure. Your data never leaves our secure environment.',
    specs: ['AES-256 encryption', 'SOC 2 Type II', 'HIPAA BAA available', 'GDPR compliant'],
  },
  {
    icon: ZapIcon,
    title: 'Real-time Processing',
    desc: 'Sub-500ms response time with streaming audio processing. Natural conversation flow with no awkward pauses.',
    specs: ['Real-time STT/TTS', 'Streaming inference', '99.9% uptime SLA', 'Automatic failover'],
  },
]

const ROITEMS = [
  { icon: ClockIcon, label: 'Hours saved/week', value: '40+', desc: 'Eliminates 40+ hours of phone time per week' },
  { icon: PhoneIcon, label: 'Calls handled', value: '100%', desc: 'Every call answered — never a missed opportunity' },
  { icon: TargetIcon, label: 'Lead conversion', value: '+35%', desc: 'Average lead conversion improvement' },
  { icon: ShieldIcon, label: 'Cost reduction', value: '60-80%', desc: 'Vs. traditional receptionist costs' },
]

function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const numericPart = parseFloat(target.replace(/[^0-9.]/g, '')) || 0
  const displaySuffix = target.replace(/[0-9.]/g, '') + suffix

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 2000, steps = 30, increment = numericPart / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= numericPart) { setCount(numericPart); clearInterval(timer) }
            else setCount(current)
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [numericPart, hasAnimated])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-aurora-cyan via-aurora-cyan/80 to-aurora-cyan/60 bg-clip-text text-transparent">
      {numericPart % 1 === 0 ? Math.floor(count) : count.toFixed(1)}{displaySuffix}
    </div>
  )
}

// ─── Legal Services Special Door ─────────────────────────────────────────────

function LegalSpecialDoor({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="relative w-full p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-600/10 to-violet-600/10 border border-purple-500/30 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden group"
    >
      {/* Background glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500" />
      
      <div className="relative flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400 text-sm font-medium">⚖️ Special Door</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Legal Services AI</h3>
          <p className="text-sm text-gray-400">The comprehensive AI receptionist for law firms — open for any industry</p>
        </div>
        <div className="ml-auto shrink-0">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = [
    { q: 'How quickly can I set up the AI receptionist?', a: 'You can go live in under 2 hours. Connect your phone number, configure your business settings and FAQs, and the AI starts taking calls immediately. Full customization takes 1-2 days for complex setups.' },
    { q: 'Can the AI understand complex industry terminology?', a: 'Yes. We pre-train on industry-specific terminology for healthcare, legal, dental, real estate, HVAC, and more. You can also upload custom glossaries, FAQs, and knowledge bases to further improve accuracy.' },
    { q: 'Does the AI handle multiple languages on the same call?', a: 'Absolutely. The AI detects which language a caller is speaking and responds in the same language. It can switch between languages mid-conversation if needed.' },
    { q: 'How does call escalation to humans work?', a: 'When a caller asks for a human or the AI determines a situation requires human judgment, it performs a warm transfer — passing full conversation context including notes and action items so the caller never repeats themselves.' },
    { q: 'Is my call data used to train public AI models?', a: 'Never. Your call recordings, transcripts, and customer data remain private and are never used to train public models. You retain full ownership and can export your data anytime.' },
    { q: 'Can I customize the AI\'s voice and personality?', a: 'Yes. You can choose from multiple neural voices with different accents and styles. We also offer custom voice cloning to match your brand. Personality settings control tone, formality, and conversational style.' },
    { q: 'What happens if my call volume spikes?', a: 'The AI scales instantly with no additional configuration. There are no busy signals, no hold queues, and no dropped calls. You only pay for your plan\'s included minutes — no surprise charges.' },
  ]

  return (
    <div className="space-y-1 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
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

// ─── MAIN PAGE ───────────────────────────────────────────

export default function ServicesPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeCategory, setActiveCategory] = useState('call-handling')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)

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

  const activeData = CAPABILITIES_CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <div className="min-h-screen bg-deep-space text-white font-body overflow-x-hidden">
      {/* Floating BG Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-aurora-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-display text-lg font-bold hidden sm:inline">GlobalVoice<span className="text-aurora-cyan"> AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="/services" className="text-sm text-aurora-cyan hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-aurora-cyan">Services</a>
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full">Demo</a>
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full">Pricing</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-aurora-cyan after:transition-all hover:after:w-full">Contact</a>
            <a href="/pricing" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all hover:scale-105">
              Get Started
            </a>
          </div>

          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="Open menu">
            <span className="w-5 h-px bg-white/70 rounded-full" /><span className="w-5 h-px bg-white/70 rounded-full" /><span className="w-5 h-px bg-white/70 rounded-full" />
          </button>
        </div>

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
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="text-xl text-aurora-cyan transition-colors">Services</a>
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Demo</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Contact</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold">Get Started</a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-cyan/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-aurora-cyan/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-aurora-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise AI Phone Agent Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              AI Receptionist{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-aurora-cyan/70 to-aurora-cyan/40 bg-clip-text text-transparent">
                Capabilities
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              From neural voice calls to smart scheduling to multi-language support — GlobalVoice AI provides a complete,
              enterprise-grade AI receptionist platform. Every capability is production-tested and deployed in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
                Try Live Demo
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300">
                See Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ROI / STATS BANNER ─── */}
      <section className="py-14 px-4 bg-white/[0.02] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {ROITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mx-auto mb-3 text-aurora-cyan">
                    <Icon />
                  </div>
                  <CountUp target={item.value} />
                  <div className="text-sm font-medium text-white mt-1">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES / FEATURE EXPLORER ─── */}
      <section id="capabilities" className="py-20 md:py-28 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Full Capability Breakdown"
            subtitle="Every feature of the GlobalVoice AI receptionist platform — explained in detail."
          />

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {CAPABILITIES_CATEGORIES.map(cat => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon />
                  {cat.name}
                </button>
              )
            })}
          </div>

          {/* Active Category Features */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeData.features.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 hover:scale-[1.01] hover:shadow-lg hover:shadow-aurora-cyan/5 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeData.color} p-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <CheckIcon />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── INDUSTRIES ─── */}
      <section id="industries" className="py-20 md:py-28 px-4 bg-white/[0.02] scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Industry-Specific Solutions"
            subtitle="Pre-trained on industry terminology, compliance requirements, and workflows. Deploy-ready for your vertical."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true, margin: '-40px' }}
                className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ind.color} flex items-center justify-center text-2xl`}>
                      {ind.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white font-display">{ind.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20">
                        {ind.compliance}
                      </span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {ind.cases.map((c, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-emerald-400/70 mt-0.5 shrink-0"><CheckIcon /></span>
                      {c}
                    </li>
                  ))}
                </ul>
                {/* Testimonial quote */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <QuoteIcon />
                  <p className="text-sm text-gray-300 italic leading-relaxed mb-2">&ldquo;{ind.testimonial}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= 5} />)}
                    </div>
                    <span className="text-xs text-gray-500">— {ind.author}, {ind.authorRole}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legal Services Special Door */}
          <div className="mt-8">
            <LegalSpecialDoor onOpen={() => setLegalModalOpen(true)} />
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGY ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="The Technology Behind the Voice"
            subtitle="Enterprise-grade AI infrastructure powering millions of conversations with sub-500ms response times."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECHNOLOGY.map((tech, i) => {
              const Icon = tech.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-4 text-aurora-cyan group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  <h3 className="font-semibold text-white mb-2 font-display">{tech.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">{tech.desc}</p>
                  <div className="space-y-1.5">
                    {tech.specs.map((spec, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1 h-1 rounded-full bg-aurora-cyan/40" />
                        {spec}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="Trusted by Industry Leaders"
            subtitle="See how businesses across industries use GlobalVoice AI to transform their phone operations."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Dr. Sarah Chen', role: 'Medical Practice Owner', text: 'Patient satisfaction scores jumped 25 points since deploying GlobalVoice. The AI handles scheduling, refills, and FAQs flawlessly — our staff can finally focus on care.', rating: 5 },
              { name: 'Mike Rodriguez', role: 'Law Firm Partner', text: 'We never miss a potential client call. The AI qualifies leads with uncanny accuracy. Our conversion rate increased 40% in the first month.', rating: 5 },
              { name: 'Lisa Park', role: 'Real Estate Broker', text: 'Property inquiries are handled 24/7. We book 3x more showings now — even while we sleep. The key is the natural voice that callers trust immediately.', rating: 5 },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-300"
              >
                <QuoteIcon />
                <p className="text-sm text-gray-200 italic leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center text-xs font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <span key={j} className="text-amber-400"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
                      ))}
                    </div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="Go Live in Hours, Not Weeks"
            subtitle="No complex setup, no engineering team required. Your AI receptionist takes calls the same day."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Connect Your Number', desc: 'Port your existing business number or get a new one. Setup wizard guides you through configuration in minutes.' },
              { step: 2, title: 'Train Your AI', desc: 'Customize with your business info, hours, services, and FAQs. Train on your brand voice and industry terminology.' },
              { step: 3, title: 'Go Live', desc: 'Your AI receptionist starts taking calls immediately. Monitor performance and fine-tune responses from the dashboard.' },
              { step: 4, title: 'Scale & Optimize', desc: 'Add more numbers, languages, and features as you grow. The AI improves with every conversation.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 border border-aurora-cyan/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-aurora-cyan">{item.step}</span>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-aurora-cyan/40 to-transparent" />}
                <h3 className="font-semibold mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTEGRATIONS ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Works With Your Stack"
            subtitle="Seamless integrations with the tools you already use. No rip-and-replace required."
          />

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Google Calendar', cat: 'Calendar' }, { name: 'Outlook', cat: 'Calendar' }, { name: 'Calendly', cat: 'Calendar' },
              { name: 'HubSpot', cat: 'CRM' }, { name: 'Salesforce', cat: 'CRM' }, { name: 'Zoho', cat: 'CRM' },
              { name: 'Twilio', cat: 'Telephony' }, { name: 'RingCentral', cat: 'Telephony' }, { name: 'Zoom Phone', cat: 'Telephony' },
              { name: 'Slack', cat: 'Messaging' }, { name: 'Zapier', cat: 'Automation' }, { name: 'Make', cat: 'Automation' },
              { name: 'Stripe', cat: 'Payments' }, { name: 'Square', cat: 'Payments' }, { name: 'OpenAI', cat: 'AI' },
              { name: 'Anthropic', cat: 'AI' }, { name: 'Supabase', cat: 'Database' }, { name: 'PostgreSQL', cat: 'Database' },
            ].map((int, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-aurora-cyan/20 hover:scale-105 transition-all duration-200 cursor-default"
              >
                <span className="text-sm text-gray-300">{int.name}</span>
                <span className="ml-2 text-[10px] text-gray-600 uppercase tracking-wider">{int.cat}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about GlobalVoice AI capabilities and implementation."
          />
          <FaqSection />
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-purple-600/5 to-aurora-cyan/10 border border-aurora-cyan/20 rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-aurora-cyan/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
                Ready to Transform Your Phone System?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of businesses using GlobalVoice AI. Start your 14-day free trial — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
                  Try Live Demo
                </Link>
                <Link href="/pricing" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300">
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

      {/* ─── FOOTER ─── */}
      <footer className="py-14 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                  <BotIcon />
                </div>
                <span className="font-bold font-display">GlobalVoice AI</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">The world&apos;s most advanced AI receptionist platform. Available 24/7 in 200+ languages.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-gray-300 transition-colors cursor-default">About</li>
                <li className="hover:text-gray-300 transition-colors cursor-default">Blog</li>
                <li className="hover:text-gray-300 transition-colors cursor-default">Careers</li>
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

      {/* Legal Services Modal */}
      <LegalServicesModal isOpen={legalModalOpen} onClose={() => setLegalModalOpen(false)} source="Services Page" />
    </div>
  )
}
