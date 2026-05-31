import os, sys

base = '/c/Users/juani/frontdesk-agents/frontdesk-agents'

def read(path):
    with open(os.path.join(base, path), 'r') as f:
        return f.read()

def write(path, content):
    full = os.path.join(base, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content)

# 1. Add getBillingHistory() to supabase.ts after getCallHistory
content = read('src/lib/supabase.ts')

new_func = '''
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

'''

marker = '}\n\nexport async function getCustomerByStripeSubscriptionId'
if marker in content:
    content = content.replace(marker, '}' + new_func + 'export async function getCustomerByStripeSubscriptionId')
    write('src/lib/supabase.ts', content)
    print('1. Added getBillingHistory() to supabase.ts OK')
else:
    print('ERROR: Could not find insertion point')
    sys.exit(1)

# 2. Create API route
api_route = """import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { getBillingHistory } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)

    const billingHistory = await getBillingHistory(session.customerId, limit)

    return NextResponse.json({
      success: true,
      data: billingHistory,
      pagination: {
        page,
        limit,
        total: billingHistory.length,
      },
    })
  } catch (error) {
    console.error('Billing history fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing history' },
      { status: 500 }
    )
  }
}
"""

write('src/app/api/billing/history/route.ts', api_route)
print('2. Created API route src/app/api/billing/history/route.ts OK')

