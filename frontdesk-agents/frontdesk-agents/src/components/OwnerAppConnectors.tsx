'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlugIcon, PlugZapIcon, SettingsIcon, CheckCircleIcon, XCircleIcon,
  RefreshCwIcon, ExternalLinkIcon, PlusIcon, TrashIcon, EditIcon,
  ChevronRightIcon, SearchIcon, FilterIcon, GlobeIcon, CreditCardIcon,
  CalendarIcon, UsersIcon, MailIcon, BarChartIcon, WorkflowIcon, MessageSquareIcon
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Connector {
  id: string
  name: string
  description: string
  category: string
  icon: string
  status: 'connected' | 'disconnected' | 'error'
  features: string[]
  configFields?: { key: string; label: string; type: string }[]
  oauthUrl?: string
}

interface ConnectorStats {
  total: number
  connected: number
  disconnected: number
}

// ─── Category Icons ───────────────────────────────────────────────────────────
const categoryIcons: Record<string, any> = {
  payments: CreditCardIcon,
  backend: SettingsIcon,
  voice: MessageSquareIcon,
  calendar: CalendarIcon,
  crm: UsersIcon,
  automation: WorkflowIcon,
  notifications: MailIcon,
  sms: MessageSquareIcon,
  email: MailIcon,
  analytics: BarChartIcon,
  accounting: CreditCardIcon,
}

const categoryColors: Record<string, string> = {
  payments: 'from-green-400/20 to-green-400/10 text-green-400 border-green-400/20',
  backend: 'from-purple-400/20 to-purple-400/10 text-purple-400 border-purple-400/20',
  voice: 'from-blue-400/20 to-blue-400/10 text-blue-400 border-blue-400/20',
  calendar: 'from-yellow-400/20 to-yellow-400/10 text-yellow-400 border-yellow-400/20',
  crm: 'from-orange-400/20 to-orange-400/10 text-orange-400 border-orange-400/20',
  automation: 'from-cyan-400/20 to-cyan-400/10 text-cyan-400 border-cyan-400/20',
  notifications: 'from-pink-400/20 to-pink-400/10 text-pink-400 border-pink-400/20',
  sms: 'from-red-400/20 to-red-400/10 text-red-400 border-red-400/20',
  email: 'from-indigo-400/20 to-indigo-400/10 text-indigo-400 border-indigo-400/20',
  analytics: 'from-amber-400/20 to-amber-400/10 text-amber-400 border-amber-400/20',
  accounting: 'from-emerald-400/20 to-emerald-400/10 text-emerald-400 border-emerald-400/20',
}

