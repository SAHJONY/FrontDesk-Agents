'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, Mic, Settings, Globe, Check, AlertCircle, 
  RefreshCw, TestTube, ChevronDown, ChevronUp, Shield,
  Volume2, Clock, Zap, ExternalLink, Loader2
} from 'lucide-react'

interface BlandConfigFormProps {
  isDark?: boolean
}

interface BlandVoice {
  id: string
  name: string
  language: string
  gender?: string
  preview?: boolean
}

interface BlandConfigState {
  apiKey: string
  phoneNumber: string
  selectedVoice: string
  language: string
  maxDuration: number
  model: 'base' | 'enhanced'
  greetingMessage: string
  temperature: number
  voiceSettings: {
    stability: number
    similarityBoost: number
    speed: number
  }
  ambientSound: boolean
  backgroundSound: string
  interruptionSensitivity: number
  responseDelay: number
  sentimentThreshold: number
}

const availableVoices: BlandVoice[] = [
  { id: 'rachel', name: 'Rachel', language: 'English (US)', gender: 'Female', preview: true },
  { id: 'josh', name: 'Josh', language: 'English (US)', gender: 'Male', preview: true },
  { id: 'sam', name: 'Sam', language: 'English (US)', gender: 'Male' },
  { id: 'beth', name: 'Beth', language: 'English (US)', gender: 'Female' },
  { id: 'sarah', name: 'Sarah', language: 'English (UK)', gender: 'Female' },
  { id: 'matt', name: 'Matt', language: 'English (AU)', gender: 'Male' },
  { id: 'emma', name: 'Emma', language: 'English (UK)', gender: 'Female' },
  { id: 'david', name: 'David', language: 'English (US)', gender: 'Male' },
  { id: 'grace', name: 'Grace', language: 'English (AU)', gender: 'Female' },
  { id: 'james', name: 'James', language: 'English (UK)', gender: 'Male' },
]

const backgroundSounds = [
  { id: 'none', name: 'No Sound' },
  { id: 'office', name: 'Office Ambience' },
  { id: 'call-center', name: 'Call Center' },
  { id: 'nature', name: 'Nature Sounds' },
]

