'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icons ───────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const PhoneOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
)

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
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
type CallStatus = 'idle' | 'calling' | 'connected' | 'completed' | 'failed'

interface TestCallResult {
  callId: string
  status: string
  duration?: number
  timestamp: Date
}

// ─── Default prompt templates ────────────────────────────────────────────────
const PROMPT_TEMPLATES = [
  { label: 'Introduction', prompt: 'Hello, this is a test call from GlobalVoice AI. I wanted to verify that everything is working correctly. Can you hear me clearly? Please respond with yes or no.' },
  { label: 'Appointment', prompt: 'Hi, this is your AI receptionist calling about an appointment. I am calling to confirm your scheduled appointment for tomorrow at 2 PM. Press 1 to confirm or 0 to speak with an operator.' },
  { label: 'Message', prompt: 'Hello, this is a callback from GlobalVoice AI regarding your recent inquiry. Our records show you requested information about our services. Please call us back at your convenience at 555-0123. Thank you.' },
  { label: 'Custom', prompt: '' },
]

// ─── Main Component ──────────────────────────────────────────────────────────
interface TestCallComponentProps {
  className?: string
  onCallComplete?: (result: TestCallResult) => void
  defaultPhoneNumber?: string
  defaultPrompt?: string
}

export default function TestCallComponent({
  className = '',
  onCallComplete,
  defaultPhoneNumber = '',
  defaultPrompt = '',
}: TestCallComponentProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [status, setStatus] = useState<CallStatus>('idle')
  const [result, setResult] = useState<TestCallResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [callId, setCallId] = useState<string | null>(null)
  const [callStartTime, setCallStartTime] = useState<number | null>(null)
  const [callDuration, setCallDuration] = useState(0)

  // Timer for call duration
  useEffect(() => {
    if (status === 'connected' && callStartTime) {
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [status, callStartTime])

  const handleStartCall = useCallback(async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number')
      return
    }

    // Validate E.164 format
    const phoneRegex = /^\\+?[1-9]\\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.trim())) {
      setError('Invalid phone number. Use E.164 format (e.g., +15555555555)')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a message/prompt for the AI to say')
      return
    }

    setStatus('calling')
    setError(null)
    setResult(null)
    setCallStartTime(Date.now())
    setCallDuration(0)

    try {
      const response = await fetch('/api/bland/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber.trim(),
          prompt: prompt.trim(),
          wait_for_greeting: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate call')
      }

      setCallId(data.call?.id || data.callId)
      setStatus('connected')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Call failed'
      setStatus('failed')
      setError(errorMessage)
      
      const failedResult: TestCallResult = {
        callId: 'unknown',
        status: 'failed',
        timestamp: new Date(),
      }
      setResult(failedResult)
      onCallComplete?.(failedResult)
    }
  }, [phoneNumber, prompt, onCallComplete])

  const handleEndCall = useCallback(() => {
    const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0
    
    const completedResult: TestCallResult = {
      callId: callId || 'unknown',
      status: 'completed',
      duration,
      timestamp: new Date(),
    }
    
    setStatus('completed')
    setResult(completedResult)
    onCallComplete?.(completedResult)
  }, [callId, callStartTime, onCallComplete])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setCallId(null)
    setCallStartTime(null)
    setCallDuration(0)
  }, [])

  const handleTemplateSelect = useCallback((template: typeof PROMPT_TEMPLATES[number]) => {
    setPrompt(template.prompt)
  }, [])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-deep-space/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
              <PhoneIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Test Voice Call</h3>
              <p className="text-xs text-gray-500">Make a test call via Bland AI</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {status === 'idle' && (
              <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs border border-gray-500/20">
                Ready
              </span>
            )}
            {status === 'calling' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Calling...
              </span>
            )}
            {status === 'connected' && (
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {formatDuration(callDuration)}
              </span>
            )}
            {status === 'completed' && (
              <span className="px-3 py-1 rounded-full bg-aurora-cyan/10 text-aurora-cyan text-xs border border-aurora-cyan/20">
                Completed
              </span>
            )}
            {status === 'failed' && (
              <span className="px-3 py-1 rounded-full bg-cinematic-red/10 text-cinematic-red text-xs border border-cinematic-red/20">
                Failed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-cinematic-red/10 border border-cinematic-red/20"
            >
              <XCircleIcon />
              <div className="flex-1">
                <p className="text-sm text-cinematic-red">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-cinematic-red/60 hover:text-cinematic-red">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success/Result Message */}
        <AnimatePresence>
          {result && status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <CheckCircleIcon />
              <div className="flex-1">
                <p className="text-sm text-green-400">Call completed successfully!</p>
                {result.duration && (
                  <p className="text-xs text-gray-400 mt-1">Duration: {formatDuration(result.duration)}</p>
                )}
                {result.callId && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">Call ID: {result.callId}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Phone Number (E.164 format)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <PhoneIcon />
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+15555555555"
              disabled={status === 'calling' || status === 'connected'}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <InfoIcon />
            Include country code (e.g., +1 for US)
          </p>
        </div>

        {/* Prompt/Message Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Message / Prompt</label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-gray-500">
              <MicIcon />
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the message the AI should say during the call..."
              rows={4}
              disabled={status === 'calling' || status === 'connected'}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Prompt Templates */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {PROMPT_TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => handleTemplateSelect(template)}
                disabled={status === 'calling' || status === 'connected'}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-aurora-cyan/20 transition-all text-xs text-gray-400 hover:text-white disabled:opacity-50"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {status === 'idle' && (
            <button
              onClick={handleStartCall}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-400 text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <PhoneIcon />
              Start Call
            </button>
          )}
          
          {status === 'calling' && (
            <button
              disabled
              className="px-6 py-3 rounded-xl bg-green-500/50 text-white font-semibold flex items-center gap-2 cursor-not-allowed"
            >
              <LoaderIcon />
              Connecting...
            </button>
          )}
          
          {status === 'connected' && (
            <>
              <button
                onClick={handleEndCall}
                className="px-6 py-3 rounded-xl bg-cinematic-red/80 text-white font-semibold hover:bg-cinematic-red transition-all active:scale-95 flex items-center gap-2"
              >
                <PhoneOffIcon />
                End Call
              </button>
              <span className="text-sm text-gray-400 font-mono">
                {formatDuration(callDuration)}
              </span>
            </>
          )}
          
          {(status === 'completed' || status === 'failed') && (
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all active:scale-95"
            >
              New Test Call
            </button>
          )}
        </div>
        
        {/* Call ID display */}
        {callId && status === 'connected' && (
          <div className="text-xs text-gray-500">
            <span className="font-mono">ID: {callId.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02]">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <InfoIcon />
          Calls use your configured Bland AI voice and phone number from environment settings.
        </p>
      </div>
    </div>
  )
}