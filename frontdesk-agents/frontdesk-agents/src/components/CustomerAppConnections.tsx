'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlugIcon, PlusIcon, CheckCircleIcon, XCircleIcon, 
  ExternalLinkIcon, RefreshCwIcon, SettingsIcon, TrashIcon,
  CalendarIcon, UsersIcon, MailIcon, CreditCardIcon, PhoneIcon,
  MessageSquareIcon, BarChartIcon
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ConnectedApp {
  id: string
  name: string
  icon: string
  category: string
  status: 'connected' | 'disconnected' | 'error'
  features: string[]
  connectedAt: string
  lastSync: string
}

interface AvailableIntegration {
  id: string
  name: string
  description: string
  icon: string
  category: string
  features: string[]
  configFields: { key: string; label: string; type: string; placeholder: string }[]
}

// ─── Mock Connected Apps ─────────────────────────────────────────────────────
const MOCK_CONNECTED: ConnectedApp[] = [
  { id: 'stripe', name: 'Stripe', icon: '💳', category: 'payments', status: 'connected', features: ['Subscription billing', 'Payment processing'], connectedAt: '2025-12-15', lastSync: '2026-06-02T08:00:00Z' },
  { id: 'google_calendar', name: 'Google Calendar', icon: '📅', category: 'calendar', status: 'connected', features: ['Appointment sync', 'Availability'], connectedAt: '2026-01-20', lastSync: '2026-06-02T09:30:00Z' },
  { id: 'hubspot', name: 'HubSpot', icon: '🔶', category: 'crm', status: 'connected', features: ['Lead capture', 'Contact sync'], connectedAt: '2026-02-10', lastSync: '2026-06-01T14:00:00Z' },
]

