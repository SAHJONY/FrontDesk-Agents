'use client'

import { useState, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icons ───────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const IncomingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const OutgoingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const TestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
)

// ─── Types ───────────────────────────────────────────────────────────────────
interface PhoneNumber {
  id: string
  number: string
  type: 'inbound' | 'outbound'
  status: 'active' | 'pending' | 'suspended'
  callsToday: number
  totalCalls: number
  forwardingTo?: string
  voicemailToEmail?: string
}

interface CustomerPhoneManagementProps {
  onNumberAdded?: (number: PhoneNumber) => void
  onNumberRemoved?: (id: string) => void
  className?: string
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerPhoneManagement({ onNumberAdded, onNumberRemoved, className = '' }: CustomerPhoneManagementProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    { id: 'pn_1', number: '+13465214387', type: 'outbound', status: 'active', callsToday: 12, totalCalls: 847 },
    { id: 'pn_2', number: '+16783466284', type: 'inbound', status: 'active', callsToday: 8, totalCalls: 423, forwardingTo: '+16783466284', voicemailToEmail: 'frontdeskllc@outlook.com' },
  ])
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Add Number modal state
  const [newNumberType, setNewNumberType] = useState<'inbound' | 'outbound'>('outbound')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newForwardingTo, setNewForwardingTo] = useState('')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRemoveNumber = (id: string) => {
    if (confirm('Are you sure you want to remove this phone number?')) {
      setPhoneNumbers(prev => prev.filter(p => p.id !== id))
      onNumberRemoved?.(id)
    }
  }

  const handleSaveSettings = (updatedNumber: PhoneNumber) => {
    setPhoneNumbers(prev => prev.map(p => p.id === updatedNumber.id ? updatedNumber : p))
    setShowSettingsModal(false)
    setSelectedNumber(null)
    setSaving(true)
    setTimeout(() => setSaving(false), 2000)
  }

  const openSettings = (number: PhoneNumber) => {
    setSelectedNumber(number)
    setShowSettingsModal(true)
  }

  return (
    <div className={`bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center text-green-400">
              <PhoneIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Phone Numbers</h3>
              <p className="text-xs text-gray-500">Manage your AI calling numbers</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all"
          >
            <PlusIcon />
            Add Number
          </button>
        </div>
      </div>

      {/* Phone Numbers List */}
      <div className="p-4 space-y-3">
        {phoneNumbers.map(phone => (
          <motion.div
            key={phone.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  phone.type === 'inbound' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-aurora-cyan/20 text-aurora-cyan'
                }`}>
                  {phone.type === 'inbound' ? <IncomingIcon /> : <OutgoingIcon />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono font-semibold">{phone.number}</p>
                    <button
                      onClick={() => copyToClipboard(phone.number, phone.id)}
                      className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                      title="Copy number"
                    >
                      {copiedId === phone.id ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                      phone.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      phone.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {phone.status}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{phone.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-3">
                  Today: <span className="text-white font-medium">{phone.callsToday}</span>
                </span>
                <button
                  onClick={() => openSettings(phone)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Settings"
                >
                  <SettingsIcon />
                </button>
                <button
                  onClick={() => window.location.href = '/test-call'}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Test call"
                >
                  <TestIcon />
                </button>
                <button
                  onClick={() => handleRemoveNumber(phone.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                  title="Remove"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-500">Total calls: <span className="text-white">{phone.totalCalls}</span></span>
              {phone.forwardingTo && (
                <span className="text-gray-500">Forwarding: <span className="text-aurora-cyan">{phone.forwardingTo}</span></span>
              )}
              {phone.voicemailToEmail && (
                <span className="text-gray-500">VM to: <span className="text-gray-400 truncate max-w-[150px]">{phone.voicemailToEmail}</span></span>
              )}
            </div>
          </motion.div>
        ))}

        {phoneNumbers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <PhoneIcon />
            </div>
            <h3 className="text-white font-medium mb-2">No Phone Numbers</h3>
            <p className="text-sm text-gray-500 mb-4">Add a phone number to start making AI calls</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan text-sm hover:bg-aurora-cyan/20 transition-all"
            >
              <PlusIcon />
              Add Your First Number
            </button>
          </div>
        )}
      </div>

      {/* Add Number Modal */}
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
              className="bg-deep-space/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/[0.06] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add Phone Number</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Number Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewNumberType('inbound')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        newNumberType === 'inbound' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <IncomingIcon />
                      <div className="text-sm font-medium text-white mt-2">Inbound</div>
                      <div className="text-xs text-gray-500">Receive calls with AI answering</div>
                    </button>
                    <button
                      onClick={() => setNewNumberType('outbound')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        newNumberType === 'outbound' 
                          ? 'bg-aurora-cyan/10 border-aurora-cyan/30' 
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <OutgoingIcon />
                      <div className="text-sm font-medium text-white mt-2">Outbound</div>
                      <div className="text-xs text-gray-500">Make AI-powered calls</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhoneNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPhoneNumber(e.target.value)}
                    placeholder="+15555555555"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Forward Calls To (Optional)</label>
                  <input
                    type="tel"
                    value={newForwardingTo}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewForwardingTo(e.target.value)}
                    placeholder="+15555555555"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewPhoneNumber('')
                    setNewForwardingTo('')
                    setNewNumberType('outbound')
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Validate phone number
                    if (!newPhoneNumber.trim()) {
                      alert('Please enter a phone number')
                      return
                    }
                    // Create new phone number entry
                    const newNumber: PhoneNumber = {
                      id: `pn_${Date.now()}`,
                      number: newPhoneNumber,
                      type: newNumberType,
                      status: 'pending',
                      callsToday: 0,
                      totalCalls: 0,
                      forwardingTo: newForwardingTo.trim() || undefined,
                    }
                    setPhoneNumbers(prev => [...prev, newNumber])
                    setShowAddModal(false)
                    // Reset modal state
                    setNewPhoneNumber('')
                    setNewForwardingTo('')
                    setNewNumberType('outbound')
                    onNumberAdded?.(newNumber)
                    // In production: call API to provision number
                    // await fetch('/api/customer/provision-phone', { method: 'POST', body: JSON.stringify(newNumber) })
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
                >
                  Provision Number
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && selectedNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-deep-space/95 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full border border-white/[0.06] shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Number Settings</h2>
                  <p className="text-sm text-gray-500 font-mono">{selectedNumber.number}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded capitalize ${
                  selectedNumber.status === 'active' ? 'bg-green-500/10 text-green-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {selectedNumber.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Forward Calls To</label>
                  <input
                    type="tel"
                    defaultValue={selectedNumber.forwardingTo}
                    placeholder="+15555555555 or leave empty to use AI only"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Voicemail Email</label>
                  <input
                    type="email"
                    defaultValue={selectedNumber.voicemailToEmail}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                  <p className="text-xs text-gray-600 mt-1">Voicemail transcripts will be sent here</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">Active</p>
                      <p className="text-xs text-gray-500">Temporarily pause this number</p>
                    </div>
                    <button className={`relative w-12 h-6 rounded-full transition-colors ${selectedNumber.status === 'active' ? 'bg-green-500' : 'bg-white/20'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${selectedNumber.status === 'active' ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSettings(selectedNumber)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}