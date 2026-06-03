'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>

const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>

const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>

const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>

const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/></svg>

const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a1 1 0 01.55-.9l4-2A1 1 0 018 6h8a1 1 0 01.45.1l4 2A1 1 0 0121 9v6a2 2 0 01-2 2"/></svg>

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>

const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>

const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

interface PracticeAreaData {
  id: string
  name: string
  icon: React.ComponentType
  color: string
  description: string
  features: string[]
  compliance: string
}

const PRACTICE_AREAS: PracticeAreaData[] = [
  { id: 'personal-injury', name: 'Personal Injury', icon: HeartIcon, color: 'from-rose-500 to-red-600', description: 'Car accidents, slip and fall, medical malpractice, workplace injuries', features: ['24/7 accident claim intake with severity triage', 'Insurance company negotiation handling', 'Medical records collection and organization', 'Client status updates and appointment scheduling', 'Settlement payment processing inquiries'], compliance: 'Attorney-client privilege, HIPAA-compliant medical intake' },
  { id: 'family-law', name: 'Family Law', icon: UsersIcon, color: 'from-purple-500 to-violet-600', description: 'Divorce, custody, child support, domestic violence, prenuptial agreements', features: ['Initial consultation scheduling with attorney matching', 'Custody arrangement inquiries and modifications', 'Child support calculation requests', 'Court date confirmations and reminders', 'Emergency protective order referrals'], compliance: 'Confidential family matters, secure document handling' },
  { id: 'criminal-defense', name: 'Criminal Defense', icon: ShieldIcon, color: 'from-slate-600 to-slate-800', description: 'Felonies, misdemeanors, DUI, drug offenses, white-collar crimes', features: ['Bond/bail hearing scheduling', 'Court appearance reminders and confirmations', 'Attorney-client meeting coordination', 'Case status inquiries for existing clients', 'Public defender referral services'], compliance: 'Attorney-client privilege, innocent until proven guilty' },
  { id: 'real-estate-law', name: 'Real Estate Law', icon: HomeIcon, color: 'from-amber-500 to-orange-600', description: 'Transactions, disputes, title issues, landlord-tenant, zoning', features: ['Property closing appointment scheduling', 'Title search and insurance inquiries', 'Landlord-tenant dispute intake', 'Zoning and permit consultation booking', 'Lease agreement review requests'], compliance: 'Fair housing laws, closing disclosure requirements' },
  { id: 'business-law', name: 'Business Law', icon: BuildingIcon, color: 'from-blue-600 to-indigo-700', description: 'Formation, contracts, disputes, M&A, intellectual property', features: ['LLC/Corporation formation consultation booking', 'Contract review request intake', 'Business dispute preliminary assessment', 'Trademark and IP consultation scheduling', 'M&A due diligence inquiry handling'], compliance: 'Corporate governance, securities regulations' },
  { id: 'immigration', name: 'Immigration Law', icon: FileTextIcon, color: 'from-emerald-500 to-teal-600', description: 'Visas, citizenship, deportation defense, work permits', features: ['Visa application status inquiries', 'Citizenship test appointment scheduling', 'Deportation defense consultation booking', 'Work permit renewal reminders', 'Immigration court date notifications'], compliance: 'ICE compliance, asylum applicant confidentiality' },
  { id: 'estate-planning', name: 'Estate Planning', icon: BriefcaseIcon, color: 'from-cyan-500 to-blue-600', description: 'Wills, trusts, probate, powers of attorney, healthcare directives', features: ['Will and trust consultation scheduling', 'Probate case status inquiries', 'Power of attorney document requests', 'Healthcare directive planning appointments', 'Estate tax consultation booking'], compliance: 'Fiduciary duty, beneficiary confidentiality' },
  { id: 'dui-defense', name: 'DUI Defense', icon: CarIcon, color: 'from-amber-600 to-yellow-600', description: 'DUI/DWI charges, license hearings, breathalyzer disputes', features: ['Immediate attorney connection for arrests', 'DMV hearing scheduling and preparation', 'Bail hearing coordination', 'Trial preparation appointments', 'License reinstatement consultation'], compliance: 'Attorney-client privilege, evidence handling protocols' },
]

const INDUSTRIES = [
  { name: 'Healthcare', desc: 'Medical malpractice, HIPAA compliance, patient disputes' },
  { name: 'Real Estate', desc: 'Property transactions, landlord-tenant, title disputes' },
  { name: 'Automotive', desc: 'Dealership disputes, lemon law, accident claims' },
  { name: 'Financial Services', desc: 'Fraud, embezzlement, regulatory compliance' },
  { name: 'Construction', desc: 'Contractor disputes, lien filings, injury claims' },
  { name: 'Hospitality', desc: 'Slip and fall, negligence claims, guest disputes' },
  { name: 'Retail', desc: 'Product liability, customer injuries, contract disputes' },
  { name: 'Technology', desc: 'IP theft, contract breaches, partnership disputes' },
]

interface FeatureData {
  icon: React.ComponentType
  title: string
  desc: string
}

const FEATURES: FeatureData[] = [
  { icon: ClockIcon, title: '24/7 Client Intake', desc: 'Never miss a potential case. Our AI receptionist captures leads around the clock, including weekends and holidays.' },
  { icon: ShieldIcon, title: 'Attorney-Client Privilege', desc: 'Every conversation is confidential. HIPAA-compliant intake forms, secure data handling, and privilege protection.' },
  { icon: PhoneIcon, title: 'Smart Case Routing', desc: 'Automatically route inquiries to the right practice area based on case type, jurisdiction, and attorney availability.' },
  { icon: DollarIcon, title: 'Cost-effective Operations', desc: 'Reduce receptionist costs by 60-80% while handling 3x more inquiries. Scale operations without adding headcount.' },
]