# 3. Create billing dashboard UI page
billing_page = '''"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Download, RefreshCw, DollarSign, Calendar,
  FileText, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Search, Filter,
  Loader2, Receipt, TrendingUp, TrendingDown, Minus,
} from "lucide-react"
import Link from "next/link"

interface BillingRecord {
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
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  })
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return "\u2014"
  return formatDate(start) + " \u2013 " + formatDate(end)
}

function getStatusIcon(status: string) {
  switch (status) {
    case "succeeded": return <CheckCircle className="w-4 h-4 text-emerald-400" />
    case "failed": return <XCircle className="w-4 h-4 text-red-400" />
    case "refunded": return <AlertCircle className="w-4 h-4 text-amber-400" />
    case "pending": return <Clock className="w-4 h-4 text-blue-400" />
    default: return <Minus className="w-4 h-4 text-gray-400" />
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }
  return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getBillingReasonLabel(reason: string | null): string {
  if (!reason) return "\u2014"
  const labels: Record<string, string> = {
    subscription_cycle: "Subscription Renewal",
    subscription_create: "New Subscription",
    subscription_update: "Subscription Update",
    invoice: "Manual Invoice",
    payment_success: "Payment",
  }
  return labels[reason] || reason.replace(/_/g, " ").replace(/\\b\\w/g, (c: string) => c.toUpperCase())
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={"relative overflow-hidden rounded-xl border " + color + " bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm p-5"}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50">{icon}</div>
      </div>
    </motion.div>
  )
}

export default function BillingDashboardPage() {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const fetchBillingHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/history")
      if (!res.ok) {
        if (res.status === 401) throw new Error("Not authenticated")
        throw new Error("Failed to fetch billing history")
      }
      const json = await res.json()
      setRecords(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBillingHistory() }, [fetchBillingHistory])

  const succeeded = records.filter(r => r.status === "succeeded")
  const totalPaid = succeeded.reduce((sum, r) => sum + r.amount, 0)
  const totalFailed = records.filter(r => r.status === "failed").length
  const pendingCount = records.filter(r => r.status === "pending").length
  const latestPayment = succeeded.length > 0 ? succeeded[0] : null

  let filtered = [...records]
  if (statusFilter !== "all") filtered = filtered.filter(r => r.status === statusFilter)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(r => r.description.toLowerCase().includes(q) || r.invoice_id.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
  }
  filtered.sort((a, b) => {
    return sortOrder === "newest"
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const exportCSV = () => {
    const headers = ["Date","Description","Invoice ID","Amount","Currency","Status","Billing Reason","Period"]
    const rows = records.map(r => [
      formatDate(r.created_at), r.description, r.invoice_id,
      (r.amount / 100).toFixed(2), r.currency.toUpperCase(),
      r.status, getBillingReasonLabel(r.billing_reason), formatPeriod(r.period_start, r.period_end),
    ])
    const csv = [headers.join(","), ...rows.map(r => r.map(v => '"' + v + '"').join(","))].join("\\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "billing-history-" + new Date().toISOString().split("T")[0] + ".csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/customer/dashboard"
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-colors group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Billing History</h1>
              <p className="text-sm text-gray-400 mt-1">View and manage your payment history</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBillingHistory} disabled={loading}
              className={"p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-colors disabled:opacity-50"}
              title="Refresh">
              <RefreshCw className={"w-4 h-4 text-gray-400 " + (loading ? "animate-spin" : "")} />
            </button>
            <button onClick={exportCSV} disabled={records.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-sm text-gray-300 transition-colors disabled:opacity-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="w-5 h-5 text-emerald-400" />} label="Total Paid" value={formatCurrency(totalPaid, "usd")} color="border-emerald-500/20" />
          <StatCard icon={<Receipt className="w-5 h-5 text-blue-400" />} label="Transactions" value={records.length.toString()} color="border-blue-500/20" />
          <StatCard icon={<XCircle className="w-5 h-5 text-red-400" />} label="Failed Payments" value={totalFailed.toString()} color="border-red-500/20" />
          <StatCard icon={<Clock className="w-5 h-5 text-amber-400" />} label="Pending" value={pendingCount.toString()} color="border-amber-500/20" />
        </div>

        {latestPayment && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/10 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-sm text-gray-400">Latest Payment</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(latestPayment.amount, latestPayment.currency)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{formatDate(latestPayment.created_at)}</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search invoices, descriptions..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700/50 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all">
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>
          <button onClick={() => setSortOrder(o => o === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700/50 text-sm text-gray-300 hover:border-gray-600/50 transition-all">
            <Calendar className="w-4 h-4" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
            {sortOrder === "newest" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
              <p className="text-sm text-gray-400">Loading billing history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <button onClick={fetchBillingHistory}
                className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors">Try Again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Receipt className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">{records.length === 0 ? "No billing records found" : "No records match your filters"}</p>
              {records.length > 0 && (
                <button onClick={() => { setSearchQuery(""); setStatusFilter("all") }}
                  className="mt-3 px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors">Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filtered.map((record, index) => (
                    <motion.tr key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(prev => prev === record.id ? null : record.id)}>
                      <td className="px-5 py-4">
                        <p className="text-sm text-white">{formatDate(record.created_at)}</p>
                        <p className="text-xs text-gray-500">{formatTime(record.created_at)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-200 max-w-[200px] truncate" title={record.description}>{record.description}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-400 font-mono">{record.invoice_id.slice(0, 12)}...</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={"text-sm font-semibold " + (record.status === "refunded" ? "text-amber-400" : record.status === "failed" ? "text-red-400" : "text-white")}>
                          {formatCurrency(record.amount, record.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(record.status)}
                          <span className={"text-xs font-medium px-2 py-0.5 rounded-full border " + getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {expandedId === record.id
                          ? <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                          : <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <AnimatePresence>
                {expandedId && (() => {
                  const record = records.find(r => r.id === expandedId)!
                  return (
                    <motion.div key={"details-" + expandedId}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-800/50">
                      <div className="px-5 py-6 bg-gray-800/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</p>
                            <p className="text-sm text-gray-200 font-mono">{record.invoice_id}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription ID</p>
                            <p className="text-sm text-gray-200 font-mono">{record.subscription_id || "\u2014"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Reason</p>
                            <p className="text-sm text-gray-200">{getBillingReasonLabel(record.billing_reason)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</p>
                            <p className="text-sm text-gray-200 uppercase">{record.currency}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Period</p>
                            <p className="text-sm text-gray-200">{formatPeriod(record.period_start, record.period_end)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</p>
                            <p className="text-sm text-gray-200">{formatDate(record.created_at)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice PDF</p>
                            {record.invoice_pdf_url ? (
                              <a href={record.invoice_pdf_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                onClick={e => e.stopPropagation()}>
                                <ExternalLink className="w-3.5 h-3.5" /> View PDF
                              </a>
                            ) : <p className="text-sm text-gray-500">\u2014</p>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })()}
              </AnimatePresence>
            </div>
          )}
        </div>

        {records.length > 0 && !loading && (
          <p className="text-xs text-gray-600 mt-4 text-center">
            Showing {filtered.length} of {records.length} billing records
            {statusFilter !== "all" && " (filtered by: " + statusFilter + ")"}
          </p>
        )}
      </div>
    </div>
  )
}
'''

write('src/app/customer/billing/page.tsx', billing_page)
print('3. Created billing dashboard page src/app/customer/billing/page.tsx OK')
print('All changes applied successfully!')
