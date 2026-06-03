'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// ─── Icons ───────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const VoicemailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

// ─── Types ───────────────────────────────────────────────────────────────────
interface CallRecord {
  id: string
  phoneNumber: string
  direction: 'inbound' | 'outbound'
  duration: number
  status: 'completed' | 'missed' | 'voicemail'
  timestamp: string
  transcript?: string
}

interface CustomerCallAnalyticsProps {
  className?: string
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtext, color, trend }: any) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      {trend !== undefined && (
        <p className={`text-xs mt-2 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerCallAnalytics({ className = '' }: CustomerCallAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([
    { id: '1', phoneNumber: '+13465214387', direction: 'outbound', duration: 245, status: 'completed', timestamp: '2026-06-02 09:15:23' },
    { id: '2', phoneNumber: '+16783466284', direction: 'inbound', duration: 0, status: 'missed', timestamp: '2026-06-02 08:47:11' },
    { id: '3', phoneNumber: '+13475558901', direction: 'outbound', duration: 180, status: 'completed', timestamp: '2026-06-02 08:32:05' },
    { id: '4', phoneNumber: '+12145557892', direction: 'inbound', duration: 0, status: 'voicemail', timestamp: '2026-06-02 07:58:44' },
    { id: '5', phoneNumber: '+19876543210', direction: 'outbound', duration: 312, status: 'completed', timestamp: '2026-06-01 16:22:10' },
    { id: '6', phoneNumber: '+15551234567', direction: 'inbound', duration: 156, status: 'completed', timestamp: '2026-06-01 14:35:42' },
  ])

  // Mock analytics data
  const stats = {
    totalCalls: 1270,
    completedCalls: 1089,
    missedCalls: 127,
    voicemailRate: 4.2,
    avgDuration: 234,
    totalRevenue: 45890,
    profitGenerated: 12450,
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className={`bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUpIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Call Analytics</h3>
              <p className="text-xs text-gray-500">Track your AI performance</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-aurora-cyan/20 text-aurora-cyan'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={PhoneIcon}
            label="Total Calls"
            value={stats.totalCalls.toLocaleString()}
            color="bg-aurora-cyan/10 text-aurora-cyan"
            trend={18.2}
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Completed"
            value={stats.completedCalls.toLocaleString()}
            color="bg-green-500/10 text-green-400"
            trend={22.1}
          />
          <StatCard
            icon={DollarIcon}
            label="Profit Generated"
            value={formatCurrency(stats.profitGenerated)}
            color="bg-yellow-500/10 text-yellow-400"
            trend={15.3}
          />
          <StatCard
            icon={ClockIcon}
            label="Avg Duration"
            value={formatDuration(stats.avgDuration)}
            color="bg-purple-500/10 text-purple-400"
            trend={8.7}
          />
        </div>

        {/* Revenue Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue Generated</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Profit</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.profitGenerated)}</p>
              <p className="text-xs text-green-400">↑ 15.3% vs last month</p>
            </div>
          </div>
        </div>

        {/* Call Resolution */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Call Resolution Rate</span>
              <span className="text-sm text-white font-medium">{((stats.completedCalls / stats.totalCalls) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-aurora-cyan rounded-full transition-all"
                style={{ width: `${(stats.completedCalls / stats.totalCalls) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-white">{stats.missedCalls}</div>
            <div className="text-xs text-gray-500">Missed</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.voicemailRate}%</div>
            <div className="text-xs text-gray-500">Voicemail</div>
          </div>
        </div>          {/* Recent Calls */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm text-gray-400 font-medium">Recent Calls</h4>
              <button 
                onClick={() => {
                  // Generate CSV from recentCalls data
                  const headers = ['ID', 'Phone Number', 'Direction', 'Duration (seconds)', 'Status', 'Timestamp']
                  const csvRows = [headers.join(',')]
                  recentCalls.forEach(call => {
                    csvRows.push([call.id, call.phoneNumber, call.direction, call.duration.toString(), call.status, call.timestamp].join(','))
                  })
                  const csvContent = csvRows.join('\n')
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                  const link = document.createElement('a')
                  link.href = URL.createObjectURL(blob)
                  link.download = `call-history-${new Date().toISOString().split('T')[0]}.csv`
                  link.click()
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white text-xs transition-all"
              >
                <DownloadIcon />
                Export CSV
              </button>
            </div>
          
          <div className="space-y-2">
            {recentCalls.map(call => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    call.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    call.status === 'missed' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {call.status === 'completed' ? <CheckCircleIcon /> :
                     call.status === 'missed' ? <XCircleIcon /> :
                     <VoicemailIcon />}
                  </div>
                  <div>
                    <p className="text-sm text-white font-mono">{call.phoneNumber}</p>
                    <p className="text-xs text-gray-500 capitalize">{call.direction} • {formatTime(call.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{formatDuration(call.duration)}</p>
                  <p className={`text-xs capitalize ${
                    call.status === 'completed' ? 'text-green-400' :
                    call.status === 'missed' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {call.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white text-sm transition-all">
            View All Calls →
          </button>
        </div>
      </div>
    </div>
  )
}