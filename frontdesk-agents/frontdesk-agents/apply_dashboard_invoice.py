import sys
import re

path = sys.argv[1]

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# ============================================================
# 1. ADD IMPORTS after recharts import (line 15)
# ============================================================
old_imports = """} from 'recharts'

const LANGUAGES"""
new_imports = """} from 'recharts'
import { useToast } from "@/components/ToastProvider"
import type { BillingRecordWithCustomer } from "@/lib/supabase"

const LANGUAGES"""

if old_imports in content:
    content = content.replace(old_imports, new_imports, 1)
    print('OK: Added imports')
else:
    print('FAIL: Could not add imports')

# ============================================================
# 2. ADD STATE DECLARATIONS after selectedCustomer state
# ============================================================
old_state = """  const [selectedCustomer, setSelectedCustomer] = useState<DashboardData['health']['customers'][0] | null>(null)

  const fetchDashboard"""

new_state = """  const [selectedCustomer, setSelectedCustomer] = useState<DashboardData['health']['customers'][0] | null>(null)
  const [recentRecords, setRecentRecords] = useState<BillingRecordWithCustomer[]>([])
  const [recentInvoicesLoading, setRecentInvoicesLoading] = useState(false)
  const [sendingState, setSendingState] = useState<Record<string, { status: "idle" | "sending" }>>({})
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null)

  const fetchDashboard"""

if old_state in content:
    content = content.replace(old_state, new_state, 1)
    print('OK: Added state declarations')
else:
    print('FAIL: Could not add state declarations')

# ============================================================
# 3. ADD fetchRecentInvoices after fetchDashboard
# ============================================================
# First find the fetchDashboard ending and the closing brace of the useCallback
old_fetch = """    }
  }, [])

  const tabIcons"""

new_fetch = """    }
  }, [])

  const { success, error: toastError } = useToast()

  const fetchRecentInvoices = useCallback(async () => {
    setRecentInvoicesLoading(true)
    try {
      const res = await fetch('/api/owner/billing?page=1&limit=5')
      const json = await res.json()
      if (json.records) {
        setRecentRecords(json.records)
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
  }, [])

  const tabIcons"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch, 1)
    print('OK: Added fetchRecentInvoices, useToast, and sendInvoice')
else:
    print('FAIL: Could not add fetchRecentInvoices')

# ============================================================
# 4. ADD "Recent Invoices" section to Overview tab
# Insert before the closing of the overview tab:   </>  )}
# ============================================================
# Find the overview tab end pattern
old_overview_end = """                </div>
              </div>
            </div>
          </>
        )"""

recent_invoices_section = """                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Invoices</h3>
              {recentInvoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : recentRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No recent invoices found.
                </div>
              ) : (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-medium">Invoice</th>
                        <th className="text-left px-4 py-3 font-medium">Customer</th>
                        <th className="text-left px-4 py-3 font-medium">Amount</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-right px-4 py-3 font-medium">Action</th>
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
                              rec.status === 'succeeded' ? 'bg-green-500/10 text-green-400' :
                              rec.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                              rec.status === 'refunded' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-red-500/10 text-red-400'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setConfirmSendId(rec.id)}
                              disabled={sendingState[rec.id]?.status === "sending"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                            >
                              {sendingState[rec.id]?.status === "sending" ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Sending</>
                              ) : (
                                <><Mail className="w-3 h-3" /> Send Invoice</>
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
        )"""

if old_overview_end in content:
    content = content.replace(old_overview_end, recent_invoices_section, 1)
    print('OK: Added Recent Invoices section')
else:
    print('FAIL: Could not add Recent Invoices section')

# ============================================================
# 5. ADD confirmation dialog before the tab closing
# Find:     case 'billing':
# This is right before the BillingContent is shown
# ============================================================
# The confirmation dialog should be placed before the tab switching logic
# Let me find a good spot - right before the tab content switch
old_dialog_location = """          {activeTab === 'overview'"""
new_dialog_location = """          {/* Send Invoice Confirmation Dialog */}
      {confirmSendId && (() => {
        const rec = recentRecords.find((r) => r.id === confirmSendId)
        if (!rec) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmSendId(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Send Invoice</h3>
                  <p className="text-sm text-gray-400">This will email the invoice PDF to the customer</p>
                </div>
              </div>

              <div className="space-y-2 mb-6 p-3 bg-gray-800/50 rounded-lg text-sm">
                {rec.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer</span>
                    <span className="text-white font-medium">{rec.customer_name}</span>
                  </div>
                )}
                {rec.business_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Business</span>
                    <span className="text-white">{rec.business_name}</span>
                  </div>
                )}
                {rec.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email to</span>
                    <span className="text-white">{rec.customer_email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-medium">
                    {rec.currency === 'usd' ? '$' : rec.currency + ' '}{(rec.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice</span>
                  <span className="text-white font-mono text-xs">{rec.invoice_id}</span>
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
                  onClick={() => sendInvoice(rec)}
                  disabled={sendingState[confirmSendId]?.status === "sending"}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {sendingState[confirmSendId]?.status === "sending" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send Invoice</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

          {activeTab === 'overview'"""

if old_dialog_location in content:
    content = content.replace(old_dialog_location, new_dialog_location, 1)
    print('OK: Added confirmation dialog')
else:
    print('FAIL: Could not add confirmation dialog')

if content != original:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: File written')
else:
    print('SKIPPED: No changes made')
