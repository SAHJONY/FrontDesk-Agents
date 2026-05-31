import os

base = os.getcwd()
path = os.path.join(base, 'src/app/customer/billing/page.tsx')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# === CHANGE 1: Add startDate and endDate state variables ===
old_state = """  const [hasMore, setHasMore] = useState(false)

  const fetchBillingHistory"""
new_state = """  const [hasMore, setHasMore] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchBillingHistory"""

if old_state in content:
    content = content.replace(old_state, new_state, 1)
    print("CHANGE 1 OK: Added startDate/endDate state")
else:
    print("CHANGE 1 FAIL: Could not find insertion point")

# === CHANGE 2: Add date range filtering to filteredRecords ===
old_filter = """      return true
    })
    .sort((a, b) => {"""

new_filter = """      if (startDate && new Date(r.created_at) < new Date(startDate)) return false
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (new Date(r.created_at) > endOfDay) return false
      }
      return true
    })
    .sort((a, b) => {"""

if old_filter in content:
    content = content.replace(old_filter, new_filter, 1)
    print("CHANGE 2 OK: Added date range filtering logic")
else:
    print("CHANGE 2 FAIL: Could not find filtering insertion point")

# === CHANGE 3: Add date input fields to the filter bar JSX ===
old_jsx = """          <div className=\"relative flex-1\">
            <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500\" />
            <input
              type=\"text\"
              placeholder=\"Search by description, invoice ID...\"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=\"w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all\"
            />
          </div>"""

new_jsx = """          <div className=\"relative flex-1\">
            <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500\" />
            <input
              type=\"text\"
              placeholder=\"Search by description, invoice ID...\"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=\"w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all\"
            />
          </div>
          <div className=\"flex items-center gap-2\">
            <div className=\"relative\">
              <Calendar className=\"absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none\" />
              <input
                type=\"date\"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className=\"w-[140px] pl-8 pr-2 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all [color-scheme:dark]\"
                title=\"Start date\"
              />
            </div>
            <span className=\"text-gray-500 text-sm\">to</span>
            <div className=\"relative\">
              <Calendar className=\"absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none\" />
              <input
                type=\"date\"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className=\"w-[140px] pl-8 pr-2 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all [color-scheme:dark]\"
                title=\"End date\"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(\"\"); setEndDate(\"\"); }}
                className=\"p-2 text-gray-500 hover:text-gray-300 transition-colors\"\n                title=\"Clear date filter\"
              >
                &times;
              </button>
            )}
          </div>"""

if old_jsx in content:
    content = content.replace(old_jsx, new_jsx, 1)
    print("CHANGE 3 OK: Added date range inputs to filter bar")
else:
    print("CHANGE 3 FAIL: Could not find filter bar insertion point")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone writing file.")
