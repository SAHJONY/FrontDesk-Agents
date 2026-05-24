'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Phone, Scale, Settings, LogOut, 
  Activity, Zap, CheckCircle, Building2, TrendingUp
} from 'lucide-react'

export default function EnterpriseDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showReceptionistModal, setShowReceptionistModal] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  // Enterprise User Data
  const user = {
    name: 'Juan Gonzalez',
    email: 'sahjonycapitalllc@outlook.com',
    company: 'Sahjony Capital LLC',
    tier: 'Enterprise',
    status: 'Active',
    limit: 'Unlimited',
    features: ['real estate', 'energy', 'marketing', 'lottery', 'crypto', 'legal ai']
  }

  // Module configurations
  const moduleConfigs: Record<string, any> = {
    'real estate': {
      title: 'Real Estate AI',
      icon: '🏠',
      color: 'from-emerald-600 to-teal-700',
      prompt: 'You are a Real Estate AI assistant for Sahjony Capital.',
      features: ['Property Analysis', 'Market Trends', 'Investment Calculator']
    },
    'energy': {
      title: 'Energy Trading AI',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      prompt: 'You are an Energy Trading AI assistant.',
      features: ['Market Analysis', 'Price Tracking', 'Risk Assessment']
    },
    'marketing': {
      title: 'Marketing AI',
      icon: '📈',
      color: 'from-pink-500 to-rose-600',
      prompt: 'You are a Marketing AI assistant.',
      features: ['Campaign Planning', 'Content Generation', 'ROI Tracking']
    },
    'lottery': {
      title: 'Lottery Analysis AI',
      icon: '🎰',
      color: 'from-purple-500 to-violet-600',
      prompt: 'You are a Lottery Analysis AI assistant.',
      features: ['Odds Calculator', 'Pattern Analysis', 'Statistics']
    },
    'crypto': {
      title: 'Crypto AI',
      icon: '🪙',
      color: 'from-cyan-500 to-blue-600',
      prompt: 'You are a Crypto AI assistant.',
      features: ['Market Analysis', 'Portfolio Tracking', 'Blockchain Data']
    },
    'legal ai': {
      title: 'Legal AI',
      icon: '⚖️',
      color: 'from-blue-600 to-indigo-700',
      prompt: 'You are a Legal AI assistant with access to US Legal Corpus.',
      features: ['Case Law Search', 'Statute Lookup', 'Document Review']
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'receptionist', label: 'AI Receptionist', icon: Phone },
    { id: 'legal', label: 'Legal Research', icon: Scale },
    { id: 'modules', label: 'Enterprise Modules', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleModuleClick = (moduleName: string) => {
    setSelectedModule(moduleName)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full bg-black/95 border-r border-white/10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-500" />
            {sidebarOpen && <span className="font-bold">Enterprise</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 text-gray-400 hover:text-white w-full px-4 py-2"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Enterprise Dashboard</h1>
              <p className="text-gray-400">{user.company} • {user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-900/50 text-green-400 rounded-lg border border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-blue-900/50 text-blue-400 rounded-lg border border-blue-800">
                <div className="font-medium">Unlimited</div>
                <div className="text-xs">Enterprise Tier</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Calls Today</span>
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">142</div>
              <div className="text-sm text-gray-500 mt-1">+12% from yesterday</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Success Rate</span>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400">99.8%</div>
              <div className="text-sm text-gray-500 mt-1">Industry leading</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Monthly Usage</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">Unlimited</div>
              <div className="text-sm text-gray-500 mt-1">Enterprise plan</div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setShowReceptionistModal(true)}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/50 to-blue-700/50 border border-blue-800 hover:border-blue-600 transition-all hover:scale-105 text-left"
            >
              <Phone className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Receptionist</h3>
              <p className="text-gray-400">Configure your autonomous phone agent</p>
            </button>
            <button
              onClick={() => setShowLegalModal(true)}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-purple-700/50 border border-purple-800 hover:border-purple-600 transition-all hover:scale-105 text-left"
            >
              <Scale className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Legal Research Engine</h3>
              <p className="text-gray-400">Search federal & state laws with AI</p>
            </button>
          </div>

          {/* Active Enterprise Modules */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Active Enterprise Modules</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {user.features.map((feature) => {
                const config = moduleConfigs[feature] || { title: feature, icon: '📦', color: 'from-gray-600 to-gray-700' }
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

          {/* Module Detail Modal */}
          {selectedModule && moduleConfigs[selectedModule] && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedModule(null)}>
              <div className="bg-black border border-white/20 rounded-2xl max-w-2xl w-full p-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedModule(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                  <LogOut className="w-6 h-6" />
                </button>
                
                {(() => {
                  const config = moduleConfigs[selectedModule]
                  return (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl`}>
                            {config.icon}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{config.title}</h2>
                            <p className="text-gray-400 capitalize">{selectedModule}</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-bold mb-3 text-green-400">System Prompt</h3>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-gray-300 text-sm leading-relaxed">{config.prompt}</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-bold mb-3 text-blue-400">Features</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {config.features.map((feature: string, idx: number) => (
                              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button 
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 font-bold transition-all hover:scale-105"
                          onClick={() => {
                            console.log('Opening module:', selectedModule)
                          }}
                        >
                          Open {config.title}
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Receptionist Modal */}
      {showReceptionistModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReceptionistModal(false)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowReceptionistModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4">AI Receptionist Configuration</h2>
            <p className="text-gray-400 mb-6">Manage your autonomous phone agent settings.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
                <input type="text" defaultValue="Sahjony Assistant" className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Voice</label>
                <select className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg focus:border-blue-500 outline-none">
                  <option>Professional Female (US)</option>
                  <option>Professional Male (US)</option>
                  <option>British Female</option>
                </select>
              </div>
              <div className="pt-4">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-medium hover:from-blue-500 hover:to-blue-400 transition-all">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Research Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLegalModal(false)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLegalModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Legal Research Engine</h2>
            <p className="text-gray-400 mb-6">Search federal & state laws, cases, and local rules.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Search Query</label>
                <input type="text" placeholder="Search laws, cases, statutes..." className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg focus:border-purple-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-xl bg-blue-900/20 border border-blue-800/50 hover:border-blue-500 transition-colors text-left">
                  <div className="font-bold text-blue-400 mb-1">Federal Courts</div>
                  <div className="text-xs text-gray-400">94 Districts, 13 Circuits</div>
                </button>
                <button className="p-4 rounded-xl bg-purple-900/20 border border-purple-800/50 hover:border-purple-500 transition-colors text-left">
                  <div className="font-bold text-purple-400 mb-1">State Laws</div>
                  <div className="text-xs text-gray-400">All 50 States + DC</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
