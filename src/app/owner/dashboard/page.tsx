'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Settings, Database, Users, DollarSign, Activity,
  BarChart3, Building2, Shield, Key, Server, Zap, TrendingUp,
  AlertCircle, CheckCircle, Plus, Trash2, Edit, Save, X, Eye, EyeOff,
  RefreshCw, Download, Upload, HardDrive, Cpu, Globe, Lock, Unlock,
  Menu, Phone, Scale, LogOut, Play, Pause, Bot, Send
} from 'lucide-react'
import HermesChat from './HermesChat'

export default function OwnerDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [harnessRunning, setHarnessRunning] = useState(true)
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    revenue: 48290,
    callsToday: 3421,
    successRate: 99.8,
    uptime: 99.99,
    harnessCycles: 142,
    autonomousDeployments: 89
  })

  // Environment Variables
  const [envVars, setEnvVars] = useState([
    { id: 1, name: 'NVIDIA_API_KEY', value: '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', description: 'NVIDIA NIM API Key', category: 'AI Models', required: true, status: 'active' },
    { id: 2, name: 'SUPABASE_URL', value: 'https://xyzabcdefghijk.supabase.co', description: 'Supabase Project URL', category: 'Database', required: true, status: 'active' },
    { id: 3, name: 'SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...', description: 'Supabase Anonymous Key', category: 'Database', required: true, status: 'active' },
    { id: 4, name: 'STRIPE_SECRET_KEY', value: 'sk_live_51ABC...', description: 'Stripe Payment Processing', category: 'Payments', required: true, status: 'active' },
    { id: 5, name: 'RESEND_API_KEY', value: 're_1234567890ABC...', description: 'Email Service (Resend)', category: 'Email', required: true, status: 'active' },
    { id: 6, name: 'OPENAI_API_KEY', value: '', description: 'OpenAI API Key (Fallback)', category: 'AI Models', required: false, status: 'inactive' },
    { id: 7, name: 'ANTHROPIC_API_KEY', value: '', description: 'Anthropic Claude API', category: 'AI Models', required: false, status: 'inactive' },
  ])

  const [editingVar, setEditingVar] = useState<number | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Enterprise Modules
  const enterpriseModules = [
    { id: 'real-estate', name: 'Real Estate AI', icon: '🏠', status: 'active', users: 234, revenue: 12400, uptime: 99.99 },
    { id: 'energy', name: 'Energy Trading AI', icon: '⚡', status: 'active', users: 189, revenue: 9800, uptime: 99.98 },
    { id: 'marketing', name: 'Marketing AI', icon: '📈', status: 'active', users: 412, revenue: 15600, uptime: 99.99 },
    { id: 'lottery', name: 'Lottery Analysis AI', icon: '🎰', status: 'active', users: 156, revenue: 4200, uptime: 99.97 },
    { id: 'crypto', name: 'Crypto AI', icon: '🪙', status: 'active', users: 298, revenue: 8900, uptime: 99.99 },
    { id: 'legal', name: 'Legal AI', icon: '⚖️', status: 'active', users: 178, revenue: 11200, uptime: 99.98 },
  ]

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'modules', label: 'Enterprise Modules', icon: Building2 },
    { id: 'harness', label: 'Autonomous Harness', icon: Activity },
    { id: 'env', label: 'Environment Vars', icon: Database },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System Health', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleSaveEnv = (id: number, newValue: string) => {
    setEnvVars(envVars.map(v => v.id === id ? { ...v, value: newValue, status: 'active' } : v))
    setEditingVar(null)
  }

  const handleDeleteEnv = (id: number) => {
    setEnvVars(envVars.filter(v => v.id !== id))
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={metrics.totalUsers.toLocaleString()} icon={Users} color="text-blue-400" change="+12%" />
              <StatCard title="Active Users" value={metrics.activeUsers.toLocaleString()} icon={Activity} color="text-green-400" change="+8%" />
              <StatCard title="Revenue (MTD)" value={`$${(metrics.revenue/1000).toFixed(1)}K`} icon={DollarSign} color="text-yellow-400" change="+15%" />
              <StatCard title="Calls Today" value={metrics.callsToday.toLocaleString()} icon={Phone} color="text-purple-400" change="+22%" />
            </div>

            {/* Enterprise Modules Summary */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseModules.map((module) => (
                <div key={module.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{module.icon}</span>
                    <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs rounded-full capitalize">{module.status}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{module.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{module.users} users</span>
                    <span className="text-green-400 font-medium">${module.revenue.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Uptime: {module.uptime}%</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'env':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Environment Variables</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variable
              </button>
            </div>

            {/* Categories */}
            {['AI Models', 'Database', 'Payments', 'Email'].map(category => (
              <div key={category} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  {category === 'AI Models' && <Cpu className="w-5 h-5 text-blue-400" />}
                  {category === 'Database' && <Database className="w-5 h-5 text-green-400" />}
                  {category === 'Payments' && <DollarSign className="w-5 h-5 text-yellow-400" />}
                  {category === 'Email' && <Globe className="w-5 h-5 text-purple-400" />}
                  {category}
                </h3>
                <div className="space-y-3">
                  {envVars.filter(v => v.category === category).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{v.name}</span>
                          {v.required && <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded">Required</span>}
                          {v.status === 'active' && <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">Active</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{v.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingVar === v.id ? (
                          <>
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="px-3 py-1 bg-black/50 border border-white/10 rounded text-sm font-mono"
                              autoFocus
                            />
                            <button onClick={() => handleSaveEnv(v.id, tempValue)} className="p-2 bg-green-600 hover:bg-green-500 rounded">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingVar(null)} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingVar(v.id); setTempValue(v.value) }} className="p-2 text-gray-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteEnv(v.id)} className="p-2 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case 'harness':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Autonomous Harness Engine</h2>
              <button
                onClick={() => setHarnessRunning(!harnessRunning)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  harnessRunning ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'
                }`}
              >
                {harnessRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {harnessRunning ? 'Running' : 'Paused'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Cycles" value={metrics.harnessCycles} icon={Activity} color="text-blue-400" />
              <StatCard title="Deployments" value={metrics.autonomousDeployments} icon={CheckCircle} color="text-green-400" />
              <StatCard title="Success Rate" value="99.2%" icon={TrendingUp} color="text-purple-400" />
              <StatCard title="Learnings" value="156" icon={Database} color="text-yellow-400" />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Harness Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/30">
                  <span className="text-gray-400">Current Status</span>
                  <span className="text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {harnessRunning ? 'Autonomous Mode Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/30">
                  <span className="text-gray-400">Next Cycle</span>
                  <span className="text-blue-400 font-medium">in 4m 32s</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/30">
                  <span className="text-gray-400">Last Anomaly</span>
                  <span className="text-yellow-400 font-medium">2 hours ago (resolved)</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'modules':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Enterprise Modules Management</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseModules.map((module) => (
                <div key={module.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{module.icon}</span>
                    <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs rounded-full capitalize">{module.status}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{module.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Users</span>
                      <span className="font-medium">{module.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue</span>
                      <span className="font-medium text-green-400">${module.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime</span>
                      <span className="font-medium text-green-400">{module.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="font-medium text-green-400">Operational</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                    Manage Module
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-gray-400">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Section under development</p>
              <p className="text-sm mt-2">{activeTab}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full bg-black/95 border-r border-white/10 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-blue-500" />
            {sidebarOpen && <span className="font-bold">Owner Dashboard</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Section - Separated */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-3 rounded-xl hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
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
              <h1 className="text-3xl font-bold mb-2 capitalize">{activeTab.replace('-', ' ')}</h1>
              <p className="text-gray-400">Sahjony Capital LLC • Enterprise Plan</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-900/50 text-green-400 rounded-lg border border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">System Operational</span>
                </div>
              </div>
            </div>
          </div>

          <HermesChat metrics={metrics} harnessRunning={harnessRunning} />
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, change }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      {change && <div className="text-xs text-green-400">{change} from last period</div>}
    </div>
  )
}
