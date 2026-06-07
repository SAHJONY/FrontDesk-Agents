'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/Footer'

// ─── SVG ICONS ──────────────────────────────────────────

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
)

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
)

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </svg>
)

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" /></svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
)

// ─── US STATES DATA ──────────────────────────────────────

const US_STATES = [
  { name: 'Alabama', abbr: 'AL', districts: 3 },
  { name: 'Alaska', abbr: 'AK', districts: 1 },
  { name: 'Arizona', abbr: 'AZ', districts: 1 },
  { name: 'Arkansas', abbr: 'AR', districts: 2 },
  { name: 'California', abbr: 'CA', districts: 4 },
  { name: 'Colorado', abbr: 'CO', districts: 1 },
  { name: 'Connecticut', abbr: 'CT', districts: 1 },
  { name: 'Delaware', abbr: 'DE', districts: 1 },
  { name: 'Florida', abbr: 'FL', districts: 3 },
  { name: 'Georgia', abbr: 'GA', districts: 3 },
  { name: 'Hawaii', abbr: 'HI', districts: 1 },
  { name: 'Idaho', abbr: 'ID', districts: 1 },
  { name: 'Illinois', abbr: 'IL', districts: 3 },
  { name: 'Indiana', abbr: 'IN', districts: 2 },
  { name: 'Iowa', abbr: 'IA', districts: 2 },
  { name: 'Kansas', abbr: 'KS', districts: 1 },
  { name: 'Kentucky', abbr: 'KY', districts: 2 },
  { name: 'Louisiana', abbr: 'LA', districts: 3 },
  { name: 'Maine', abbr: 'ME', districts: 1 },
  { name: 'Maryland', abbr: 'MD', districts: 1 },
  { name: 'Massachusetts', abbr: 'MA', districts: 1 },
  { name: 'Michigan', abbr: 'MI', districts: 2 },
  { name: 'Minnesota', abbr: 'MN', districts: 1 },
  { name: 'Mississippi', abbr: 'MS', districts: 2 },
  { name: 'Missouri', abbr: 'MO', districts: 2 },
  { name: 'Montana', abbr: 'MT', districts: 1 },
  { name: 'Nebraska', abbr: 'NE', districts: 1 },
  { name: 'Nevada', abbr: 'NV', districts: 1 },
  { name: 'New Hampshire', abbr: 'NH', districts: 1 },
  { name: 'New Jersey', abbr: 'NJ', districts: 1 },
  { name: 'New Mexico', abbr: 'NM', districts: 1 },
  { name: 'New York', abbr: 'NY', districts: 4 },
  { name: 'North Carolina', abbr: 'NC', districts: 3 },
  { name: 'North Dakota', abbr: 'ND', districts: 1 },
  { name: 'Ohio', abbr: 'OH', districts: 2 },
  { name: 'Oklahoma', abbr: 'OK', districts: 3 },
  { name: 'Oregon', abbr: 'OR', districts: 1 },
  { name: 'Pennsylvania', abbr: 'PA', districts: 3 },
  { name: 'Rhode Island', abbr: 'RI', districts: 1 },
  { name: 'South Carolina', abbr: 'SC', districts: 1 },
  { name: 'South Dakota', abbr: 'SD', districts: 1 },
  { name: 'Tennessee', abbr: 'TN', districts: 3 },
  { name: 'Texas', abbr: 'TX', districts: 4 },
  { name: 'Utah', abbr: 'UT', districts: 1 },
  { name: 'Vermont', abbr: 'VT', districts: 1 },
  { name: 'Virginia', abbr: 'VA', districts: 2 },
  { name: 'Washington', abbr: 'WA', districts: 2 },
  { name: 'West Virginia', abbr: 'WV', districts: 2 },
  { name: 'Wisconsin', abbr: 'WI', districts: 2 },
  { name: 'Wyoming', abbr: 'WY', districts: 1 },
]

const TOTAL_DISTRICTS = US_STATES.reduce((sum, s) => sum + s.districts, 0)

// ─── PRACTICE AREAS ─────────────────────────────────────

