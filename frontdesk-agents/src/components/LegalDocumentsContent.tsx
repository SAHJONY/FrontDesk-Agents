'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Scale, FileText, Loader2, ChevronRight, Search, CheckCircle,
  XCircle, AlertTriangle, RefreshCw, Zap, Key, Shield, Globe, Clock
} from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

interface DocumentTemplateInfo {
  type: string
  title: string
  description: string
  courtType: string
  jurisdiction: string
  estimatedTime: string
  sectionCount: number
  fieldCount: number
}

interface CourtInfo {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  badge: string
  count: number
}

const COURT_TYPES = [
  { id: 'all', label: 'All Courts', icon: <Globe className="w-4 h-4" />, color: 'text-white', badge: 'bg-white/10' },
  { id: 'family', label: 'Family Law', icon: <Scale className="w-4 h-4" />, color: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  { id: 'bankruptcy', label: 'Bankruptcy', icon: <Shield className="w-4 h-4" />, color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  { id: 'ip', label: 'IP / Trademark', icon: <Key className="w-4 h-4" />, color: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  { id: 'immigration', label: 'Immigration', icon: <Globe className="w-4 h-4" />, color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
] as const

interface Props {
  embedded?: boolean
}

export default function LegalDocumentsContent({ embedded }: Props) {
  const { t } = useTranslation()
  const [selectedCourt, setSelectedCourt] = useState<string>('all')
  const [catalog, setCatalog] = useState<{
    family: DocumentTemplateInfo[]
    bankruptcy: DocumentTemplateInfo[]
    ip: DocumentTemplateInfo[]
    immigration: DocumentTemplateInfo[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocumentTemplateInfo | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedDoc, setGeneratedDoc] = useState<any>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCatalog = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/legal/documents?action=catalog')
      const json = await res.json()
      if (json.success) {
        setCatalog(json.catalog)
      } else {
        setError(json.error || 'Failed to load catalog')
      }
    } catch (err) {
      setError('Failed to connect to legal API')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  // Compute court counts
  const courtCounts = {
    all: catalog ? catalog.family.length + catalog.bankruptcy.length + catalog.ip.length + catalog.immigration.length : 0,
    family: catalog?.family.length ?? 0,
    bankruptcy: catalog?.bankruptcy.length ?? 0,
    ip: catalog?.ip.length ?? 0,
    immigration: catalog?.immigration.length ?? 0,
  }

  // Filter templates by court + search
  const filteredTemplates = catalog
    ? Object.entries(catalog).reduce((acc, [court, docs]) => {
        if (selectedCourt !== 'all' && court !== selectedCourt) {
          acc[court as keyof typeof catalog] = []
          return acc
        }
        const q = searchQuery.toLowerCase()
        acc[court as keyof typeof catalog] = q
          ? (docs as DocumentTemplateInfo[]).filter(
              (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
            )
          : docs
        return acc
      }, {} as Record<string, DocumentTemplateInfo[]>)
    : {}

  const displayedTemplates = Object.values(filteredTemplates).flat()

  const courtColors: Record<string, string> = {
    family: 'from-blue-600/20 to-blue-400/5 border-blue-500/30',
    bankruptcy: 'from-amber-600/20 to-amber-400/5 border-amber-500/30',
    ip: 'from-purple-600/20 to-purple-400/5 border-purple-500/30',
    immigration: 'from-emerald-600/20 to-emerald-400/5 border-emerald-500/30',
  }

  const courtBadgeColors: Record<string, string> = {
    family: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bankruptcy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ip: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    immigration: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  const courtLabelColors: Record<string, string> = {
    family: 'text-blue-400',
    bankruptcy: 'text-amber-400',
    ip: 'text-purple-400',
    immigration: 'text-emerald-400',
  }

  const handleDocSelect = async (doc: DocumentTemplateInfo) => {
    setSelectedDoc(doc)
    setPreview(null)
    setGeneratedDoc(null)
    setFieldValues({})
    setPreviewLoading(true)
    try {
      const res = await fetch('/api/legal/documents?action=get-template&type=' + doc.type)
      const json = await res.json()
      if (json.success) {
        setPreview(json.template)
      }
    } catch {
      // silently fail
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedDoc) return
    setGenerating(true)
    setGeneratedDoc(null)
    try {
      const res = await fetch('/api/legal/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          documentType: selectedDoc.type,
          fieldValues,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setGeneratedDoc(json.document)
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className={`space-y-6 ${embedded ? '' : 'p-8'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <Scale className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Legal Document Generation</h2>
            <p className="text-sm text-gray-400">Generate trademark, custody, bankruptcy &amp; cease-and-desist documents</p>
          </div>
        </div>
        <button
          onClick={fetchCatalog}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Row */}
      {catalog && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COURT_TYPES.slice(1).map((court) => {
            const count = courtCounts[court.id as keyof typeof courtCounts] ?? 0
            const label = court.id === 'ip' ? 'IP / Trademark' : court.label
            return (
              <button
                key={court.id}
                onClick={() => setSelectedCourt(selectedCourt === court.id ? 'all' : court.id)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  courtColors[court.id] ?? 'bg-white/5 border-white/10'
                } ${selectedCourt === court.id ? 'ring-2 ring-offset-2 ring-offset-black' : ''} ${
                  selectedCourt === court.id
                    ? court.id === 'family' ? 'ring-blue-500'
                    : court.id === 'bankruptcy' ? 'ring-amber-500'
                    : court.id === 'ip' ? 'ring-purple-500'
                    : 'ring-emerald-500'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={courtLabelColors[court.id] ?? court.color}>{court.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-gray-500">{count === 1 ? 'document type' : 'document types'}</div>
              </button>
            )
          })}
        </div>
      )}

      {/* Court Type Filter Tabs + Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
          {COURT_TYPES.map((court) => (
            <button
              key={court.id}
              onClick={() => setSelectedCourt(court.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCourt === court.id
                  ? court.id === 'all'
                    ? 'bg-white/20 text-white'
                    : courtBadgeColors[court.id] ?? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {court.icon}
              <span>{court.id === 'ip' ? 'IP / Trademark' : court.label}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                selectedCourt === court.id && court.id !== 'all'
                  ? 'bg-white/20'
                  : 'bg-white/10'
              }`}>
                {courtCounts[court.id as keyof typeof courtCounts] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <div className="font-medium text-red-400">Error</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </div>
      )}

      {/* Document Grid */}
      {!loading && !error && (
        <>
          {displayedTemplates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedTemplates.map((doc) => {
                const courtColor = courtBadgeColors[doc.courtType] ?? 'bg-white/10 text-gray-300'
                const courtLabel = COURT_TYPES.find((c) => c.id === doc.courtType)?.label ?? doc.courtType
                const courtLabelWithIP = doc.courtType === 'ip' ? 'IP / Trademark' : courtLabel
                return (
                  <button
                    key={doc.type}
                    onClick={() => handleDocSelect(doc)}
                    className={`p-5 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-white/20 transition-all group ${
                      selectedDoc?.type === doc.type ? 'ring-2 ring-purple-500 border-purple-500/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${courtColor}`}>
                        {courtLabelWithIP}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{doc.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{doc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {doc.sectionCount} sections
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {doc.estimatedTime}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Document Detail Panel */}
      {selectedDoc && (
        <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedDoc.title}</h3>
              <p className="text-sm text-gray-400">{selectedDoc.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${courtBadgeColors[selectedDoc.courtType] ?? 'bg-white/10 text-gray-300'}`}>
              {selectedDoc.courtType === 'ip' ? 'IP / Trademark' : COURT_TYPES.find((c) => c.id === selectedDoc.courtType)?.label}
            </div>
          </div>

          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : preview ? (
            <div className="space-y-6">
              {/* Sections */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Document Sections</h4>
                <div className="space-y-3">
                  {preview.sections.map((section: any) => (
                    <div key={section.id} className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">{section.title}</h5>
                        <span className="text-xs text-gray-500">{section.fields.length} fields</span>
                      </div>
                      {section.instruction && (
                        <p className="text-xs text-gray-500 mb-3">{section.instruction}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.fields.slice(0, 6).map((field: any) => (
                          <div key={field.id}>
                            <label className="text-xs text-gray-400 mb-1 block">
                              {field.label}
                              {field.required && <span className="text-purple-400 ml-0.5">*</span>}
                            </label>
                            {field.type === 'select' ? (
                              <select
                                value={fieldValues[field.id] || ''}
                                onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">Select...</option>
                                {field.options?.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : field.type === 'checkbox' ? (
                              <input
                                type="checkbox"
                                checked={fieldValues[field.id] === 'true'}
                                onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.id]: e.target.checked ? 'true' : '' }))}
                                className="w-4 h-4 rounded"
                              />
                            ) : field.type === 'textarea' ? (
                              <textarea
                                value={fieldValues[field.id] || ''}
                                onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                rows={2}
                              />
                            ) : (
                              <input
                                type={field.type === 'date' ? 'date' : field.type === 'currency' ? 'number' : 'text'}
                                value={fieldValues[field.id] || ''}
                                onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {section.fields.length > 6 && (
                        <p className="text-xs text-gray-500 mt-2">+ {section.fields.length - 6} more fields</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Generate Document</>
                  )}
                </button>
                {Object.keys(fieldValues).length > 0 && (
                  <span className="text-sm text-gray-400">{Object.keys(fieldValues).length} fields filled</span>
                )}
              </div>

              {/* Generated Document */}
              {generatedDoc && (
                <div className="mt-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-semibold text-emerald-400">Document Generated</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Fields</div>
                      <div className="text-lg font-bold text-white">{generatedDoc.metadata.fieldCount}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Filled</div>
                      <div className="text-lg font-bold text-emerald-400">{generatedDoc.metadata.filledCount}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Completion</div>
                      <div className="text-lg font-bold text-aurora-cyan">{generatedDoc.metadata.completionPercent}%</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Generated at {new Date(generatedDoc.generatedAt).toLocaleString()} • {generatedDoc.jurisdiction}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}