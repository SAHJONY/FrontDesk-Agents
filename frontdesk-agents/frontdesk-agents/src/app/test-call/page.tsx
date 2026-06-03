'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TestCallComponent from '@/components/TestCallComponent'
import InboundCallConfig from '@/components/InboundCallConfig'
import Link from 'next/link'

// ─── Icons ───────────────────────────────────────────────────────────────────
const PhoneInboundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
)

const PhoneOutboundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

// ─── Call History Entry ──────────────────────────────────────────────────────
interface CallHistoryEntry {
  id: string
  phoneNumber: string
  prompt: string
  status: 'completed' | 'failed'
  duration?: number
  timestamp: Date
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default function TestCallPage() {
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeSection, setActiveSection] = useState<'outbound' | 'inbound'>('outbound')

  const handleInboundConfigSave = (config: any) => {
    // In production, save to backend/database
    console.log('Inbound config saved:', config)
  }

  const handleCallComplete = (result: { callId: string; status: string; duration?: number; timestamp: Date }) => {
    const entry: CallHistoryEntry = {
      id: result.callId,
      phoneNumber: 'Recorded',
      prompt: 'Test call',
      status: result.status as 'completed' | 'failed',
      duration: result.duration,
      timestamp: result.timestamp,
    }
    setCallHistory(prev => [entry, ...prev].slice(0, 10))
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* ─── NAV ─── */}
      <nav className="border-b border-white/10 bg-white/[0.03]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/demo" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeftIcon />
              <span className="text-sm">Back</span>
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                <BotIcon />
              </div>
              <span className="font-bold">GlobalVoice AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showHistory 
                  ? 'bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              Call History ({callHistory.length})
            </button>
          </div>
        </div>
      </nav>

      {/* ─── SECTION TABS ─── */}
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveSection('outbound')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeSection === 'outbound'
                  ? 'border-aurora-cyan text-aurora-cyan'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <PhoneOutboundIcon />
              Outbound Calls
            </button>
            <button
              onClick={() => setActiveSection('inbound')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeSection === 'inbound'
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <PhoneInboundIcon />
              Inbound AI Answering
            </button>
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative pt-12 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-cyan/10 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-sm text-aurora-cyan mb-4">
              <PhoneIcon />
              {activeSection === 'outbound' ? 'Test Mode' : 'AI Receptionist'}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display leading-tight mb-3">
              {activeSection === 'outbound' ? 'Voice Call Testing' : 'Inbound AI Answering'}
            </h1>
            <p className="text-base text-gray-400 max-w-xl mx-auto">
              {activeSection === 'outbound' 
                ? 'Make test calls to verify your Bland AI integration is working correctly.'
                : 'Configure your AI receptionist to handle incoming calls with custom greetings, routing, and voicemail.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeSection === 'outbound' && (
              <motion.div
                key="outbound"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Test Call Component */}
                  <div className="lg:col-span-2">
                    <TestCallComponent
                      onCallComplete={handleCallComplete}
                      defaultPhoneNumber="+16783466284"
                      defaultPrompt="Hello, this is a test call from GlobalVoice AI. If you can hear this message, the Bland AI integration is working correctly. Thank you for testing with us today."
                    />
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Configuration Info */}
                    <div className="bg-deep-space/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <InfoIcon />
                        Configuration
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Voice ID</span>
                          <span className="text-gray-300 font-mono text-xs truncate max-w-[120px]">30972a71-...</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">From Number</span>
                          <span className="text-gray-300 font-mono text-xs">+13465214387</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Caller ID</span>
                          <span className="text-gray-300 font-mono text-xs">+16783466284</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-600">
                          Configuration is loaded from environment variables
                        </p>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-deep-space/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5">
                      <h3 className="font-semibold text-white mb-3">Tips</h3>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-aurora-cyan mt-0.5">•</span>
                          Use E.164 format: +1 for US numbers
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-aurora-cyan mt-0.5">•</span>
                          Keep prompts under 500 characters
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-aurora-cyan mt-0.5">•</span>
                          Test with your actual caller ID number
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-aurora-cyan mt-0.5">•</span>
                          Check webhook logs for call events
                        </li>
                      </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-deep-space/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5">
                      <h3 className="font-semibold text-white mb-3">Quick Links</h3>
                      <div className="space-y-2">
                        <Link 
                          href="/api/bland/voices" 
                          className="block px-4 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-sm text-gray-400 hover:text-white transition-all"
                        >
                          Check Available Voices
                        </Link>
                        <Link 
                          href="/api/bland/webhook" 
                          className="block px-4 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-sm text-gray-400 hover:text-white transition-all"
                        >
                          Webhook Status
                        </Link>
                        <a 
                          href="https://app.bland.ai" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block px-4 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-sm text-gray-400 hover:text-white transition-all"
                        >
                          Bland AI Dashboard →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call History */}
                <AnimatePresence>
                  {showHistory && callHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mt-8"
                    >
                      <div className="bg-deep-space/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
                          <h3 className="font-semibold text-white">Recent Test Calls</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                          {callHistory.map((entry, i) => (
                            <div key={entry.id || i} className="px-6 py-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  entry.status === 'completed' 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-cinematic-red/10 text-cinematic-red'
                                }`}>
                                  {entry.status === 'completed' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-white font-medium">{entry.phoneNumber}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[300px]">{entry.prompt}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-medium ${entry.status === 'completed' ? 'text-green-400' : 'text-cinematic-red'}`}>
                                  {entry.status === 'completed' ? 'Completed' : 'Failed'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {entry.duration ? formatDuration(entry.duration) : '--:--'} · {formatTime(entry.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeSection === 'inbound' && (
              <motion.div
                key="inbound"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-4xl mx-auto">
                  <InboundCallConfig onConfigSave={handleInboundConfigSave} />
                  
                  {/* Info Box */}
                  <div className="mt-6 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <p className="text-sm text-gray-400">
                      <span className="text-green-400 font-medium">Inbound Setup:</span> To enable AI answering for incoming calls, configure your Bland AI phone number to route to this endpoint. 
                      In your Bland AI dashboard, set the webhook URL to receive call events and enable the AI to answer incoming calls on your designated inbound number.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}