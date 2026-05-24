'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, BarChart3, Building2, Languages, Settings, LogOut,
  Globe, TrendingUp, Users, DollarSign, Activity, Phone
} from 'lucide-react'

const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  'zh-cn': { name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
}

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState('en')

  const metrics = {
    totalBusinesses: 1247,
    activeUsers: 892,
    callsToday: 3421,
    revenue: 48290,
    successRate: 99.8,
    uptime: 99.97,
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full bg-black/95 border-r border-white/10 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GlobalVoice
          </h1>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGES).map(([code, data]: any) => (
                <option key={code} value={code}>
                  {data.flag} {data.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="m-4 p-3 text-gray-400 hover:text-red-400 transition-colors flex items-center gap-3">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
          <button 
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics.totalBusinesses.toLocaleString()}</div>
                <div className="text-gray-400">Total Businesses</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics.activeUsers.toLocaleString()}</div>
                <div className="text-gray-400">Active Users</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Phone className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics.callsToday.toLocaleString()}</div>
                <div className="text-gray-400">Calls Today</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">${(metrics.revenue / 1000).toFixed(1)}K</div>
                <div className="text-gray-400">Revenue (MTD)</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Success Rate</h3>
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">{metrics.successRate}%</div>
                <div className="text-gray-400">Call resolution rate</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Uptime</h3>
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">{metrics.uptime}%</div>
                <div className="text-gray-400">Platform availability</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'languages' && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Supported Languages</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(LANGUAGES).map(([code, data]: any) => (
                <div key={code} className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-3xl mb-2">{data.flag}</div>
                  <div className="font-semibold">{data.nativeName}</div>
                  <div className="text-sm text-gray-400">{data.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'analytics' || activeTab === 'businesses' || activeTab === 'settings') && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-6 capitalize">{activeTab}</h3>
            <p className="text-gray-400">This section is coming soon. The platform is being built to support {Object.keys(LANGUAGES).length} languages and 50+ industries worldwide.</p>
          </div>
        )}
      </main>
    </div>
  )
}
