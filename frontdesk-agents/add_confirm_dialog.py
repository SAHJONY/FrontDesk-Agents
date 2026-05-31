import os

base = os.getcwd()
path = os.path.join(base, 'src', 'app', 'owner', 'billing', 'page.tsx')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# 1. Add confirmSendId state after sendingState
old_state = 'const [sendingState, setSendingState] = useState<Record<string, { status: "idle" | "sending" | "sent" | "error"; message?: string }>>({})'
new_state = old_state + '\n  const [confirmSendId, setConfirmSendId] = useState<string | null>(null)'

if old_state in content:
    content = content.replace(old_state, new_state, 1)
    print('Step 1 OK: Added confirmSendId state')
else:
    print('Step 1 FAIL: Could not find sendingState line')

# 2. Add sendInvoice helper after timeoutRef line
old_helper = 'const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)\n\n  const fetchBillingHistory'

new_helper_lines = [
    'const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)',
    '',
    '  const sendInvoice = useCallback(async (recordId: string) => {',
    '    const rec = records.find((r) => r.id === recordId)',
    '    if (!rec) return',
    '    setSendingState((prev) => ({ ...prev, [recordId]: { status: "sending" } }))',
    '    try {',
    "      const res = await fetch('/api/billing/send-invoice', {",
    "        method: 'POST',",
    "        headers: { 'Content-Type': 'application/json' },",
    '        body: JSON.stringify({ invoiceId: rec.invoice_id }),',
    '      })',
    '      const json = await res.json()',
    '      setSendingState((prev) => ({ ...prev, [recordId]: json.success ? { status: "sent" } : { status: "error", message: json.error || "Sending failed" } }))',
    '      clearTimeout(timeoutRef.current)',
    '      timeoutRef.current = setTimeout(() => {',
    '        setSendingState((prev) => ({ ...prev, [recordId]: { status: "idle" } }))',
    '      }, json.success ? 2500 : 4000)',
    '      if (json.success) setConfirmSendId(null)',
    '    } catch {',
    '      setSendingState((prev) => ({ ...prev, [recordId]: { status: "error", message: "Network error. Please try again." } }))',
    '      clearTimeout(timeoutRef.current)',
    '      timeoutRef.current = setTimeout(() => {',
    '        setSendingState((prev) => ({ ...prev, [recordId]: { status: "idle" } }))',
    '      }, 4000)',
    '    }',
    '  }, [records])',
]
new_helper = '\n'.join(new_helper_lines)

if old_helper in content:
    content = content.replace(old_helper, new_helper, 1)
    print('Step 2 OK: Added sendInvoice helper')
else:
    print('Step 2 FAIL: Could not find timeoutRef location')

# 3. Replace the button's onClick to set confirmSendId instead of directly sending
old_onclick = '''onClick={async () => {
                                      setSendingState((prev) => ({ ...prev, [record.id]: { status: "sending" } }))
                                      try {
                                        const res = await fetch('/api/billing/send-invoice', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ invoiceId: record.invoice_id }),
                                        })
                                        const json = await res.json()
                                        setSendingState((prev) => ({ ...prev, [record.id]: json.success ? { status: "sent" } : { status: "error", message: json.error || "Sending failed" } }))
                                        clearTimeout(timeoutRef.current)
                                          timeoutRef.current = setTimeout(() => {
                                            setSendingState((prev) => ({ ...prev, [record.id]: { status: "idle" } }))
                                          }, json.success ? 2500 : 4000)
                                      } catch {
                                        setSendingState((prev) => ({ ...prev, [record.id]: { status: "error", message: "Network error. Please try again." } }))
                                        clearTimeout(timeoutRef.current)
                                          timeoutRef.current = setTimeout(() => {
                                            setSendingState((prev) => ({ ...prev, [record.id]: { status: "idle" } }))
                                          }, 4000)
                                      }
                                    }}'''

new_onclick = 'onClick={() => setConfirmSendId(record.id)}'

if old_onclick in content:
    content = content.replace(old_onclick, new_onclick, 1)
    print('Step 3 OK: Replaced button onClick to show confirm dialog')
else:
    # Try alternate indentation (one less indent)
    alt_onclick = old_onclick.replace('                                      ', '                                    ')
    if alt_onclick in content:
        content = content.replace(alt_onclick, new_onclick, 1)
        print('Step 3 OK: Replaced with alt indentation')
    else:
        print('Step 3 FAIL: Could not find old onClick handler')

# 4. Add the confirmation dialog modal before the component closing
old_end = '''        <div className="mt-6 text-center text-xs text-gray-600">
          Showing {filteredRecords.length} of {records.length} record(s) &middot; Sorted {sortOrder === "newest" ? "newest first" : "oldest first"} &middot; Page {page}
        </div>
      </div>
    </div>
  )
}

export default function OwnerBillingPage() {'''

modal = '''
      {/* Confirmation dialog */}
      {confirmSendId && (() => {
        const rec = filteredRecords.find((r) => r.id === confirmSendId)
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
                  <span className="text-white font-medium">{formatCurrency(rec.amount, rec.currency)}</span>
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
                  onClick={() => sendInvoice(confirmSendId)}
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

              {sendingState[confirmSendId]?.status === "error" && (
                <p className="mt-3 text-xs text-red-400 text-center">{sendingState[confirmSendId]?.message}</p>
              )}
              {sendingState[confirmSendId]?.status === "sent" && (
                <p className="mt-3 text-xs text-green-400 text-center flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Invoice sent successfully!
                </p>
              )}
            </div>
          </div>
        )
      })()}
'''

new_end = modal + old_end

if old_end in content:
    content = content.replace(old_end, new_end, 1)
    print('Step 4 OK: Added confirmation dialog modal')
else:
    print('Step 4 FAIL: Could not find component end pattern')

if content != original:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'All changes applied ({len(original)} -> {len(content)} bytes)')
else:
    print('No changes were made!')
print('Done')
