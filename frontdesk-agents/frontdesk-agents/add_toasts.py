import os

# The project root from the tree
base_dir = '/c/Users/juani/frontdesk-agents/frontdesk-agents/src/app'

# ============================================================
# OWNER BILLING PAGE
# ============================================================
owner_path = base_dir + '/owner/billing/page.tsx'

with open(owner_path, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Step 1: Add useToast import
old_imports = 'import { useState, useEffect, useCallback, useRef, Suspense } from "react"'
new_imports = 'import { useState, useEffect, useCallback, useRef, Suspense } from "react"\nimport { useToast } from "@/components/ToastProvider"'

if old_imports in content:
    content = content.replace(old_imports, new_imports, 1)
    print("OWNER OK: Added useToast import")
else:
    print("OWNER FAIL: Could not find imports")

# Step 2: Replace full sendInvoice function
old_send = '''  const sendInvoice = useCallback(async (rec: { id: string; invoice_id: string; amount: number; currency: string }) => {
    setSendingState((prev) => ({ ...prev, [rec.id]: { status: "sending" } }))
    try {
      const res = await fetch('/api/billing/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: rec.invoice_id }),
      })
      const json = await res.json()
      setSendingState((prev) => ({ ...prev, [rec.id]: json.success ? { status: "sent" } : { status: "error", message: json.error || "Sending failed" } }))
      if (json.success) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setConfirmSendId(null)
          setSendingState((prev) => ({ ...prev, [rec.id]: { status: "idle" } }))
        }, 1200)
      } else {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setSendingState((prev) => ({ ...prev, [rec.id]: { status: "idle" } }))
        }, 4000)
      }
    } catch {
      setSendingState((prev) => ({ ...prev, [rec.id]: { status: "error", message: "Network error. Please try again." } }))
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setSendingState((prev) => ({ ...prev, [rec.id]: { status: "idle" } }))
      }, 4000)
    }
  }, [])'''

new_send = '''  const sendInvoice = useCallback(async (rec: { id: string; invoice_id: string; amount: number; currency: string }) => {
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
        error("Sending Failed", json.error || "Failed to send invoice.")
      }
    } catch {
      setSendingState((prev) => ({ ...prev, [rec.id]: { status: "idle" } }))
      error("Network Error", "Please try again.")
    }
  }, [])'''

if old_send in content:
    content = content.replace(old_send, new_send, 1)
    print("OWNER OK: Replaced sendInvoice function")
else:
    print("OWNER FAIL: Could not find sendInvoice function - checking...")
    idx = content.find("const sendInvoice = useCallback")
    if idx >= 0:
        print("  Found sendInvoice declaration")
    else:
        print("  sendInvoice not found!")

# Step 3: Add { success, error } = useToast() after timeoutRef
old_toast_ins = '  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)\n\n  const sendInvoice'
new_toast_ins = '  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)\n  const { success, error } = useToast()\n\n  const sendInvoice'

if old_toast_ins in content:
    content = content.replace(old_toast_ins, new_toast_ins, 1)
    print("OWNER OK: Added useToast destructuring")
else:
    print("OWNER FAIL: Could not find insertion point for useToast")

# Step 4: Simplify the button rendering - remove sent/error states
old_button = '''                      {sendingState[record.id]?.status === "sending" ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : sendingState[record.id]?.status === "sent" ? (
                        <div className="flex items-center gap-1.5 text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Sent!</span>
                        </div>
                      ) : sendingState[record.id]?.status === "error" ? (
                        <div className="flex items-center gap-1.5 text-red-400">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{sendingState[record.id]?.message || "Failed"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Invoice</span>
                        </div>
                      )}'''

new_button = '''                      {sendingState[record.id]?.status === "sending" ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Invoice</span>
                        </div>
                      )}'''

if old_button in content:
    content = content.replace(old_button, new_button, 1)
    print("OWNER OK: Simplified button content")
else:
    print("OWNER FAIL: Could not find button content pattern")

# Step 5: Simplify button className
old_class = '''                    className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      sendingState[record.id]?.status === "sending"
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                        : sendingState[record.id]?.status === "sent"
                        ? "bg-green-900/20 text-green-400 border border-green-500/30"
                        : sendingState[record.id]?.status === "error"
                        ? "bg-red-900/20 text-red-400 border border-red-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50"
                    }`}'''

new_class = '''                    className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      sendingState[record.id]?.status === "sending"
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50"
                    }`}'''

if old_class in content:
    content = content.replace(old_class, new_class, 1)
    print("OWNER OK: Simplified button className")
else:
    print("OWNER FAIL: Could not find button className pattern")

# Step 6: Remove dialog inline feedback
old_dialog = '''                    {sendingState[confirmSendId]?.status === "error" && (
                      <p className="mt-3 text-xs text-red-400">{sendingState[confirmSendId]?.message}</p>
                    )}
                    {sendingState[confirmSendId]?.status === "sent" && (
                      <p className="mt-3 text-xs text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Invoice sent successfully!
                      </p>
                    )}'''

if old_dialog in content:
    content = content.replace(old_dialog, "", 1)
    print("OWNER OK: Removed dialog inline feedback")
else:
    print("OWNER FAIL: Could not find dialog feedback pattern")

# Save
if content != original:
    with open(owner_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("\nOWNER: Changes saved.")
else:
    print("\nOWNER: No changes to save.")


# ============================================================
# CUSTOMER BILLING PAGE
# ============================================================
customer_path = base_dir + '/customer/billing/page.tsx'

with open(customer_path, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Step 1: Add useToast import
old_imports = 'import { useState, useEffect, useCallback, useRef } from "react"'
new_imports = 'import { useState, useEffect, useCallback, useRef } from "react"\nimport { useToast } from "@/components/ToastProvider"'

if old_imports in content:
    content = content.replace(old_imports, new_imports, 1)
    print("CUSTOMER OK: Added useToast import")
else:
    print("CUSTOMER FAIL: Could not find imports")

# Step 2: Add { success, error } = useToast() after timeoutRef
old_toast_ins = '  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)\n\n  const filteredRecords'
new_toast_ins = '  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)\n  const { success, error } = useToast()\n\n  const filteredRecords'

if old_toast_ins in content:
    content = content.replace(old_toast_ins, new_toast_ins, 1)
    print("CUSTOMER OK: Added useToast destructuring")
else:
    print("CUSTOMER FAIL: Could not find insertion point")

# Step 3: Replace onClick handler
old_click = '''                      onClick={async () => {
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

new_click = '''                      onClick={async () => {
                        setSendingState((prev) => ({ ...prev, [record.id]: { status: "sending" } }))
                        try {
                          const res = await fetch('/api/billing/send-invoice', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ invoiceId: record.invoice_id }),
                          })
                          const json = await res.json()
                          setSendingState((prev) => ({ ...prev, [record.id]: { status: "idle" } }))
                          if (json.success) {
                            success("Invoice Sent", "Invoice " + record.invoice_id + " has been emailed successfully.")
                          } else {
                            error("Sending Failed", json.error || "Failed to send invoice.")
                          }
                        } catch {
                          setSendingState((prev) => ({ ...prev, [record.id]: { status: "idle" } }))
                          error("Network Error", "Please try again.")
                        }
                      }}'''

if old_click in content:
    content = content.replace(old_click, new_click, 1)
    print("CUSTOMER OK: Replaced onClick handler")
else:
    print("CUSTOMER FAIL: Could not find onClick handler")
    idx = content.find("setSendingState((prev) => ({ ...prev, [record.id]: json.success")
    if idx >= 0:
        print("  Found partial match for onClick")
    else:
        print("  Pattern not found")

# Step 4: Simplify button content
old_cust_btn = '''                      ) : sendingState[record.id]?.status === "sent" ? (
                        <div className="flex items-center gap-1.5 text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Sent!</span>
                        </div>
                      ) : sendingState[record.id]?.status === "error" ? (
                        <div className="flex items-center gap-1.5 text-red-400">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{sendingState[record.id]?.message || "Failed"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Invoice</span>
                        </div>
                      )}'''

new_cust_btn = '''                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Invoice</span>
                        </div>
                      )}'''

if old_cust_btn in content:
    content = content.replace(old_cust_btn, new_cust_btn, 1)
    print("CUSTOMER OK: Simplified button content")
else:
    print("CUSTOMER FAIL: Could not find button content pattern")

# Step 5: Simplify button className
old_cust_class = '''                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      sendingState[record.id]?.status === "sending"
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                        : sendingState[record.id]?.status === "sent"
                        ? "bg-green-900/20 text-green-400 border border-green-500/30"
                        : sendingState[record.id]?.status === "error"
                        ? "bg-red-900/20 text-red-400 border border-red-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50"
                    }`}'''

new_cust_class = '''                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      sendingState[record.id]?.status === "sending"
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50"
                    }`}'''

if old_cust_class in content:
    content = content.replace(old_cust_class, new_cust_class, 1)
    print("CUSTOMER OK: Simplified button className")
else:
    print("CUSTOMER FAIL: Could not find button className pattern")

# Save
if content != original:
    with open(customer_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("\nCUSTOMER: Changes saved.")
else:
    print("\nCUSTOMER: No changes to save.")

print("\nDone!")
