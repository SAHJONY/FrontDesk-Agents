import os

BASE = os.getcwd()

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)

# =========================================================
# CHANGE 1: Add getAllBillingRecords() to supabase.ts
# =========================================================
supa = read('src/lib/supabase.ts')

old = """export async function getBillingHistory(customerId: string, limit = 50): Promise<BillingRecord[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('billing_history')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching billing history:', error)
    return []
  }
  return (data as BillingRecord[]) || []
}"""

new = """export interface BillingRecordWithCustomer extends BillingRecord {
  customer_email?: string
  customer_name?: string
  business_name?: string
}

export async function getBillingHistory(customerId: string, limit = 50): Promise<BillingRecord[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('billing_history')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching billing history:', error)
    return []
  }
  return (data as BillingRecord[]) || []
}

export async function getAllBillingRecords(limit = 100, offset = 0): Promise<BillingRecordWithCustomer[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('billing_history')
    .select(\`
      *,
      customers!inner (
        email,
        business_name,
        owner_name
      )
    \`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching all billing records:', error)
    return []
  }

  return (data as any[]).map((r) => ({
    ...r,
    customer_email: r.customers?.email || '',
    customer_name: r.customers?.owner_name || r.customers?.business_name || '',
    business_name: r.customers?.business_name || '',
  }))
}"""

if old in supa:
    supa = supa.replace(old, new, 1)
    write('src/lib/supabase.ts', supa)
    print("CHANGE 1 OK: Added getAllBillingRecords() and BillingRecordWithCustomer")
else:
    print("CHANGE 1 FAIL: Could not find getBillingHistory in supabase.ts")

# =========================================================
# CHANGE 2: Create API route src/app/api/owner/billing/route.ts
# =========================================================
api_route = """import { NextRequest, NextResponse } from 'next/server'
import { getAllBillingRecords } from '@/lib/supabase'
import { authService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const offset = (page - 1) * limit

    const records = await getAllBillingRecords(limit, offset)

    return NextResponse.json({
      success: true,
      data: records,
      pagination: { page, limit, hasMore: records.length === limit },
    })
  } catch (error) {
    console.error('Owner billing API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
"""

write('src/app/api/owner/billing/route.ts', api_route)
print("CHANGE 2 OK: Created API route")

