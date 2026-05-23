'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Bot, Sun, Moon, LogOut, Home, BarChart3, Users, Settings, Building2, Globe, TrendingUp, DollarSign, Phone, MessageSquare } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btjscudzrtarfommgegw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default function OwnerDashboard() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    activeAgents: 0,
    totalCalls: 0,
    customers: []
  })

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Fetch customers
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
      
      // Fetch metrics
      const { data: businessMetrics } = await supabase
        .from('business_metrics')
        .select('*')

      const totalCustomers = customers?.length || 0
      const totalRevenue = customers?.reduce((acc, curr) => acc + (curr.monthly_revenue || 0), 0) || 0
      const activeAgents = customers?.filter(c => c.status === 'active').length || 0
      const totalCalls = businessMetrics?.reduce((acc, curr) => acc + (curr.calls_handled || 0), 0) || 0

      setMetrics({
        totalCustomers,
        totalRevenue,
        activeAgents,
        totalCalls,
        customers: customers || []
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    await supabase.auth.signOut()
    router.push('/owner/login')
  }

  const stats = [
    { name: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'from-blue-400 to-blue-600' },
    { name: 'Total Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-400 to-green-600' },
    { name: 'Active Agents', value: metrics.activeAgents, icon: Bot, color: 'from-purple-400 to-purple-600' },
    { name: 'Total Calls', value: metrics.totalCalls.toLocaleString(), icon: Phone, color: 'from-orange-400 to-orange-600' }
  ]

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: '#f0b429' }} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 border-b ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0b429, #c4920a)' }}>
                <Bot className="w-6 h-6" style={{ color: '#050810' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold">FRONTDESK</h1>
                <p className="text-xs font-bold tracking-wider" style={{ color: '#f0b429' }}>AGENTS</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <a
                href="/"
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Home className="w-5 h-5" />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Owner Dashboard</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Monitor your platform performance and manage customers
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.name}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Customers Table */}
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}">
            <h3 className="text-xl font-bold">Customers</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your customer accounts
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-white/5' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y ${isDarkMode ? 'divide-white/10' : 'divide-gray-200'}">
                {metrics.customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No customers yet</p>
                    </td>
                  </tr>
                ) : (
                  metrics.customers.map((customer: any) => (
                    <tr key={customer.id} className={isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.business_name}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                          {customer.industry}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{customer.plan || 'Starter'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          customer.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {customer.status || 'trial'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {customer.website ? (
                          <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            Visit
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