const PRACTICE_AREAS = [
  { id: 'personal_injury', name: 'Personal Injury', icon: '⚕️', baseWinRate: 65, color: 'from-aurora-cyan to-blue-500' },
  { id: 'family_law', name: 'Family Law', icon: '👨‍👩‍👧', baseWinRate: 58, color: 'from-purple-500 to-pink-500' },
  { id: 'criminal_defense', name: 'Criminal Defense', icon: '🛡️', baseWinRate: 45, color: 'from-red-500 to-rose-500' },
  { id: 'corporate_law', name: 'Corporate Law', icon: '🏢', baseWinRate: 72, color: 'from-emerald-400 to-teal-500' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠', baseWinRate: 70, color: 'from-amber-500 to-orange-500' },
  { id: 'immigration', name: 'Immigration', icon: '🌐', baseWinRate: 55, color: 'from-indigo-500 to-violet-500' },
  { id: 'employment', name: 'Employment Law', icon: '💼', baseWinRate: 60, color: 'from-blue-500 to-cyan-500' },
  { id: 'intellectual_property', name: 'IP & Patents', icon: '💡', baseWinRate: 68, color: 'from-fuchsia-500 to-rose-500' },
]

// ─── FEATURES DATA ──────────────────────────────────────

const FEATURES = [
  { icon: GlobeIcon, title: '50-State Coverage', desc: 'Trained on statutes and regulations across all 50 US states. Your AI knows local law.' },
  { icon: BuildingIcon, title: '94 Federal Districts', desc: 'Pre-configured for every US federal district court with jurisdiction-specific protocols.' },
  { icon: TargetIcon, title: 'Win Probability Scoring', desc: 'AI analyzes case facts against historical outcomes to predict success probability.' },
  { icon: ShieldIcon, title: 'Attorney-Client Privilege', desc: 'Built-in confidentiality safeguards. All calls encrypted and compliant with privilege rules.' },
  { icon: ZapIcon, title: 'Instant Client Intake', desc: 'Captures case details, qualifies clients, and books consultations automatically.' },
  { icon: TrendingUpIcon, title: 'Case Value Estimation', desc: 'AI-powered settlement range prediction based on jurisdiction, practice area, and claim type.' },
]

const METRICS = [
  { value: '50', suffix: '', label: 'States Covered', decimals: 0 },
  { value: '94', suffix: '', label: 'Federal Districts', decimals: 0 },
  { value: '8', suffix: '', label: 'Practice Areas', decimals: 0 },
  { value: '92', suffix: '%', label: 'Intake Accuracy', decimals: 0 },
]

const TESTIMONIALS = [
  { name: 'Michael Rodriguez', role: 'Managing Partner', text: "We've recovered 40% more billable hours since deploying the AI receptionist. Client intake that used to take 20 minutes now takes 3.", rating: 5, firm: 'Rodriguez & Associates' },
  { name: 'Jennifer Walsh', role: 'Solo Practitioner', text: "I was skeptical about AI handling client calls, but the win probability scoring alone has been game-changing. It helps me prioritize cases instantly.", rating: 5, firm: 'Walsh Legal LLC' },
  { name: 'David Kim', role: 'Senior Partner', text: "Covering all 94 federal districts was our biggest challenge. Now every call gets jurisdiction-specific intake. Our out-of-state client conversion is up 35%.", rating: 5, firm: 'Kim & Partners' },
]

// ─── CINEMATIC AVATAR DATA ──────────────────────────────

const CINEMATIC_AVATARS = [
  { id: 'sage', name: 'Sage', style: 'Authoritative Counselor', gradient: 'from-slate-500 to-gray-700', emoji: '👨‍⚖️', desc: 'Deep, measured tone. Ideal for corporate and high-stakes litigation.' },
  { id: 'clara', name: 'Clara', style: 'Empathetic Advocate', gradient: 'from-rose-400 to-pink-600', emoji: '👩‍💼', desc: 'Warm, reassuring voice. Perfect for family law and personal injury.' },
  { id: 'rex', name: 'Rex', style: 'Aggressive Litigator', gradient: 'from-red-500 to-orange-600', emoji: '🦁', desc: 'Commanding presence. Built for criminal defense and high-pressure negotiations.' },
  { id: 'nova', name: 'Nova', style: 'Precision Analyst', gradient: 'from-aurora-cyan to-blue-600', emoji: '🤖', desc: 'Crisp, analytical tone. Designed for IP, patents, and technical legal matters.' },
]

// ─── ANIMATION VARIANTS ─────────────────────────────────

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] } }) }
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }

// ─── WIN PROBABILITY CALCULATOR ────────────────────────

