'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icons ───────────────────────────────────────────────────────────────────
const PhoneInboundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 2 16 8 22 8" />
    <line x1="22" y1="2" x2="11" y2="13" />
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const TransferIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

// ─── Types ───────────────────────────────────────────────────────────────────
interface InboundConfig {
  // Phone number settings
  inboundPhoneNumber: string
  callerIdNumber: string
  
  // AI behavior
  greetingPrompt: string
  language: string
  voice: string
  
  // Routing
  transferNumber: string
  allowTransfers: boolean
  escalateOnKeywords: string[]
  
  // Business hours
  businessHoursEnabled: boolean
  businessHours: {
    monday: { enabled: boolean; start: string; end: string }
    tuesday: { enabled: boolean; start: string; end: string }
    wednesday: { enabled: boolean; start: string; end: string }
    thursday: { enabled: boolean; start: string; end: string }
    friday: { enabled: boolean; start: string; end: string }
    saturday: { enabled: boolean; start: string; end: string }
    sunday: { enabled: boolean; start: string; end: string }
  }
  afterHoursBehavior: 'voicemail' | 'transfer' | 'custom_message'
  afterHoursMessage: string
  
  // Voicemail
  voicemailEnabled: boolean
  voicemailPrompt: string
  voicemailToEmail: string
  
  // Fallback
  fallbackNumber: string
  maxCallDuration: number
}

// ─── Default Configuration ───────────────────────────────────────────────────
const DEFAULT_INBOUND_CONFIG: InboundConfig = {
  inboundPhoneNumber: '+16783466284',
  callerIdNumber: '+16783466284',
  greetingPrompt: `Hello, you've reached GlobalVoice AI. I'm your virtual receptionist. How can I help you today?\n\nYou can:\n- Schedule an appointment\n- Get information about our services\n- Speak with someone from our team\n\nPlease tell me how I can assist you.`,
  language: 'en',
  voice: '30972a71-c4b5-4aa3-9ce7-e065d6409a8f',
  transferNumber: '+16783466284',
  allowTransfers: true,
  escalateOnKeywords: ['human', 'person', 'agent', 'real person', 'speak to someone', 'manager', 'supervisor', 'help'],
  businessHoursEnabled: true,
  businessHours: {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '10:00', end: '14:00' },
    sunday: { enabled: false, start: '10:00', end: '14:00' },
  },
  afterHoursBehavior: 'voicemail',
  afterHoursMessage: 'Thank you for calling. Our office is currently closed. Please leave a message and we will return your call during business hours.',
  voicemailEnabled: true,
  voicemailPrompt: 'Please leave your name, phone number, and message after the beep.',
  voicemailToEmail: 'frontdeskllc@outlook.com',
  fallbackNumber: '+16783466284',
  maxCallDuration: 600,
}

// ─── Greeting Templates ──────────────────────────────────────────────────────
const GREETING_TEMPLATES = [
  { label: 'Professional', prompt: `Hello, you've reached GlobalVoice AI. I'm your virtual receptionist and I'm here to help. How can I assist you today?\n\nYou can ask me about:\n- Our services and pricing\n- Scheduling an appointment\n- Speaking with a team member\n\nWhat can I help you with?` },
  { label: 'Medical', prompt: `Thank you for calling. This is your AI medical receptionist speaking. How may I help you today?\n\nI can assist with:\n- Scheduling or rescheduling appointments\n- Prescription refills\n- General health questions\n\nHow can I help you?` },
  { label: 'Legal', prompt: `You've reached Rodriguez & Associates. I'm your AI intake specialist. Are you a new client seeking a consultation, an existing client checking case status, or calling about something else?\n\nPlease let me know how I can assist you.` },
  { label: 'Service Business', prompt: `Thank you for calling! This is your AI service dispatcher. I'm here to help you with scheduling, service inquiries, or emergencies.\n\nHow may I assist you today?` },
  { label: 'Custom', prompt: '' },
]

// ─── Main Component ──────────────────────────────────────────────────────────
interface InboundCallConfigProps {
  className?: string
  onConfigSave?: (config: InboundConfig) => void
}

