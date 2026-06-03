'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ─── Icons ───────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const PhoneIncomingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const PhoneOutgoingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

// ─── Types ───────────────────────────────────────────────────────────────────
interface PhoneNumber {
  id: string
  number: string
  type: 'inbound' | 'outbound'
  status: 'active' | 'pending' | 'suspended'
  callsToday: number
  totalCalls: number
}

interface CustomerData {
  id: string
  businessName: string
  email: string
  plan: {
    id: string
    name: string
    callsLimit: number
    phoneNumbersLimit: number
  }
  phoneNumbers: PhoneNumber[]
  stats: {
    totalCalls: number
    totalMinutes: number
    totalRevenue: number
    profitGenerated: number
  }
  tier: 'starter' | 'growth' | 'pro'
  trialEndDate: string
  nextBillingDate: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_CUSTOMER: CustomerData = {
  id: 'cus_123456',
  businessName: 'GlobalVoice Demo Business',
  email: 'demo@business.com',
  plan: {
    id: 'growth',
    name: 'Growth',
    callsLimit: 2000,
    phoneNumbersLimit: 3,
  },
  phoneNumbers: [
    { id: 'pn_1', number: '+13465214387', type: 'outbound', status: 'active', callsToday: 12, totalCalls: 847 },
    { id: 'pn_2', number: '+16783466284', type: 'inbound', status: 'active', callsToday: 8, totalCalls: 423 },
  ],
  stats: {
    totalCalls: 1270,
    totalMinutes: 8923,
    totalRevenue: 45890,
    profitGenerated: 12450,
  },
  tier: 'growth',
  trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
}

// ─── Plan Upgrade Banner ─────────────────────────────────────────────────────
function UpgradeBanner({ currentTier, profitGenerated }: { currentTier: string; profitGenerated: number }) {
  const [showBanner, setShowBanner] = useState(true)
  
  // Show banner if profit > $5000 and tier is not pro
  const shouldShow = profitGenerated > 5000 && currentTier !== 'pro'

  if (!shouldShow || !showBanner) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
            <ZapIcon />
          </div>
          <div>
            <p className="text-white font-semibold">🎉 Congratulations! You've qualified for Pro!</p>
            <p className="text-sm text-gray-400">Your first ${profitGenerated.toLocaleString()} in profits unlocks unlimited calls and premium features.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 text-black font-semibold text-sm hover:shadow-lg hover:shadow-green-500/25 transition-all">
            Upgrade Now - Free
          </button>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-gray-500 hover:text-white p-1"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtext, color }: any) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  )
}

// ─── Phone Number Card ───────────────────────────────────────────────────────
function PhoneNumberCard({ phone, onAction }: { phone: PhoneNumber; onAction: (id: string, action: string) => void }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            phone.type === 'inbound' ? 'bg-green-500/10 text-green-400' : 'bg-aurora-cyan/10 text-aurora-cyan'
          }`}>
            {phone.type === 'inbound' ? <PhoneIncomingIcon /> : <PhoneOutgoingIcon />}
          </div>
          <div>
            <p className="text-white font-mono font-semibold">{phone.number}</p>
            <p className="text-xs text-gray-500 capitalize">{phone.type} • {phone.status}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          phone.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
        }`}>
          {phone.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Today: </span>
          <span className="text-white font-medium">{phone.callsToday} calls</span>
          <span className="text-gray-500 ml-3">Total: </span>
          <span className="text-white font-medium">{phone.totalCalls}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onAction(phone.id, 'test')}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-all"
          >
            Test Call
          </button>
          <button 
            onClick={() => onAction(phone.id, 'settings')}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-all"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const searchParams = useSearchParams()
  const [customer, setCustomer] = useState<CustomerData>(MOCK_CUSTOMER)
  const [showWelcome, setShowWelcome] = useState(searchParams.get('welcome') === 'true')
  const [activeTab, setActiveTab] = useState<'overview' | 'phone-numbers' | 'analytics' | 'settings'>('overview')

  // Auto-upgrade check
  useEffect(() => {
    if (customer.stats.profitGenerated > 10000 && customer.tier !== 'pro') {
      // Show upgrade banner
      console.log('Customer qualifies for Pro tier upgrade!')
    }
  }, [customer.stats.profitGenerated, customer.tier])

  const handlePhoneAction = (id: string, action: string) => {
    if (action === 'test') {
      window.location.href = '/test-call'
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-white/[0.03]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                <BotIcon />
              </div>
              <span className="font-bold">GlobalVoice AI</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <SettingsIcon />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Modal */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-deep-space/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/[0.06] shadow-2xl text-center"
              >
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">Welcome to GlobalVoice AI!</h2>
                <p className="text-gray-400 mb-6">
                  Your AI receptionist is ready. You have 14 days free with full access to all features.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-green-400"><CheckIcon /></span>
                    Phone number +1{String(customer.phoneNumbers[0]?.number).slice(3)} provisioned
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-green-400"><CheckIcon /></span>
                    AI receptionist configured
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-green-400"><CheckIcon /></span>
                    Ready to handle calls 24/7
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upgrade Banner */}
        <UpgradeBanner currentTier={customer.tier} profitGenerated={customer.stats.profitGenerated} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{customer.businessName}</h1>
            <p className="text-gray-500 text-sm">
              {customer.plan.name} Plan • Trial ends {formatDate(customer.trialEndDate)}
            </p>
          </div>
          <Link 
            href="/test-call"
            className="px-4 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20 text-sm font-medium hover:bg-aurora-cyan/20 transition-all"
          >
            Make Test Call
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 mb-6">
          {(['overview', 'phone-numbers', 'analytics', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? 'border-aurora-cyan text-aurora-cyan'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'phone-numbers' ? 'Phone Numbers' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={PhoneOutgoingIcon} 
                label="Total Calls" 
                value={customer.stats.totalCalls.toLocaleString()} 
                subtext="All time"
                color="bg-aurora-cyan/10 text-aurora-cyan"
              />
              <StatCard 
                icon={TrendingUpIcon} 
                label="Profit Generated" 
                value={formatCurrency(customer.stats.profitGenerated)} 
                subtext="Revenue after costs"
                color="bg-green-500/10 text-green-400"
              />
              <StatCard 
                icon={DollarIcon} 
                label="Total Revenue" 
                value={formatCurrency(customer.stats.totalRevenue)} 
                subtext="From AI calls"
                color="bg-yellow-500/10 text-yellow-400"
              />
              <StatCard 
                icon={PhoneIcon} 
                label="Active Numbers" 
                value={customer.phoneNumbers.length} 
                subtext={`of ${customer.plan.phoneNumbersLimit} allowed`}
                color="bg-purple-500/10 text-purple-400"
              />
            </div>

            {/* Phone Numbers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your Phone Numbers</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-aurora-cyan/10 text-aurora-cyan text-sm hover:bg-aurora-cyan/20 transition-all">
                  <PlusIcon />
                  Add Number
                </button>
              </div>
              <div className="space-y-3">
                {customer.phoneNumbers.map(phone => (
                  <PhoneNumberCard key={phone.id} phone={phone} onAction={handlePhoneAction} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Link href="/customer/portal" className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-aurora-cyan/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan mb-3">
                    <SettingsIcon />
                  </div>
                  <h3 className="font-medium text-white mb-1">AI Settings</h3>
                  <p className="text-xs text-gray-500">Configure your AI receptionist</p>
                </Link>
                <Link href="/test-call" className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-aurora-cyan/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan mb-3">
                    <PhoneOutgoingIcon />
                  </div>
                  <h3 className="font-medium text-white mb-1">Test Call</h3>
                  <p className="text-xs text-gray-500">Make a test call to verify setup</p>
                </Link>
                <Link href="/test-call?section=inbound" className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-green-500/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
                    <PhoneIncomingIcon />
                  </div>
                  <h3 className="font-medium text-white mb-1">Inbound Setup</h3>
                  <p className="text-xs text-gray-500">Configure AI answering for incoming calls</p>
                </Link>
                <Link href="/contact" className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3">
                    <PhoneIcon />
                  </div>
                  <h3 className="font-medium text-white mb-1">Get Support</h3>
                  <p className="text-xs text-gray-500">Talk to our team for help</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'phone-numbers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Phone Numbers</h2>
                <p className="text-sm text-gray-500">{customer.phoneNumbers.length} of {customer.plan.phoneNumbersLimit} numbers used</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">
                <PlusIcon />
                Provision New Number
              </button>
            </div>

            <div className="space-y-4">
              {customer.phoneNumbers.map(phone => (
                <PhoneNumberCard key={phone.id} phone={phone} onAction={handlePhoneAction} />
              ))}
            </div>

            {customer.phoneNumbers.length < customer.plan.phoneNumbersLimit && (
              <div className="p-6 rounded-xl border-2 border-dashed border-white/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-500">
                  <PlusIcon />
                </div>
                <h3 className="font-medium text-white mb-1">Add another phone number</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Expand your reach with additional inbound or outbound numbers
                </p>
                <button className="px-4 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan text-sm hover:bg-aurora-cyan/20 transition-all">
                  Provision Number (+${customer.plan.id === 'starter' ? '25' : customer.plan.id === 'growth' ? '20' : '15'}/mo)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calls Chart Placeholder */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="font-medium text-white mb-4">Calls This Month</h3>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">847</div>
                    <p className="text-sm">Total calls handled</p>
                    <p className="text-xs text-green-400 mt-2">↑ 23% vs last month</p>
                  </div>
                </div>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="font-medium text-white mb-4">Revenue Generated</h3>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">$12,450</div>
                    <p className="text-sm">Profit generated</p>
                    <p className="text-xs text-green-400 mt-2">↑ 18% vs last month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Account Settings</h2>
            
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
              <h3 className="font-medium text-white mb-4">Current Plan</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{customer.plan.name} Plan</p>
                  <p className="text-sm text-gray-500">
                    {customer.plan.callsLimit} calls/month • {customer.plan.phoneNumbersLimit} phone numbers
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-aurora-cyan/20 text-aurora-cyan text-sm hover:bg-aurora-cyan/10 transition-all">
                  Upgrade Plan
                </button>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
              <h3 className="font-medium text-white mb-4">Billing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Next billing date</span>
                  <span className="text-white">{formatDate(customer.nextBillingDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">${customer.plan.id === 'starter' ? '99' : customer.plan.id === 'growth' ? '149' : '299'}/mo</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}