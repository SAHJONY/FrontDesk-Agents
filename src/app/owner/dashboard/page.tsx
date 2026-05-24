'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { 
  LayoutDashboard, BarChart3, Building2, Languages, Settings, LogOut,
  Globe, TrendingUp, Users, DollarSign, Activity, Phone, MessageSquare
} from 'lucide-react'

export default function OwnerDashboard() {
  const { t, language, setLanguage, languages } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock data - would come from Supabase
  const metrics = {
    totalBusinesses: 1247,
    activeUsers: 892,
    callsToday: 3421,
    revenue: 48290,
    successRate: 99.8,
    uptime: 99.97,
  }

  const businesses = [
    { id: 1, name: 'Smith & Associates Law', industry: 'legal', language: 'en', status: 'active', calls: 142 },
    { id: 2, name: 'HealthFirst Medical', industry: 'medical', language: 'es', status: 'active', calls: 98 },
    { id: 3, name: 'Premium Real Estate', industry: 'real_estate', language: 'zh', status: 'active', calls: 76 },
    { id: 4, name: 'Global Finance Corp', industry: 'financial', language: 'en', status: 'active', calls: 234 },
  ]

  const navItems = [
    { id: 'overview', label: t('dashboard.overview'), icon: LayoutDashboard },
    { id: 'analytics', label: t('dashboard.analytics'), icon: BarChart3 },
    { id: 'businesses', label: t('dashboard.businesses'), icon: Building2 },
    { id: 'languages', label: t('dashboard.languages'), icon: Languages },
    { id: 'settings', label: t('dashboard.settings'), icon: Settings },
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
                onChange={(e) => setLanguage(e.target.value as any)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              {Object.entries(languages).map(([code, data]: any) => (
                <option key={code} value={code}>
                  {data.flag} {data.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="m-4 p-3 text-gray-400 hover:text-red-400 transition-colors flex items-center gap-3">
          <LogOut className="w-5 h-5" />
          <span>{t('dashboard.logout')}</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t(`dashboard.${activeTab}`)}</h1>
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
                <div className="text-gray-400">{t('metrics.totalBusinesses')}</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics.activeUsers.toLocaleString()}</div>
                <div className="text-gray-400">{t('metrics.activeUsers')}</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Phone className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics.callsToday.toLocaleString()}</div>
                <div className="text-gray-400">{t('metrics.callsToday')}</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">${(metrics.revenue / 1000).toFixed(1)}K</div>
                <div className="text-gray-400">{t('metrics.revenue')}</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{t('metrics.successRate')}</h3>
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">{metrics.successRate}%</div>
                <div className="text-gray-400">Call resolution rate</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{t('metrics.uptime')}</h3>
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">{metrics.uptime}%</div>
                <div className="text-gray-400">Platform availability</div>
              </div>
            </div>

            {/* Active Businesses */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-6">{t('dashboard.activeBusinesses')}</h3>
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div key={business.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        {business.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{business.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{business.industry}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{languages[business.language as keyof typeof languages]?.flag || '🌍'}</span>
                      <div className="text-right">
                        <div className="font-semibold">{business.calls} calls</div>
                        <div className="text-sm text-green-400 capitalize">{business.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'businesses' && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">{t('dashboard.businesses')}</h3>
            <p className="text-gray-400">Business management interface - coming soon</p>
          </div>
        )}

        {activeTab === 'languages' && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">{t('dashboard.languages')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(languages).map(([code, data]: any) => (
                <div key={code} className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-3xl mb-2">{data.flag}</div>
                  <div className="font-semibold">{data.nativeName}</div>
                  <div className="text-sm text-gray-400">{data.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