export default function InboundCallConfig({ className = '', onConfigSave }: InboundCallConfigProps) {
  const [config, setConfig] = useState<InboundConfig>(DEFAULT_INBOUND_CONFIG)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'routing' | 'hours' | 'voicemail'>('general')

  const handleSave = useCallback(() => {
    onConfigSave?.(config)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }, [config, onConfigSave])

  const handleGreetingTemplateSelect = (template: typeof GREETING_TEMPLATES[number]) => {
    if (template.prompt) {
      setConfig(prev => ({ ...prev, greetingPrompt: template.prompt }))
    }
  }

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !config.escalateOnKeywords.includes(keyword.trim())) {
      setConfig(prev => ({
        ...prev,
        escalateOnKeywords: [...prev.escalateOnKeywords, keyword.trim()]
      }))
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setConfig(prev => ({
      ...prev,
      escalateOnKeywords: prev.escalateOnKeywords.filter(k => k !== keyword)
    }))
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
  const dayLabels: Record<typeof days[number], string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
  }

  return (
    <div className={`bg-deep-space/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center text-green-400">
              <PhoneInboundIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Inbound Call Settings</h3>
              <p className="text-xs text-gray-500">Configure AI receptionist for incoming calls</p>
            </div>
          </div>
          
          {/* Save Status */}
          <AnimatePresence>
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm border border-green-500/20"
              >
                <CheckCircleIcon />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-white/10">
        <div className="flex gap-1 -mb-px">
          {(['general', 'routing', 'hours', 'voicemail'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? 'border-aurora-cyan text-aurora-cyan'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* General Tab */}
        <AnimatePresence>
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Inbound Phone Number</label>
                  <input
                    type="tel"
                    value={config.inboundPhoneNumber}
                    onChange={e => setConfig(prev => ({ ...prev, inboundPhoneNumber: e.target.value }))}
                    placeholder="+15555555555"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Caller ID Number</label>
                  <input
                    type="tel"
                    value={config.callerIdNumber}
                    onChange={e => setConfig(prev => ({ ...prev, callerIdNumber: e.target.value }))}
                    placeholder="+15555555555"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                </div>
              </div>

              {/* Greeting Prompt */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <MessageIcon />
                  AI Greeting / Prompt
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {GREETING_TEMPLATES.map(template => (
                    <button
                      key={template.label}
                      onClick={() => handleGreetingTemplateSelect(template)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-aurora-cyan/20 transition-all text-xs text-gray-400 hover:text-white"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={config.greetingPrompt}
                  onChange={e => setConfig(prev => ({ ...prev, greetingPrompt: e.target.value }))}
                  rows={6}
                  placeholder="Enter what the AI should say when answering inbound calls..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors resize-none"
                />
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <InfoIcon />
                  This is what the AI says when answering incoming calls. Keep it under 500 characters.
                </p>
              </div>

              {/* Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Language</label>
                  <select
                    value={config.language}
                    onChange={e => setConfig(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Voice</label>
                  <select
                    value={config.voice}
                    onChange={e => setConfig(prev => ({ ...prev, voice: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  >
                    <option value="30972a71-c4b5-4aa3-9ce7-e065d6409a8f">Custom (Your Voice)</option>
                    <option value="nat">Natural</option>
                    <option value="sage">Sage</option>
                    <option value="forest">Forest</option>
                    <option value="river">River</option>
                    <option value="max">Max</option>
                  </select>
                </div>
              </div>

              {/* Max Duration */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Max Call Duration (seconds)</label>
                <input
                  type="number"
                  value={config.maxCallDuration}
                  onChange={e => setConfig(prev => ({ ...prev, maxCallDuration: parseInt(e.target.value) || 600 }))}
                  min={60}
                  max={3600}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Routing Tab */}
        <AnimatePresence>
          {activeTab === 'routing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Transfer Settings */}
              <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TransferIcon />
                    <h4 className="font-medium text-white">Human Transfer</h4>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, allowTransfers: !prev.allowTransfers }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      config.allowTransfers ? 'bg-aurora-cyan' : 'bg-white/20'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      config.allowTransfers ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Transfer Number</label>
                  <input
                    type="tel"
                    value={config.transferNumber}
                    onChange={e => setConfig(prev => ({ ...prev, transferNumber: e.target.value }))}
                    placeholder="+15555555555"
                    disabled={!config.allowTransfers}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Escalation Keywords */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <UserIcon />
                  Escalation Keywords
                </label>
                <p className="text-xs text-gray-600">AI transfers to human when caller says these words</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {config.escalateOnKeywords.map(keyword => (
                    <span
                      key={keyword}
                      className="px-3 py-1.5 rounded-full bg-aurora-cyan/10 text-aurora-cyan text-xs border border-aurora-cyan/20 flex items-center gap-2"
                    >
                      {keyword}
                      <button
                        onClick={() => handleKeywordRemove(keyword)}
                        className="hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                <input
                  type="text"
                  placeholder="Add a keyword (e.g., 'manager')"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleKeywordAdd((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                />
              </div>

              {/* Fallback */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Fallback Number</label>
                <input
                  type="tel"
                  value={config.fallbackNumber}
                  onChange={e => setConfig(prev => ({ ...prev, fallbackNumber: e.target.value }))}
                  placeholder="+15555555555"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                />
                <p className="text-xs text-gray-600">Called if AI cannot handle the call</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hours Tab */}
        <AnimatePresence>
          {activeTab === 'hours' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Business Hours Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <ClockIcon />
                  <h4 className="font-medium text-white">Business Hours</h4>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, businessHoursEnabled: !prev.businessHoursEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.businessHoursEnabled ? 'bg-aurora-cyan' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    config.businessHoursEnabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Hours Grid */}
              {config.businessHoursEnabled && (
                <div className="space-y-3">
                  {days.map(day => (
                    <div key={day} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <div className="w-24">
                        <span className="text-sm text-white font-medium capitalize">{dayLabels[day]}</span>
                      </div>
                      <button
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          businessHours: {
                            ...prev.businessHours,
                            [day]: { ...prev.businessHours[day], enabled: !prev.businessHours[day].enabled }
                          }
                        }))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          config.businessHours[day].enabled
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/5 text-gray-500 border border-white/10'
                        }`}
                      >
                        {config.businessHours[day].enabled ? 'Open' : 'Closed'}
                      </button>
                      {config.businessHours[day].enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={config.businessHours[day].start}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                [day]: { ...prev.businessHours[day], start: e.target.value }
                              }
                            }))}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-aurora-cyan/50"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={config.businessHours[day].end}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                [day]: { ...prev.businessHours[day], end: e.target.value }
                              }
                            }))}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-aurora-cyan/50"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* After Hours Behavior */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <label className="text-sm text-gray-400 font-medium">After Hours Behavior</label>
                <select
                  value={config.afterHoursBehavior}
                  onChange={e => setConfig(prev => ({ ...prev, afterHoursBehavior: e.target.value as typeof config.afterHoursBehavior }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                >
                  <option value="voicemail">Send to Voicemail</option>
                  <option value="transfer">Transfer to Number</option>
                  <option value="custom_message">Play Custom Message</option>
                </select>
                
                {config.afterHoursBehavior === 'transfer' && (
                  <input
                    type="tel"
                    value={config.transferNumber}
                    onChange={e => setConfig(prev => ({ ...prev, transferNumber: e.target.value }))}
                    placeholder="After hours transfer number"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                )}
                
                {config.afterHoursBehavior === 'custom_message' && (
                  <textarea
                    value={config.afterHoursMessage}
                    onChange={e => setConfig(prev => ({ ...prev, afterHoursMessage: e.target.value }))}
                    rows={3}
                    placeholder="Message to play after hours..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors resize-none"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voicemail Tab */}
        <AnimatePresence>
          {activeTab === 'voicemail' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Voicemail Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <MessageIcon />
                  <h4 className="font-medium text-white">Voicemail</h4>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, voicemailEnabled: !prev.voicemailEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.voicemailEnabled ? 'bg-aurora-cyan' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    config.voicemailEnabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {config.voicemailEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Voicemail Prompt</label>
                    <textarea
                      value={config.voicemailPrompt}
                      onChange={e => setConfig(prev => ({ ...prev, voicemailPrompt: e.target.value }))}
                      rows={2}
                      placeholder="Please leave your name, number, and message after the beep."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Email Transcriptions To</label>
                    <input
                      type="email"
                      value={config.voicemailToEmail}
                      onChange={e => setConfig(prev => ({ ...prev, voicemailToEmail: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                    />
                    <p className="text-xs text-gray-600">Voicemail transcripts will be sent to this email</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03]">
        <button
          onClick={handleSave}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <SaveIcon />
          Save Inbound Configuration
        </button>
      </div>
    </div>
  )
}