'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, Bot, Phone, Users, DollarSign, TrendingUp, TrendingDown,
  Activity, BarChart3, MessageSquare, Clock, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronDown, Settings, Bell, LogOut,
  Eye, EyeOff, Play, Pause, RefreshCw, CheckCircle2, AlertCircle,
  PhoneCall, PhoneIncoming, PhoneOutgoing, MessageCircle, Mail,
  Globe, Calendar, PieChart, Download, Filter, Search,
  Plus, Minus, Edit3, Copy, ExternalLink, Maximize2, Minimize2,
  CreditCard, Wallet, Receipt, PiggyBank, ArrowRight, Star,
  Zap, Shield, Headphones, User, UserPlus, UserCheck, CalendarClock,
  FileText, Folder, Monitor, Database, Server, Wifi, Video
} from 'lucide-react'
import { clsx } from 'clsx'

const colors = {
  deepNavy: '#050810',
  midnightBlue: '#0a1220',
  slate: '#141d2f',
  steel: '#1c2942',
  silver: '#8892a4',
  gold: '#f0b429',
  goldLight: '#ffd666',
  goldDark: '#c4920a',
  white: '#ffffff',
  offWhite: '#f5f7fa',
  cyan: '#00d4ff',
  cyanLight: '#66e5ff',
  cyanDark: '#0099cc',
  red: '#ff4757',
  redDark: '#c0392b',
  green: '#26de81',
  greenDark: '#20bf6a',
  purple: '#a55eea',
  orange: '#fd9644',
  rose: '#ff6b9d'
}

// Mock business data
const businessData = {
  businessName: 'Acme Corporation',
  industry: 'Healthcare',
  plan: 'Professional',
  avatar: '🏥',
  metrics: {
    totalCalls: 2847,
    missedCalls: 23,
    avgResponseTime: 1.2,
    satisfactionScore: 94.7,
    monthlyRevenue: 2847.50,
    yearlyRevenue: 34170,
    activeUsers: 89,
    totalLeads: 456,
    convertedLeads: 124,
    conversionRate: 27.2
  },
  aiAgents: [
    { name: 'ARIA', status: 'online', interactions: 1247, satisfaction: 96.2 },
    { name: 'CHRONOS', status: 'online', interactions: 892, satisfaction: 94.8 },
    { name: 'NOVA', status: 'busy', interactions: 456, satisfaction: 92.1 },
  ],
  recentCalls: [
    { id: 1, from: '+1 555-0123', duration: 245, status: 'completed', time: '10:45 AM', type: 'inbound' },
    { id: 2, from: '+1 555-0456', duration: 180, status: 'completed', time: '10:32 AM', type: 'outbound' },
    { id: 3, from: '+1 555-0789', duration: 0, status: 'missed', time: '10:15 AM', type: 'missed' },
    { id: 4, from: '+1 555-0234', duration: 320, status: 'completed', time: '09:58 AM', type: 'inbound' },
  ],
  financialSummary: {
    monthToDate: 947.50,
    lastMonth: 2847.50,
    projectedMonth: 3150.00,
    yearlyTotal: 34170,
    averagePerCall: 1.20,
    roi: 340
  }
}

// Financial breakdown by service
const serviceRevenue = [
  { service: 'AI Voice Calls', amount: 1847.50, percentage: 65, color: colors.cyan },
  { service: 'SMS Notifications', amount: 450.00, percentage: 16, color: colors.gold },
  { service: 'Appointment Scheduling', amount: 350.00, percentage: 12, color: colors.green },
  { service: 'Lead Capture', amount: 200.00, percentage: 7, color: colors.purple },
]

// Revenue by day (last 7 days)
const weeklyRevenue = [
  { day: 'Mon', amount: 425, calls: 45 },
  { day: 'Tue', amount: 389, calls: 42 },
  { day: 'Wed', amount: 512, calls: 51 },
  { day: 'Thu', amount: 478, calls: 48 },
  { day: 'Fri', amount: 543, calls: 55 },
  { day: 'Sat', amount: 312, calls: 32 },
  { day: 'Sun', amount: 188, calls: 21 },
]

