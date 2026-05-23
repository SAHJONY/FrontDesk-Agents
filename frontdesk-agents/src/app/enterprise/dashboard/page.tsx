'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Phone, Scale, Settings, LogOut, 
  Activity, Users, CreditCard, CheckCircle, AlertCircle,
  Menu, X, Search, Mic, Database, BarChart3, Zap
} from 'lucide-react'

export default function EnterpriseDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showReceptionistModal, setShowReceptionistModal] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  
  // Handle navigation clicks
  const handleNavClick = (tabId: string) => {
    if (tabId === 'receptionist') {
      setShowReceptionistModal(true)
      setActiveTab('receptionist')
    } else if (tabId === 'legal') {
      setShowLegalModal(true)
      setActiveTab('legal')
    } else {
      setActiveTab(tabId)
    }
  }
  
  // Enterprise User Data (Hardcoded for Free Unlimited Access)
  const user = {
    name: 'Juan Gonzalez',
    email: 'sahjonycapitalllc@outlook.com',
    company: 'Sahjony Capital LLC',
    tier: 'Enterprise',
    status: 'Active',
    limit: 'Unlimited',
    features: ['real estate', 'energy', 'marketing', 'lottery', 'crypto', 'legal ai']
  }

  // Mock Metrics
  const metrics = {
    callsToday: 142,
    callsMonth: 12840,
    legalSearches: 89,
    successRate: '99.8%'
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'receptionist', label: 'AI Receptionist', icon: Phone },
    { id: 'legal', label: 'Legal Research', icon: Scale },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full bg-black/95 border-r border-white/10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'md:hidden'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-xl">FrontDesk</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button onClick={() => router.push('/')} className="flex items-center gap-3 text-gray-400 hover:text-white w-full px-4 py-2">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Enterprise Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-green-400 flex items-center gap-2 justify-end">
                <CheckCircle className="w-4 h-4" /> {user.tier} Plan
              </div>
              <div className="text-xs text-gray-500">{user.company}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center font-bold">
              JG
            </div>
          </div>
        </header>

        {/* Content Area - Always show Overview for now as it contains the main cards */}
        <div className="space-y-8">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatusCard 
                title="Account Status" 
                value="Active" 
                icon={CheckCircle} 
                color="text-green-400" 
                subtext={user.email}
              />
              <StatusCard 
                title="Monthly Limit" 
                value={user.limit} 
                icon={Activity} 
                color="text-blue-400"
                subtext="Unlimited Access"
              />
              <StatusCard 
                title="Calls Today" 
                value={metrics.callsToday} 
                icon={Phone} 
                color="text-purple-400"
              />
              <StatusCard 
                title="Success Rate" 
                value={metrics.successRate} 
                icon={Zap} 
                color="text-yellow-400"
              />
            </div>

            {/* Main Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Receptionist Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-black border border-green-800/30 hover:border-green-500/50 transition-all cursor-pointer group" onClick={() => setShowReceptionistModal(true)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-green-900/30 group-hover:scale-110 transition-transform">
                    <Phone className="w-8 h-8 text-green-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-xs font-bold border border-green-800">ACTIVE</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">AI Receptionist</h3>
                <p className="text-gray-400 mb-6">Configure your AI phone agent, voice settings, and call routing. Handle unlimited calls with zero staffing.</p>
                <div className="flex items-center gap-2 text-green-400 font-bold group-hover:gap-3 transition-all">
                  <span>Configure Agent</span> →
                </div>
              </div>

              {/* Legal Research Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-800/30 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={() => setShowLegalModal(true)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-blue-900/30 group-hover:scale-110 transition-transform">
                    <Scale className="w-8 h-8 text-blue-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-400 text-xs font-bold border border-blue-800">ACTIVE</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Legal Research Engine</h3>
                <p className="text-gray-400 mb-6">Search federal & state laws, cases, and local rules with AI-powered semantic search. Access US Legal Corpus.</p>
                <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:gap-3 transition-all">
                  <span>Open Research</span> →
                </div>
              </div>
            </div>

            {/* Active Features */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                Active Enterprise Modules
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {user.features.map((feature) => (
                  <div key={feature} className="p-4 rounded-xl bg-black/50 border border-white/10 text-center capitalize hover:border-green-500/50 transition-colors">
                    {feature}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>

      {/* AI Receptionist Modal */}
      {showReceptionistModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReceptionistModal(false)}>
          <div className="bg-black border border-green-800/50 rounded-2xl max-w-2xl w-full p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowReceptionistModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold mb-2 text-green-400">AI Receptionist Configuration</h2>
            <p className="text-gray-400 mb-6">Manage your autonomous phone agent settings.</p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="block text-sm text-gray-400 mb-2">Agent Name</label>
                <input type="text" defaultValue="Sahjony Assistant" className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-green-500 outline-none" />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="block text-sm text-gray-400 mb-2">Voice</label>
                <select className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 outline-none">
                  <option>Professional Female (US)</option>
                  <option>Professional Male (US)</option>
                  <option>Friendly Female (UK)</option>
                </select>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="block text-sm text-gray-400 mb-2">Call Routing</label>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" /> Active: Forward to Email & Dashboard
                </div>
              </div>
              <button className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Research Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLegalModal(false)}>
          <div className="bg-black border border-blue-800/50 rounded-2xl max-w-3xl w-full p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLegalModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold mb-2 text-blue-400">US Legal Research Engine</h2>
            <p className="text-gray-400 mb-6">Search federal, state, and local laws with AI precision.</p>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search cases, statutes, local rules..." 
                className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-4 focus:border-blue-500 outline-none text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-xl bg-blue-900/20 border border-blue-800/50 hover:border-blue-500 transition-colors text-left">
                <div className="font-bold text-blue-400 mb-1">Federal Courts</div>
                <div className="text-xs text-gray-400">94 District Courts, 13 Circuits</div>
              </button>
              <button className="p-4 rounded-xl bg-blue-900/20 border border-blue-800/50 hover:border-blue-500 transition-colors text-left">
                <div className="font-bold text-blue-400 mb-1">State Laws</div>
                <div className="text-xs text-gray-400">All 50 States + DC</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusCard({ title, value, icon: Icon, color, subtext }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
    </div>
  )
}