function getIconByAreaId(areaId: string): React.ReactNode {
  switch (areaId) {
    case 'personal-injury': return <HeartIcon />
    case 'family-law': return <UsersIcon />
    case 'criminal-defense': return <ShieldIcon />
    case 'real-estate-law': return <HomeIcon />
    case 'business-law': return <BuildingIcon />
    case 'immigration': return <FileTextIcon />
    case 'estate-planning': return <BriefcaseIcon />
    case 'dui-defense': return <CarIcon />
    default: return null
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  source?: string
}

export default function LegalServicesModal({ isOpen, onClose, source }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'practice-areas' | 'industries'>('overview')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const selectedArea = PRACTICE_AREAS.find(a => a.id === selectedId)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
          <motion.div ref={modalRef} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-deep-space/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10" onClick={(e) => e.stopPropagation()}>
            <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20"><ScaleIcon /></div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">Legal Services AI</h2>
                    <p className="text-sm text-gray-400 mt-1">The special door to AI-powered legal receptionist services</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><XIcon /></button>
              </div>
              {source && <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">Accessed from: {source}</div>}
            </div>
            <div className="flex items-center gap-1 px-6 pt-4 bg-white/[0.02]">
              {(['overview', 'practice-areas', 'industries'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}>
                  {tab === 'overview' ? 'Overview' : tab === 'practice-areas' ? 'Practice Areas' : 'Industries Served'}
                  {activeTab === tab && <motion.div layoutId="legalTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" />}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <div className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-600/10 via-transparent to-violet-600/10 border border-purple-500/20 mb-8">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                      <div className="relative">
                        <h3 className="text-xl font-bold font-display mb-2">AI Receptionist for Law Firms and Legal Services</h3>
                        <p className="text-gray-400 mb-6 max-w-2xl">A comprehensive AI phone agent designed specifically for legal professionals. Handles client intake, case routing, appointment scheduling, and confidential inquiries while maintaining attorney-client privilege and HIPAA compliance.</p>
                        <Link href="/legal" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 inline-flex">Full Legal Page <ChevronRightIcon /></Link>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold font-display mb-4">Why Legal Firms Choose Our AI</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {FEATURES.map((f, i) => { const FeatureIcon = f.icon; return <div key={i} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-purple-500/20 transition-all"><div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 text-purple-400"><FeatureIcon /></div><h5 className="font-semibold text-white mb-1">{f.title}</h5><p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p></div> })}
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-center"><div className="text-2xl font-bold text-purple-400">60-80%</div><div className="text-xs text-gray-500 mt-1">Cost Reduction</div></div>
                      <div className="text-center border-x border-white/[0.06]"><div className="text-2xl font-bold text-purple-400">3x</div><div className="text-xs text-gray-500 mt-1">More Inquiries</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-purple-400">24/7</div><div className="text-xs text-gray-500 mt-1">Availability</div></div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'practice-areas' && (
                  <motion.div key="practice-areas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {selectedArea ? (
                      <div>
                        <button onClick={() => setSelectedId(null)} className="mb-4 text-sm text-purple-400 hover:text-purple-300">Back to all practice areas</button>
                        <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedArea.color}/10 border ${selectedArea.color}/20 mb-6`}>
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedArea.color} flex items-center justify-center`}>{getIconByAreaId(selectedArea.id)}</div>
                            <div><h3 className="text-xl font-bold">{selectedArea.name}</h3><p className="text-sm text-gray-400">{selectedArea.description}</p></div>
                          </div>
                          <div className="flex items-center gap-2 mt-3"><ShieldIcon /><span className="text-xs text-gray-400">{selectedArea.compliance}</span></div>
                        </div>
                        <h4 className="text-lg font-semibold mb-4">Capabilities for {selectedArea.name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedArea.features.map((feature, i) => <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]"><div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5"><CheckIcon /></div><span className="text-sm text-gray-300">{feature}</span></div>)}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {PRACTICE_AREAS.map(area => { const AreaIcon = area.icon; return (
                          <button key={area.id} onClick={() => setSelectedId(area.id)} className="text-left p-5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-purple-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${area.color} flex items-center justify-center text-white`}><AreaIcon /></div>
                              <ChevronRightIcon />
                            </div>
                            <h4 className="font-semibold text-white mb-1">{area.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{area.description}</p>
                          </button>
                        )})}
                      </div>
                    )}
                  </motion.div>
                )}
                {activeTab === 'industries' && (
                  <motion.div key="industries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold font-display mb-2">Legal Services for Every Industry</h3>
                      <p className="text-gray-400 text-sm">Our AI receptionist adapts to any industry legal needs.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {INDUSTRIES.map((ind, i) => <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-purple-500/20 transition-all"><h5 className="font-semibold text-white mb-2">{ind.name}</h5><p className="text-xs text-gray-500">{ind.desc}</p></div>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldIcon /><span>Attorney-client privilege protected - HIPAA compliant</span></div>
              <div className="flex items-center gap-3">
                <Link href="/contact" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors">Contact Sales</Link>
                <Link href="/legal/pricing" onClick={onClose} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">Start Free Trial</Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  )
}