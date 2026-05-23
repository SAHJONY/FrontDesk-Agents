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
  const [activeModule, setActiveModule] = useState<string | null>(null)
  
  // Debug helper
  const debugLog = (msg: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Enterprise Dashboard]', msg)
    }
  }
  
  // Handle module click
  const handleModuleClick = (moduleName: string) => {
    debugLog(`Clicked module: ${moduleName}`)
    debugLog(`Config exists: ${!!moduleConfigs[moduleName]}`)
    setActiveModule(moduleName)
  }
  
  // Module Configurations
  const moduleConfigs: Record<string, any> = {
    'real estate': {
      title: 'Real Estate AI Agent',
      icon: '🏢',
      color: 'blue',
      prompt: `You are the AI assistant for Sahjony Capital's Real Estate Division.
Your goals:
1. Qualify buyers (Budget, Location, Timeline).
2. Schedule property viewings.
3. Answer questions about listings, HOA fees, and zoning.
4. Flag "investment opportunity" calls for immediate transfer.

Tone: Professional, knowledgeable, and enthusiastic.
Opening: "Thank you for calling Sahjony Real Estate. I'm here to help you find your dream property or investment opportunity. How can I assist you today?"`,
      features: ['Auto-schedule viewings', 'MLS Integration', 'Zoning lookup', 'Investment scoring']
    },
    'energy': {
      title: 'Energy Sector AI',
      icon: '⚡',
      color: 'yellow',
      prompt: `You are the AI assistant for Sahjony Capital's Energy Division.
Your goals:
1. Screen renewable energy project leads (Solar, Wind, Hydro).
2. Collect project specs (Capacity, Location, Budget).
3. Schedule consultations with energy analysts.
4. Identify regulatory hurdles (Permits, Environmental impact).

Tone: Technical, precise, and forward-thinking.
Opening: "Welcome to Sahjony Energy. We specialize in accelerating the transition to sustainable power. What project can we help you develop today?"`,
      features: ['Project screening', 'Regulatory check', 'Capacity analysis', 'Investor matching']
    },
    'marketing': {
      title: 'Marketing AI Strategist',
      icon: '📢',
      color: 'purple',
      prompt: `You are the AI Marketing Strategist for Sahjony Capital.
Your goals:
1. Analyze campaign performance metrics.
2. Suggest optimization strategies (ROI, CTR, CAC).
3. Generate ad copy variations.
4. Schedule marketing reviews.

Tone: Creative, data-driven, and persuasive.
Opening: "Hello! I'm your AI Marketing Strategist. Let's optimize your campaigns and maximize your ROI. What metric are we improving today?"`,
      features: ['ROI Analysis', 'Ad copy gen', 'Trend spotting', 'Competitor watch']
    },
    'lottery': {
      title: 'Lottery & Probability AI',
      icon: '🎰',
      color: 'red',
      prompt: `You are the AI Probability Analyst for Sahjony Capital.
Your goals:
1. Analyze lottery pool strategies.
2. Explain probability theory and odds.
3. Manage syndicate communications.
4. Verify winning numbers against tickets.

Tone: Exciting but realistic, mathematical.
Opening: "Welcome to the Sahjony Lottery Syndicate AI. While luck plays a role, strategy matters. How can we analyze the odds today?"`,
      features: ['Odds calculator', 'Syndicate mgmt', 'Number verification', 'Pool tracking']
    },
    'crypto': {
      title: 'Crypto & Web3 AI',
      icon: '₿',
      color: 'orange',
      colorHex: '#f97316',
      prompt: `You are the AI Crypto Analyst for Sahjony Capital.
Your goals:
1. Track market sentiment (BTC, ETH, Altcoins).
2. Explain DeFi protocols and tokenomics.
3. Alert on whale movements and regulatory news.
4. Schedule trading reviews.

Tone: Fast-paced, technical, and risk-aware.
Opening: "Welcome to Sahjony Crypto. Markets move 24/7, and so do we. What asset or protocol are we analyzing?"`,
      features: ['Market sentiment', 'Whale alerts', 'DeFi scanner', 'Regulatory news']
    },
    'legal ai': {
      title: 'Legal Research AI',
      icon: '⚖️',
      color: 'indigo',
      prompt: `You are the AI Legal Researcher for Sahjony Capital.
Your goals:
1. Search federal/state case law.
2. Summarize statutes and regulations.
3. Draft legal memos and briefs.
4. Cite-check references.

Tone: Precise, authoritative, and thorough.
Opening: "Welcome to Sahjony Legal AI. I have access to the full US Legal Corpus. What legal question or case are we researching?"`,
      features: ['Case law search', 'Statute summary', 'Brief drafting', 'Cite checking']
    }
  }

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
                {user.features.map((feature) => {
                  const config = moduleConfigs[feature] || { title: feature, icon: '📦', color: 'gray' }
                  return (
                    <button
                      key={feature}
                      onClick={() => handleModuleClick(feature)}
                      className="p-4 rounded-xl bg-black/50 border border-white/10 text-center capitalize hover:border-green-500/50 transition-all hover:scale-105 hover:bg-white/5 group cursor-pointer"
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{config.icon}</div>
                      <div className="text-xs font-medium text-gray-300 group-hover:text-white">{feature}</div>
                    </button>
                  )
                })}
              </div>
            </div>
        </div>
      </main>

      {/* AI Receptionist Modal - Bland.ai Style */}
      {showReceptionistModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowReceptionistModal(false)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-4xl w-full my-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h2 className="text-xl font-bold text-white">AI Receptionist Configuration</h2>
              </div>
              <button onClick={() => setShowReceptionistModal(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid md:grid-cols-3 gap-6">
              {/* Left Column: Configuration */}
              <div className="md:col-span-2 space-y-6">
                
                {/* 1. Phone Number */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <button className="text-xs text-green-400 hover:text-green-300 font-medium">+ Claim New Number</button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="p-2 bg-white/10 rounded-md">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">+1 (555) 0123-4567</div>
                      <div className="text-xs text-gray-500">Verified • SMS Enabled</div>
                    </div>
                    <button className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">Edit</button>
                  </div>
                </div>

                {/* 2. System Prompt (The Brain) */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                    <span>System Prompt</span>
                    <span className="text-blue-400 cursor-pointer hover:underline">Save Template</span>
                  </label>
                  <div className="relative">
                    <textarea 
                      className="w-full h-48 bg-black border border-white/10 rounded-lg p-4 text-sm text-gray-300 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                      defaultValue={`You are the AI receptionist for Sahjony Capital LLC.
Your name is "Sahjony Assistant".
Tone: Professional, concise, and helpful.

Key Responsibilities:
1. Answer calls within 2 rings.
2. Screen for "urgent" legal matters.
3. Schedule appointments for Real Estate and Energy sectors.
4. Transfer calls to Juan Gonzalez only if the caller mentions "Crypto" or "Lottery".

Opening Line: "Thank you for calling Sahjony Capital, this is the AI assistant. How can I help you today?"`}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-600">Markdown supported</div>
                  </div>
                </div>

                {/* 3. Voice & Model Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Voice Model</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none">
                      <option>enhanced (High Fidelity)</option>
                      <option>turbo (Low Latency)</option>
                      <option>base (Standard)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Voice ID</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none">
                      <option>🇺🇸 Alexa (Professional Female)</option>
                      <option>🇺🇸 Marcus (Professional Male)</option>
                      <option>🇬🇧 Eleanor (British Female)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Call Flow & Actions */}
              <div className="space-y-6">
                {/* Call Flow Visualization */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4">Call Flow Logic</h3>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
                    {/* Step 1 */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 bg-blue-900 border border-blue-700 rounded-full flex items-center justify-center text-[10px] text-blue-300 font-bold">1</div>
                      <div className="text-sm font-medium text-white">Greeting</div>
                      <div className="text-xs text-gray-500">Play initial message</div>
                    </div>
                    {/* Step 2 */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 bg-purple-900 border border-purple-700 rounded-full flex items-center justify-center text-[10px] text-purple-300 font-bold">2</div>
                      <div className="text-sm font-medium text-white">AI Classification</div>
                      <div className="text-xs text-gray-500">Detect intent (Sales, Urgent, Info)</div>
                    </div>
                    {/* Step 3 */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 bg-green-900 border border-green-700 rounded-full flex items-center justify-center text-[10px] text-green-300 font-bold">3</div>
                      <div className="text-sm font-medium text-white">Action</div>
                      <div className="text-xs text-gray-500">Transfer or Hangup</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Test Call
                  </button>
                  <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                    View Call Logs
                  </button>
                  <button className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-900/20">
                    Save Configuration
                  </button>
                </div>

                {/* Stats */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Total Calls Handled</div>
                  <div className="text-2xl font-bold text-white">1,248</div>
                  <div className="text-xs text-green-400 mt-1">↑ 12% this week</div>
                </div>
              </div>
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

      {/* Enterprise Module Modal */}
      {activeModule && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setActiveModule(null)}>
          {moduleConfigs[activeModule] ? (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-4xl w-full my-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
          {(() => {
          const config = moduleConfigs[activeModule]
              const colorMap: Record<string, string> = {
                blue: 'text-blue-400 border-blue-800 bg-blue-900/20',
                yellow: 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
                purple: 'text-purple-400 border-purple-800 bg-purple-900/20',
                red: 'text-red-400 border-red-800 bg-red-900/20',
                orange: 'text-orange-400 border-orange-800 bg-orange-900/20',
                indigo: 'text-indigo-400 border-indigo-800 bg-indigo-900/20',
              }
              const colorClass = colorMap[config.color] || 'text-gray-400 border-gray-800 bg-gray-900/20'
              const buttonColor = config.color === 'orange' ? 'bg-orange-600 hover:bg-orange-500' : `bg-${config.color}-600 hover:bg-${config.color}-500`

              return (
                <>
                  <div className={`p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-xl ${colorClass.replace('bg-', 'bg-opacity-10 ')}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{config.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">{config.title}</h2>
                        <p className="text-xs text-gray-400">Enterprise Module • Active</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveModule(null)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="p-6 grid md:grid-cols-3 gap-6">
                    {/* Left: Prompt */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Prompt</label>
                        <textarea 
                          className="w-full h-64 bg-black border border-white/10 rounded-lg p-4 text-sm text-gray-300 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                          defaultValue={config.prompt}
                        />
                      </div>
                    </div>

                    {/* Right: Features & Actions */}
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Active Features</h3>
                        <ul className="space-y-2">
                          {config.features.map((f: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                              <div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}></div>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button className={`w-full py-2.5 ${buttonColor} text-white rounded-lg text-sm font-medium transition-colors shadow-lg`}>
                        Activate Module
                      </button>
                      <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                        View Logs
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}
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