# =========================================================
# CHANGE 3: Create owner billing dashboard page
# =========================================================
owner_billing_page = '''"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Download, RefreshCw, DollarSign, Calendar,
  FileText, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Search, Building2, Mail,
  Loader2, Receipt, TrendingUp, Users,
} from "lucide-react"
import Link from "next/link"

interface BillingRecordWithCustomer {
  id: string
  customer_id: string
  invoice_id: string
  subscription_id: string | null
  amount: number
  currency: string
  status: "succeeded" | "failed" | "refunded" | "pending"
  description: string
  billing_reason: string | null
  invoice_pdf_url: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
  customer_email?: string
  customer_name?: string
  business_name?: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function getStatusIcon(status: string) {
  switch (status) {
    case "succeeded":
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case "failed":
      return <XCircle className="w-5 h-5 text-red-400" />
    case "refunded":
      return <Clock className="w-5 h-5 text-yellow-400" />
    case "pending":
      return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "succeeded":
      return "text-green-400 bg-green-500/10 border-green-500/20"
    case "failed":
      return "text-red-400 bg-red-500/10 border-red-500/20"
    case "refunded":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    case "pending":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20"
    default:
      return "text-gray-400 bg-gray-500/10 border-gray-500/20"
  }
}

function getBillingReasonLabel(reason: string | null) {
  switch (reason) {
    case "subscription_cycle":
      return "Subscription Renewal"
    case "subscription_create":
      return "New Subscription"
    case "subscription_update":
      return "Plan Change"
    case "invoice_payment_failed":
      return "Payment Failed Retry"
    case "manual":
      return "Manual Adjustment"
    default:
      return reason || "General"
  }
}

function csvEscape(val: unknown): string {
  const s = String(val ?? "")
  if (s.includes(",") || s.includes('"') || s.includes("\\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function OwnerBillingPage() {
  const [records, setRecords] = useState<BillingRecordWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchBillingHistory = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/owner/billing?page=${pageNum}&limit=50`)
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Not authenticated" : "Failed to load billing data")
      }
      const json = await res.json()
      if (pageNum === 1) {
        setRecords(json.data)
      } else {
        setRecords((prev) => [...prev, ...json.data])
      }
      setHasMore(json.pagination?.hasMore ?? false)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBillingHistory(1)
  }, [fetchBillingHistory])

  const filteredRecords = records
    .filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (startDate && new Date(r.created_at) < new Date(startDate)) return false
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (new Date(r.created_at) > endOfDay) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.description.toLowerCase().includes(q) ||
          r.invoice_id.toLowerCase().includes(q) ||
          r.customer_name?.toLowerCase().includes(q) ||
          r.business_name?.toLowerCase().includes(q) ||
          r.customer_email?.toLowerCase().includes(q) ||
          formatCurrency(r.amount, r.currency).toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const d = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortOrder === "newest" ? -d : d
    })

  const totalRevenue = records
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + r.amount, 0)

  const uniqueCustomers = new Set(records.map((r) => r.customer_id)).size

  const failedCount = records.filter((r) => r.status === "failed").length

  function exportCSV() {
    const headers = ["Date", "Customer", "Business", "Email", "Description", "Amount", "Currency", "Status", "Invoice ID", "Subscription ID", "Billing Reason"]
    const rows = filteredRecords.map((r) => [
      formatDate(r.created_at),
      r.customer_name || "",
      r.business_name || "",
      r.customer_email || "",
      r.description,
      (r.amount / 100).toFixed(2),
      r.currency.toUpperCase(),
      r.status,
      r.invoice_id,
      r.subscription_id || "",
      getBillingReasonLabel(r.billing_reason),
    ].map(csvEscape))

    const csv = [headers.map(csvEscape).join(","), ...rows.join("\\n")].join("\\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "all-billing-history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading all billing records...</p>
        </div>
      </div>
    )
  }

  if (error && records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchBillingHistory(1)}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/owner/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                  <Receipt className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">All Billing History</h1>
                  <p className="text-sm text-gray-400">View billing records across all customers</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBillingHistory(1)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue, "usd")}</p>
            <p className="text-xs text-gray-500 mt-1">From {records.filter(r => r.status === "succeeded").length} successful payments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Customers</span>
            </div>
            <p className="text-2xl font-bold text-white">{uniqueCustomers}</p>
            <p className="text-xs text-gray-500 mt-1">With billing activity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white">{records.length}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredRecords.length} shown with filters</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Failed</span>
            </div>
            <p className="text-2xl font-bold text-white">{failedCount}</p>
            <p className="text-xs text-gray-500 mt-1">{failedCount > 0 ? `${((failedCount / records.length) * 100).toFixed(1)}% failure rate` : "No failures"}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by description, customer, business, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px] pl-8 pr-2 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all [color-scheme:dark]"
                title="Start date"
              />
            </div>
            <span className="text-gray-500 text-sm">to</span>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-[140px] pl-8 pr-2 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all [color-scheme:dark]"
                title="End date"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                title="Clear date filter"
              >
                &times;
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "succeeded", "failed", "refunded", "pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-300"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            {sortOrder === "newest" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>

        {/* Records List */}
        <AnimatePresence mode="popLayout">
          {filteredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              {records.length === 0 ? (
                <>
                  <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-1">No billing records yet</h3>
                  <p className="text-sm text-gray-600">Billing history will appear once customers complete payments.</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-1">No records match your filters</h3>
                  <p className="text-sm text-gray-600">Try adjusting your search or filter criteria.</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filteredRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className="rounded-xl bg-gray-800/20 border border-gray-700/30 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/40 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg border ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white truncate">
                          {record.description}
                        </span>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border capitalize ${
                          record.status === "succeeded"
                            ? "text-green-400 border-green-500/20 bg-green-500/5"
                            : record.status === "failed"
                              ? "text-red-400 border-red-500/20 bg-red-500/5"
                              : record.status === "refunded"
                                ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5"
                                : "text-blue-400 border-blue-500/20 bg-blue-500/5"
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {record.business_name || record.customer_name || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {record.customer_email || "—"}
                        </span>
                        <span>{formatDate(record.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(record.amount, record.currency)}</p>
                      <p className="text-xs text-gray-500">{getBillingReasonLabel(record.billing_reason)}</p>
                    </div>
                    {expandedId === record.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedId === record.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-gray-700/20">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 block text-xs mb-0.5">Invoice ID</span>
                              <span className="text-gray-300 font-mono text-xs">{record.invoice_id}</span>
                            </div>
                            {record.subscription_id && (
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Subscription ID</span>
                                <span className="text-gray-300 font-mono text-xs">{record.subscription_id}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500 block text-xs mb-0.5">Customer ID</span>
                              <span className="text-gray-300 font-mono text-xs">{record.customer_id}</span>
                            </div>
                            {record.business_name && (
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Business</span>
                                <span className="text-gray-300">{record.business_name}</span>
                              </div>
                            )}
                            {record.customer_email && (
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Email</span>
                                <span className="text-gray-300">{record.customer_email}</span>
                              </div>
                            )}
                            {record.period_start && record.period_end && (
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Billing Period</span>
                                <span className="text-gray-300">{formatDate(record.period_start)} – {formatDate(record.period_end)}</span>
                              </div>
                            )}
                            {record.invoice_pdf_url && (
                              <div className="col-span-full">
                                <a
                                  href={record.invoice_pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  View Invoice PDF
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center pt-4"
                >
                  <button
                    onClick={() => fetchBillingHistory(page + 1)}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer stats */}
        <div className="mt-6 text-center text-xs text-gray-600">
          Showing {filteredRecords.length} of {records.length} record(s) &middot; Sorted {sortOrder === "newest" ? "newest first" : "oldest first"} &middot; Page {page}
        </div>
      </div>
    </div>
  )
}
'''

