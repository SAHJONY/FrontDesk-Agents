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

# =============================================================
# FIX 1: API route — use stripe.client.invoices.sendInvoice()
# =============================================================
api_path = 'src/app/api/billing/send-invoice/route.ts'
api = read(api_path)

old_stripe_call = "await stripe.invoices.sendInvoice(invoiceId)"
new_stripe_call = "await stripe.client.invoices.sendInvoice(invoiceId)"

if old_stripe_call in api:
    api = api.replace(old_stripe_call, new_stripe_call, 1)
    write(api_path, api)
    print("FIX 1 OK: stripe.client.invoices.sendInvoice()")
else:
    print("FIX 1 FAIL: Could not find stripe.invoices.sendInvoice")

# =============================================================
# FIX 2: Owner billing page — use React state instead of DOM manipulation
# =============================================================
owner = read('src/app/owner/billing/page.tsx')

# Add sendingState to the state declarations
old_states = """  const [hasMore, setHasMore] = useState(false)
  const [startDate, setStartDate] = useState(\"\")"""

new_states = """  const [hasMore, setHasMore] = useState(false)
  const [sendingState, setSendingState] = useState<Record<string, \"idle\" | \"sending\" | \"sent\" | \"error\">>({})
  const [startDate, setStartDate] = useState(\"\")"""

if old_states in owner:
    owner = owner.replace(old_states, new_states, 1)
    print("FIX 2a OK: Added sendingState to owner page")
else:
    print("FIX 2a FAIL: Could not find state declarations")

# Replace the inline DOM manipulation button with a React state-based button
old_send_button = """                                  <button
                                    onClick={async () => {
                                      // Store original text temporarily
                                      const btn = (event.target as HTMLElement).closest('button')
                                      if (btn) {
                                        const originalHTML = btn.innerHTML
                                        btn.innerHTML = '<span class=\"flex items-center gap-1\"><svg class=\"animate-spin w-3 h-3\" viewBox=\"0 0 24 24\" fill=\"none\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"/><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z\"/></svg> Sending...</span>'
                                        btn.setAttribute('disabled', 'true')
                                        try {
                                          const res = await fetch('/api/billing/send-invoice', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ invoiceId: record.invoice_id }),
                                          })
                                          const json = await res.json()
                                          if (json.success) {
                                            btn.innerHTML = '<span class=\"flex items-center gap-1 text-green-400\">Sent!</span>'
                                            setTimeout(() => { btn.innerHTML = originalHTML; btn.removeAttribute('disabled') }, 2500)
                                          } else {
                                            btn.innerHTML = `<span class=\"flex items-center gap-1 text-red-400\">${json.error || 'Failed'}</span>`
                                            setTimeout(() => { btn.innerHTML = originalHTML; btn.removeAttribute('disabled') }, 3000)
                                          }
                                        } catch {
                                          btn.innerHTML = '<span class=\"flex items-center gap-1 text-red-400\">Error</span>'
                                          setTimeout(() => { btn.innerHTML = originalHTML; btn.removeAttribute('disabled') }, 3000)
                                        }
                                      }
                                    }}
                                    className=\"inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs\"
                                    title=\"Send invoice to customer's email\"
                                  >
                                    <Mail className=\"w-3.5 h-3.5\" />
                                    Send Invoice
                                  </button>"""

new_send_button = """                                  <button
                                    onClick={async () => {
                                      setSendingState((prev) => ({ ...prev, [record.id]: \"sending\" }))
                                      try {
                                        const res = await fetch('/api/billing/send-invoice', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ invoiceId: record.invoice_id }),
                                        })
                                        const json = await res.json()
                                        setSendingState((prev) => ({ ...prev, [record.id]: json.success ? \"sent\" : \"error\" }))
                                        setTimeout(() => {
                                          setSendingState((prev) => ({ ...prev, [record.id]: \"idle\" }))
                                        }, json.success ? 2500 : 4000)
                                      } catch {
                                        setSendingState((prev) => ({ ...prev, [record.id]: \"error\" }))
                                        setTimeout(() => {
                                          setSendingState((prev) => ({ ...prev, [record.id]: \"idle\" }))
                                        }, 4000)
                                      }
                                    }}
                                    disabled={sendingState[record.id] === \"sending\"}
                                    className={`inline-flex items-center gap-1 text-xs transition-colors ${
                                      sendingState[record.id] === \"sent\"
                                        ? \"text-green-400\"
                                        : sendingState[record.id] === \"error\"
                                          ? \"text-red-400\"
                                          : \"text-gray-400 hover:text-white\"
                                    } ${sendingState[record.id] === \"sending\" ? \"opacity-60 cursor-not-allowed\" : \"\"}`}
                                    title=\"Send invoice to customer's email\"
                                  >
                                    {sendingState[record.id] === \"sending\" ? (
                                      <><Loader2 className=\"w-3.5 h-3.5 animate-spin\" /> Sending...</>
                                    ) : sendingState[record.id] === \"sent\" ? (
                                      <><CheckCircle className=\"w-3.5 h-3.5\" /> Sent!</>
                                    ) : sendingState[record.id] === \"error\" ? (
                                      <><XCircle className=\"w-3.5 h-3.5\" /> Failed</>
                                    ) : (
                                      <><Mail className=\"w-3.5 h-3.5\" /> Send Invoice</>
                                    )}
                                  </button>"""

