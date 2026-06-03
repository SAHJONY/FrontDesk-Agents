"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useToast } from "@/components/ToastProvider"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Download, RefreshCw, DollarSign, Calendar,
  FileText, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Search, Building2, Mail,
  Loader2, Receipt, TrendingUp, Users,
} from "lucide-react"
import Link from "next/link"

import type { BillingRecordWithCustomer } from "@/lib/supabase"
import SendInvoiceDialog from "@/components/SendInvoiceDialog"

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
      return <XCircle className="w-5 h-5 text-cinematic-red" />
    case "refunded":
      return <Clock className="w-5 h-5 text-hollywood-gold" />
    case "pending":
      return <Loader2 className="w-5 h-5 text-aurora-cyan animate-spin" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "succeeded":
      return "text-green-400 bg-green-500/10 border-green-500/20"
    case "failed":
      return "text-cinematic-red bg-cinematic-red/10 border-cinematic-red/20"
    case "refunded":
      return "text-hollywood-gold bg-hollywood-gold/10 border-hollywood-gold/20"
    case "pending":
      return "text-aurora-cyan bg-aurora-cyan/10 border-blue-500/20"
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
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function OwnerBillingPageInner() {
  const searchParams = useSearchParams()
  const embedded = searchParams.get("embedded") === "true"
  const [records, setRecords] = useState<BillingRecordWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sendingState, setSendingState] = useState<Record<string, { status: "idle" | "sending" | "sent" | "error"; message?: string }>>({})
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { success, error: toastError } = useToast()

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

  // Cleanup timeout refs on unmount
  useEffect(() => {
    const timer = timeoutRef.current
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

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

    const csv = [headers.map(csvEscape).join(","), ...rows.join("\n")].join("\n")
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
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-aurora-cyan animate-spin mx-auto mb-4 drop-shadow-glow" />
          <p className="text-gray-400 text-sm">Loading all billing records...</p>
        </div>
      </div>
    )
  }

  if (error && records.length === 0) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-cinematic-red mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchBillingHistory(1)}
            className="px-6 py-2.5 bg-aurora-cyan hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header - only show when NOT embedded in dashboard iframe */}
        {!embedded && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/owner/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105 active:scale-95 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/5 border border-aurora-cyan/20">
                  <Receipt className="w-6 h-6 text-aurora-cyan" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-white via-aurora-cyan/60 to-white bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">All Billing History</h1>
                  <p className="text-sm text-gray-400">View billing records across all customers</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchBillingHistory(1)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105 active:scale-95 rounded-lg transition-all duration-200"
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
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400 animate-float" style={{ animationDelay: "0s" }} />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold font-display bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">{formatCurrency(totalRevenue, "usd")}</p>
            <p className="text-xs text-gray-500 mt-1">From {records.filter(r => r.status === "succeeded").length} successful payments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-aurora-cyan animate-float" style={{ animationDelay: "0.3s" }} />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Customers</span>
            </div>
            <p className="text-2xl font-bold font-display bg-gradient-to-r from-aurora-cyan/80 via-aurora-cyan to-aurora-cyan/80 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">{uniqueCustomers}</p>
            <p className="text-xs text-gray-500 mt-1">With billing activity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-aurora-cyan animate-float" style={{ animationDelay: "0.6s" }} />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white font-display">{records.length}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredRecords.length} shown with filters</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-cinematic-red animate-float" style={{ animationDelay: "0.9s" }} />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Failed</span>
            </div>
            <p className="text-2xl font-bold text-white font-display">{failedCount}</p>
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
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] backdrop-blur-lg border border-white/[0.08] rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/40 focus:border-aurora-cyan/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px] pl-8 pr-2 py-2.5 bg-white/[0.05] backdrop-blur-lg border border-white/[0.08] rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/40 focus:border-aurora-cyan/50 transition-all [color-scheme:dark]"
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
                className="w-[140px] pl-8 pr-2 py-2.5 bg-white/[0.05] backdrop-blur-lg border border-white/[0.08] rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/40 focus:border-aurora-cyan/50 transition-all [color-scheme:dark]"
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
                    ? "bg-aurora-cyan text-white animate-glow shadow-lg shadow-blue-500/20"
                    : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-300"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] backdrop-blur-lg border border-white/[0.08] rounded-lg text-sm text-gray-400 hover:text-gray-300 transition-colors"
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
                  className="rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] overflow-hidden hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.05] active:bg-white/[0.08] active:scale-[0.99] transition-all duration-200 text-left"
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
                              ? "text-cinematic-red border-red-500/20 bg-red-500/5"
                              : record.status === "refunded"
                                ? "text-hollywood-gold border-yellow-500/20 bg-yellow-500/5"
                                : "text-aurora-cyan border-blue-500/20 bg-aurora-cyan/5"
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
                                <div className="flex items-center gap-3">
                                  <a
                                    href={record.invoice_pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-aurora-cyan hover:text-blue-300 transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    View Invoice PDF
                                  </a>
                                  <button
                                    onClick={() => setConfirmSendId(record.id)}
                                    disabled={sendingState[record.id]?.status === "sending"}
                                    className={`inline-flex items-center gap-1 text-xs transition-colors ${
                                      sendingState[record.id]?.status === "sending"
                                        ? "text-gray-500 opacity-60 cursor-not-allowed"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                    title="Send invoice to customer's email"
                                  >
                                    {sendingState[record.id]?.status === "sending" ? (
                                      <><Loader2 className="w-3.5 h-3.5 animate-spin drop-shadow-glow" /> Sending...</>
                                    ) : (
                                      <><Mail className="w-3.5 h-3.5" /> Send Invoice</>
                                    )}
                                  </button>
                                </div>
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
                        <Loader2 className="w-4 h-4 animate-spin drop-shadow-glow" />
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

      {/* Confirmation dialog */}
      {confirmSendId && (() => {
        const rec = filteredRecords.find((r) => r.id === confirmSendId)
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
        <div className="mt-6 text-center text-xs text-gray-500">
          Showing {filteredRecords.length} of {records.length} record(s) &middot; Sorted {sortOrder === "newest" ? "newest first" : "oldest first"} &middot; Page {page}
        </div>
      </div>
    </div>
  )
}

export default function OwnerBillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-aurora-cyan animate-spin mx-auto mb-4 drop-shadow-glow" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <OwnerBillingPageInner />
    </Suspense>
  )
}