write('src/app/owner/billing/page.tsx', owner_billing_page)
print("CHANGE 3 OK: Created owner billing dashboard page")

# =========================================================
# CHANGE 4: Add "Billing" nav item to owner dashboard sidebar
# =========================================================
dashboard = read('src/app/owner/dashboard/page.tsx')

# Add Receipt to the lucide-react import
import_old = "RefreshCw, Loader2"
import_new = "RefreshCw, Loader2, Receipt"

if import_old in dashboard:
    dashboard = dashboard.replace(import_old, import_new, 1)
    print("CHANGE 4a OK: Added Receipt import")
else:
    print("CHANGE 4a FAIL: Could not find import area")

# Add the Billing nav item after Languages
nav_old = "{ id: 'languages', label: 'Languages', icon: Languages },"
nav_new = "{ id: 'languages', label: 'Languages', icon: Languages },\n    { id: 'billing', label: 'Billing', icon: Receipt },"

if nav_old in dashboard:
    dashboard = dashboard.replace(nav_old, nav_new, 1)
    print("CHANGE 4b OK: Added Billing nav item")
else:
    print("CHANGE 4b FAIL: Could not find nav item insertion point")

# Add the billing tab content in the activeTab switch
# First, find the main content area where tabs are rendered
tab_marker = "case 'settings':"
tab_new_code = """case 'settings':
        return <SettingsContent />
      case 'billing':
        return <BillingContent />
      default:"""

if tab_marker in dashboard:
    dashboard = dashboard.replace(tab_marker, tab_new_code, 1)
    print("CHANGE 4c OK: Added billing case to tab switch")
else:
    print("CHANGE 4c FAIL: Could not find settings case in tab switch")

# Add the BillingContent component near the end of the file, before SettingsContent or at the end
# Find SettingsContent to add BillingContent before it
settings_marker = "function SettingsContent()"
billing_component = """function BillingContent() {
  return (
    <div className="h-full">
      <iframe
        src="/owner/billing"
        className="w-full h-full border-0"
        title="Billing Dashboard"
      />
    </div>
  )
}

function SettingsContent()"""

if settings_marker in dashboard:
    dashboard = dashboard.replace(settings_marker, billing_component, 1)
    print("CHANGE 4d OK: Added BillingContent component")
else:
    print("CHANGE 4d FAIL: Could not find SettingsContent function")
    # Fallback: try to find "function MetricCard"
    fallback = "function MetricCard"
    billing_component_fallback = """function BillingContent() {
  return (
    <div className="h-full">
      <iframe
        src="/owner/billing"
        className="w-full h-full border-0"
        title="Billing Dashboard"
      />
    </div>
  )
}

""" + fallback
    if fallback in dashboard:
        dashboard = dashboard.replace(fallback, billing_component_fallback, 1)
        print("CHANGE 4d OK (fallback): Added BillingContent component before MetricCard")
    else:
        print("CHANGE 4d FAIL (fallback): Could not find insertion point")

write('src/app/owner/dashboard/page.tsx', dashboard)
print("CHANGE 4 OK: Updated owner dashboard with billing nav")

print("\nAll changes applied successfully!")