const languages = [
  { code: 'en', name: 'English (US)' },
  { code: 'en-gb', name: 'English (UK)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
]

export default function BlandConfigForm({ isDark = true }: BlandConfigFormProps) {
  const [config, setConfig] = useState<BlandConfigState>({
    apiKey: '••••••••••••••••',
    phoneNumber: '+1 (555) 123-4567',
    selectedVoice: 'rachel',
    language: 'en',
    maxDuration: 300,
    model: 'enhanced',
    greetingMessage: 'Hello, you have reached the AI receptionist. How may I help you today?',
    temperature: 0.7,
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
      speed: 1.0,
    },
    ambientSound: false,
    backgroundSound: 'none',
    interruptionSensitivity: 0.5,
    responseDelay: 0,
    sentimentThreshold: 0.3,
  })
  
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('voice')
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking')
  const [callStats, setCallStats] = useState({ total: 247, completed: 234, missed: 13 })

  useEffect(() => {
    // Simulate checking API health
    const timer = setTimeout(() => {
      setHealthStatus('healthy')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleTestCall = async () => {
    setIsTesting(true)
    setTestResult(null)
    // Simulate test call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestResult({ success: true, message: 'Test call initiated successfully!' })
    setIsTesting(false)
  }

  const handleVoicePreview = async (voiceId: string) => {
    // In production, this would call the TTS API to preview the voice
    console.log(`Previewing voice: ${voiceId}`)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateVoiceSetting = (key: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, [key]: value }
    }))
  }

  return (
    <div className={`rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30`}>
              <Phone className='w-6 h-6 text-green-500' />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Voice Configuration
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Voice AI settings for your receptionist agent
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            {/* Health Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              healthStatus === 'healthy' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : healthStatus === 'error'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                  : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy' ? 'bg-green-500 animate-pulse' 
                  : healthStatus === 'error' ? 'bg-red-500' 
                  : 'bg-yellow-500 animate-pulse'
              }`} />
              {healthStatus === 'checking' ? 'Checking...' : healthStatus === 'healthy' ? 'API Connected' : 'Error'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`px-6 py-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'} border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{callStats.total}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Calls</div>
          </div>
          <div className='text-center'>
            <div className={`text-2xl font-bold text-green-500`}>{callStats.completed}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</div>
          </div>
          <div className='text-center'>
            <div className={`text-2xl font-bold text-yellow-500`}>{callStats.missed}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Missed</div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='p-6 space-y-4'>
        {/* Connection Section */}
        <div className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} overflow-hidden`}>
          <button
            onClick={() => toggleSection('connection')}
            className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <div className='flex items-center gap-3'>
              <Globe className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Connection Settings</span>
            </div>
            {expandedSection === 'connection' ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
          
          {expandedSection === 'connection' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className={`px-4 pb-4 space-y-4`}
            >
              <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                <div className='flex items-center gap-3'>
                  <Check className='w-5 h-5 text-green-500' />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                      API Key Configured
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      API key is configured
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bland Phone Number
                </label>
                <div className='relative'>
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='text'
                    value={config.phoneNumber}
                    onChange={(e) => updateConfig('phoneNumber', e.target.value)}
                    placeholder='+1234567890'
                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  This number will be used for outbound AI calls
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Voice Section */}
        <div className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} overflow-hidden`}>
          <button
            onClick={() => toggleSection('voice')}
            className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <div className='flex items-center gap-3'>
              <Mic className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Settings</span>
            </div>
            {expandedSection === 'voice' ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
          
          {expandedSection === 'voice' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className={`px-4 pb-4 space-y-4`}
            >
              {/* Voice Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  AI Voice
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {availableVoices.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => updateConfig('selectedVoice', voice.id)}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        config.selectedVoice === voice.id
                          ? 'border-green-500 bg-green-500/10'
                          : isDark
                            ? 'border-white/10 bg-white/5 hover:border-white/20'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {voice.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {voice.language} {voice.gender && `• ${voice.gender}`}
                          </div>
                        </div>
                        {voice.preview && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVoicePreview(voice.id) }}
                            className={`p-1.5 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <Volume2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                        )}
                      </div>
                      {config.selectedVoice === voice.id && (
                        <div className='mt-2 flex items-center gap-1 text-green-500 text-xs'>
                          <Check className='w-3 h-3' /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => updateConfig('language', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                    isDark 
                      ? 'bg-white/5 border border-white/10 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Voice Settings Sliders */}
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Stability
                    </label>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {config.voiceSettings.stability.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    value={config.voiceSettings.stability}
                    onChange={(e) => updateVoiceSetting('stability', parseFloat(e.target.value))}
                    className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Lower = more variable, Higher = more consistent
                  </p>
                </div>

                <div>
                  <div className='flex justify-between mb-2'>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Similarity Boost
                    </label>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {config.voiceSettings.similarityBoost.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    value={config.voiceSettings.similarityBoost}
                    onChange={(e) => updateVoiceSetting('similarityBoost', parseFloat(e.target.value))}
                    className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                  />
                </div>

                <div>
                  <div className='flex justify-between mb-2'>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Speed
                    </label>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {config.voiceSettings.speed.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type='range'
                    min='0.5'
                    max='1.5'
                    step='0.01'
                    value={config.voiceSettings.speed}
                    onChange={(e) => updateVoiceSetting('speed', parseFloat(e.target.value))}
                    className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Behavior Section */}
        <div className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} overflow-hidden`}>
          <button
            onClick={() => toggleSection('behavior')}
            className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <div className='flex items-center gap-3'>
              <Zap className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Behavior</span>
            </div>
            {expandedSection === 'behavior' ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
          
          {expandedSection === 'behavior' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className={`px-4 pb-4 space-y-4`}
            >
              {/* Model */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  AI Model
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {['base', 'enhanced'].map(model => (
                    <button
                      key={model}
                      onClick={() => updateConfig('model', model)}
                      className={`p-3 rounded-xl border transition-all ${
                        config.model === model
                          ? 'border-green-500 bg-green-500/10 text-green-500'
                          : isDark
                            ? 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className='text-sm font-medium capitalize'>{model}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {model === 'enhanced' ? 'Better quality, higher cost' : 'Standard quality, lower cost'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <div className='flex justify-between mb-2'>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Temperature / Creativity
                  </label>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {config.temperature.toFixed(1)}
                  </span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={config.temperature}
                  onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                  className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                />
                <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Duration */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Max Call Duration
                </label>
                <div className='flex items-center gap-4'>
                  <input
                    type='range'
                    min='60'
                    max='600'
                    step='30'
                    value={config.maxDuration}
                    onChange={(e) => updateConfig('maxDuration', parseInt(e.target.value))}
                    className='flex-1 h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                  />
                  <span className={`text-sm font-medium min-w-[60px] text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.floor(config.maxDuration / 60)}:{(config.maxDuration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Response Delay */}
              <div>
                <div className='flex justify-between mb-2'>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Response Delay
                  </label>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {config.responseDelay}s
                  </span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='2'
                  step='0.1'
                  value={config.responseDelay}
                  onChange={(e) => updateConfig('responseDelay', parseFloat(e.target.value))}
                  className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Add a natural pause before responses
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Greeting Message */}
        <div className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} overflow-hidden`}>
          <button
            onClick={() => toggleSection('greeting')}
            className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <div className='flex items-center gap-3'>
              <Volume2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Greeting Message</span>
            </div>
            {expandedSection === 'greeting' ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
          
          {expandedSection === 'greeting' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className={`px-4 pb-4`}
            >
              <textarea
                value={config.greetingMessage}
                onChange={(e) => updateConfig('greetingMessage', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                }`}
                placeholder='Enter the greeting message your AI receptionist will say...'
              />
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                This message will be played when a call is answered. Keep it under 30 seconds.
              </p>
            </motion.div>
          )}
        </div>

        {/* Advanced Section */}
        <div className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} overflow-hidden`}>
          <button
            onClick={() => toggleSection('advanced')}
            className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <div className='flex items-center gap-3'>
              <Settings className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Advanced Settings</span>
            </div>
            {expandedSection === 'advanced' ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
          
          {expandedSection === 'advanced' && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className={`px-4 pb-4 space-y-4`}
            >
              {/* Ambient Sound Toggle */}
              <div className='flex items-center justify-between'>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ambient Sound
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Play subtle background audio during calls
                  </div>
                </div>
                <button
                  onClick={() => updateConfig('ambientSound', !config.ambientSound)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    config.ambientSound ? 'bg-green-500' : isDark ? 'bg-white/20' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    config.ambientSound ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Background Sound */}
              {config.ambientSound && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Background Sound
                  </label>
                  <select
                    value={config.backgroundSound}
                    onChange={(e) => updateConfig('backgroundSound', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {backgroundSounds.map(sound => (
                      <option key={sound.id} value={sound.id}>{sound.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Interruption Sensitivity */}
              <div>
                <div className='flex justify-between mb-2'>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Interruption Sensitivity
                  </label>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {config.interruptionSensitivity.toFixed(1)}
                  </span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={config.interruptionSensitivity}
                  onChange={(e) => updateConfig('interruptionSensitivity', parseFloat(e.target.value))}
                  className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  How sensitive the AI is to user interruptions
                </p>
              </div>

              {/* Sentiment Threshold */}
              <div>
                <div className='flex justify-between mb-2'>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sentiment Alert Threshold
                  </label>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {config.sentimentThreshold.toFixed(1)}
                  </span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={config.sentimentThreshold}
                  onChange={(e) => updateConfig('sentimentThreshold', parseFloat(e.target.value))}
                  className='w-full h-2 rounded-full appearance-none bg-gray-600 accent-green-500'
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Trigger human transfer when negative sentiment is detected
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-4 pt-4'>
          <button
            onClick={handleTestCall}
            disabled={isTesting}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
            }`}
          >
            {isTesting ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Testing...
              </>
            ) : (
              <>
                <TestTube className='w-5 h-5' />
                Test Call
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-all'
          >
            {isSaving ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className='w-5 h-5' />
                Saved!
              </>
            ) : (
              <>
                Save Configuration
              </>
            )}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              testResult.success 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            {testResult.success ? (
              <Check className='w-5 h-5 text-green-500' />
            ) : (
              <AlertCircle className='w-5 h-5 text-red-500' />
            )}
            <span className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.message}
            </span>
          </motion.div>
        )}

        {/* Documentation Link */}
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <a 
            href='#' 
            target='_blank' 
            rel='noopener noreferrer'
            className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <ExternalLink className='w-4 h-4' />
            View Documentation
          </a>
        </div>
      </div>
    </div>
  )
}