function WinProbabilityCalculator() {
  const [practiceArea, setPracticeArea] = useState('personal_injury')
  const [state, setState] = useState('CA')
  const [claimValue, setClaimValue] = useState(50000)
  const [evidenceStrength, setEvidenceStrength] = useState(3)
  const [juryTrial, setJuryTrial] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<{ probability: number; range: [number, number]; confidence: string; recommendation: string } | null>(null)

  const area = PRACTICE_AREAS.find(a => a.id === practiceArea)!
  const stateData = US_STATES.find(s => s.abbr === state)!

  const calculateProbability = useCallback(() => {
    setIsCalculating(true)
    setTimeout(() => {
      const baseProb = area.baseWinRate
      const evidenceMod = (evidenceStrength - 3) * 8
      const juryMod = juryTrial ? -8 : 5
      const stateMod = Math.min(stateData.districts * 1.5, 12)
      const valueMod = claimValue > 100000 ? -5 : claimValue > 25000 ? 2 : 4

      const rawProb = Math.min(99, Math.max(1, baseProb + evidenceMod + juryMod + stateMod + valueMod))
      const probability = Math.round(rawProb)
      const variance = 8
      const range: [number, number] = [Math.max(1, probability - variance), Math.min(99, probability + variance)]

      const confidence = probability >= 75 ? 'High' : probability >= 50 ? 'Moderate' : 'Caution Advised'
      const recommendation = probability >= 70
        ? 'Strong case — recommend pursuing with full resources'
        : probability >= 45
          ? 'Viable case — consider settlement negotiation'
          : 'Challenging case — evaluate risk carefully before proceeding'

      setResult({ probability, range, confidence, recommendation })
      setIsCalculating(false)
    }, 800)
  }, [claimValue, evidenceStrength, juryTrial, area.baseWinRate, stateData.districts])

  useEffect(() => {
    calculateProbability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
          <TargetIcon />
        </div>
        <div>
          <h3 className="text-xl font-semibold font-display">Win Probability Estimator</h3>
          <p className="text-sm text-gray-500">AI-powered case outcome prediction based on jurisdiction and practice area</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Practice Area</label>
          <select
            value={practiceArea}
            onChange={e => setPracticeArea(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-aurora-cyan/50 transition-colors"
          >
            {PRACTICE_AREAS.map(a => (
              <option key={a.id} value={a.id} className="bg-deep-space">{a.icon} {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Jurisdiction (State)</label>
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-aurora-cyan/50 transition-colors"
          >
            {US_STATES.map(s => (
              <option key={s.abbr} value={s.abbr} className="bg-deep-space">{s.name} ({s.abbr})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Estimated Claim Value</label>
          <select
            value={claimValue}
            onChange={e => setClaimValue(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-aurora-cyan/50 transition-colors"
          >
            <option value={10000} className="bg-deep-space">Under $10,000</option>
            <option value={25000} className="bg-deep-space">$10,000 - $25,000</option>
            <option value={50000} className="bg-deep-space">$25,000 - $50,000</option>
            <option value={100000} className="bg-deep-space">$50,000 - $100,000</option>
            <option value={250000} className="bg-deep-space">$100,000 - $250,000</option>
            <option value={500000} className="bg-deep-space">$250,000+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Evidence Strength</label>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(strength => (
              <button
                key={strength}
                onClick={() => setEvidenceStrength(strength)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  evidenceStrength >= strength
                    ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
                    : 'bg-white/[0.04] text-gray-600 border border-white/[0.06] hover:border-aurora-cyan/10'
                }`}
              >
                {strength}
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {['Weak', 'Fair', 'Average', 'Strong', 'Overwhelming'][evidenceStrength - 1]}
            </span>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setJuryTrial(!juryTrial)}
              className={`relative w-11 h-6 rounded-full transition-colors ${juryTrial ? 'bg-aurora-cyan' : 'bg-white/[0.12]'}`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md"
                animate={{ x: juryTrial ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
            <span className="text-sm text-gray-300">Jury Trial (vs. Bench Trial)</span>
            <span className="text-xs text-gray-600">— jury trials typically have more variable outcomes</span>
          </label>
        </div>
      </div>

      <button
        onClick={calculateProbability}
        disabled={isCalculating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all disabled:opacity-50"
      >
        {isCalculating ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
            Analyzing...
          </span>
        ) : 'Calculate Win Probability'}
      </button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result ? 'result' : 'placeholder'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="mt-6 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="text-center sm:text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Win Probability</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold font-display ${result.probability >= 60 ? 'text-emerald-400' : result.probability >= 40 ? 'text-amber-400' : 'text-cinematic-red'}`}>
                    {result.probability}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Range: {result.range[0]}% – {result.range[1]}%</div>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  result.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  result.confidence === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    result.confidence === 'High' ? 'bg-emerald-400' : result.confidence === 'Moderate' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                  {result.confidence} Confidence
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">AI Recommendation</div>
                <p className="text-sm text-gray-300 leading-relaxed">{result.recommendation}</p>
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Jurisdiction</span>
                    <span className="text-gray-300">{stateData.name} ({stateData.abbr})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Practice Area</span>
                    <span className="text-gray-300">{area.icon} {area.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── CINEMATIC AVATARS SECTION ─────────────────────────

function CinematicAvatarsSection() {
  const [selectedAvatar, setSelectedAvatar] = useState(0)

  return (
    <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
            Cinematic AI Avatars
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Choose from four distinct cinematic-grade AI personas. Each avatar is voice-trained with Hollywood-level
            audio synthesis for courtroom-ready gravitas and client-facing warmth.
          </motion.p>
        </motion.div>

        {/* Avatar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CINEMATIC_AVATARS.map((avatar, i) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedAvatar(i)}
              className={`relative group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                selectedAvatar === i
                  ? 'border-aurora-cyan/30 bg-gradient-to-b from-aurora-cyan/5 to-transparent scale-[1.02]'
                  : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-aurora-cyan/20'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {avatar.emoji}
              </div>
              <h3 className="text-lg font-semibold font-display mb-1">{avatar.name}</h3>
              <div className="text-xs text-aurora-cyan/80 font-medium mb-2">{avatar.style}</div>
              <p className="text-sm text-gray-500 leading-relaxed">{avatar.desc}</p>
              {selectedAvatar === i && (
                <motion.div
                  layoutId="avatarSelected"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-aurora-cyan flex items-center justify-center"
                >
                  <CheckIcon />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Selected Avatar Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAvatar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-2xl border border-aurora-cyan/20 bg-gradient-to-br from-aurora-cyan/[0.04] via-transparent to-purple-600/[0.02]"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar Visualization */}
              <div className="relative w-32 h-32 shrink-0">
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${CINEMATIC_AVATARS[selectedAvatar].gradient} blur-xl opacity-50`}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-aurora-cyan/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-aurora-cyan/10"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
                <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${CINEMATIC_AVATARS[selectedAvatar].gradient} flex items-center justify-center text-5xl shadow-lg`}>
                  {CINEMATIC_AVATARS[selectedAvatar].emoji}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-xs text-aurora-cyan mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI Voice Active
                </div>
                <h3 className="text-2xl font-bold font-display mb-2">
                  {CINEMATIC_AVATARS[selectedAvatar].name} — {CINEMATIC_AVATARS[selectedAvatar].style}
                </h3>
                <p className="text-gray-400 mb-4">{CINEMATIC_AVATARS[selectedAvatar].desc}</p>
                <div className="flex flex-wrap gap-3">
                  {['Neural Voice Synthesis', 'Emotion-Aware Prosody', 'Jurisdiction-Specific Tone', '24/7 Availability'].map(feat => (
                    <span key={feat} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 flex items-center gap-1.5">
                      <CheckIcon />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audio waveform visualization */}
              <div className="hidden lg:flex items-center gap-[3px] h-16">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-aurora-cyan/60 to-aurora-cyan"
                    animate={{ height: [Math.random() * 16 + 8, Math.random() * 40 + 8, Math.random() * 16 + 8], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────

export default function AIReceptionistPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedState, setSelectedState] = useState<string | null>(null)

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
      {/* Floating BG Orbs */}
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
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
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
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Demo</a>
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Pricing</a>
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
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-aurora-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Receptionist — Legal Edition
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              The AI Receptionist{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-aurora-cyan/70 to-aurora-cyan/40 bg-clip-text text-transparent">
                Built for Law Firms
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Covering all 50 states and 94 federal districts. AI-powered client intake, win probability scoring,
              and cinematic avatars that represent your firm at the highest level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
                Try Live Demo
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300">
                View Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── METRICS ─── */}
      <section className="py-14 px-4 bg-white/[0.02] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {METRICS.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-4"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-aurora-cyan via-aurora-cyan/80 to-aurora-cyan/60 bg-clip-text text-transparent">
                  {m.value}{m.suffix}
                </div>
                <div className="text-sm text-gray-400 mt-2 font-medium tracking-wide uppercase">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Purpose-Built for Legal
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Not a generic AI — a receptionist trained specifically for law firm operations, jurisdiction-specific
              compliance, and attorney-client privilege protection.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
                  className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 hover:scale-[1.01] hover:shadow-lg hover:shadow-aurora-cyan/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-4 text-aurora-cyan group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  <h3 className="font-semibold mb-2 font-display">{feat.title}</h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{feat.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── JURISDICTION COVERAGE MAP ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Nationwide Coverage
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Pre-trained on state-specific statutes and federal district court procedures.
              Select a state to see its district coverage.
            </motion.p>
          </motion.div>

          {/* State Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-8">
            {US_STATES.map((s, i) => (
              <motion.button
                key={s.abbr}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                viewport={{ once: true }}
                onClick={() => setSelectedState(selectedState === s.abbr ? null : s.abbr)}
                className={`relative px-2 py-3 rounded-xl text-center text-xs font-medium transition-all ${
                  selectedState === s.abbr
                    ? 'bg-aurora-cyan/20 border border-aurora-cyan/30 text-aurora-cyan scale-105'
                    : 'bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:border-aurora-cyan/10 hover:text-white'
                }`}
              >
                <div className="text-base font-bold">{s.abbr}</div>
                <div className="text-[10px] mt-0.5">{s.name}</div>
              </motion.button>
            ))}
          </div>

          {/* Selected State Detail */}
          <AnimatePresence mode="wait">
            {selectedState && (() => {
              const state = US_STATES.find(s => s.abbr === selectedState)!
              const districtNumbers = Array.from({ length: state.districts }, (_, i) => i + 1)
              return (
                <motion.div
                  key={selectedState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 rounded-2xl border border-aurora-cyan/20 bg-gradient-to-br from-aurora-cyan/5 to-transparent"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan to-blue-600 flex items-center justify-center text-2xl">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display">{state.name}</h3>
                      <p className="text-sm text-gray-400">{state.districts} Federal District{state.districts > 1 ? 's' : ''} — Full jurisdictional coverage</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {districtNumbers.map(d => (
                      <div key={d} className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        <CheckIcon />
                        <span className="text-sm text-gray-300">{state.name} District {d} Court</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['State Statutes', 'Local Rules', 'Precedent DB', 'Filing Procedures'].map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item} — Trained
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              {US_STATES.length} states · {TOTAL_DISTRICTS} federal districts · Coverage across all jurisdictions
            </span>
          </div>
        </div>
      </section>

      {/* ─── WIN PROBABILITY CALCULATOR ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Estimate Your Win Probability
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Our AI analyzes thousands of data points — jurisdiction, practice area, claim value, and evidence strength —
              to estimate your case&apos;s win probability in seconds.
            </motion.p>
          </motion.div>
          <WinProbabilityCalculator />
        </div>
      </section>

      {/* ─── CINEMATIC AVATARS ─── */}
      <CinematicAvatarsSection />

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Trusted by Law Firms Nationwide
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto">
              From solo practitioners to Am Law 200 firms, our AI receptionist handles client intake 24/7.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
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
                  <div className="flex gap-0.5 mb-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-hollywood-gold"><StarIcon /></span>
                    ))}
                  </div>
                </div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role} · {t.firm}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRACTICE AREAS ─── */}
      <section className="py-20 md:py-28 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Specialized Practice Areas
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto">
              Each practice area is pre-trained with domain-specific terminology, question flows, and qualification logic.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRACTICE_AREAS.map((area, i) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="group p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {area.icon}
                </div>
                <h3 className="font-semibold font-display mb-1">{area.name}</h3>
                <div className="text-xs text-gray-500">
                  Base Win Rate: <span className={area.baseWinRate >= 65 ? 'text-emerald-400' : area.baseWinRate >= 50 ? 'text-amber-400' : 'text-cinematic-red'}>{area.baseWinRate}%</span>
                </div>
              </motion.div>
            ))}
          </div>
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
                Ready to Transform Your Legal Practice?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of law firms using FrontDesk Agents AI to handle client intake across all 50 states and 94 federal districts. Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
                  Try Live Demo
                </Link>
                <Link href="/pricing" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300">
                  View Pricing
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6">Free 14-day trial · No credit card required · Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
