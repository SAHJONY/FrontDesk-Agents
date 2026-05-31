'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3, DollarSign, Activity, Phone, Zap, CheckCircle2,
  ArrowUp, ArrowDown, AlertTriangle, CheckCircle,
  RefreshCw, Loader2, Award, Star, TrendingUp, Users, Clock,
  Building2, Download, Receipt, Globe
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────

interface Business {
  id: string
  name: string
  industry: string | null
}

interface BusinessHealth {
  score: number
  status: string
  satisfactionScore: number
  supportTicketsOpen: number
  daysSinceLastCall: number
  callVolumeTrend: 'increasing' | 'stable' | 'decreasing'
  onboardingCompleted: boolean
  daysSinceOnboarding: number
  upsellPotential: 'high' | 'medium' | 'low'
  recommendedActions: string[]
}

interface WeeklyBucket {
  label: string
  total: number
}

interface CallAnalytics {
  totalCalls4Weeks: number
  weeklyBuckets: WeeklyBucket[]
  maxWeeklyCalls: number
}

interface LeadInfo {
  score: number
  tier: string
  qualified: boolean
  conversionProbability: number
  recommendedAction: string
  scoreBreakdown?: Record<string, number>
}

interface DashboardData {
  business: { id: string; name: string; email: string; plan: string; mrr: number; industry: string | null }
  health: BusinessHealth
  callAnalytics: CallAnalytics
  lead: LeadInfo | null
  platformMetrics: { mrr: number; churnRate: number; cac: number; ltv: number; totalCustomers: number }
  availableBusinesses: { id: string; name: string; industry: string }[]
  allCustomers: { id: string; name: string; status: string; healthScore: number }[]
}

// ─── Helpers ────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'This week'
  if (diffDays < 7) return 'Last week'
  if (diffDays < 14) return '2 weeks ago'
  if (diffDays < 21) return '3 weeks ago'
  return `${Math.floor(diffDays / 7)} weeks ago`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    case 'at_risk': return 'text-cinematic-red bg-cinematic-red/10 border-cinematic-red/30 animate-glow'
    case 'churned': return 'text-gray-500 bg-gray-500/10 border-gray-500/30'
    default: return 'text-aurora-cyan bg-yellow-500/10 border-yellow-500/30'
  }
}

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-aurora-cyan'
  return 'text-cinematic-red'
}

const getHealthBarColor = (score: number) => {
  if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-400'
  if (score >= 60) return 'bg-gradient-to-r from-amber-500 to-amber-400'
  return 'bg-gradient-to-r from-cinematic-red to-rose-400'
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'hot': return 'text-cinematic-red bg-cinematic-red/10 border-cinematic-red/30 animate-glow'
    case 'warm': return 'text-aurora-cyan bg-yellow-500/10 border-yellow-500/30'
    case 'cold': return 'text-aurora-cyan bg-blue-500/10 border-aurora-cyan/30'
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }
}

import { downloadMergedCSV } from '@/lib/export-utils'
import { useToast } from '@/components/ToastProvider'


// ─── Platform Data ───────────────────────────────────────────────

const platformServices = [
  { name: 'Twilio Integration', status: 'Operational', color: 'bg-emerald-500' },
  { name: 'OpenAI API', status: 'Operational', color: 'bg-emerald-500' },
  { name: 'Supabase Database', status: 'Operational', color: 'bg-emerald-500' },
  { name: 'Bland AI Voice', status: 'Operational', color: 'bg-emerald-500' },
  { name: 'Stripe Payments', status: 'Operational', color: 'bg-emerald-500' },
  { name: 'Square POS', status: 'Operational', color: 'bg-emerald-500' },
  { name: 'LiveKit Media', status: 'Degraded Performance', color: 'bg-yellow-500 animate-pulse' },
  { name: 'Lead Scoring Engine', status: 'Operational', color: 'bg-emerald-500' },
]