// ─── Available Integrations ──────────────────────────────────────────────────
const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  { id: 'slack', name: 'Slack', description: 'Team notifications and call alerts', icon: '💬', category: 'notifications', features: ['Call notifications', 'Lead alerts', 'Team channels'], configFields: [{ key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' }] },
  { id: 'twilio', name: 'Twilio', description: 'SMS notifications and phone services', icon: '📱', category: 'sms', features: ['SMS alerts', 'Text notifications'], configFields: [{ key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'AC...' }, { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: 'Your auth token' }] },
  { id: 'zapier', name: 'Zapier', description: 'Workflow automation and app connections', icon: '⚡', category: 'automation', features: ['Trigger workflows', 'App connections', 'Data sync'], configFields: [{ key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...' }] },
  { id: 'salesforce', name: 'Salesforce', description: 'Enterprise CRM integration', icon: '☁️', category: 'crm', features: ['Contact management', 'Opportunity tracking'], configFields: [{ key: 'instance_url', label: 'Instance URL', type: 'text', placeholder: 'https://yourinstance.salesforce.com' }, { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Your client ID' }] },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting and invoicing', icon: '🧾', category: 'accounting', features: ['Invoice sync', 'Payment tracking'], configFields: [{ key: 'realm_id', label: 'Realm ID', type: 'text', placeholder: 'Your QuickBooks realm' }] },
  { id: 'sendgrid', name: 'SendGrid', description: 'Email marketing and transactional emails', icon: '📧', category: 'email', features: ['Email campaigns', 'Transactional emails'], configFields: [{ key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your SendGrid API key' }] },
]

// ─── Category Config ─────────────────────────────────────────────────────────
const categoryConfig: Record<string, { icon: any; color: string }> = {
  payments: { icon: CreditCardIcon, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  calendar: { icon: CalendarIcon, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  crm: { icon: UsersIcon, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  notifications: { icon: MailIcon, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  sms: { icon: MessageSquareIcon, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  automation: { icon: PhoneIcon, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  email: { icon: MailIcon, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  accounting: { icon: BarChartIcon, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

// ─── Connected App Card ─────────────────────────────────────────────────────
function ConnectedAppCard({ app, onDisconnect, onSync }: { app: ConnectedApp; onDisconnect: () => void; onSync: () => void }) {
  const config = categoryConfig[app.category] || { icon: PlugIcon, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl">
            {app.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{app.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                app.status === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {app.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{app.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onSync}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" 
            title="Sync now"
          >
            <RefreshCwIcon size={16} />
          </button>
          <button 
            onClick={onDisconnect}
            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all" 
            title="Disconnect"
          >
            <XCircleIcon size={16} />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-4">
        {app.features.map(feature => (
          <span key={feature} className="px-2 py-1 rounded-lg bg-white/[0.02] text-xs text-gray-400">
            {feature}
          </span>
        ))}
      </div>

      {/* Last Sync */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
        <span>Connected {new Date(app.connectedAt).toLocaleDateString()}</span>
        <span>Last sync: {new Date(app.lastSync).toLocaleString()}</span>
      </div>
    </motion.div>
  )
}

// ─── Available Integration Card ─────────────────────────────────────────────
function AvailableIntegrationCard({ integration, onConnect }: { integration: AvailableIntegration; onConnect: () => void }) {
  const config = categoryConfig[integration.category] || { icon: PlugIcon, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-aurora-cyan/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {integration.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{integration.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="flex flex-wrap gap-2 mb-4">
        {integration.features.slice(0, 2).map(feature => (
          <span key={feature} className="px-2 py-1 rounded-lg bg-white/[0.02] text-xs text-gray-400">
            {feature}
          </span>
        ))}
        {integration.features.length > 2 && (
          <span className="px-2 py-1 rounded-lg bg-white/[0.02] text-xs text-gray-500">
            +{integration.features.length - 2} more
          </span>
        )}
      </div>

      <button
        onClick={onConnect}
        className="w-full py-2.5 rounded-xl bg-aurora-cyan/10 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all flex items-center justify-center gap-2"
      >
        <PlusIcon size={16} />
        Connect
      </button>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerAppConnections() {
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>(MOCK_CONNECTED)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleSync = async (appId: string) => {
    setSyncing(appId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setConnectedApps(prev => prev.map(app => 
      app.id === appId ? { ...app, lastSync: new Date().toISOString() } : app
    ))
    setSyncing(null)
  }

  const handleDisconnect = async (appId: string, appName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${appName}?`)) return
    setConnectedApps(prev => prev.filter(app => app.id !== appId))
  }

  const handleConnect = (integrationId: string) => {
    const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === integrationId)
    if (!integration) return

    // Add to connected apps
    const newApp: ConnectedApp = {
      id: integration.id,
      name: integration.name,
      icon: integration.icon,
      category: integration.category,
      status: 'connected',
      features: integration.features,
      connectedAt: new Date().toISOString().split('T')[0],
      lastSync: new Date().toISOString(),
    }
    setConnectedApps(prev => [...prev, newApp])
    setShowAddModal(false)
  }

  const categories = [...new Set(AVAILABLE_INTEGRATIONS.map(i => i.category))]
  const filteredIntegrations = activeCategory 
    ? AVAILABLE_INTEGRATIONS.filter(i => i.category === activeCategory)
    : AVAILABLE_INTEGRATIONS

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Connected Apps</h2>
          <p className="text-sm text-gray-500 mt-1">Integrate your favorite tools with your AI receptionist</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-cyan/10 text-aurora-cyan font-medium text-sm hover:bg-aurora-cyan/20 transition-all"
        >
          <PlusIcon size={18} />
          Add Integration
        </button>
      </div>

      {/* Connected Apps */}
      {connectedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedApps.map(app => (
            <ConnectedAppCard
              key={app.id}
              app={app}
              onSync={() => handleSync(app.id)}
              onDisconnect={() => handleDisconnect(app.id, app.name)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/10">
          <PlugIcon size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No apps connected yet</p>
          <p className="text-sm text-gray-600 mt-1">Connect your favorite tools to enhance your AI receptionist</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-aurora-cyan/10 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all"
          >
            Add Your First Integration
          </button>
        </div>
      )}

      {/* Add Integration Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-deep-space/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-white/[0.06] shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Add Integration</h3>
                  <p className="text-sm text-gray-500 mt-1">Connect your favorite apps and services</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                  <XCircleIcon size={20} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    !activeCategory ? 'bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20' : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap capitalize transition-all ${
                      activeCategory === category ? 'bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20' : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
                {filteredIntegrations.map(integration => (
                  <AvailableIntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={() => handleConnect(integration.id)}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}