// Navigation items
const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'calls', label: 'Call History', icon: Phone },
  { id: 'financial', label: 'Financials', icon: DollarSign },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot },
  { id: 'leads', label: 'Lead Management', icon: UserPlus },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function CustomerDashboardPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [showMoney, setShowMoney] = useState(true)

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!showMoney) return '$••••••'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className='min-h-screen bg-deepNavy text-white flex'>
      {/* Sidebar */}
      <motion.aside
        className={clsx(
          'fixed left-0 top-0 h-full z-50 bg-gradient-to-b from-slate to-midnightBlue border-r border-white/10 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className='h-20 flex items-center justify-center border-b border-white/10 px-4'>
          <div className='flex items-center gap-3'>
            <div 
              className='w-12 h-12 rounded-xl flex items-center justify-center text-2xl'
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
            >
              {businessData.avatar}
            </div>
            {sidebarOpen && (
              <div className='overflow-hidden'>
                <h1 className='text-lg font-bold text-white truncate'>{businessData.businessName}</h1>
                <p className='text-xs font-bold tracking-wider' style={{ color: colors.gold }}>{businessData.plan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className='p-4 space-y-2'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                activeSection === item.id
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-silver hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className='w-5 h-5 flex-shrink-0' />
              {sidebarOpen && <span className='font-medium'>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='absolute -right-4 top-24 w-8 h-8 rounded-full bg-slate border border-white/20 flex items-center justify-center'
        >
          {sidebarOpen ? <ChevronLeft className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
        </button>

        {/* Logout */}
        <div className='absolute bottom-4 left-0 right-0 px-4'>
          <button 
            onClick={async () => {
              try {
                await fetch('/api/customer/logout', { method: 'POST' })
                window.location.href = '/customer/login'
              } catch (e) {
                console.error('Logout failed', e)
              }
            }}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors'
          >
            <LogOut className='w-5 h-5' />
            {sidebarOpen && <span className='font-medium'>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={clsx('flex-1 transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20')}>
        {/* Header */}
        <header className='h-20 border-b border-white/10 px-6 flex items-center justify-between bg-gradient-to-r from-slate/50 to-transparent'>
          <div className='flex items-center gap-4'>
            <div>
              <h2 className='text-xl font-bold text-white capitalize'>{activeSection}</h2>
              <p className='text-sm text-silver'>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            {/* Period Selector */}
            <div className='flex items-center gap-2 bg-white/5 rounded-xl p-1'>
              {['24h', '7d', '30d', '90d', '1y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedPeriod === period
                      ? 'bg-gold text-deepNavy'
                      : 'text-silver hover:text-white'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Toggle Money */}
            <button
              onClick={() => setShowMoney(!showMoney)}
              className='p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
              title={showMoney ? 'Hide amounts' : 'Show amounts'}
            >
              {showMoney ? <Eye className='w-5 h-5' /> : <EyeOff className='w-5 h-5' />}
            </button>

            <button className='p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative'>
              <Bell className='w-5 h-5' />
              <span className='absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500' />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className='p-6 overflow-y-auto' style={{ height: 'calc(100vh - 5rem)' }}>
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className='space-y-6'>
              {/* Top Stats */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <motion.div
                  className='relative group'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <div className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity' style={{ background: `linear-gradient(135deg, ${colors.green}30, ${colors.cyan}30)` }} />
                  <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ background: `${colors.green}20` }}>
                        <DollarSign className='w-6 h-6' style={{ color: colors.green }} />
                      </div>
                      <span className='flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium'>
                        <ArrowUp className='w-3 h-3' /> +12.5%
                      </span>
                    </div>
                    <p className='text-sm text-silver mb-1'>Monthly Revenue</p>
                    <p className='text-3xl font-bold text-white'>{formatCurrency(businessData.financialSummary.monthToDate)}</p>
                    <p className='text-xs text-silver mt-1'>vs {formatCurrency(businessData.financialSummary.lastMonth)} last month</p>
                  </div>
                </motion.div>

                <motion.div
                  className='relative group'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity' style={{ background: `linear-gradient(135deg, ${colors.cyan}30, ${colors.gold}30)` }} />
                  <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ background: `${colors.cyan}20` }}>
                        <PhoneCall className='w-6 h-6' style={{ color: colors.cyan }} />
                      </div>
                      <span className='flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium'>
                        <ArrowUp className='w-3 h-3' /> +8.2%
                      </span>
                    </div>
                    <p className='text-sm text-silver mb-1'>Total Calls</p>
                    <p className='text-3xl font-bold text-white'>{businessData.metrics.totalCalls.toLocaleString()}</p>
                    <p className='text-xs text-silver mt-1'>{businessData.metrics.missedCalls} missed this month</p>
                  </div>
                </motion.div>

                <motion.div
                  className='relative group'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity' style={{ background: `linear-gradient(135deg, ${colors.gold}30, ${colors.orange}30)` }} />
                  <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ background: `${colors.gold}20` }}>
                        <Users className='w-6 h-6' style={{ color: colors.gold }} />
                      </div>
                      <span className='flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium'>
                        <ArrowUp className='w-3 h-3' /> +15.3%
                      </span>
                    </div>
                    <p className='text-sm text-silver mb-1'>Leads Captured</p>
                    <p className='text-3xl font-bold text-white'>{businessData.metrics.totalLeads}</p>
                    <p className='text-xs text-silver mt-1'>{businessData.metrics.convertedLeads} converted ({businessData.metrics.conversionRate}%)</p>
                  </div>
                </motion.div>

                <motion.div
                  className='relative group'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity' style={{ background: `linear-gradient(135deg, ${colors.purple}30, ${colors.rose}30)` }} />
                  <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ background: `${colors.purple}20` }}>
                        <Star className='w-6 h-6' style={{ color: colors.purple }} />
                      </div>
                      <span className='flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium'>
                        <ArrowUp className='w-3 h-3' /> +2.1%
                      </span>
                    </div>
                    <p className='text-sm text-silver mb-1'>Satisfaction Score</p>
                    <p className='text-3xl font-bold text-white'>{businessData.metrics.satisfactionScore}%</p>
                    <p className='text-xs text-silver mt-1'>Based on {businessData.metrics.totalCalls} interactions</p>
                  </div>
                </motion.div>
              </div>

              {/* Revenue Chart & AI Agents */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Revenue Chart */}
                <div className='lg:col-span-2 bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-lg font-bold text-white'>Revenue This Week</h3>
                    <span className='text-2xl font-bold' style={{ color: colors.gold }}>{formatCurrency(weeklyRevenue.reduce((a, b) => a + b.amount, 0))}</span>
                  </div>
                  <div className='h-64 flex items-end gap-4'>
                    {weeklyRevenue.map((day, i) => (
                      <motion.div
                        key={day.day}
                        className='flex-1 flex flex-col items-center gap-2'
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      >
                        <div className='w-full flex-1 flex items-end'>
                          <motion.div
                            className='w-full rounded-t-lg'
                            style={{ 
                              background: `linear-gradient(to top, ${colors.gold}, ${colors.goldLight})`,
                              height: `${(day.amount / 550) * 100}%`
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.amount / 550) * 100}%` }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                          />
                        </div>
                        <span className='text-xs text-silver'>{day.day}</span>
                        <span className='text-sm font-medium' style={{ color: colors.gold }}>${day.amount}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* AI Agents Status */}
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>AI Agents Status</h3>
                  <div className='space-y-4'>
                    {businessData.aiAgents.map((agent) => (
                      <div key={agent.name} className='flex items-center gap-4 p-4 rounded-xl bg-white/5'>
                        <div className='w-12 h-12 rounded-xl flex items-center justify-center text-2xl' style={{ background: `${colors.cyan}20` }}>
                          🤖
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-white font-bold'>{agent.name}</span>
                            <span className={clsx(
                              'w-2 h-2 rounded-full',
                              agent.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                            )} />
                          </div>
                          <p className='text-xs text-silver'>{agent.interactions} interactions</p>
                        </div>
                        <div className='text-right'>
                          <span className='text-lg font-bold' style={{ color: colors.green }}>{agent.satisfaction}%</span>
                          <p className='text-xs text-silver'>satisfaction</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Revenue Breakdown</h3>
                  <div className='space-y-4'>
                    {serviceRevenue.map((item) => (
                      <div key={item.service}>
                        <div className='flex justify-between text-sm mb-2'>
                          <span className='text-silver'>{item.service}</span>
                          <span className='text-white font-medium'>{formatCurrency(item.amount)}</span>
                        </div>
                        <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                          <motion.div
                            className='h-full rounded-full'
                            style={{ background: item.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <p className='text-xs text-silver mt-1'>{item.percentage}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>ROI & Value</h3>
                  <div className='grid grid-cols-2 gap-6'>
                    <div className='text-center p-6 rounded-xl bg-white/5'>
                      <p className='text-4xl font-bold' style={{ color: colors.gold }}>{businessData.financialSummary.roi}%</p>
                      <p className='text-sm text-silver mt-2'>Return on Investment</p>
                      <p className='text-xs text-green-400 mt-1'>vs traditional reception</p>
                    </div>
                    <div className='text-center p-6 rounded-xl bg-white/5'>
                      <p className='text-4xl font-bold' style={{ color: colors.cyan }}>{formatCurrency(businessData.financialSummary.averagePerCall)}</p>
                      <p className='text-sm text-silver mt-2'>Cost Per Call</p>
                      <p className='text-xs text-green-400 mt-1'>60% cheaper than human</p>
                    </div>
                  </div>
                  <div className='mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30'>
                    <div className='flex items-center gap-3'>
                      <TrendingUp className='w-6 h-6 text-green-400' />
                      <div>
                        <p className='text-white font-medium'>Projected Annual Savings</p>
                        <p className='text-2xl font-bold text-green-400'>{formatCurrency(businessData.metrics.yearlyRevenue * 3)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALLS SECTION */}
          {activeSection === 'calls' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>Call History</h3>
                  <p className='text-silver'>Monitor all interactions with your AI receptionist</p>
                </div>
                <button className='px-4 py-2 rounded-xl bg-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/20 transition-colors'>
                  <Download className='w-4 h-4' />
                  Export CSV
                </button>
              </div>

              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'>
                <div className='p-4 border-b border-white/10 flex items-center gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver' />
                    <input
                      type='text'
                      placeholder='Search calls...'
                      className='w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50'
                    />
                  </div>
                  <button className='px-4 py-3 rounded-xl bg-white/5 text-sm font-medium flex items-center gap-2 hover:bg-white/10'>
                    <Filter className='w-4 h-4' />
                    Filter
                  </button>
                </div>

                <div className='divide-y divide-white/5'>
                  {businessData.recentCalls.map((call) => (
                    <div key={call.id} className='flex items-center gap-4 p-4 hover:bg-white/5 transition-colors'>
                      <div className={clsx(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        call.type === 'inbound' ? 'bg-cyan-500/20' : call.type === 'outbound' ? 'bg-purple-500/20' : 'bg-red-500/20'
                      )}>
                        {call.type === 'inbound' ? <PhoneIncoming className='w-5 h-5 text-cyan-400' /> :
                         call.type === 'outbound' ? <PhoneOutgoing className='w-5 h-5 text-purple-400' /> :
                         <Phone className='w-5 h-5 text-red-400' />}
                      </div>
                      <div className='flex-1'>
                        <p className='text-white font-medium'>{call.from}</p>
                        <p className='text-sm text-silver'>{call.status === 'completed' ? `${call.duration}s duration` : 'Missed call'}</p>
                      </div>
                      <div className='text-right'>
                        <span className={clsx(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          call.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        )}>
                          {call.status}
                        </span>
                        <p className='text-xs text-silver mt-1'>{call.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='p-4 border-t border-white/10 flex items-center justify-between'>
                  <p className='text-sm text-silver'>Showing 1-{businessData.recentCalls.length} of 2,847 calls</p>
                  <div className='flex items-center gap-2'>
                    <button className='p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50' disabled>
                      <ChevronLeft className='w-5 h-5' />
                    </button>
                    <span className='px-4 py-2 rounded-lg bg-gold/20 text-gold'>1</span>
                    <button className='p-2 rounded-lg bg-white/5 hover:bg-white/10'>2</button>
                    <button className='p-2 rounded-lg bg-white/5 hover:bg-white/10'>
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL SECTION */}
          {activeSection === 'financial' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-2xl font-bold text-white'>Financial Dashboard</h3>
                <p className='text-silver'>Track your revenue and business value</p>
              </div>

              {/* Financial Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-gradient-to-br from-gold/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-gold/30 p-6'>
                  <p className='text-sm text-silver mb-1'>This Month</p>
                  <p className='text-3xl font-bold' style={{ color: colors.gold }}>{formatCurrency(businessData.financialSummary.monthToDate)}</p>
                </div>
                <div className='bg-gradient-to-br from-cyan/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-cyan/30 p-6'>
                  <p className='text-sm text-silver mb-1'>Last Month</p>
                  <p className='text-3xl font-bold text-white'>{formatCurrency(businessData.financialSummary.lastMonth)}</p>
                </div>
                <div className='bg-gradient-to-br from-green/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-green/30 p-6'>
                  <p className='text-sm text-silver mb-1'>Projected</p>
                  <p className='text-3xl font-bold text-green'>{formatCurrency(businessData.financialSummary.projectedMonth)}</p>
                </div>
                <div className='bg-gradient-to-br from-purple/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-purple/30 p-6'>
                  <p className='text-sm text-silver mb-1'>Yearly Total</p>
                  <p className='text-3xl font-bold text-purple'>{formatCurrency(businessData.financialSummary.yearlyTotal)}</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-6'>Revenue by Service</h3>
                  <div className='space-y-6'>
                    {serviceRevenue.map((item, i) => (
                      <div key={item.service}>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-white font-medium'>{item.service}</span>
                          <span className='text-xl font-bold' style={{ color: item.color }}>{formatCurrency(item.amount)}</span>
                        </div>
                        <div className='h-3 bg-white/10 rounded-full overflow-hidden'>
                          <motion.div
                            className='h-full rounded-full'
                            style={{ background: item.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-6'>Growth Metrics</h3>
                  <div className='space-y-6'>
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <div className='flex items-center gap-3'>
                        <TrendingUp className='w-6 h-6 text-green' />
                        <span className='text-white'>Monthly Growth</span>
                      </div>
                      <span className='text-2xl font-bold text-green'>+12.5%</span>
                    </div>
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <div className='flex items-center gap-3'>
                        <Users className='w-6 h-6 text-cyan' />
                        <span className='text-white'>New Customers</span>
                      </div>
                      <span className='text-2xl font-bold text-cyan'>+23</span>
                    </div>
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <div className='flex items-center gap-3'>
                        <PhoneCall className='w-6 h-6 text-gold' />
                        <span className='text-white'>Call Resolution</span>
                      </div>
                      <span className='text-2xl font-bold text-gold'>99.2%</span>
                    </div>
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <div className='flex items-center gap-3'>
                        <DollarSign className='w-6 h-6 text-purple' />
                        <span className='text-white'>Avg Transaction</span>
                      </div>
                      <span className='text-2xl font-bold text-purple'>{formatCurrency(24.50)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice/Receipt Section */}
              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-bold text-white'>Billing & Invoices</h3>
                  <button className='px-4 py-2 rounded-xl bg-gold/20 text-gold text-sm font-medium flex items-center gap-2 hover:bg-gold/30'>
                    <Download className='w-4 h-4' />
                    Download Invoice
                  </button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='p-4 rounded-xl bg-white/5'>
                    <p className='text-sm text-silver'>Current Period</p>
                    <p className='text-lg font-bold text-white'>Apr 1 - Apr 30, 2026</p>
                  </div>
                  <div className='p-4 rounded-xl bg-white/5'>
                    <p className='text-sm text-silver'>Amount Due</p>
                    <p className='text-lg font-bold' style={{ color: colors.gold }}>{formatCurrency(947.50)}</p>
                  </div>
                  <div className='p-4 rounded-xl bg-white/5'>
                    <p className='text-sm text-silver'>Next Billing</p>
                    <p className='text-lg font-bold text-white'>May 1, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI AGENTS SECTION */}
          {activeSection === 'ai-agents' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>AI Agents</h3>
                  <p className='text-silver'>Monitor and manage your AI workforce</p>
                </div>
                <button className='px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold flex items-center gap-2 hover:scale-105 transition-transform'>
                  <Plus className='w-5 h-5' />
                  Add Agent
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {businessData.aiAgents.map((agent) => (
                  <motion.div
                    key={agent.name}
                    className='relative group'
                    whileHover={{ y: -5 }}
                  >
                    <div className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity' style={{ background: `linear-gradient(135deg, ${colors.cyan}30, ${colors.gold}30)` }} />
                    <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                      <div className='flex items-center gap-4 mb-6'>
                        <div className='w-16 h-16 rounded-2xl flex items-center justify-center text-3xl' style={{ background: `${colors.cyan}20` }}>
                          🤖
                        </div>
                        <div>
                          <h4 className='text-xl font-bold text-white'>{agent.name}</h4>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className={clsx(
                              'w-2 h-2 rounded-full',
                              agent.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                            )} />
                            <span className='text-sm text-silver capitalize'>{agent.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <span className='text-silver'>Interactions</span>
                          <span className='text-white font-medium'>{agent.interactions.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-silver'>Satisfaction</span>
                          <span className='text-white font-medium' style={{ color: colors.green }}>{agent.satisfaction}%</span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-silver'>Avg Response</span>
                          <span className='text-white font-medium'>0.8s</span>
                        </div>
                      </div>

                      <div className='mt-6 flex gap-2'>
                        <button className='flex-1 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors'>
                          Configure
                        </button>
                        <button className='flex-1 py-2 rounded-lg bg-cyan/20 text-sm text-cyan hover:bg-cyan/30 transition-colors'>
                          View Stats
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Agent Performance</h3>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  {[
                    { label: 'Total Interactions', value: '48,293', change: '+15%' },
                    { label: 'Avg Satisfaction', value: '94.7%', change: '+2%' },
                    { label: 'Escalation Rate', value: '3.2%', change: '-0.5%' },
                    { label: 'Resolution Time', value: '1.4s', change: '-12%' },
                  ].map((metric) => (
                    <div key={metric.label} className='p-4 rounded-xl bg-white/5 text-center'>
                      <p className='text-2xl font-bold text-white mb-1'>{metric.value}</p>
                      <p className='text-sm text-silver mb-2'>{metric.label}</p>
                      <span className='text-xs text-green-400 font-medium'>{metric.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LEADS SECTION */}
          {activeSection === 'leads' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>Lead Management</h3>
                  <p className='text-silver'>Track and convert business leads</p>
                </div>
                <button className='px-4 py-2 rounded-xl bg-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/20'>
                  <Download className='w-4 h-4' />
                  Export Leads
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center'>
                  <p className='text-4xl font-bold' style={{ color: colors.cyan }}>{businessData.metrics.totalLeads}</p>
                  <p className='text-sm text-silver mt-2'>Total Leads</p>
                </div>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center'>
                  <p className='text-4xl font-bold' style={{ color: colors.gold }}>{businessData.metrics.convertedLeads}</p>
                  <p className='text-sm text-silver mt-2'>Converted</p>
                </div>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center'>
                  <p className='text-4xl font-bold' style={{ color: colors.green }}>{businessData.metrics.conversionRate}%</p>
                  <p className='text-sm text-silver mt-2'>Conversion Rate</p>
                </div>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center'>
                  <p className='text-4xl font-bold' style={{ color: colors.purple }}>{formatCurrency(businessData.metrics.convertedLeads * 150)}</p>
                  <p className='text-sm text-silver mt-2'>Lead Value</p>
                </div>
              </div>

              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'>
                <div className='p-4 border-b border-white/10'>
                  <h3 className='text-lg font-bold text-white'>Recent Leads</h3>
                </div>
                <div className='divide-y divide-white/5'>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex items-center gap-4 p-4 hover:bg-white/5 transition-colors'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center'>
                        👤
                      </div>
                      <div className='flex-1'>
                        <p className='text-white font-medium'>Lead {i + 1}</p>
                        <p className='text-sm text-silver'>lead{i + 1}@company.com</p>
                      </div>
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        i < 2 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      )}>
                        {i < 2 ? 'Converted' : 'Pending'}
                      </span>
                      <span className='text-sm text-silver'>{i + 1}h ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-2xl font-bold text-white'>Account Settings</h3>
                <p className='text-silver'>Manage your business preferences</p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Business Information</h3>
                  <div className='space-y-4'>
                    {[
                      { label: 'Business Name', value: businessData.businessName },
                      { label: 'Industry', value: businessData.industry },
                      { label: 'Plan', value: businessData.plan },
                      { label: 'Contact Email', value: 'contact@acmecorp.com' },
                    ].map((item) => (
                      <div key={item.label} className='flex items-center justify-between py-3 border-b border-white/5'>
                        <span className='text-silver'>{item.label}</span>
                        <div className='flex items-center gap-2'>
                          <span className='text-white'>{item.value}</span>
                          <Edit3 className='w-4 h-4 text-silver cursor-pointer hover:text-white' />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Notifications</h3>
                  <div className='space-y-4'>
                    {[
                      { label: 'Email Notifications', enabled: true },
                      { label: 'SMS Alerts', enabled: true },
                      { label: 'Weekly Reports', enabled: false },
                      { label: 'Daily Summary', enabled: true },
                    ].map((setting) => (
                      <div key={setting.label} className='flex items-center justify-between py-3 border-b border-white/5'>
                        <span className='text-silver'>{setting.label}</span>
                        <button className={clsx(
                          'w-12 h-6 rounded-full transition-colors relative',
                          setting.enabled ? 'bg-gold' : 'bg-slate'
                        )}>
                          <span className={clsx(
                            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                            setting.enabled ? 'left-7' : 'left-1'
                          )} />
                        </button>
                      </div>
                    ))}
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