const industries = [
  { id: 'legal', name: 'Legal Services', icon: '⚖️', users: 234, revenue: '$12,400' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', users: 189, revenue: '$9,800' },
  { id: 'realestate', name: 'Real Estate', icon: '🏠', users: 412, revenue: '$15,600' },
  { id: 'finance', name: 'Financial Services', icon: '💰', users: 156, revenue: '$8,200' },
  { id: 'retail', name: 'Retail', icon: '🛍️', users: 298, revenue: '$11,900' },
  { id: 'hospitality', name: 'Hospitality', icon: '🏨', users: 167, revenue: '$7,500' },
]

const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
]

// ─── Component ──────────────────────────────────────────

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBusinessId, setSelectedBusinessId] = useState('cust-1')
  const [refreshing, setRefreshing] = useState(false)
  const { success, error: toastError } = useToast()

  const fetchData = useCallback(async (businessId: string, signal?: AbortSignal, showToast = false) => {
    try {
      setError(null)
      const res = await fetch(`/api/customer/dashboard?businessId=${businessId}`, { signal })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      if (!signal?.aborted) {
      setData(json)
      if (showToast) success('Dashboard refreshed', 'Data updated successfully')
    }
    } catch (err) {
      if (signal?.aborted) return
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(msg)
      if (showToast) toastError('Refresh failed', msg)
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetchData(selectedBusinessId, controller.signal)
    return () => controller.abort()
  }, [selectedBusinessId, fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData(selectedBusinessId, undefined, true)
  }

  const handleExportCSV = () => {
    const healthRow = {
      Business: business.name,
      Industry: business.industry || '',
      Plan: business.plan,
      MRR: business.mrr,
      HealthScore: health.score,
      Status: health.status,
      SatisfactionPct: health.satisfactionScore,
      SupportTickets: health.supportTicketsOpen,
      DaysSinceLastCall: health.daysSinceLastCall,
      CallVolumeTrend: health.callVolumeTrend,
      TotalCalls4Weeks: callAnalytics.totalCalls4Weeks,
      UpsellPotential: health.upsellPotential,
      OnboardingComplete: health.onboardingCompleted,
      LeadScore: lead?.score ?? 'N/A',
      LeadTier: lead?.tier ?? 'N/A',
      LeadQualified: lead?.qualified ?? 'N/A',
      ConversionProbability: lead?.conversionProbability ?? 'N/A',
    }

    const callRows = callAnalytics.weeklyBuckets.map(w => ({
      Week: w.label,
      Calls: w.total,
    }))

    const slug = business.name.replace(/\s+/g, '-').toLowerCase()
    try {
      downloadMergedCSV([
        { title: `${business.name} - Health Report`, rows: [healthRow] },
        { title: `${business.name} - Weekly Call Volume`, rows: callRows },
      ], `${slug}-report`)
      success('CSV Exported', `${business.name} report downloaded as ${slug}-report.csv`)
    } catch (err) {
      toastError('Export Failed', err instanceof Error ? err.message : 'Could not generate CSV')
    }
  }

  const handleBusinessChange = (id: string) => {
    setSelectedBusinessId(id)
  }

  // ─── Loading State ──────────────────────────────────

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-deep-space text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-aurora-cyan animate-spin mx-auto mb-4 drop-shadow-glow" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────

  if (error && !data) {
    return (
      <div className="min-h-screen bg-deep-space text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-cinematic-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchData(selectedBusinessId) }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { business, health, callAnalytics, lead, platformMetrics, availableBusinesses } = data
  const selectedBiz = availableBusinesses.find(b => b.id === selectedBusinessId)

  // ─── Render ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-space/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurora-cyan to-aurora-cyan/80 flex items-center justify-center">
                <span className="text-lg font-bold text-black">FA</span>
              </div>
              <span className="text-xl font-semibold">FRONTDESK AGENTS</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Download CSV Report"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <Link
                href="/customer/billing"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap"
                title="View Billing History"
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Billing</span>
              </Link>
              <div className="w-px h-5 bg-white/10" />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50"
                aria-label="Refresh dashboard data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-black hover:opacity-90 transition-opacity"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6" id="dashboard-content">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-aurora-cyan/40 to-white bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">{business.name}</h1>
                <p className="text-gray-400 mt-1">
                  {business.industry || 'Business'} · {business.plan.charAt(0).toUpperCase() + business.plan.slice(1)} Plan
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400">${business.mrr.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Monthly Recurring Revenue</p>
              </div>
            </div>
          </motion.div>

          {/* Business Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {availableBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleBusinessChange(biz.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedBusinessId === biz.id
                      ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/50 shadow-lg shadow-aurora-cyan/10 animate-glow'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{biz.name}</span>
                  <span className="text-xs opacity-60">{biz.industry}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-float" style={{ animationDelay: "0s" }}>
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <span className={`text-lg font-bold ${getHealthColor(health.score)}`}>
                  {health.score}/100
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getHealthBarColor(health.score)} animate-gradient-shift bg-[length:200%_auto]`}
                  style={{ width: `${health.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Health Score</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(health.status)}`}>
                  {health.status.replace('_', ' ')}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center animate-float" style={{ animationDelay: "0.15s" }}>
                  <Phone className="w-5 h-5 text-aurora-cyan" />
                </div>
                <span className="text-2xl font-bold">{callAnalytics.totalCalls4Weeks.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Calls (4 weeks)</p>
                {health.callVolumeTrend === 'increasing' && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" /> Rising
                  </span>
                )}
                {health.callVolumeTrend === 'decreasing' && (
                  <span className="text-xs text-cinematic-red flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" /> Declining
                  </span>
                )}
                {health.callVolumeTrend === 'stable' && (
                  <span className="text-xs text-gray-400">Stable</span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center animate-float" style={{ animationDelay: "0.3s" }}>
                  <Award className="w-5 h-5 text-aurora-cyan" />
                </div>
                <span className="text-2xl font-bold">{health.satisfactionScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Satisfaction</p>
                <span className="text-xs text-gray-500">
                  {health.supportTicketsOpen > 0 ? `${health.supportTicketsOpen} open tickets` : 'No tickets'}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center animate-float" style={{ animationDelay: "0.45s" }}>
                  <TrendingUp className="w-5 h-5 text-aurora-cyan" />
                </div>
                <span className={`text-lg font-bold ${
                  health.upsellPotential === 'high' ? 'text-emerald-400' :
                  health.upsellPotential === 'medium' ? 'text-aurora-cyan' : 'text-gray-400'
                }`}>
                  {health.upsellPotential.charAt(0).toUpperCase() + health.upsellPotential.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Upsell Potential</p>
                {lead && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getTierColor(lead.tier)}`}>
                    {lead.tier}
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Call Volume Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aurora-cyan" />
                Weekly Call Volume
              </h2>
              {callAnalytics.weeklyBuckets.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <p>No call data available</p>
                </div>
              ) : (
                <div className="flex items-end gap-3 h-48">
                  {callAnalytics.weeklyBuckets.slice(-8).map((week, i) => {
                    const height = (week.total / callAnalytics.maxWeeklyCalls) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs text-gray-500">{week.total}</span>
                        <div className="w-full rounded-lg overflow-hidden" style={{ height: '100%' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 4)}%` }}
                            transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                            className="w-full rounded-lg bg-gradient-to-t from-aurora-cyan/80 to-aurora-cyan drop-shadow-glow"
                          />
                        </div>
                        <span className="text-xs text-gray-500 truncate max-w-full text-center">
                          {formatDate(week.label)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Recommended Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-aurora-cyan" />
                Recommended Actions
              </h2>
              {health.recommendedActions.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <p>All clear — no actions needed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {health.recommendedActions.map((action, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/[0.07] transition-all duration-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-aurora-cyan mt-2 shrink-0 animate-pulse" />
                      <p className="text-sm text-gray-300">{action}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Lead Status & Platform Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Lead Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-aurora-cyan" />
                Lead Status
              </h2>
              {lead ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Score</span>
                    <span className="font-bold">{lead.score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tier</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full border ${getTierColor(lead.tier)}`}>
                      {lead.tier.charAt(0).toUpperCase() + lead.tier.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Qualified</span>
                    {lead.qualified ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="text-cinematic-red">No</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Conv. Probability</span>
                    <span className="font-bold text-aurora-cyan">{lead.conversionProbability}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Recommended Action</span>
                    <span className="text-sm text-gray-300">{lead.recommendedAction}</span>
                  </div>
                  {lead.scoreBreakdown && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-500 mb-3">Score Breakdown</p>
                      <div className="space-y-2">
                        {Object.entries(lead.scoreBreakdown).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                            </span>
                            <span className="text-sm font-medium">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <p>No lead data available</p>
                </div>
              )}
            </motion.div>

            {/* Platform Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
            >
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aurora-cyan" />
                Platform Metrics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center animate-float" style={{ animationDelay: "0.1s" }}>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">MRR</p>
                      <p className="text-xs text-gray-500">Platform-wide</p>
                    </div>
                  </div>
                  <span className="font-bold">${platformMetrics.mrr.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cinematic-red/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-cinematic-red" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Churn Rate</p>
                      <p className="text-xs text-gray-500">Monthly</p>
                    </div>
                  </div>
                  <span className="font-bold text-cinematic-red">{platformMetrics.churnRate}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aurora-cyan/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-aurora-cyan" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customer Acq. Cost</p>
                      <p className="text-xs text-gray-500">Average</p>
                    </div>
                  </div>
                  <span className="font-bold">${platformMetrics.cac.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aurora-cyan/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-aurora-cyan" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">LTV</p>
                      <p className="text-xs text-gray-500">Lifetime Value</p>
                    </div>
                  </div>
                  <span className="font-bold">${platformMetrics.ltv.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aurora-cyan/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-aurora-cyan" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Customers</p>
                      <p className="text-xs text-gray-500">Active accounts</p>
                    </div>
                  </div>
                  <span className="font-bold">{platformMetrics.totalCustomers}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Onboarding Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8"
          >
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-aurora-cyan" />
              Onboarding Status
            </h2>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                health.onboardingCompleted
                  ? 'bg-emerald-500/20'
                  : 'bg-aurora-cyan/20'
              }`}>
                {health.onboardingCompleted
                  ? <CheckCircle className="w-8 h-8 text-emerald-400" />
                  : <Clock className="w-8 h-8 text-aurora-cyan" />
                }
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {health.onboardingCompleted ? 'Onboarding Complete' : 'Onboarding In Progress'}
                </p>
                <p className="text-sm text-gray-400">
                  {health.onboardingCompleted
                    ? `Completed ${health.daysSinceOnboarding} days ago`
                    : `${health.daysSinceOnboarding} days since start`
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* All Customers Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
          >
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-aurora-cyan" />
              All Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.allCustomers.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    c.id === selectedBusinessId
                      ? 'bg-aurora-cyan/10 border-aurora-cyan/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Health Score</span>
                    <span className={`text-sm font-bold ${getHealthColor(c.healthScore)}`}>
                      {c.healthScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Platform Services Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
          >
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-aurora-cyan" />
              Platform Services Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformServices.map((service, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 flex items-center gap-3 hover:bg-white/[0.07] transition-all duration-200"
                >
                  <div className={`w-3 h-3 rounded-full ${service.color}`} />
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {service.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Industry Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
          >
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-aurora-cyan" />
              Industry Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry) => (
                <div
                  key={industry.id}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{industry.icon}</span>
                    <div>
                      <p className="font-medium">{industry.name}</p>
                      <p className="text-sm text-gray-500">{industry.users} users</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-emerald-500">{industry.revenue}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Language Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.01] transition-all duration-300"
          >
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-aurora-cyan" />
              Multi-Language Support (200+ Languages)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-200 text-center"
                >
                  <p className="text-3xl mb-2">{lang.flag}</p>
                  <p className="font-medium text-sm">{lang.native}</p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
