'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BotIcon, PhoneIcon, UsersIcon, DollarIcon, TrendingUpIcon, 
  SettingsIcon, LogoutIcon, ChevronRightIcon, ActivityIcon,
  GlobeIcon, ShieldIcon, ZapIcon, CreditCardIcon, BuildIcon,
  FileTextIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon,
  BarChartIcon, DatabaseIcon, CloudIcon, KeyIcon, SearchIcon,
  PlusIcon, MinusIcon, EyeIcon, EditIcon, TrashIcon, PlugIcon
} from 'lucide-react'
import OwnerAppConnectors from '@/components/OwnerAppConnectors'
import AIPlatformConfig from '@/components/AIPlatformConfig'
import LegalServicesManagement from '@/components/LegalServicesManagement'

// ─── Types ───────────────────────────────────────────────────────────────────
interface PlatformStats {
  totalCustomers: number
  activeCustomers: number
  totalCalls: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  growthRate: number
}

interface Customer {
  id: string
  businessName: string
  email: string
  plan: string
  status: 'active' | 'trial' | 'suspended'
  totalCalls: number
  revenue: number
  joinedDate: string
  lastActive: string
}

interface Transaction {
  id: string
  customerId: string
  customerName: string
  amount: number
  type: 'subscription' | 'one-time' | 'refund' | 'charge'
  status: 'completed' | 'pending' | 'failed'
  date: string
}

interface CallRecord {
  id: string
  customerId: string
  customerName: string
  phoneNumber: string
  duration: number
  status: 'completed' | 'missed' | 'voicemail'
  timestamp: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_STATS: PlatformStats = {
  totalCustomers: 127,
  activeCustomers: 98,
  totalCalls: 45892,
  totalRevenue: 1245890,
  monthlyRecurringRevenue: 87450,
  growthRate: 23.5,
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cus_001', businessName: 'BrightSmile Dental', email: 'admin@brightsmile.com', plan: 'pro', status: 'active', totalCalls: 1247, revenue: 45890, joinedDate: '2025-08-15', lastActive: '2026-05-30' },
  { id: 'cus_002', businessName: 'Rodriguez & Associates', email: 'mike@rodriguezlaw.com', plan: 'growth', status: 'active', totalCalls: 892, revenue: 28450, joinedDate: '2025-10-22', lastActive: '2026-05-29' },
  { id: 'cus_003', businessName: 'Park Realty Group', email: 'lisa@parkrealty.com', plan: 'growth', status: 'active', totalCalls: 654, revenue: 21340, joinedDate: '2025-11-03', lastActive: '2026-05-28' },
  { id: 'cus_004', businessName: 'Wilson HVAC Services', email: 'james@wilsonhvac.com', plan: 'starter', status: 'trial', totalCalls: 89, revenue: 0, joinedDate: '2026-04-15', lastActive: '2026-05-27' },
  { id: 'cus_005', businessName: 'Elite MedSpa', email: 'sophia@elitemedspa.com', plan: 'pro', status: 'active', totalCalls: 2156, revenue: 67890, joinedDate: '2025-07-08', lastActive: '2026-05-31' },
  { id: 'cus_006', businessName: 'Harrison Auto Group', email: 'tom@harrisonauto.com', plan: 'growth', status: 'active', totalCalls: 432, revenue: 15670, joinedDate: '2025-12-19', lastActive: '2026-05-26' },
  { id: 'cus_007', businessName: 'Kim Insurance Agency', email: 'david@kiminsurance.com', plan: 'starter', status: 'suspended', totalCalls: 156, revenue: 4990, joinedDate: '2025-09-28', lastActive: '2026-04-15' },
  { id: 'cus_008', businessName: 'Global Medical Center', email: 'contact@globalmed.com', plan: 'pro', status: 'active', totalCalls: 3421, revenue: 124500, joinedDate: '2025-06-12', lastActive: '2026-05-31' },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn_001', customerId: 'cus_005', customerName: 'Elite MedSpa', amount: 299, type: 'subscription', status: 'completed', date: '2026-06-01' },
  { id: 'txn_002', customerId: 'cus_001', customerName: 'BrightSmile Dental', amount: 299, type: 'subscription', status: 'completed', date: '2026-06-01' },
  { id: 'txn_003', customerId: 'cus_008', customerName: 'Global Medical Center', amount: 1500, type: 'charge', status: 'completed', date: '2026-05-30' },
  { id: 'txn_004', customerId: 'cus_004', customerName: 'Wilson HVAC Services', amount: -99, type: 'refund', status: 'completed', date: '2026-05-28' },
  { id: 'txn_005', customerId: 'cus_002', customerName: 'Rodriguez & Associates', amount: 149, type: 'subscription', status: 'completed', date: '2026-05-27' },
]

const MOCK_CALLS: CallRecord[] = [
  { id: 'call_001', customerId: 'cus_001', customerName: 'BrightSmile Dental', phoneNumber: '+13465214387', duration: 245, status: 'completed', timestamp: '2026-06-02 09:15:23' },
  { id: 'call_002', customerId: 'cus_005', customerName: 'Elite MedSpa', phoneNumber: '+16783466284', duration: 0, status: 'missed', timestamp: '2026-06-02 08:47:11' },
  { id: 'call_003', customerId: 'cus_008', customerName: 'Global Medical Center', phoneNumber: '+13475558901', duration: 180, status: 'completed', timestamp: '2026-06-02 08:32:05' },
  { id: 'call_004', customerId: 'cus_003', customerName: 'Park Realty Group', phoneNumber: '+12145557892', duration: 0, status: 'voicemail', timestamp: '2026-06-02 07:58:44' },
]

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtext, color, trend }: any) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
    </div>
  )
}

