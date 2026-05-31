"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/components/ToastProvider"
import { motion, AnimatePresence } from "framer-motion"
import type { BillingRecord } from "@/lib/supabase"
import {
  ArrowLeft, Download, RefreshCw, DollarSign, Calendar,
  FileText, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Mail, Search,
  Loader2, Receipt,
} from "lucide-react"
import Link from "next/link"

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

function getStatusIcon(status: BillingRecord["status"]) {
  switch (status) {
    case "succeeded":
      return CheckCircle
    case "failed":
      return XCircle
    case "refunded":
      return AlertCircle
    case "pending":
      return Clock
  }
}

function getStatusColor(status: BillingRecord["status"]) {
  switch (status) {
    case "succeeded":
      return "text-green-400 bg-green-500/10 border-green-500/20"
    case "failed":
      return "text-red-400 bg-red-500/10 border-red-500/20"
    case "refunded":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    case "pending":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20"
  }
}

function getBillingReasonLabel(reason: string | null) {
  const labels: Record<string, string> = {
    subscription_create: "Subscription Created",
    subscription_cycle: "Monthly Renewal",
    subscription_update: "Plan Changed",
    subscription_threshold: "Usage Threshold",
    invoice: "Invoice",
  }
  return reason ? labels[reason] || reason.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Payment"
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export default function BillingDashboardPage() {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<BillingRecord["status"] | "all">("all")
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

  const fetchBillingHistory = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/billing/history?page=${pageNum}&limit=25`)
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Failed to load billing history")
      }
      if (pageNum === 1) {
        setRecords(json.data || [])
      } else {
        setRecords((prev) => [...prev, ...(json.data || [])])
      }
      setHasMore(json.pagination?.hasMore || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing history")
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
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.description.toLowerCase().includes(q) ||
          r.invoice_id.toLowerCase().includes(q) ||
          r.subscription_id?.toLowerCase().includes(q) ||
          formatCurrency(r.amount, r.currency).toLowerCase().includes(q)
        )
      }
      if (startDate && new Date(r.created_at) < new Date(startDate)) return false
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (new Date(r.created_at) > endOfDay) return false
      }
      return true
    })

    .sort((a, b) => {
      const d = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortOrder === "newest" ? -d : d
    })

  const totalPaid = records
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + r.amount, 0)

  const latestPayment = records.find((r) => r.status === "succeeded")

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading billing history...</p>
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

  const exportCSV = () => {
    const headers = ["Date", "Description", "Amount", "Currency", "Status", "Invoice ID", "Reason"]
    const rows = filteredRecords.map((r) => [
      formatDate(r.created_at),
      csvEscape(r.description),
      (r.amount / 100).toFixed(2),
      r.currency.toUpperCase(),
      r.status,
      csvEscape(r.invoice_id),
      getBillingReasonLabel(r.billing_reason),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `billing-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/customer/dashboard"
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Billing History</h1>
              <p className="text-sm text-gray-400 mt-1">
                View your payment history and invoices
              </p>
            </div>
          </div>
          <button
            onClick={exportCSV}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalPaid, "usd")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {records.filter((r) => r.status === "succeeded").length} successful payment(s)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Latest Payment</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {latestPayment ? formatCurrency(latestPayment.amount, latestPayment.currency) : "$0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {latestPayment ? formatDate(latestPayment.created_at) : "No payments yet"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Receipt className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white">{records.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {records.length > 0 ? `${records.filter(r => r.status === "succeeded").length} succeeded, ${records.filter(r => r.status === "failed").length} failed` : "No records"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-gray-400">Active Filters</span>
            </div>
            <p className="text-2xl font-bold text-white">{filteredRecords.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {statusFilter !== "all" ? `Filtered by: ${statusFilter}` : "Showing all statuses"}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by description, invoice ID..."
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
              <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-1">
                {records.length === 0 ? "No billing history yet" : "No records match your filters"}
              </h3>
              <p className="text-sm text-gray-600">
                {records.length === 0
                  ? "Your payment history will appear here once you make a payment."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record, index) => {
                const StatusIcon = getStatusIcon(record.status)
                const isExpanded = expandedId === record.id
                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-xl border border-gray-800/80 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/30 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg border ${getStatusColor(record.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {record.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(record.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(record.amount, record.currency)}
                        </p>
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
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-gray-800/50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Invoice ID</p>
                                <p className="text-gray-300 font-mono text-xs">{record.invoice_id}</p>
                              </div>
                              {record.subscription_id && (
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Subscription</p>
                                  <p className="text-gray-300 font-mono text-xs">{record.subscription_id}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Billing Reason</p>
                                <p className="text-gray-300 text-xs">{getBillingReasonLabel(record.billing_reason)}</p>
                              </div>
                              {record.period_start && record.period_end && (
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Period</p>
                                  <p className="text-gray-300 text-xs">{formatDate(record.period_start)} — {formatDate(record.period_end)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Date</p>
                                <p className="text-gray-300 text-xs">{formatDate(record.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Amount</p>
                                <p className="text-gray-300 text-xs">{formatCurrency(record.amount, record.currency)}</p>
                              </div>
                              {record.invoice_pdf_url && (
                                <div className="col-span-full">
                                  <div className="flex items-center gap-3">
                                    <a href={record.invoice_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-xs">
                                      <FileText className="w-3.5 h-3.5" />
                                      View Invoice PDF
                                    </a>
                                    <button
                                      onClick={() => setConfirmSendId(record.id)}
                                      disabled={sendingState[record.id]?.status === "sending"}
                                      className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                                        sendingState[record.id]?.status === "sending"
                                          ? "text-gray-500 opacity-60 cursor-not-allowed"
                                          : "text-gray-400 hover:text-white"
                                      }`}
                                    >
                                      {sendingState[record.id]?.status === "sending" ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                                      ) : (
                                        <><Mail className="w-3.5 h-3.5" /> Email Invoice</>
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
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const nextPage = page + 1
                setPage(nextPage)
                fetchBillingHistory(nextPage)
              }}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-40"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

          {/* Confirmation dialog */}
      {confirmSendId && (() => {
        const rec = records.find((r) => r.id === confirmSendId)
        if (!rec) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmSendId(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Invoice</h3>
                  <p className="text-sm text-gray-400">The invoice PDF will be sent to your email on file</p>
                </div>
              </div>

              <div className="space-y-2 mb-6 p-3 bg-gray-800/50 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice</span>
                  <span className="text-white font-mono text-xs">{rec.invoice_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-medium">{formatCurrency(rec.amount, rec.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white capitalize">{rec.status}</span>
                </div>
                {rec.description && (
                  <div className="pt-1 border-t border-gray-700/50 text-gray-300 text-xs line-clamp-2">{rec.description}</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmSendId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setSendingState((prev) => ({ ...prev, [confirmSendId]: { status: "sending" } }))
                    try {
                      const res = await fetch('/api/billing/send-invoice', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invoiceId: rec.invoice_id }),
                      })
                      const json = await res.json()
                      setSendingState((prev) => ({ ...prev, [confirmSendId]: { status: "idle" } }))
                      if (json.success) {
                        setConfirmSendId(null)
                        success("Invoice Sent", "Invoice " + rec.invoice_id + " has been emailed successfully.")
                      } else {
                        toastError("Sending Failed", json.error || "Failed to send invoice.")
                      }
                    } catch {
                      setSendingState((prev) => ({ ...prev, [confirmSendId]: { status: "idle" } }))
                      toastError("Network Error", "Please try again.")
                    }
                  }}
                  disabled={sendingState[confirmSendId]?.status === "sending"}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {sendingState[confirmSendId]?.status === "sending" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Email Invoice</>
                  )}
                </button>
              </div>

            </div>
          </div>
        )
      })()}
                  <p className="text-center text-xs text-gray-600 mt-6">
          {filteredRecords.length} of {records.length} record(s) shown
        </p>
      </div>
    </div>
  )
}
