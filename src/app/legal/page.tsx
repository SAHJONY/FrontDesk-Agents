'use client'

import { useState } from 'react'
import { Search, Gavel, Scale, FileText, Loader2 } from 'lucide-react'

export default function USLegalSearchPage() {
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/us-legal-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, state: stateFilter || null, docType: null }),
      })
      const data = await res.json()
      if (data.success) {
        setResults(data.results)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Failed to connect to legal database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center border border-blue-700">
            <Scale className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">US Legal Research Engine</h1>
            <p className="text-gray-400">Search federal & state laws, cases, and local rules</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your legal issue (e.g., 'securities fraud', 'negligence in California')"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition"
              required
            />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 cursor-pointer min-w-[200px]"
            >
              <option value="">All Jurisdictions</option>
              <option value="US-Fed">Federal Only</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition min-w-[150px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded text-xs font-mono">
                    {result.state_code === 'US-Fed' ? 'FEDERAL' : result.state_code}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs uppercase">
                    {result.document_type}
                  </span>
                  {result.court_name && (
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded text-xs">
                      {result.court_name}
                    </span>
                  )}
                </div>
                {result.citation && (
                  <span className="text-sm font-mono text-gray-400">{result.citation}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{result.title}</h3>
              {result.summary && <p className="text-gray-300 text-sm mb-4">{result.summary}</p>}
              {result.legal_topic && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.legal_topic.map((topic: string, i: number) => (
                    <span key={i} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
              <details className="mt-4 group">
                <summary className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                  <FileText className="w-4 h-4" /> View Full Text
                </summary>
                <pre className="mt-3 text-xs text-gray-400 whitespace-pre-wrap bg-black/30 p-4 rounded-lg overflow-x-auto">
                  {result.full_text}
                </pre>
              </details>
            </div>
          ))}
          {!loading && results.length === 0 && query && (
            <div className="text-center text-gray-500 py-12">
              <Gavel className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No results found. Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
