'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const PRACTICE_AREAS = [
  { id: 'personal-injury', name: 'Personal Injury', color: 'from-rose-500 to-red-600', enabled: true, monthlyPrice: 99 },
  { id: 'family-law', name: 'Family Law', color: 'from-purple-500 to-violet-600', enabled: true, monthlyPrice: 89 },
  { id: 'criminal-defense', name: 'Criminal Defense', color: 'from-slate-500 to-slate-700', enabled: true, monthlyPrice: 99 },
  { id: 'real-estate-law', name: 'Real Estate Law', color: 'from-amber-500 to-orange-600', enabled: true, monthlyPrice: 79 },
  { id: 'business-law', name: 'Business Law', color: 'from-blue-600 to-indigo-700', enabled: true, monthlyPrice: 99 },
  { id: 'immigration', name: 'Immigration Law', color: 'from-emerald-500 to-teal-600', enabled: true, monthlyPrice: 89 },
  { id: 'estate-planning', name: 'Estate Planning', color: 'from-cyan-500 to-blue-600', enabled: false, monthlyPrice: 79 },
  { id: 'dui-defense', name: 'DUI Defense', color: 'from-yellow-500 to-amber-600', enabled: false, monthlyPrice: 89 },
]

const STATS = [
  { label: 'Active Legal Customers', value: '23', change: '+3 this month' },
  { label: 'Legal Services MRR', value: '$12,450', change: '+8.2%' },
  { label: 'Total Legal Calls', value: '1,847', change: '+15%' },
  { label: 'Avg. Solution Rate', value: '94.2%', change: '+2.1%' },
]

export default function LegalServicesManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'areas' | 'settings'>('overview')
  const [practiceAreas, setPracticeAreas] = useState(PRACTICE_AREAS)
  const [pricing, setPricing] = useState({
    essentials: 299,
    professional: 599,
    enterprise: 1299,
    additionalNumber: 29,
    extraCalls: 99,
  })

  const togglePracticeArea = (id: string) => {
    setPracticeAreas(prev => prev.map(area => 
      area.id === id ? { ...area, enabled: !area.enabled } : area
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <ScaleIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Legal Services AI</h2>
            <p className="text-sm text-gray-400">Premium vertical with dedicated pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-green-400 font-medium">Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            <div className="text-xs text-green-400 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl w-fit">
        {(['overview', 'pricing', 'areas', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold text-white mb-4">Legal Services Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                <div className="text-3xl font-bold text-purple-400">23</div>
                <div className="text-sm text-gray-400 mt-1">Active Subscribers</div>
                <div className="text-xs text-green-400 mt-2">↑ 15% from last month</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                <div className="text-3xl font-bold text-green-400">$12,450</div>
                <div className="text-sm text-gray-400 mt-1">Monthly Revenue</div>
                <div className="text-xs text-green-400 mt-2">↑ 8.2% from last month</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                <div className="text-3xl font-bold text-aurora-cyan">94.2%</div>
                <div className="text-sm text-gray-400 mt-1">Call Resolution</div>
                <div className="text-xs text-green-400 mt-2">↑ 2.1% from last month</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold text-white mb-4">Top Practice Areas by Revenue</h3>
            <div className="space-y-3">
              {[
                { name: 'Personal Injury', revenue: 4580, customers: 8 },
                { name: 'Criminal Defense', revenue: 3200, customers: 6 },
                { name: 'Family Law', revenue: 2890, customers: 5 },
                { name: 'Business Law', revenue: 1780, customers: 4 },
              ].map((area, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm text-white">{area.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-400">${area.revenue}</span>
                    <span className="text-xs text-gray-500 ml-2">{area.customers} customers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold text-white mb-4">Premium Pricing Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Legal Essentials ($/mo)</label>
                <input
                  type="number"
                  value={pricing.essentials}
                  onChange={(e) => setPricing({ ...pricing, essentials: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-200 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Legal Professional ($/mo)</label>
                <input
                  type="number"
                  value={pricing.professional}
                  onChange={(e) => setPricing({ ...pricing, professional: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-200 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Legal Enterprise ($/mo)</label>
                <input
                  type="number"
                  value={pricing.enterprise}
                  onChange={(e) => setPricing({ ...pricing, enterprise: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-200 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold text-white mb-4">Add-on Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Additional Phone Number ($/mo)</label>
                <input
                  type="number"
                  value={pricing.additionalNumber}
                  onChange={(e) => setPricing({ ...pricing, additionalNumber: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-200 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Extra 500 Calls Pack ($/mo)</label>
                <input
                  type="number"
                  value={pricing.extraCalls}
                  onChange={(e) => setPricing({ ...pricing, extraCalls: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-200 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <button className="px-6 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-all">
            Save Pricing Changes
          </button>
        </div>
      )}

      {activeTab === 'areas' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Practice Areas Configuration</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all">
                <PlusIcon /> Add Area
              </button>
            </div>
            <div className="space-y-3">
              {practiceAreas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${area.color} flex items-center justify-center`} />
                    <div>
                      <span className="text-white font-medium">{area.name}</span>
                      <span className="ml-2 text-xs text-gray-500">${area.monthlyPrice}/mo addon</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded ${area.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {area.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => togglePracticeArea(area.id)}
                      className={`w-10 h-5 rounded-full transition-colors ${area.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${area.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold text-white mb-4">Legal Services Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-white font-medium">Attorney-Client Privilege Mode</p>
                  <p className="text-xs text-gray-500">Warn callers that conversations may not be fully privileged</p>
                </div>
                <button className="w-10 h-5 rounded-full bg-green-500">
                  <div className="w-4 h-4 rounded-full bg-white shadow translate-x-5" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-white font-medium">HIPAA Compliance Mode</p>
                  <p className="text-xs text-gray-500">Enable HIPAA-compliant intake and data handling</p>
                </div>
                <button className="w-10 h-5 rounded-full bg-green-500">
                  <div className="w-4 h-4 rounded-full bg-white shadow translate-x-5" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-white font-medium">Auto-transfer for Sensitive Matters</p>
                  <p className="text-xs text-gray-500">Automatically transfer calls requesting attorneys for sensitive issues</p>
                </div>
                <button className="w-10 h-5 rounded-full bg-green-500">
                  <div className="w-4 h-4 rounded-full bg-white shadow translate-x-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              <a href="/legal" className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all">
                View Legal Services Page
              </a>
              <a href="/legal/pricing" className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm hover:bg-white/10 transition-all">
                Legal Services Pricing
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}