// ─── Connector Card ───────────────────────────────────────────────────────────
function ConnectorCard({ connector, onConfigure, onTest, onDisconnect }: { 
  connector: Connector
  onConfigure: () => void
  onTest: () => void
  onDisconnect: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const CategoryIcon = categoryIcons[connector.category] || PlugIcon
  const colorClass = categoryColors[connector.category] || 'from-gray-400/20 to-gray-400/10 text-gray-400 border-gray-400/20'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${colorClass}`}>
            {connector.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{connector.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                connector.status === 'connected' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : connector.status === 'error'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}>
                {connector.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{connector.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {connector.status === 'connected' ? (
            <>
              <button
                onClick={onTest}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Test connection"
              >
                <RefreshCwIcon size={18} />
              </button>
              <button
                onClick={onDisconnect}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                title="Disconnect"
              >
                <XCircleIcon size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={onConfigure}
              className="px-4 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all flex items-center gap-2"
            >
              <PlusIcon size={16} />
              Connect
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <ChevronRightIcon size={18} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <CategoryIcon size={16} className="text-gray-500" />
                <span className="text-xs text-gray-400 capitalize px-2 py-1 rounded-full bg-white/5">{connector.category}</span>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {connector.features.map(feature => (
                    <span key={feature} className="px-2 py-1 rounded-lg bg-white/[0.02] text-xs text-gray-300 border border-white/5">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Config Fields */}
              {connector.configFields && connector.configFields.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Configuration</h4>
                  <div className="space-y-2">
                    {connector.configFields.map(field => (
                      <div key={field.key} className="flex items-center gap-3">
                        <label className="text-xs text-gray-500 w-32">{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OAuth Connection */}
              {connector.oauthUrl && (
                <div className="pt-2 border-t border-white/10">
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all flex items-center justify-center gap-2">
                    <ExternalLinkIcon size={18} />
                    Connect via OAuth
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OwnerAppConnectors() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [stats, setStats] = useState<ConnectorStats>({ total: 0, connected: 0, disconnected: 0 })
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'disconnected'>('all')

  useEffect(() => {
    fetchConnectors()
  }, [])

  const fetchConnectors = async () => {
    try {
      const res = await fetch('/api/owner/connectors?action=list')
      const data = await res.json()
      
      if (data.connectors) {
        setConnectors(data.connectors)
        setStats(data.stats)
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch connectors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigure = (connector: Connector) => {
    setSelectedConnector(connector)
    setShowConfigureModal(true)
  }

  const handleTest = async (connector: Connector) => {
    try {
      const res = await fetch('/api/owner/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', connectorId: connector.id }),
      })
      const data = await res.json()
      
      if (data.success) {
        alert(`${connector.name} connection successful! Latency: ${data.testResult.latency}ms`)
      } else {
        alert(`Connection failed: ${data.error}`)
      }
    } catch (error) {
      alert('Connection test failed')
    }
  }

  const handleDisconnect = async (connector: Connector) => {
    if (!confirm(`Are you sure you want to disconnect ${connector.name}?`)) return
    
    try {
      const res = await fetch('/api/owner/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', connectorId: connector.id }),
      })
      const data = await res.json()
      
      if (data.success) {
        setConnectors(prev => prev.map(c => 
          c.id === connector.id ? { ...c, status: 'disconnected' } : c
        ))
      }
    } catch (error) {
      alert('Failed to disconnect')
    }
  }

  const handleSaveConfig = async () => {
    if (!selectedConnector) return
    
    // Collect config values from form
    const config: Record<string, string> = {}
    const inputs = document.querySelectorAll('#config-form input')
    inputs.forEach(input => {
      const key = input.getAttribute('data-key')
      const value = (input as HTMLInputElement).value
      if (key && value) config[key] = value
    })

    try {
      const res = await fetch('/api/owner/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'configure', 
          connectorId: selectedConnector.id,
          config,
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        setConnectors(prev => prev.map(c => 
          c.id === selectedConnector.id ? { ...c, status: 'connected' } : c
        ))
        setShowConfigureModal(false)
        setSelectedConnector(null)
      }
    } catch (error) {
      alert('Failed to save configuration')
    }
  }

  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || connector.category === activeCategory
    const matchesStatus = activeTab === 'all' || 
                         (activeTab === 'connected' && connector.status === 'connected') ||
                         (activeTab === 'disconnected' && connector.status === 'disconnected')
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">App Connectors</h2>
          <p className="text-sm text-gray-500 mt-1">Manage integrations and third-party connections</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircleIcon size={16} className="text-green-400" />
            <span className="text-sm text-green-400 font-medium">{stats.connected} Connected</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <PlugIcon size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400 font-medium">{stats.total} Total</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'connected', 'disconnected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            !activeCategory
              ? 'bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          All Categories
        </button>
        {categories.map(category => {
          const Icon = categoryIcons[category] || PlugIcon
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeCategory === category
                  ? 'bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon size={16} />
              {category}
            </button>
          )
        })}
      </div>

      {/* Connectors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-aurora-cyan border-t-transparent rounded-full" />
        </div>
      ) : filteredConnectors.length === 0 ? (
        <div className="text-center py-12">
          <PlugIcon size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No connectors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredConnectors.map(connector => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onConfigure={() => handleConfigure(connector)}
              onTest={() => handleTest(connector)}
              onDisconnect={() => handleDisconnect(connector)}
            />
          ))}
        </div>
      )}

      {/* Configure Modal */}
      <AnimatePresence>
        {showConfigureModal && selectedConnector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowConfigureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-deep-space/95 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full border border-white/[0.06] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10">
                  {selectedConnector.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Configure {selectedConnector.name}</h3>
                  <p className="text-sm text-gray-500">{selectedConnector.description}</p>
                </div>
              </div>

              <form id="config-form" className="space-y-4">
                {selectedConnector.configFields?.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">{field.label}</label>
                    <input
                      type={field.type === 'password' ? 'password' : 'text'}
                      data-key={field.key}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50"
                    />
                  </div>
                ))}
              </form>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfigureModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}