'use client'

import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icons ───────────────────────────────────────────────────────────────────
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

// ─── Templates ───────────────────────────────────────────────────────────────
const GREETING_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    icon: '👔',
    prompt: `Hello, you've reached {businessName}. I'm your AI virtual assistant and I'm here to help. 

How can I assist you today? You can:
• Schedule an appointment
• Get information about our services
• Speak with a team member

Please let me know how I can help you.`
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: '🏥',
    prompt: `Thank you for calling {businessName}. This is your AI medical receptionist.

I can help you with:
• Scheduling or rescheduling appointments
• Prescription refills
• General health information
• Speaking with a nurse or physician

How may I assist you today?`
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: '⚖️',
    prompt: `You've reached {businessName}. I'm your AI intake specialist.

Are you:
• A new client seeking a consultation?
• An existing client checking case status?
• Calling about general legal matters?

Please let me know and I'll be happy to assist you.`
  },
  {
    id: 'realtor',
    name: 'Real Estate',
    icon: '🏠',
    prompt: `Hello and welcome to {businessName}! I'm your AI real estate assistant.

I can help you with:
• Viewing schedule for available properties
• Scheduling a consultation with an agent
• Information about neighborhoods and listings
• Selling your current home

What can I help you with today?`
  },
  {
    id: 'service',
    name: 'Home Services',
    icon: '🔧',
    prompt: `Thank you for calling {businessName}! This is your AI service dispatcher.

I can help you with:
• Scheduling service appointments
• Emergency service requests
• Service estimates and pricing
• Tracking your service technician

How may I assist you?`
  }
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface AIGreetingConfig {
  greetingPrompt: string
  language: string
  voice: string
  voiceSpeed: string
  waitForGreeting: boolean
  maxResponseTime: number
  sentimentAnalysis: boolean
  escalationKeywords: string[]
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface CustomerAIGreetingProps {
  onSave?: (config: AIGreetingConfig) => void
  className?: string
}

export default function CustomerAIGreeting({ onSave, className = '' }: CustomerAIGreetingProps) {
  const [config, setConfig] = useState<AIGreetingConfig>({
    greetingPrompt: GREETING_TEMPLATES[0].prompt,
    language: 'en',
    voice: 'natural',
    voiceSpeed: 'normal',
    waitForGreeting: true,
    maxResponseTime: 30,
    sentimentAnalysis: true,
    escalationKeywords: ['human', 'person', 'agent', 'real person', 'speak to someone', 'manager', 'supervisor', 'help', 'emergency'],
  })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'prompt' | 'voice' | 'behavior'>('prompt')
  const [customKeyword, setCustomKeyword] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('customer_ai_greeting')
    if (savedConfig) {
      try {
        setConfig({ ...config, ...JSON.parse(savedConfig) })
      } catch (e) {
        console.log('No saved config found')
      }
    }
  }, [])

  const handleSave = () => {
    // Save to localStorage (in production, would call API)
    localStorage.setItem('customer_ai_greeting', JSON.stringify(config))
    onSave?.(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectTemplate = (templateId: string) => {
    const template = GREETING_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      // Replace business name placeholder
      const businessName = localStorage.getItem('customer_business_name') || 'Your Business'
      setConfig(prev => ({
        ...prev,
        greetingPrompt: template.prompt.replace('{businessName}', businessName)
      }))
    }
  }

  const addKeyword = () => {
    if (customKeyword.trim() && !config.escalationKeywords.includes(customKeyword.trim())) {
      setConfig(prev => ({
        ...prev,
        escalationKeywords: [...prev.escalationKeywords, customKeyword.trim()]
      }))
      setCustomKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setConfig(prev => ({
      ...prev,
      escalationKeywords: prev.escalationKeywords.filter(k => k !== keyword)
    }))
  }

  const previewGreeting = () => {
    setIsPlaying(true)
    // In production, would trigger text-to-speech preview
    setTimeout(() => setIsPlaying(false), 3000)
  }

  const characterCount = config.greetingPrompt.length
  const maxCharacters = 500

  return (
    <div className={`bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
            <MessageIcon />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Greeting & Behavior</h3>
            <p className="text-xs text-gray-500">Configure how your AI receptionist answers calls</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-white/10">
        <div className="flex gap-1 -mb-px">
          {([
            { id: 'prompt', label: 'Greeting Prompt' },
            { id: 'voice', label: 'Voice & Language' },
            { id: 'behavior', label: 'Escalation' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-aurora-cyan text-aurora-cyan'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Prompt Tab */}
        <AnimatePresence>
          {activeTab === 'prompt' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Template Selection */}
              <div>
                <label className="text-sm text-gray-400 font-medium block mb-3">Quick Start Templates</label>
                <div className="flex flex-wrap gap-2">
                  {GREETING_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-aurora-cyan/30 transition-all text-sm text-gray-300 hover:text-white"
                    >
                      <span>{template.icon}</span>
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Greeting Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 font-medium">Your Greeting Message</label>
                  <span className={`text-xs ${characterCount > maxCharacters ? 'text-red-400' : 'text-gray-500'}`}>
                    {characterCount}/{maxCharacters} characters
                  </span>
                </div>
                <textarea
                  value={config.greetingPrompt}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setConfig(prev => ({ ...prev, greetingPrompt: e.target.value.slice(0, maxCharacters) }))}
                  rows={8}
                  placeholder="Enter what your AI should say when answering calls..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-colors resize-none"
                />
                <div className="flex items-start gap-2 mt-2">
                  <InfoIcon />
                  <p className="text-xs text-gray-500">
                    Keep your greeting under {maxCharacters} characters. Include what you want callers to know about your business and what actions they can take.
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400 font-medium">Preview</span>
                  <button
                    onClick={previewGreeting}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-aurora-cyan/10 hover:bg-aurora-cyan/20 text-aurora-cyan text-xs transition-all disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-aurora-cyan animate-pulse" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <PlayIcon />
                        Listen
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-deep-space/50 border border-white/5">
                  <p className="text-sm text-gray-300 whitespace-pre-line">
                    {config.greetingPrompt.replace('{businessName}', localStorage.getItem('customer_business_name') || 'Your Business')}
                  </p>
                </div>
              </div>

              {/* Wait for Greeting */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-sm text-white font-medium">Wait for caller greeting first</p>
                  <p className="text-xs text-gray-500">AI waits for the caller to speak before responding</p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, waitForGreeting: !prev.waitForGreeting }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${config.waitForGreeting ? 'bg-aurora-cyan' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${config.waitForGreeting ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Tab */}
        <AnimatePresence>
          {activeTab === 'voice' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Language */}
              <div>
                <label className="text-sm text-gray-400 font-medium block mb-2">Language</label>
                <select
                  value={config.language}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setConfig(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese (Mandarin)</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="pt">Portuguese</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="text-sm text-gray-400 font-medium block mb-2">Voice Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'natural', name: 'Natural', desc: 'Warm, conversational tone', preview: 'Neutral and friendly' },
                    { id: 'professional', name: 'Professional', desc: 'Clear, authoritative', preview: 'Polished and confident' },
                    { id: 'friendly', name: 'Friendly', desc: 'Energetic, upbeat', preview: 'Welcoming and casual' },
                    { id: 'calm', name: 'Calm', desc: 'Soothing, reassuring', preview: 'Peaceful and measured' },
                  ].map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => setConfig(prev => ({ ...prev, voice: voice.id }))}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        config.voice === voice.id
                          ? 'bg-aurora-cyan/10 border-aurora-cyan/30'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MicIcon />
                        <span className="text-sm font-medium text-white">{voice.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{voice.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div>
                <label className="text-sm text-gray-400 font-medium block mb-2">Speaking Speed</label>
                <div className="flex gap-2">
                  {['slow', 'normal', 'fast'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setConfig(prev => ({ ...prev, voiceSpeed: speed }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                        config.voiceSpeed === speed
                          ? 'bg-aurora-cyan text-white'
                          : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Behavior Tab */}
        <AnimatePresence>
          {activeTab === 'behavior' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Sentiment Analysis */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-sm text-white font-medium">Sentiment Analysis</p>
                  <p className="text-xs text-gray-500">AI detects caller emotion and adjusts response</p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, sentimentAnalysis: !prev.sentimentAnalysis }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${config.sentimentAnalysis ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${config.sentimentAnalysis ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Escalation Keywords */}
              <div>
                <label className="text-sm text-gray-400 font-medium block mb-2">Escalation Keywords</label>
                <p className="text-xs text-gray-500 mb-3">When callers say these words, AI transfers to human</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {config.escalationKeywords.map(keyword => (
                    <span
                      key={keyword}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-aurora-cyan/10 text-aurora-cyan text-xs border border-aurora-cyan/20"
                    >
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)} className="hover:text-white transition-colors ml-1">×</button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomKeyword(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword (e.g., 'manager')"
                    className="flex-1 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 rounded-xl bg-aurora-cyan/20 text-aurora-cyan text-sm hover:bg-aurora-cyan/30 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Max Response Time */}
              <div>
                <label className="text-sm text-gray-400 font-medium block mb-2">Max AI Response Time</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={config.maxResponseTime}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig(prev => ({ ...prev, maxResponseTime: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-white font-medium w-20 text-right">{config.maxResponseTime}s</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">AI will transfer call if response takes longer</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03]">
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <CheckIcon />
              Saved!
            </>
          ) : (
            <>
              <SaveIcon />
              Save AI Configuration
            </>
          )}
        </button>
      </div>
    </div>
  )
}