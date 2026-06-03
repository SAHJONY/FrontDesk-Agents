'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Icons ───────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

// ─── Components ──────────────────────────────────────────────────────────────
import CustomerAIGreeting from '@/components/CustomerAIGreeting'
import CustomerPhoneManagement from '@/components/CustomerPhoneManagement'
import CustomerCallAnalytics from '@/components/CustomerCallAnalytics'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CustomerData {
  id: string
  businessName: string
  email: string
  plan: string
  phoneNumber: string
  aiConfigured: boolean
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerPortal() {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [activeTab, setActiveTab] = useState<'ai' | 'phones' | 'analytics' | 'settings'>('ai')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)

  // Load customer data
  useEffect(() => {
    const customerData = localStorage.getItem('customer_data')
    if (customerData) {
      const parsed = JSON.parse(customerData)
      setCustomer(parsed)
      setSetupComplete(parsed.aiConfigured || false)
    } else {
      // For demo, set mock data
      const mockCustomer: CustomerData = {
        id: 'cus_demo_123',
        businessName: 'GlobalVoice Demo Business',
        email: 'demo@business.com',
        plan: 'growth',
        phoneNumber: '+13465214387',
        aiConfigured: false,
      }
      setCustomer(mockCustomer)
      localStorage.setItem('customer_data', JSON.stringify(mockCustomer))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('customer_session')
    localStorage.removeItem('customer_data')
    router.push('/')
  }

  const markSetupComplete = () => {
    if (customer) {
      const updated = { ...customer, aiConfigured: true }
      setCustomer(updated)
      localStorage.setItem('customer_data', JSON.stringify(updated))
      setSetupComplete(true)
    }
  }

  const navItems = [
    { id: 'ai', icon: SparklesIcon, label: 'AI Configuration', color: 'from-aurora-cyan to-blue-500' },
    { id: 'phones', icon: PhoneIcon, label: 'Phone Numbers', color: 'from-green-500 to-emerald-500' },
    { id: 'analytics', icon: ChartIcon, label: 'Analytics', color: 'from-purple-500 to-pink-500' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings', color: 'from-yellow-500 to-orange-500' },
  ]

  if (!customer) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-aurora-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-space text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white/[0.02] border-r border-white/10 flex flex-col transition-all duration-300 fixed h-full z-10`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan to-purple-600 flex items-center justify-center">
              <BotIcon />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-white">GlobalVoice</h1>
                <p className="text-xs text-aurora-cyan">Customer Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-white/10">
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-sm font-medium text-white truncate">{customer.businessName}</p>
              <p className="text-xs text-gray-500 truncate">{customer.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-aurora-cyan/10 text-aurora-cyan capitalize">
                  {customer.plan}
                </span>
                {setupComplete && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircleIcon />
                    Setup Complete
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/customer/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <HomeIcon />
            {!sidebarCollapsed && <span className="text-sm">Dashboard</span>}
          </Link>
          
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-white/10 to-transparent text-white border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <item.icon />
              </div>
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogoutIcon />
            {!sidebarCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-deep-space border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={sidebarCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-deep-space/95 backdrop-blur-md border-b border-white/10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold capitalize">
                {activeTab === 'ai' ? 'AI Configuration' :
                 activeTab === 'phones' ? 'Phone Numbers' :
                 activeTab === 'analytics' ? 'Analytics Dashboard' :
                 'Account Settings'}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTab === 'ai' ? 'Configure your AI receptionist behavior and voice' :
                 activeTab === 'phones' ? 'Manage your phone numbers and call routing' :
                 activeTab === 'analytics' ? 'Track your AI performance and revenue' :
                 'Manage your account and subscription'}
              </p>
            </div>
            
            {/* Quick Status */}
            <div className="flex items-center gap-4">
              {setupComplete ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircleIcon />
                  <span className="text-sm text-green-400 font-medium">AI Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircleIcon />
                  <span className="text-sm text-yellow-400 font-medium">Setup Required</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* AI Configuration Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6 max-w-4xl">
              {/* Setup Progress */}
              {!setupComplete && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-r from-aurora-cyan/10 to-purple-500/10 border border-aurora-cyan/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan to-purple-500 flex items-center justify-center">
                      <ZapIcon />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Complete Your AI Setup</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Configure your AI receptionist in just a few steps. Once complete, your AI will be ready to handle calls 24/7.
                      </p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan text-sm font-bold">1</div>
                          <span className="text-sm text-white">Configure AI Voice</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan text-sm font-bold">2</div>
                          <span className="text-sm text-white">Set Greeting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan text-sm font-bold">3</div>
                          <span className="text-sm text-white">Test & Launch</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI Configuration Component */}
              <CustomerAIGreeting onSave={markSetupComplete} />

              {/* Quick Tips */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="font-medium text-white mb-4">Pro Tips for Better AI Conversations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎯</span>
                      <span className="text-sm font-medium text-white">Be Specific</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Include specific actions callers can take in your greeting (schedule, inquire, support)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⏱️</span>
                      <span className="text-sm font-medium text-white">Keep It Brief</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Aim for 30-60 seconds. Long greetings feel robotic and callers may hang up.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔄</span>
                      <span className="text-sm font-medium text-white">Test Regularly</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Test your AI weekly to ensure it's handling calls as expected.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📝</span>
                      <span className="text-sm font-medium text-white">Monitor Analytics</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Check your Analytics tab weekly to spot issues and improvement opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phone Numbers Tab */}
          {activeTab === 'phones' && (
            <div className="space-y-6 max-w-4xl">
              <CustomerPhoneManagement />
              
              {/* Phone Number Quick Guide */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="font-medium text-white mb-4">About Phone Numbers</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">1</div>
                    <div>
                      <p className="text-sm text-white">Inbound Numbers</p>
                      <p className="text-xs text-gray-500">Receive calls with AI answering. Your callers dial this number directly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan text-xs font-bold">2</div>
                    <div>
                      <p className="text-sm text-white">Outbound Numbers</p>
                      <p className="text-xs text-gray-500">Make AI-powered calls to your customers. Great for follow-ups and confirmations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">3</div>
                    <div>
                      <p className="text-sm text-white">Call Forwarding</p>
                      <p className="text-xs text-gray-500">Set up fallback numbers. If AI can't help, calls go to your team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <CustomerCallAnalytics />
              
              {/* ROI Highlight */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Your AI has generated</p>
                    <p className="text-4xl font-bold text-green-400">$12,450</p>
                    <p className="text-sm text-gray-500 mt-1">in profit this month</p>
                  </div>
                  <div className="text-center px-8">
                    <p className="text-sm text-gray-400">ROI</p>
                    <p className="text-3xl font-bold text-white">847%</p>
                    <p className="text-xs text-green-400 mt-1">↑ vs last month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              {/* Account Settings */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="font-medium text-white mb-4">Account Information</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Business Name</span>
                    <span className="text-sm text-white">{customer.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Email</span>
                    <span className="text-sm text-white">{customer.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Plan</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-aurora-cyan/10 text-aurora-cyan capitalize">{customer.plan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Phone Number</span>
                    <span className="text-sm text-white font-mono">{customer.phoneNumber}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-all">
                  Edit Account Information
                </button>
              </div>

              {/* Subscription */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="font-medium text-white mb-4">Subscription</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                    <div>
                      <p className="text-sm text-white font-medium">Growth Plan</p>
                      <p className="text-xs text-gray-500">2,000 calls/month • 3 phone numbers</p>
                    </div>
                    <span className="text-sm text-white font-medium">$149/mo</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan text-sm hover:bg-aurora-cyan/20 transition-all">
                    Upgrade Plan
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-all">
                    Manage Billing
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <h4 className="font-medium text-red-400 mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02]">
                    <div>
                      <p className="text-sm text-white font-medium">Cancel Subscription</p>
                      <p className="text-xs text-gray-500">You can reactivate anytime within 30 days</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}