if old_send_button in owner:
    owner = owner.replace(old_send_button, new_send_button, 1)
    print("FIX 2b OK: Replaced DOM manipulation with React state")
else:
    print("FIX 2b FAIL: Could not find old send button")
    # Debug
    idx = owner.find('closest')
    if idx >= 0:
        print(f"Found at idx {idx}: {repr(owner[idx-100:idx+300])}")

write('src/app/owner/billing/page.tsx', owner)
print("FIX 2 OK: Owner page updated with React state")

# =============================================================
# FIX 3: Customer billing page — replace alert() with inline feedback
# =============================================================
customer = read('src/app/customer/billing/page.tsx')

# Add sendingState to customer page
old_cust_states = """  const [hasMore, setHasMore] = useState(false)
  const [startDate, setStartDate] = useState(\"\")"""

new_cust_states = """  const [hasMore, setHasMore] = useState(false)
  const [sendingState, setSendingState] = useState<Record<string, \"idle\" | \"sending\" | \"sent\" | \"error\">>({})
  const [startDate, setStartDate] = useState(\"\")"""

if old_cust_states in customer:
    customer = customer.replace(old_cust_states, new_cust_states, 1)
    print("FIX 3a OK: Added sendingState to customer page")
else:
    print("FIX 3a FAIL: Could not find state declarations in customer page")

# Replace the alert()-based button with React state button
old_cust_button = """                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch('/api/billing/send-invoice', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ invoiceId: record.invoice_id }),
                                          })
                                          const json = await res.json()
                                          if (json.success) {
                                            alert('Invoice sent to your email!')
                                          } else {
                                            alert(json.error || 'Failed to send invoice')
                                          }
                                        } catch {
                                          alert('Network error. Please try again.')
                                        }
                                      }}
                                      className=\"inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs\"
                                    >
                                      <Mail className=\"w-3.5 h-3.5\" />
                                      Email Invoice
                                    </button>"""

new_cust_button = """                                    <button
                                      onClick={async () => {
                                        setSendingState((prev) => ({ ...prev, [record.id]: \"sending\" }))
                                        try {
                                          const res = await fetch('/api/billing/send-invoice', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ invoiceId: record.invoice_id }),
                                          })
                                          const json = await res.json()
                                          setSendingState((prev) => ({ ...prev, [record.id]: json.success ? \"sent\" : \"error\" }))
                                          setTimeout(() => {
                                            setSendingState((prev) => ({ ...prev, [record.id]: \"idle\" }))
                                          }, json.success ? 2500 : 4000)
                                        } catch {
                                          setSendingState((prev) => ({ ...prev, [record.id]: \"error\" }))
                                          setTimeout(() => {
                                            setSendingState((prev) => ({ ...prev, [record.id]: \"idle\" }))
                                          }, 4000)
                                        }
                                      }}
                                      disabled={sendingState[record.id] === \"sending\"}
                                      className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                                        sendingState[record.id] === \"sent\"
                                          ? \"text-green-400\"
                                          : sendingState[record.id] === \"error\"
                                            ? \"text-red-400\"
                                            : \"text-gray-400 hover:text-white\"
                                      } ${sendingState[record.id] === \"sending\" ? \"opacity-60 cursor-not-allowed\" : \"\"}`}
                                    >
                                      {sendingState[record.id] === \"sending\" ? (
                                        <><Loader2 className=\"w-3.5 h-3.5 animate-spin\" /> Sending...</>
                                      ) : sendingState[record.id] === \"sent\" ? (
                                        <><CheckCircle className=\"w-3.5 h-3.5\" /> Sent!</>
                                      ) : sendingState[record.id] === \"error\" ? (
                                        <><XCircle className=\"w-3.5 h-3.5\" /> Failed</>
                                      ) : (
                                        <><Mail className=\"w-3.5 h-3.5\" /> Email Invoice</>
                                      )}
                                    </button>"""

if old_cust_button in customer:
    customer = customer.replace(old_cust_button, new_cust_button, 1)
    print("FIX 3b OK: Replaced alert() with React state inline feedback")
else:
    print("FIX 3b FAIL: Could not find old customer button")
    # Debug
    idx = customer.find('Email Invoice')
    if idx >= 0:
        print(f"Found at idx {idx}: {repr(customer[idx-50:idx+200])}")

write('src/app/customer/billing/page.tsx', customer)
print("FIX 3 OK: Customer page updated with React state")

print("\nAll fixes applied!")
