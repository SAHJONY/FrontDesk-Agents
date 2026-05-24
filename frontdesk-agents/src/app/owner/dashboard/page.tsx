'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Phone, Scale, Building2, Activity, Settings, LogOut,
  Zap, CheckCircle, TrendingUp, Users, DollarSign, BarChart3,
  Menu, X, Shield, Database, Server, Clock, AlertCircle, Play, Pause
} from 'lucide-react'
import HermesChat from './HermesChat'
export default function OwnerDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [harnessRunning, setHarnessRunning] = useState(true)
  const [harnessStatus, setHarnessStatus] = useState<any>(null)
  
  // Mock data for demonstration
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

  const enterpriseModules = [
    { id: 'real-estate', name: 'Real Estate AI', icon: '🏠', status: 'active', users: 234, revenue: 12400 },
    { id: 'energy', name: 'Energy Trading AI', icon: '⚡', status: 'active', users: 189, revenue: 9800 },
    { id: 'marketing', name: 'Marketing AI', icon: '📈', status: 'active', users: 412, revenue: 15600 },
    { id: 'lottery', name: 'Lottery Analysis AI', icon: '🎰', status: 'active', users: 156, revenue: 4200 },
    { id: 'crypto', name: 'Crypto AI', icon: '🪙', status: 'active', users: 298, revenue: 8900 },
    { id: 'legal', name: 'Legal AI', icon: '⚖️', status: 'active', users: 178, revenue: 11200 },
  ]

  const recentActivities = [
    { id: 1, type: 'deployment', message: 'Autonomous deployment: Simplified signup flow', time: '2 min ago', status: 'success' },
    { id: 2, type: 'alert', message: 'High latency detected in API gateway', time: '15 min ago', status: 'warning' },
    { id: 3, type: 'user', message: 'New enterprise customer: TechCorp Inc.', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'harness', message: 'Harness cycle #142 completed successfully', time: '2 hours ago', status: 'success' },
    { id: 5, type: 'deployment', message: 'Feature rollout: Multi-language support', time: '3 hours ago', status: 'success' },
  ]

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'enterprise', label: 'Enterprise Modules', icon: Building2 },
    { id: 'harness', label: 'Autonomous Harness', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System Health', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        callsToday: prev.callsToday + Math.floor(Math.random() * 10)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' : 
                      activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{activity.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'harness':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Autonomous Harness Engine</h2>
              <div className="flex items-center gap-4">
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
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Cycles" value={metrics.harnessCycles} icon={Activity} color="text-blue-400" />
              <StatCard title="Successful Deployments" value={metrics.autonomousDeployments} icon={CheckCircle} color="text-green-400" />
              <StatCard title="Success Rate" value="99.2%" icon={TrendingUp} color="text-purple-400" />
              <StatCard title="Learnings Stored" value="156" icon={Database} color="text-yellow-400" />
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

      case 'enterprise':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Enterprise Modules Management</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseModules.map((module) => (
                <div key={module.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{module.icon}</span>
                    <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs rounded-full">Active</span>
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

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold mb-4">User Growth</h3>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  [Chart Placeholder]
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Revenue Trends</h3>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  [Chart Placeholder]
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Module Usage</h3>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  [Chart Placeholder]
                </div>
              </div>
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
      <aside className={`fixed md:relative z-40 h-full bg-black/95 border-r border-white/10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-blue-500" />
            {sidebarOpen && <span className="font-bold">Owner Dashboard</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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

          {renderContent()}
        </div>
      <HermesChat metrics={metrics} harnessRunning={harnessRunning} />
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
