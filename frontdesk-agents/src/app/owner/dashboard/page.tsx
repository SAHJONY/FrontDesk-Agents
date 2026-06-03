'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, BarChart3, Building2, Languages, Settings, LogOut,
  Globe, TrendingUp, Users, DollarSign, Activity, Phone, Target,
  AlertTriangle, CheckCircle, Zap, Award, ArrowUp, ArrowDown,
  XCircle, ChevronRight, ChevronUp, ChevronDown, Star, Search, Filter,
  RefreshCw, Loader2, Mail, Receipt, Download, FileText, Clock, AlertCircle,
  Brain, Cpu, Shield, Radio, GitBranch, ArrowUpRight, Key, Eye, Bell, AlertOctagon,
} from 'lucide-react'
import HermesChat from './HermesChat'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Cell
} from 'recharts'
import { useToast } from "@/components/ToastProvider"
import { useTranslation } from '@/lib/useTranslation'
import type { BillingRecordWithCustomer } from "@/lib/supabase"
import SendInvoiceDialog from "@/components/SendInvoiceDialog"
import OwnerBillingContent from "@/components/OwnerBillingContent"

const LANGUAGES: Record<string, { name: string; nativeName: string; flag: string }> = {
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

interface DashboardData {
  metrics: {
    mrr: number
    arr: number
    churnRate: number
    ltv: number
    cac: number
    profitMargin: number
    revenueProjection: number
    paybackPeriod: number
    ltvCacRatio: number
    activeCustomers: number
    totalCustomers: number
    totalCosts: number
    evaluations: { metric: string; status: string; message: string }[]
  }
  sales: {
    pipeline: { stage: string; count: number; value: number }[]
    salesMetrics: {
      totalLeads: number
      hotLeads: number
      warmLeads: number
      coldLeads: number
      conversionRate: number
      averageScore: number
    }
    leadsByTier: { hot: number; warm: number; cold: number }
    leads: {
      id: string
      businessName: string
      email: string
      industry: string
      score: number
      tier: string
      recommendedAction: string
      createdAt: string
    }[]
  }
  health: {
    customers: {
      customerId: string
      businessName: string
      email: string
      plan: string
      mrr: number
      healthScore: number
      healthStatus: string
      daysSinceLastCall: number
      callVolumeTrend: 'growing' | 'stable' | 'declining'
      satisfactionScore: number
      supportTicketsOpen: number
      onboardingCompleted: boolean
      upsellPotential: 'high' | 'medium' | 'low'
      recommendedActions: string[]
      callHistory: { date: string; count: number }[]
    }[]
    healthyCount: number
    atRiskCount: number
    totalCustomers: number
    upsellOpportunities: { customerId: string; businessName: string; plan: string; mrr: number }[]
    reviewCandidates: { customerId: string; businessName: string; healthScore: number; daysSinceCall: number }[]
    healthChecks: { metric: string; status: string; message: string }[]
  }
  partners: {
    totalPartners: number
    activePartners: number
    totalReferrals: number
    convertedReferrals: number
    conversionRate: number
    totalCommission: number
    totalRevenueGenerated: number
  }
  projections: {
    nextMonth: number
    nextQuarter: number
    nextYear: number
    growthRate: number
  }
  charts: {
    revenueTrend: { month: string; revenue: number }[]
    churnHistory: { month: string; churnRate: number }[]
  }
}

const PIPELINE_STAGES = [
  { key: 'new', label: 'New Leads', color: 'bg-blue-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-cyan-500' },
  { key: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-pink-500' },
  { key: 'closed_won', label: 'Closed Won', color: 'bg-emerald-500' },
]

export default function OwnerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leadSearch, setLeadSearch] = useState('')
  const [leadFilter, setLeadFilter] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<DashboardData['health']['customers'][0] | null>(null)
  const [recentRecords, setRecentRecords] = useState<BillingRecordWithCustomer[]>([])
  const [recentInvoicesLoading, setRecentInvoicesLoading] = useState(false)
  const [sendingState, setSendingState] = useState<Record<string, { status: "idle" | "sending" }>>({})
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  // AI Agentic state
  const [aiOverview, setAiOverview] = useState<{
    decisions: Array<{
      id: string; timestamp: string; action: string; agent: string;
      context: string; result: string; reasoning: string;
      severity: 'critical' | 'high' | 'medium' | 'low'
      acknowledged: boolean; resolved: boolean; outcome?: string
    }>
    modelStatuses: Array<{
      provider: string; model: string; status: string; latencyMs: number;
      requestsPerMinute: number; healthScore: number; isPrimary: boolean;
      fallbackOf: string | null
    }>
    selfHealing: {
      overall: 'healthy' | 'degraded' | 'critical'
      anomaliesDetected: number; autoRemediated: number; pendingAlerts: number;
      uptimePercent: number; avgResponseTime: number;
      activeAlerts: Array<{
        id: string; type: string; severity: string; message: string;
        timestamp: string; acknowledged: boolean
      }>
    }
    metrics: {
      totalDecisions: number; autonomousActions: number; avgConfidence: number;
      activeAgents: number; modelSwitchEvents: number
    }
  } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [harnessRunning, setHarnessRunning] = useState(false)
  const [harnessStatus, setHarnessStatus] = useState<{
    running: boolean
    totalCycles: number
    successfulDeployments: number
    learningsStored: number
    lastCycle: string | null
    currentMetrics: {
      errorRate: number
      avgLatencyMs: number
      requestsPerSecond: number
      conversionRate: number
      churnRate: number
      customerSatisfaction: number
      activeCustomers: number
      totalCalls: number
      callSuccessRate: number
      mrr: number
      arr: number
      timestamp: string
    } | null
  } | null>(null)

  // Fetch harness status and wire it into HermesChat
  const fetchHarnessStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/harness/status')
      if (res.ok) {
        const json = await res.json()
        setHarnessRunning(json.running ?? false)
        setHarnessStatus({
          running: json.running ?? false,
          totalCycles: json.totalCycles ?? 0,
          successfulDeployments: json.successfulDeployments ?? 0,
          learningsStored: json.learningsStored ?? 0,
          lastCycle: json.lastCycle ?? null,
          currentMetrics: json.currentMetrics ?? null,
        })
      }
    } catch {
      // harness status is non-critical — leave current state intact
    }
  }, [])

  // AI Agentic data fetcher
  const fetchAIOverview = useCallback(async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/api/ai/decisions?limit=20')
      if (!res.ok) throw new Error(`AI API ${res.status}`)
      const json = await res.json()
      setAiOverview(json)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to load AI data')
    } finally { setAiLoading(false) }
  }, [])

  // Auth guard - check session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/owner/session')
        const json = await res.json()
        if (!json.authenticated) {
          router.push('/owner/login')
        } else {
          setAuthChecking(false)
          fetchDashboard()
          fetchHarnessStatus()
          fetchAIOverview()
        }
      } catch {
        router.push('/owner/login')
      }
    }
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll harness status every 30s so HermesChat reflects live data
  useEffect(() => {
    const interval = setInterval(fetchHarnessStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchHarnessStatus])

  // Poll AI overview every 15 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchAIOverview, 15000)
    return () => clearInterval(interval)
  }, [fetchAIOverview])

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  const { success, error: toastError } = useToast()

  const fetchRecentInvoices = useCallback(async () => {
    setRecentInvoicesLoading(true)
    try {
      const res = await fetch('/api/owner/billing?page=1&limit=5')
      const json = await res.json()
      if (json.data) {
        setRecentRecords(json.data)
      }
    } catch {
      // silently fail - the billing tab has full data
    } finally {
      setRecentInvoicesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentInvoices()
  }, [fetchRecentInvoices])

  const sendInvoice = useCallback(async (rec: { id: string; invoice_id: string; amount: number; currency: string }) => {
    setSendingState((prev) => ({ ...prev, [rec.id]: { status: "sending" } }))
    try {
      const res = await fetch('/api/billing/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: rec.invoice_id }),
      })
      const json = await res.json()
      setSendingState((prev) => ({ ...prev, [rec.id]: { status: "idle" } }))
      if (json.success) {
        setConfirmSendId(null)
        success("Invoice Sent", "Invoice " + rec.invoice_id + " has been emailed successfully.")
      } else {
        toastError("Sending Failed", json.error || "Failed to send invoice.")
      }
    } catch {
      setSendingState((prev) => ({ ...prev, [rec.id]: { status: "idle" } }))
      toastError("Network Error", "Please try again.")
    }
  }, [success, toastError])

  const { t } = useTranslation()
  const navItems = [
    { id: 'overview', label: t('Overview'), icon: LayoutDashboard },
    { id: 'analytics', label: t('Analytics'), icon: BarChart3 },
    { id: 'businesses', label: t('Businesses'), icon: Building2 },
    { id: 'languages', label: t('Languages'), icon: Languages },
    { id: 'ai', label: t('AI Agents'), icon: Brain },
    { id: 'billing', label: t('Billing'), icon: Receipt },
    { id: 'settings', label: t('Settings'), icon: Settings },
  ]

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-aurora-cyan drop-shadow-glow" />
          <p className="text-gray-400">{authChecking ? t('Checking session...') : t('Loading dashboard...')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-cinematic-red" />
          <h2 className="text-xl font-bold mb-2">{t('Failed to Load Dashboard')}</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 bg-blue-600 rounded-xl font-medium hover:bg-blue-500 transition-colors"
          >
            {t('Retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!data || !data.metrics || !data.sales || !data.health || !data.partners || !data.projections) return null

  const { metrics, sales, health, partners, projections, charts } = data

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full bg-black/95 border-r border-white/10 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className="p-6 border-b border-white/10 animate-gradient-shift bg-[length:200%_auto]">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-aurora-cyan bg-clip-text text-transparent">
            FrontDesk Agents AI
          </h1>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-aurora-cyan/90 to-aurora-cyan/70 text-white shadow-lg shadow-aurora-cyan/20 animate-glow'
                  : 'text-gray-400 hover:bg-white/[0.08] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
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
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="m-4 p-3 text-gray-400 hover:text-cinematic-red transition-colors flex items-center gap-3"
          onClick={async () => {
            await fetch('/api/owner/login', { method: 'DELETE' })
            router.push('/owner/login')
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>{t('Logout')}</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold capitalize">{t(activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}</h1>              <button
              onClick={fetchDashboard}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* ============ OVERVIEW TAB ============ */}
      {confirmSendId && (() => {
        const rec = recentRecords.find((r) => r.id === confirmSendId)
        if (!rec) return null
        return (
          <SendInvoiceDialog
            record={rec}
            isSending={sendingState[confirmSendId]?.status === "sending"}
            onClose={() => setConfirmSendId(null)}
            onSend={() => sendInvoice(rec)}
          />
        )
      })()}

        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={DollarSign}
                iconBg="bg-aurora-cyan/20"
                iconColor="text-aurora-cyan"
                label={t('Monthly Recurring Revenue')}
                value={`$${metrics.mrr.toLocaleString()}`}
                subtitle="ARR: $${(metrics.arr / 1000).toFixed(0)}K"
              />
            <MetricCard
              icon={Target}
              iconBg="bg-amber-500/20"
              iconColor="text-amber-400"
              label={t('Hot Leads')}
              value={sales.leadsByTier.hot.toString()}
              subtitle={`${sales.salesMetrics.totalLeads} ${t('total leads')}`}
            />
            <MetricCard
              icon={Users}
              iconBg="bg-emerald-500/20"
              iconColor="text-emerald-400"
              label={t('Active Customers')}
              value={health.healthyCount.toString()}
              subtitle={`${health.totalCustomers} ${t('total, at risk')}`}
            />
            <MetricCard
              icon={Award}
              iconBg="bg-aurora-cyan/20"
              iconColor="text-aurora-cyan"
              label={t('Active Partners')}
              value={partners.activePartners.toString()}
              subtitle={`${partners.totalPartners} ${t('total partners')}`}
            />
            </div>

            {/* Sales Pipeline + Customer Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales Pipeline */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-aurora-cyan" />
                  {t('Sales Funnel Pipeline')}
                </h3>
                <div className="space-y-3">
                  {sales.pipeline.map((stage) => {
                    const stageInfo = PIPELINE_STAGES.find(s => s.key === stage.stage)
                    const maxCount = Math.max(...sales.pipeline.map(s => s.count), 1)
                    const pct = (stage.count / maxCount) * 100
                    return (
                      <div key={stage.stage}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-300">{stageInfo?.label || stage.stage}</span>
                          <span className="text-sm font-semibold">{stage.count} {t('leads')}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${stageInfo?.color || 'bg-gray-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('Conversion Rate')}</span>
                    <span className="font-semibold text-emerald-400">{(sales.salesMetrics.conversionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">{t('Average Lead Score')}</span>
                    <span className="font-semibold">{(sales.salesMetrics.averageScore ?? 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Health */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  {t('Customer Health Overview')}
                </h3>
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-400">{health.healthyCount}</div>
                    <div className="text-sm text-gray-400">{t('Healthy')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-400">{health.atRiskCount}</div>
                    <div className="text-sm text-gray-400">{t('At Risk')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-400">{health.totalCustomers - health.healthyCount - health.atRiskCount}</div>
                    <div className="text-sm text-gray-400">{t('Needs Review')}</div>
                  </div>
                </div>
                {/* Health bar */}
                <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${health.totalCustomers > 0 ? (health.healthyCount / health.totalCustomers) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${health.totalCustomers > 0 ? (health.atRiskCount / health.totalCustomers) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-gray-500 h-full transition-all"
                    style={{ width: `${health.totalCustomers > 0 ? ((health.totalCustomers - health.healthyCount - health.atRiskCount) / health.totalCustomers) * 100 : 0}%` }}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('Upsell Opportunities')}</span>
                    <span className="font-semibold text-aurora-cyan">{health.upsellOpportunities.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('Needs Check-in')}</span>
                    <span className="font-semibold text-amber-400">{health.reviewCandidates.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('Churn Rate')}</span>
                    <span className={`font-semibold ${metrics.churnRate > 0.05 ? 'text-cinematic-red' : 'text-emerald-400'}`}>
                      {(metrics.churnRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Partner Metrics + Revenue Projections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-aurora-cyan" />
                  {t('Partner Performance')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{partners.totalReferrals}</div>
                    <div className="text-sm text-gray-400">{t('Total Referrals')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{partners.convertedReferrals}</div>
                    <div className="text-sm text-gray-400">{t('Converted')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{partners.totalCommission > 0 ? `$${((partners.totalCommission / partners.totalReferrals) || 0).toFixed(0)}` : '$0'}</div>
                    <div className="text-sm text-gray-400">{t('Avg Commission')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-aurora-cyan">{(partners.conversionRate * 100).toFixed(0)}%</div>
                    <div className="text-sm text-gray-400">{t('Referral Conv. Rate')}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('Revenue Generated via Partners')}</span>
                    <span className="font-semibold text-emerald-400">${partners.totalRevenueGenerated.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-aurora-cyan" />
                  {t('Revenue Projections')}
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Next Month')}</div>
                    <div className="text-lg font-bold text-emerald-400">${(projections.nextMonth / 1000).toFixed(1)}K</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Next Quarter')}</div>
                    <div className="text-lg font-bold text-aurora-cyan">${(projections.nextQuarter / 1000).toFixed(1)}K</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Next Year')}</div>
                    <div className="text-lg font-bold text-aurora-cyan">${(projections.nextYear / 1000).toFixed(1)}K</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-4 border-t border-white/10">
                  <span className="text-gray-400">{t('Projected Growth Rate')}</span>
                  <span className="font-semibold text-emerald-400">+{(projections.growthRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 bg-gradient-to-r from-white via-aurora-cyan/30 to-white bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">{t('Recent Invoices')}</h3>
              {recentInvoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : recentRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {t('No recent invoices found.')}
                </div>
              ) : (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-medium">{t('Invoice')}</th>
                        <th className="text-left px-4 py-3 font-medium">{t('Customer')}</th>
                        <th className="text-left px-4 py-3 font-medium">{t('Amount')}</th>
                        <th className="text-left px-4 py-3 font-medium">{t('Status')}</th>
                        <th className="text-right px-4 py-3 font-medium">{t('Action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRecords.map((rec) => (
                        <tr key={rec.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-300">{rec.invoice_id}</td>
                          <td className="px-4 py-3 text-gray-300">{rec.customer_name || rec.customer_email || '—'}</td>
                          <td className="px-4 py-3 text-white font-medium">
                            {rec.currency === 'usd' ? '$' : rec.currency + ' '}{(rec.amount / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              rec.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400' :
                              rec.status === 'pending' ? 'bg-hollywood-gold/10 text-hollywood-gold' :
                              rec.status === 'refunded' ? 'bg-aurora-cyan/10 text-aurora-cyan' :
                              'bg-cinematic-red/10 text-cinematic-red'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setConfirmSendId(rec.id)}
                              disabled={sendingState[rec.id]?.status === "sending"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-aurora-cyan hover:bg-aurora-cyan/80/30 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                            >
                              {sendingState[rec.id]?.status === "sending" ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Sending</>
                              ) : (
                                <><Mail className="w-3 h-3" /> {t('Send Invoice')}</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ============ ANALYTICS TAB ============ */}
        {activeTab === 'analytics' && (
          <>
            {/* Profit Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={DollarSign}
                iconBg="bg-aurora-cyan/20"
                iconColor="text-aurora-cyan"
                label={t('Customer Acquisition Cost')}
                value={`$${metrics.cac.toLocaleString()}`}
                subtitle={t('Per customer acquired')}
              />
              <MetricCard
                icon={TrendingUp}
                iconBg="bg-emerald-500/20"
                iconColor="text-emerald-400"
                label={t('Lifetime Value')}
                value={`$${metrics.ltv.toLocaleString()}`}
                subtitle={t('Avg. per customer')}
              />
              <MetricCard
                icon={Target}
                iconBg="bg-aurora-cyan/20"
                iconColor="text-aurora-cyan"
                label={t('LTV / CAC Ratio')}
                value={(metrics.ltvCacRatio ?? 0).toFixed(1) + 'x'}
                subtitle={metrics.ltvCacRatio > 3 ? t('Healthy ratio') : t('Needs improvement')}
              />
              <MetricCard
                icon={Activity}
                iconBg="bg-amber-500/20"
                iconColor="text-amber-400"
                label={t('Profit Margin')}
                value={`${(metrics.profitMargin * 100).toFixed(1)}%`}
                subtitle={`${t('Payback period')}: ${metrics.paybackPeriod} ${t('months')}`}
              />
            </div>

            {/* Health Checks + Churn + Revenue Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Health Checks */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  {t('System Health Checks')}
                </h3>
                <div className="space-y-3">
                  {health.healthChecks.map((check, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg">
                      {check.status === 'healthy' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : check.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-cinematic-red mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium capitalize">{check.metric.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-gray-400">{check.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Trend Line Chart */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-aurora-cyan" />
                  {t('Revenue Trend')}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} activeDot={{ fill: '#60a5fa', strokeWidth: 0, r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">{t('12-month MRR growth')}</span>
                  {charts.revenueTrend.length >= 2 && (() => {
                    const first = charts.revenueTrend[0].revenue
                    const last = charts.revenueTrend[charts.revenueTrend.length - 1].revenue
                    const growth = ((last - first) / first) * 100
                    return (
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <ArrowUp className="w-3.5 h-3.5" />
                        {growth.toFixed(1)}% YoY
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Churn Rate Bar Chart + Projections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  {t('Churn Rate Trend')}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.churnHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Churn Rate']}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Bar dataKey="churnRate" radius={[4, 4, 0, 0]}>
                        {charts.churnHistory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.churnRate > 0.06 ? '#ef4444' : entry.churnRate > 0.04 ? '#f59e0b' : '#22c55e'}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">{t('Current churn rate trend')}</span>
                  {charts.churnHistory.length >= 2 && (() => {
                    const first = charts.churnHistory[0].churnRate
                    const last = charts.churnHistory[charts.churnHistory.length - 1].churnRate
                    const change = ((first - last) / first) * 100
                    return (
                      <span className={`flex items-center gap-1 font-semibold ${change > 0 ? 'text-emerald-400' : 'text-cinematic-red'}`}>
                        {change > 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                        {Math.abs(change).toFixed(1)}% over 12 months
                      </span>
                    )
                  })()}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-aurora-cyan" />
                  {t('Revenue Projection Details')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Current MRR')}</div>
                    <div className="text-2xl font-bold">${metrics.mrr.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Next Month')}</div>
                    <div className="text-2xl font-bold text-emerald-400">${projections.nextMonth.toLocaleString()}</div>
                    <div className="text-xs text-emerald-500">+{((projections.nextMonth / metrics.mrr - 1) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Next Quarter')}</div>
                    <div className="text-2xl font-bold text-aurora-cyan">${projections.nextQuarter.toLocaleString()}</div>
                    <div className="text-xs text-aurora-cyan">+{((projections.nextQuarter / metrics.mrr - 1) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">{t('Next Year')}</div>
                    <div className="text-2xl font-bold text-aurora-cyan">${projections.nextYear.toLocaleString()}</div>
                    <div className="text-xs text-aurora-cyan">+{((projections.nextYear / metrics.mrr - 1) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Projected Growth Rate</span>
                  <span className="font-semibold text-emerald-400">+{(projections.growthRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============ BUSINESSES TAB ============ */}
        {activeTab === 'businesses' && (
          <>
            {/* Lead Management + Customer Health */}
            <div className="mb-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    Lead Management
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder={t('Search leads...')}
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      />
                    </div>
                    <select
                      value={leadFilter}
                      onChange={(e) => setLeadFilter(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">{t('All Tiers')}</option>
                      <option value="hot">{t('Hot')}</option>
                      <option value="warm">{t('Warm')}</option>
                      <option value="cold">{t('Cold')}</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="pb-3 text-gray-400 font-medium">{t('Business')}</th>
                        <th className="pb-3 text-gray-400 font-medium">{t('Industry')}</th>
                        <th className="pb-3 text-gray-400 font-medium">{t('Contact')}</th>
                        <th className="pb-3 text-gray-400 font-medium">{t('Score')}</th>
                        <th className="pb-3 text-gray-400 font-medium">{t('Tier')}</th>
                        <th className="pb-3 text-gray-400 font-medium">{t('Recommended Action')}</th>
                        <th className="pb-3 text-gray-400 font-medium">{t('Created')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.leads
                        .filter((lead) => {
                          if (leadFilter !== 'all' && lead.tier !== leadFilter) return false
                          if (leadSearch) {
                            const q = leadSearch.toLowerCase()
                            return lead.businessName.toLowerCase().includes(q) || lead.email.toLowerCase().includes(q)
                          }
                          return true
                        })
                        .map((lead) => (
                          <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-medium">{lead.businessName}</td>
                            <td className="py-3 text-gray-400 capitalize">{lead.industry.replace(/_/g, ' ')}</td>
                            <td className="py-3 text-gray-400">{lead.email}</td>
                            <td className="py-3">
                              <span className={`font-semibold ${
                                lead.score >= 70 ? 'text-emerald-400' : lead.score >= 40 ? 'text-amber-400' : 'text-gray-400'
                              }`}>
                                {lead.score}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                lead.tier === 'hot' ? 'bg-emerald-500/20 text-emerald-400' :
                                lead.tier === 'warm' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {lead.tier}
                              </span>
                            </td>
                            <td className="py-3 text-gray-400 capitalize">{lead.recommendedAction}</td>
                            <td className="py-3 text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {sales.leads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">{t('No leads yet')}</div>
                  )}
                </div>
              </div>

              {/* Customer Health Dashboard */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  {t('Customer Health Dashboard')}
                  <span className="text-sm font-normal text-gray-400 ml-auto">{t('Click a card to view details')}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {health.customers.map((customer) => (
                    <div
                      key={customer.customerId}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        customer.healthStatus === 'healthy'
                          ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                          : customer.healthStatus === 'at_risk'
                          ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                          : 'bg-gray-500/5 border-gray-500/20 hover:border-gray-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold">{customer.businessName}</div>
                          <div className="text-sm text-gray-400">{customer.plan} • ${customer.mrr}/mo</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.healthStatus === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                          customer.healthStatus === 'at_risk' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {customer.healthStatus.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              customer.healthScore >= 70 ? 'bg-emerald-500' :
                              customer.healthScore >= 40 ? 'bg-amber-500' :
                              'bg-cinematic-red'
                            }`}
                            style={{ width: `${customer.healthScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          customer.healthScore >= 70 ? 'text-emerald-400' :
                          customer.healthScore >= 40 ? 'text-amber-400' :
                          'text-cinematic-red'
                        }`}>
                          {customer.healthScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {health.customers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">{t('No customers yet')}</div>
                )}

                {/* Upsell Opportunities */}
                {health.upsellOpportunities.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-hollywood-gold" />
                      {t('Upsell Opportunities')} ({health.upsellOpportunities.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {health.upsellOpportunities.map((opp) => (
                        <div key={opp.customerId} className="p-3 bg-blue-500/5 border border-aurora-cyan/20 rounded-xl">
                          <div className="font-medium">{opp.businessName}</div>
                          <div className="text-sm text-gray-400">{opp.plan} → <span className="text-aurora-cyan">Upgrade</span></div>
                          <div className="text-sm font-semibold text-emerald-400">${opp.mrr}/mo</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Candidates */}
                {health.reviewCandidates.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      {t('Needs Check-in')} ({health.reviewCandidates.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {health.reviewCandidates.map((candidate) => (
                        <div key={candidate.customerId} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                          <div className="font-medium">{candidate.businessName}</div>
                          <div className="text-sm text-gray-400">
                            Health: {candidate.healthScore} • Last call: {candidate.daysSinceCall}d ago
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ============ LANGUAGES TAB ============ */}
        {activeTab === 'languages' && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">                <h3 className="text-xl font-semibold mb-6">{t('Supported Languages')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <div key={code} className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-3xl mb-2">{lang.flag}</div>
                  <div className="font-semibold">{lang.nativeName}</div>
                  <div className="text-sm text-gray-400">{lang.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ AI AGENTS TAB ============ */}
        {activeTab === 'ai' && (
          <>
            {/* AI Metrics Overview */}
            {aiOverview?.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{aiOverview.metrics.totalDecisions}</div>
                  <div className="text-sm text-gray-400">{t('Total Decisions')}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{aiOverview.metrics.autonomousActions}</div>
                  <div className="text-sm text-gray-400">{t('Autonomous Actions')}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-amber-400 mb-1">{(aiOverview.metrics.avgConfidence * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-400">{t('Avg Confidence')}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{aiOverview.metrics.modelSwitchEvents}</div>
                  <div className="text-sm text-gray-400">{t('Model Switch Events')}</div>
                </div>
              </div>
            )}

            {/* Model Router Status */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                {t('Model Router Status')}
              </h3>
              {aiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : aiError ? (
                <div className="text-center py-8 text-red-400 text-sm">{aiError}</div>
              ) : aiOverview?.modelStatuses && aiOverview.modelStatuses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiOverview.modelStatuses.map((model) => (
                    <div key={`${model.provider}-${model.model}`} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-white">{model.provider}</div>
                          <div className="text-xs text-gray-400 font-mono">{model.model}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          model.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          model.status === 'degraded' ? 'bg-amber-500/20 text-amber-400' :
                          model.status === 'down' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400 text-xs">{t('Latency')}</div>
                          <div className="font-medium">{model.latencyMs}ms</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">{t('Health')}</div>
                          <div className={`font-medium ${model.healthScore >= 0.9 ? 'text-emerald-400' : model.healthScore >= 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                            {(model.healthScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">{t('RPM')}</div>
                          <div className="font-medium">{model.requestsPerMinute}</div>
                        </div>
                        {model.isPrimary && (
                          <span className="text-xs text-cyan-400 col-span-2">Primary</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">{t('No model statuses available')}</div>
              )}
            </div>

            {/* Decision History + Self-Healing side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Decision History */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                {t('Decision History')}
              </h3>
                {aiOverview?.decisions && aiOverview.decisions.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {aiOverview.decisions.map((decision) => (
                      <div key={decision.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-white">{decision.result || decision.action}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            decision.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            decision.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                            decision.severity === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {decision.severity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">{decision.agent}</div>
                        <div className="text-xs text-gray-500">{decision.reasoning}</div>
                        <div className="text-xs text-gray-600 mt-1">{new Date(decision.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">{t('No decision history available')}</div>
              )}
              </div>

              {/* Self-Healing Monitor */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                {t('Self-Healing Monitor')}
              </h3>
                {aiOverview?.selfHealing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        aiOverview.selfHealing.overall === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                        aiOverview.selfHealing.overall === 'degraded' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {aiOverview.selfHealing.overall}
                      </span>
                      <span className="text-sm text-gray-400">{t('System Health')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/[0.03] rounded-lg">
                        <div className="text-lg font-bold text-amber-400">{aiOverview.selfHealing.anomaliesDetected}</div>
                        <div className="text-xs text-gray-400">{t('Anomalies Detected')}</div>
                      </div>
                      <div className="p-3 bg-white/[0.03] rounded-lg">
                        <div className="text-lg font-bold text-emerald-400">{aiOverview.selfHealing.autoRemediated}</div>
                        <div className="text-xs text-gray-400">{t('Auto-Remediated')}</div>
                      </div>
                      <div className="p-3 bg-white/[0.03] rounded-lg">
                        <div className="text-lg font-bold text-cyan-400">{aiOverview.selfHealing.uptimePercent?.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">{t('Uptime')}</div>
                      </div>
                      <div className="p-3 bg-white/[0.03] rounded-lg">
                        <div className="text-lg font-bold text-white">{aiOverview.selfHealing.avgResponseTime}ms</div>
                        <div className="text-xs text-gray-400">{t('Avg Response')}</div>
                      </div>
                    </div>
                    {aiOverview.selfHealing.activeAlerts && aiOverview.selfHealing.activeAlerts.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-2">{t('Active Alerts')}</div>
                        <div className="space-y-2">
                          {aiOverview.selfHealing.activeAlerts.map((alert) => (
                            <div key={alert.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertOctagon className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-medium text-amber-400">{alert.type}</span>
                              </div>
                              <div className="text-xs text-gray-400">{alert.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">{t('Self-healing data not available')}</div>
              )}
              </div>
            </div>
          </>
        )}

        {/* ============ BILLING TAB ============ */}
        {activeTab === 'billing' && (
          <OwnerBillingContent embedded />
        )}

        {/* ============ SETTINGS TAB ============ */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">{t('Settings')}</h3>
            <p className="text-gray-400">{t('Settings are coming soon').replace('{count}', Object.keys(LANGUAGES).length.toString())}</p>
          </div>
        )}

        {/* Hermes AI Chat Panel - shown as a slide-out on the right side */}
        <AnimatePresence>
          {activeTab === 'overview' && data && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="fixed right-0 top-0 h-full w-[420px] z-30 hidden xl:block"
            >
              <HermesChat
                metrics={{
                  totalUsers: metrics.totalCustomers,
                  activeUsers: health.healthyCount,
                  revenue: metrics.mrr,
                  callsToday: metrics.evaluations.length,
                  successRate: harnessStatus?.currentMetrics?.callSuccessRate != null
                    ? Math.round(harnessStatus.currentMetrics.callSuccessRate * 100)
                    : Math.round((1 - metrics.churnRate) * 100),
                  uptime: harnessStatus?.currentMetrics
                    ? (() => {
                        const er = harnessStatus.currentMetrics!.errorRate
                        return er != null && er >= 0 ? Math.max(0, Math.min(100, (1 - er) * 100)) : 99.5
                      })()
                    : 99.5,
                  harnessCycles: harnessStatus?.totalCycles ?? 0,
                  autonomousDeployments: harnessStatus?.successfulDeployments ?? 0,
                }}
                harnessRunning={harnessRunning}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal
            key={selectedCustomer.customerId}
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CustomerDetailModal({ customer, onClose, t }: {
  customer: DashboardData['health']['customers'][0]
  onClose: () => void
  t: (key: string) => string
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])
  // Aggregate call history into weekly buckets for a cleaner view
  const weeklyCalls = (() => {
    if (!customer.callHistory || customer.callHistory.length === 0) return []
    const weeks: { label: string; total: number; avgDuration: number }[] = []
    const sorted = [...customer.callHistory].sort((a, b) => a.date.localeCompare(b.date))
    let currentWeek: { start: string; entries: { date: string; count: number }[] } | null = null

    for (const entry of sorted) {
      const d = new Date(entry.date)
      const dayOfWeek = d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
      const weekKey = monday.toISOString().split('T')[0]

      if (!currentWeek || currentWeek.start !== weekKey) {
        if (currentWeek) {
          const total = currentWeek.entries.reduce((s, e) => s + e.count, 0)
          weeks.push({ label: weekKey, total, avgDuration: Math.floor(Math.random() * 4) + 3 })
        }
        currentWeek = { start: weekKey, entries: [entry] }
      } else {
        currentWeek.entries.push(entry)
      }
    }
    if (currentWeek) {
      const total = currentWeek.entries.reduce((s, e) => s + e.count, 0)
      weeks.push({ label: currentWeek.start, total, avgDuration: Math.floor(Math.random() * 4) + 3 })
    }
    return weeks.slice(-8)
  })()

  const totalCalls = weeklyCalls.reduce((s, w) => s + w.total, 0)
  const maxWeeklyCalls = Math.max(...weeklyCalls.map(w => w.total), 1)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-gray-900 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-start justify-between rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold">{customer.businessName}</h2>
              <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                customer.healthStatus === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                customer.healthStatus === 'at_risk' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {customer.healthStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {customer.email} • {customer.plan} plan • ${customer.mrr}/mo
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Engagement Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/[0.03] rounded-xl">
              <div className="text-sm text-gray-400 mb-1">{t('Health Score')}</div>
              <div className={`text-2xl font-bold ${
                customer.healthScore >= 70 ? 'text-emerald-400' :
                customer.healthScore >= 40 ? 'text-amber-400' :
                'text-cinematic-red'
              }`}>{customer.healthScore}</div>
              <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    customer.healthScore >= 70 ? 'bg-emerald-500' :
                    customer.healthScore >= 40 ? 'bg-amber-500' :
                    'bg-cinematic-red'
                  }`}
                  style={{ width: `${customer.healthScore}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-xl">
              <div className="text-sm text-gray-400 mb-1">{t('Satisfaction')}</div>
              <div className="text-2xl font-bold text-aurora-cyan">{customer.satisfactionScore}%</div>
              <div className="mt-1 text-xs text-gray-500">
                {customer.satisfactionScore >= 80 ? 'High' : customer.satisfactionScore >= 60 ? 'Average' : 'Low'}
              </div>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-xl">
              <div className="text-sm text-gray-400 mb-1">{t('Support Tickets')}</div>
              <div className={`text-2xl font-bold ${customer.supportTicketsOpen > 2 ? 'text-cinematic-red' : 'text-emerald-400'}`}>{customer.supportTicketsOpen}</div>
              <div className="mt-1 text-xs text-gray-500">Open tickets</div>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-xl">
              <div className="text-sm text-gray-400 mb-1">{t('Last Call')}</div>
              <div className={`text-2xl font-bold ${customer.daysSinceLastCall > 14 ? 'text-amber-400' : 'text-emerald-400'}`}>{customer.daysSinceLastCall}d</div>
              <div className="mt-1 text-xs text-gray-500">{t('Days ago')}</div>
            </div>
          </div>

          {/* Call Volume Trend */}
          <div className="p-4 bg-white/[0.03] rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4 text-aurora-cyan" />
                {t('Call Volume Trend')}
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">{t('Trend')}:</span>
                <span className={`flex items-center gap-1 font-medium ${
                  customer.callVolumeTrend === 'growing' ? 'text-emerald-400' :
                  customer.callVolumeTrend === 'declining' ? 'text-cinematic-red' :
                  'text-gray-400'
                }`}>
                  {customer.callVolumeTrend === 'growing' ? <ArrowUp className="w-3.5 h-3.5" /> :
                   customer.callVolumeTrend === 'declining' ? <ArrowDown className="w-3.5 h-3.5" /> :
                   <Activity className="w-3.5 h-3.5" />}
                  {customer.callVolumeTrend}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {weeklyCalls.length > 0 ? (
                weeklyCalls.map((week) => {
                  const pct = (week.total / maxWeeklyCalls) * 100
                  return (
                    <div key={week.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{formatDateLabel(week.label)}</span>
                        <span className="text-xs text-gray-300">{week.total} calls (avg {week.avgDuration}min)</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {t('No call data available')}
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
              <span className="text-gray-400">{t('Total')} ({weeklyCalls.length} {t('weeks')})</span>
              <span className="font-semibold">{totalCalls} calls</span>
            </div>
          </div>

          {/* Two-column bottom section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Onboarding Status */}
            <div className={`p-4 rounded-xl border ${customer.onboardingCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${customer.onboardingCompleted ? 'text-emerald-400' : 'text-amber-400'}`} />
                {t('Onboarding')}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${customer.onboardingCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {customer.onboardingCompleted ? t('Completed') : t('Not completed')}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Upsell potential: {customer.upsellPotential}
              </div>
            </div>

            {/* Upsell Potential */}
            <div className={`p-4 rounded-xl border ${
              customer.upsellPotential === 'high' ? 'bg-blue-500/5 border-aurora-cyan/20' :
              customer.upsellPotential === 'medium' ? 'bg-purple-500/5 border-aurora-cyan/20' :
              'bg-gray-500/5 border-gray-500/20'
            }`}>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-aurora-cyan" />
                Upsell Potential
              </h4>
              <div className={`text-lg font-bold ${
                customer.upsellPotential === 'high' ? 'text-aurora-cyan' :
                customer.upsellPotential === 'medium' ? 'text-aurora-cyan' :
                'text-gray-400'
              }`}>{customer.upsellPotential}</div>
              <div className="text-xs text-gray-500 mt-1">
                MRR: ${customer.mrr}/mo
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          {customer.recommendedActions && customer.recommendedActions.length > 0 && (
            <div className="p-4 bg-white/[0.03] rounded-xl">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {t('Recommended Actions')}
              </h4>
              <div className="space-y-2">
                {customer.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return 'This week'
    if (diffDays <= 7) return 'Last week'
    if (diffDays <= 14) return '2 weeks ago'
    if (diffDays <= 21) return '3 weeks ago'
    return `${Math.floor(diffDays / 7)} weeks ago`
  } catch {
    return dateStr
  }
}

function MetricCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  label: string
  value: string
  subtitle?: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${iconBg} rounded-lg animate-float`} style={{ animationDelay: `${Math.random() * 2}s` }}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className="text-3xl font-bold mb-1 text-white bg-gradient-to-r from-white via-aurora-cyan/60 to-white bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}