// ─── Customer Row ────────────────────────────────────────────────────────────
function CustomerRow({ customer, onView, onEdit, onSuspend }: { customer: Customer; onView: () => void; onEdit: () => void; onSuspend: () => void }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center text-aurora-cyan text-sm font-bold">
            {customer.businessName.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{customer.businessName}</p>
            <p className="text-xs text-gray-500">{customer.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          customer.status === 'active' ? 'bg-green-500/10 text-green-400' :
          customer.status === 'trial' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {customer.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-300 capitalize">{customer.plan}</span>
      </td>
      <td className="px-4 py-4 text-sm text-gray-300">{customer.totalCalls.toLocaleString()}</td>
      <td className="px-4 py-4 text-sm font-medium text-green-400">${customer.revenue.toLocaleString()}</td>
      <td className="px-4 py-4 text-sm text-gray-500">{new Date(customer.lastActive).toLocaleDateString()}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button onClick={onView} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="View">
            <EyeIcon size={16} />
          </button>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Edit">
            <EditIcon size={16} />
          </button>
          <button onClick={onSuspend} className={`p-2 rounded-lg hover:bg-white/10 transition-all ${customer.status === 'suspended' ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`} title={customer.status === 'suspended' ? 'Activate' : 'Suspend'}>
            {customer.status === 'suspended' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Transaction Row ─────────────────────────────────────────────────────────
function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-sm text-white">{transaction.customerName}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          transaction.type === 'subscription' ? 'bg-aurora-cyan/10 text-aurora-cyan' :
          transaction.type === 'charge' ? 'bg-yellow-500/10 text-yellow-400' :
          transaction.type === 'refund' ? 'bg-red-500/10 text-red-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>
          {transaction.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}>
          {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          transaction.status === 'completed' ? 'bg-green-500/10 text-green-400' :
          transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {transaction.status}
        </span>
      </td>
    </tr>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<PlatformStats>(MOCK_STATS)
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [calls, setCalls] = useState<CallRecord[]>(MOCK_CALLS)
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'financial' | 'calls' | 'settings' | 'ai'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  // Verify owner session on mount
  useEffect(() => {
    verifyOwnerSession()
  }, [])

  const verifyOwnerSession = async () => {
    try {
      const res = await fetch('/api/owner/login')
      const data = await res.json()
      
      if (!res.ok || !data.authenticated) {
        router.push('/owner/login')
      } else if (data.platformStats) {
        setStats(data.platformStats)
      }
    } catch (error) {
      console.error('Session verification failed:', error)
      router.push('/owner/login')
    }
  }

  const handleLogout = () => {
    document.cookie = 'owner_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/owner/login')
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  
  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-deep-space text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/[0.02] border-r border-white/10 flex flex-col transition-all duration-300 fixed h-full z-10`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <BotIcon className="text-black" size={24} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white">GlobalVoice</h1>
                <p className="text-xs text-yellow-400">Owner Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: BarChartIcon, label: 'Overview' },
            { id: 'customers', icon: UsersIcon, label: 'Customers' },
            { id: 'financial', icon: DollarIcon, label: 'Financial' },
            { id: 'calls', icon: PhoneIcon, label: 'Calls' },
            { id: 'connectors', icon: PlugIcon, label: 'Connectors' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
            { id: 'ai', icon: BotIcon, label: 'AI Engine' },
            { id: 'legal', icon: ShieldIcon, label: 'Legal Services' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <GlobeIcon size={20} />
            {sidebarOpen && <span className="text-sm">View Site</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogoutIcon size={20} />
            {sidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-deep-space border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <ChevronRightIcon size={14} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-deep-space/95 backdrop-blur-md border-b border-white/10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Owner Dashboard</h1>
              <p className="text-sm text-gray-500">Full platform control & analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 w-64"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400 font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={UsersIcon} label="Total Customers" value={stats.totalCustomers} subtext={`${stats.activeCustomers} active`} color="bg-aurora-cyan/10 text-aurora-cyan" trend={12.5} />
                <StatCard icon={PhoneIcon} label="Total Calls" value={stats.totalCalls.toLocaleString()} subtext="All time" color="bg-purple-500/10 text-purple-400" trend={18.2} />
                <StatCard icon={DollarIcon} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} subtext="Lifetime" color="bg-green-500/10 text-green-400" trend={23.5} />
                <StatCard icon={TrendingUpIcon} label="Monthly Revenue" value={formatCurrency(stats.monthlyRecurringRevenue)} subtext="Recurring MRR" color="bg-yellow-500/10 text-yellow-400" trend={8.1} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/customer/signup" className="p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-yellow-400/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-4 group-hover:bg-yellow-400/20 transition-all">
                    <PlusIcon size={24} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Add New Customer</h3>
                  <p className="text-sm text-gray-500">Create a new customer account</p>
                </Link>
                <Link href="/test-call" className="p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-aurora-cyan/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan mb-4 group-hover:bg-aurora-cyan/20 transition-all">
                    <ZapIcon size={24} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Test Platform</h3>
                  <p className="text-sm text-gray-500">Test AI calling functionality</p>
                </Link>
                <Link href="/services" className="p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-500/20 transition-all">
                    <SettingsIcon size={24} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Platform Settings</h3>
                  <p className="text-sm text-gray-500">Configure global settings</p>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Calls */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Recent Calls</h3>
                    <button onClick={() => setActiveTab('calls')} className="text-xs text-aurora-cyan hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {calls.slice(0, 4).map(call => (
                      <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            call.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            call.status === 'missed' ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {call.status === 'completed' ? <CheckCircleIcon size={16} /> :
                             call.status === 'missed' ? <AlertCircleIcon size={16} /> :
                             <ClockIcon size={16} />}
                          </div>
                          <div>
                            <p className="text-sm text-white">{call.customerName}</p>
                            <p className="text-xs text-gray-500">{call.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{call.duration > 0 ? `${call.duration}s` : '--'}</p>
                          <p className="text-xs text-gray-600">{new Date(call.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Recent Transactions</h3>
                    <button onClick={() => setActiveTab('financial')} className="text-xs text-aurora-cyan hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {transactions.slice(0, 4).map(txn => (
                      <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            txn.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            <CreditCardIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm text-white">{txn.customerName}</p>
                            <p className="text-xs text-gray-500 capitalize">{txn.type}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">All Customers</h2>
                  <p className="text-sm text-gray-500">{filteredCustomers.length} total</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowAddCustomer(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-medium text-sm hover:bg-yellow-500 transition-all"
                  >
                    <PlusIcon size={18} />
                    Add Customer
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(customer => (
                      <CustomerRow
                        key={customer.id}
                        customer={customer}
                        onView={() => console.log('View', customer.id)}
                        onEdit={() => console.log('Edit', customer.id)}
                        onSuspend={() => {
                          setCustomers(prev => prev.map(c => 
                            c.id === customer.id 
                              ? { ...c, status: c.status === 'suspended' ? 'active' : 'suspended' }
                              : c
                          ))
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Financial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={DollarIcon} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="bg-green-500/10 text-green-400" trend={23.5} />
                <StatCard icon={TrendingUpIcon} label="Monthly Recurring" value={formatCurrency(stats.monthlyRecurringRevenue)} color="bg-aurora-cyan/10 text-aurora-cyan" trend={8.1} />
                <StatCard icon={CreditCardIcon} label="Avg Revenue/Customer" value={formatCurrency(Math.round(stats.totalRevenue / stats.totalCustomers))} color="bg-yellow-500/10 text-yellow-400" trend={12.3} />
                <StatCard icon={ActivityIcon} label="Collection Rate" value="94.2%" color="bg-purple-500/10 text-purple-400" trend={2.1} />
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="font-semibold text-white mb-4">Revenue Over Time</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUpIcon size={48} className="mx-auto mb-3 text-aurora-cyan/50" />
                    <p className="text-lg font-medium text-white">$1,245,890</p>
                    <p className="text-sm text-green-400">↑ 23.5% from last period</p>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white">Recent Transactions</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <TransactionRow key={txn.id} transaction={txn} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Calls Tab */}
          {activeTab === 'calls' && (
            <div className="space-y-6">
              {/* Call Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={PhoneIcon} label="Total Calls" value={stats.totalCalls.toLocaleString()} color="bg-aurora-cyan/10 text-aurora-cyan" trend={18.2} />
                <StatCard icon={CheckCircleIcon} label="Completed" value="38,452" color="bg-green-500/10 text-green-400" trend={22.1} />
                <StatCard icon={AlertCircleIcon} label="Missed" value="4,892" color="bg-red-500/10 text-red-400" trend={-5.3} />
                <StatCard icon={ClockIcon} label="Avg Duration" value="2m 34s" color="bg-yellow-500/10 text-yellow-400" trend={8.7} />
              </div>

              {/* All Calls Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white">All Calls</h3>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-cyan/10 text-aurora-cyan text-sm hover:bg-aurora-cyan/20 transition-all">
                    <FileTextIcon size={16} />
                    Export CSV
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map(call => (
                      <tr key={call.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-400">{new Date(call.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-white">{call.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">{call.phoneNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{call.duration > 0 ? `${call.duration}s` : '--'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            call.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            call.status === 'missed' ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {call.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Connectors Tab */}
          {activeTab === 'connectors' && (
            <OwnerAppConnectors />
          )}

          {/* AI Engine Tab */}
          {activeTab === 'ai' && (
            <AIPlatformConfig />
          )}

          {/* Legal Services Tab */}
          {activeTab === 'legal' && (
            <LegalServicesManagement />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Platform Settings</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Configuration */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
                      <KeyIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">API Configuration</h3>
                      <p className="text-xs text-gray-500">Manage API keys and integrations</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Bland AI API</span>
                      <span className="text-xs text-green-400">● Connected</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Stripe Payment</span>
                      <span className="text-xs text-green-400">● Connected</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Supabase Database</span>
                      <span className="text-xs text-green-400">● Connected</span>
                    </div>
                  </div>
                </div>

                {/* Voice Configuration */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <BuildIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Voice Settings</h3>
                      <p className="text-xs text-gray-500">Configure AI voice defaults</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Default Voice</span>
                      <span className="text-xs text-white">Natural (Sage)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Max Call Duration</span>
                      <span className="text-xs text-white">10 minutes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Recording Enabled</span>
                      <span className="text-xs text-green-400">● Yes</span>
                    </div>
                  </div>
                </div>

                {/* Platform Configuration */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                      <DatabaseIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Platform Config</h3>
                      <p className="text-xs text-gray-500">Global platform settings</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Platform Name</span>
                      <span className="text-xs text-white">GlobalVoice AI</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Maintenance Mode</span>
                      <span className="text-xs text-red-400">● Off</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Debug Mode</span>
                      <span className="text-xs text-yellow-400">● Off</span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                      <CloudIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">System Status</h3>
                      <p className="text-xs text-gray-500">Infrastructure health</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">API Server</span>
                      <span className="text-xs text-green-400">● Healthy</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Database</span>
                      <span className="text-xs text-green-400">● Healthy</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-gray-400">Voice API</span>
                      <span className="text-xs text-green-400">● Healthy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02]">
                    <div>
                      <p className="text-white font-medium">Reset Platform Data</p>
                      <p className="text-xs text-gray-500">Remove all customer data and reset to defaults</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
                      Reset Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowAddCustomer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-deep-space/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/[0.06] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
              <form className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Business Name</label>
                  <input type="text" placeholder="Enter business name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Email</label>
                  <input type="email" placeholder="Enter email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Plan</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400/50">
                    <option value="starter">Starter - $99/mo</option>
                    <option value="growth">Growth - $149/mo</option>
                    <option value="pro">Pro - $299/mo</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddCustomer(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-all">
                    Create Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}