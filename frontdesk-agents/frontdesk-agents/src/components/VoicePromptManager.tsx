'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BotIcon, MicIcon, FileTextIcon, ChevronDownIcon, SaveIcon, TestIcon } from 'lucide-react'

// Business types for prompt templates
const BUSINESS_TYPES = [
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'dental', name: 'Dental', icon: '🦷' },
  { id: 'legal', name: 'Legal', icon: '⚖️' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠' },
  { id: 'hvac', name: 'HVAC / Home Services', icon: '🔧' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'spa', name: 'Spa & Wellness', icon: '💆' },
  { id: 'general', name: 'General Business', icon: '🏢' },
]

// Sample voices (would come from API in production)
const VOICES = [
  { id: 'nat', name: 'Natural', description: 'Most natural sounding voice' },
  { id: 'sage', name: 'Sage', description: 'Calm and professional' },
  { id: 'forest', name: 'Forest', description: 'Soft and friendly' },
  { id: 'river', name: 'River', description: 'Clear and articulate' },
  { id: 'max', name: 'Max', description: 'Energetic and upbeat' },
  { id: '30972a71-c4b5-4aa3-9ce7-e065d6409a8f', name: 'Custom Voice', description: 'Your custom voice from Bland AI' },
]

interface VoiceConfig {
  selectedVoice: string
  language: string
}

interface PromptConfig {
  businessType: string
  customPrompt: string
  variables: string[]
}

export default function VoicePromptManager() {
  const [activeTab, setActiveTab] = useState<'voice' | 'prompts'>('voice')
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    selectedVoice: '30972a71-c4b5-4aa3-9ce7-e065d6409a8f',
    language: 'en',
  })
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    businessType: 'general',
    customPrompt: '',
    variables: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [testPrompt, setTestPrompt] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  // Load existing configuration on mount
  useEffect(() => {
    fetchVoiceConfig()
    fetchPromptConfig()
  }, [])

  const fetchVoiceConfig = async () => {
    try {
      const res = await fetch('/api/bland/voices')
      const data = await res.json()
      if (data.defaultVoice) {
        setVoiceConfig(prev => ({
          ...prev,
          selectedVoice: data.defaultVoice,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch voice config:', error)
    }
  }

  const fetchPromptConfig = async () => {
    try {
      const res = await fetch(`/api/bland/prompts?business_type=${promptConfig.businessType}`)
      const data = await res.json()
      if (data.prompt) {
        setPromptConfig(prev => ({
          ...prev,
          customPrompt: data.prompt.systemPrompt,
          variables: data.prompt.variables,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch prompt config:', error)
    }
  }

  const handleSaveVoice = async () => {
    setIsSaving(true)
    try {
      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save voice config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrompt = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/bland/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: promptConfig.businessType,
          customPrompt: promptConfig.customPrompt,
        }),
      })
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save prompt config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestCall = async () => {
    if (!testPrompt.trim()) return
    
    setIsTesting(true)
    try {
      const res = await fetch('/api/bland/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: '+16783466284', // Your test number
          prompt: testPrompt,
          voice: voiceConfig.selectedVoice,
          language: voiceConfig.language,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Test call initiated! Check your phone.')
      } else {
        alert('Failed to initiate test call: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to test call:', error)
      alert('Failed to initiate test call')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'voice'
              ? 'border-aurora-cyan text-aurora-cyan'
              : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <MicIcon size={16} />
          Voice Settings
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'prompts'
              ? 'border-aurora-cyan text-aurora-cyan'
              : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <FileTextIcon size={16} />
          Prompt Templates
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Voice Settings Tab */}
        {activeTab === 'voice' && (
          <motion.div
            key="voice-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Voice Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400">AI Voice</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VOICES.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setVoiceConfig(prev => ({ ...prev, selectedVoice: voice.id }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      voiceConfig.selectedVoice === voice.id
                        ? 'border-aurora-cyan/50 bg-aurora-cyan/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        voiceConfig.selectedVoice === voice.id
                          ? 'bg-aurora-cyan/20 text-aurora-cyan'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        <BotIcon size={16} />
                      </div>
                      <span className="font-medium text-white">{voice.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{voice.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400">Language</label>
              <select
                value={voiceConfig.language}
                onChange={(e) => setVoiceConfig(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Test Voice Section */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <h4 className="text-sm font-medium text-white mb-3">Test Voice</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a test message..."
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50"
                />
                <button
                  onClick={handleTestCall}
                  disabled={isTesting || !testPrompt.trim()}
                  className="px-4 py-2 rounded-lg bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20 text-sm font-medium hover:bg-aurora-cyan/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <TestIcon size={16} />
                  {isTesting ? 'Calling...' : 'Test'}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveVoice}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-50"
              >
                <SaveIcon size={18} />
                {isSaving ? 'Saving...' : 'Save Voice Settings'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <motion.div
            key="prompts-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Business Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400">Business Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setPromptConfig(prev => ({ ...prev, businessType: type.id }))
                      fetch(`/api/bland/prompts?business_type=${type.id}`)
                        .then(res => res.json())
                        .then(data => {
                          if (data.prompt) {
                            setPromptConfig(prev => ({
                              ...prev,
                              businessType: type.id,
                              customPrompt: data.prompt.systemPrompt,
                              variables: data.prompt.variables,
                            }))
                          }
                        })
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      promptConfig.businessType === type.id
                        ? 'border-aurora-cyan/50 bg-aurora-cyan/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium text-white">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-400">System Prompt</label>
                <span className="text-xs text-gray-500">
                  Variables: {promptConfig.variables.length}
                </span>
              </div>
              <textarea
                value={promptConfig.customPrompt}
                onChange={(e) => setPromptConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Enter your AI receptionist prompt..."
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use {"{{variable}}"} syntax for dynamic values. The AI will fill these in during calls.
              </p>
            </div>

            {/* Available Variables */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400">Available Variables</label>
              <div className="flex flex-wrap gap-2">
                {promptConfig.variables.map(variable => (
                  <span
                    key={variable}
                    className="px-3 py-1 rounded-full bg-aurora-cyan/10 text-aurora-cyan text-xs font-mono"
                  >
                    {"{{" + variable + "}}"}
                  </span>
                ))}
                {promptConfig.variables.length === 0 && (
                  <span className="text-xs text-gray-500">Select a business type to see available variables</span>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSavePrompt}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-50"
              >
                <SaveIcon size={18} />
                {isSaving ? 'Saving...' : 'Save Prompt Template'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium"
          >
            ✓ Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}