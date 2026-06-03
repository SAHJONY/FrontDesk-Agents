'use client'

import { useState, useEffect } from 'react'

interface AIStatus {
  hermes: { initialized: boolean; openai: boolean; anthropic: boolean; bland: boolean }
  openai: { configured: boolean; models: string[] }
  anthropic: { configured: boolean; models: { id: string; name: string; description: string }[] }
  bland: { configured: boolean }
}

export default function AIPlatformConfig() {
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    hermesDefaultModel: 'auto',
    openaiModel: 'gpt-4-turbo',
    anthropicModel: 'claude-sonnet-4-20250514',
    autonomousMode: true,
    sentimentAnalysis: true,
    callRouting: true,
    voiceResponses: true,
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAIStatus()
  }, [])

  const fetchAIStatus = async () => {
    try {
      const res = await fetch('/api/ai/hermes?action=status')
      const hermesStatus = await res.json()
      
      const openaiRes = await fetch('/api/ai/openai')
      const openaiStatus = await openaiRes.json()
      
      const anthropicRes = await fetch('/api/ai/anthropic')
      const anthropicStatus = await anthropicRes.json()
      
      setStatus({
        hermes: hermesStatus,
        openai: openaiStatus,
        anthropic: anthropicStatus,
        bland: { configured: !!hermesStatus.bland }
      })
    } catch (error) {
      console.error('Failed to fetch AI status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      // Save config to localStorage for demo (in production, would call API)
      localStorage.setItem('ai_platform_config', JSON.stringify(config))
      setMessage('AI platform configuration saved successfully!')
    } catch (error) {
      setMessage('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-aurora-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hermes Status */}
        <div className={`p-4 rounded-xl border ${status?.hermes?.initialized ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status?.hermes?.initialized ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Hermes</h3>
              <p className="text-sm text-gray-400">Main Brain & Engine</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status?.hermes?.initialized ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status?.hermes?.initialized ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {status?.hermes?.initialized ? 'Active' : 'Not Initialized'}
          </div>
        </div>

        {/* OpenAI Status */}
        <div className={`p-4 rounded-xl border ${status?.openai?.configured ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status?.openai?.configured ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">OpenAI</h3>
              <p className="text-sm text-gray-400">GPT-4 Processing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status?.openai?.configured ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-400">
              {status?.openai?.configured ? 'Configured' : 'API Key Required'}
            </span>
          </div>
          {status?.openai?.configured && (
            <p className="mt-2 text-xs text-gray-500">
              Model: {status.openai.models?.[0] || 'gpt-4-turbo'}
            </p>
          )}
        </div>

        {/* Anthropic Status */}
        <div className={`p-4 rounded-xl border ${status?.anthropic?.configured ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status?.anthropic?.configured ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              <span className="text-xl">🧩</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Anthropic</h3>
              <p className="text-sm text-gray-400">Claude Processing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status?.anthropic?.configured ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-400">
              {status?.anthropic?.configured ? 'Configured' : 'API Key Required'}
            </span>
          </div>
          {status?.anthropic?.configured && (
            <p className="mt-2 text-xs text-gray-500">
              Model: Claude Sonnet 4
            </p>
          )}
        </div>
      </div>

      {/* Bland AI Status */}
      <div className={`p-4 rounded-xl border ${status?.bland?.configured ? 'bg-aurora-cyan/10 border-aurora-cyan/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.bland?.configured ? 'bg-aurora-cyan/20' : 'bg-gray-500/20'}`}>
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Bland AI</h3>
              <p className="text-sm text-gray-400">Voice & Autonomous Calling</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status?.bland?.configured ? 'bg-aurora-cyan' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-400">
                  {status?.bland?.configured ? 'Active' : 'Not Configured'}
                </span>
              </div>
              {status?.bland?.configured && (
                <p className="text-xs text-gray-500 mt-1">Autonomous calling enabled</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hermes Default Model
            </label>
            <select
              value={config.hermesDefaultModel}
              onChange={(e) => setConfig({ ...config, hermesDefaultModel: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-aurora-cyan"
            >
              <option value="auto">Auto-Select (Based on Task)</option>
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          {/* OpenAI Model */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OpenAI Model
            </label>
            <select
              value={config.openaiModel}
              onChange={(e) => setConfig({ ...config, openaiModel: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-aurora-cyan"
            >
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          {/* Anthropic Model */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Anthropic Model
            </label>
            <select
              value={config.anthropicModel}
              onChange={(e) => setConfig({ ...config, anthropicModel: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-aurora-cyan"
            >
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
              <option value="claude-opus-4-20250514">Claude Opus 4</option>
            </select>
          </div>

          {/* Autonomous Mode */}
          <div className="flex items-center justify-between p-4 bg-dark-100 rounded-lg border border-white/5">
            <div>
              <h4 className="font-medium text-white">Autonomous Mode</h4>
              <p className="text-xs text-gray-400">AI makes decisions without human input</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, autonomousMode: !config.autonomousMode })}
              className={`w-12 h-6 rounded-full transition-colors ${config.autonomousMode ? 'bg-aurora-cyan' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${config.autonomousMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Autonomous Features</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sentiment Analysis */}
            <div className="flex items-center justify-between p-3 bg-dark-100 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎭</span>
                <div>
                  <p className="text-sm font-medium text-white">Sentiment Analysis</p>
                  <p className="text-xs text-gray-400">Analyze caller emotions</p>
                </div>
              </div>
              <button
                onClick={() => setConfig({ ...config, sentimentAnalysis: !config.sentimentAnalysis })}
                className={`w-10 h-5 rounded-full transition-colors ${config.sentimentAnalysis ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config.sentimentAnalysis ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Call Routing */}
            <div className="flex items-center justify-between p-3 bg-dark-100 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔀</span>
                <div>
                  <p className="text-sm font-medium text-white">AI Call Routing</p>
                  <p className="text-xs text-gray-400">Smart call distribution</p>
                </div>
              </div>
              <button
                onClick={() => setConfig({ ...config, callRouting: !config.callRouting })}
                className={`w-10 h-5 rounded-full transition-colors ${config.callRouting ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config.callRouting ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Voice Responses */}
            <div className="flex items-center justify-between p-3 bg-dark-100 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-lg">🗣️</span>
                <div>
                  <p className="text-sm font-medium text-white">Dynamic Voice Responses</p>
                  <p className="text-xs text-gray-400">AI-generated responses</p>
                </div>
              </div>
              <button
                onClick={() => setConfig({ ...config, voiceResponses: !config.voiceResponses })}
                className={`w-10 h-5 rounded-full transition-colors ${config.voiceResponses ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config.voiceResponses ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-aurora-cyan text-dark-100 font-medium rounded-lg hover:bg-aurora-cyan/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          {message && (
            <span className="text-sm text-green-400">{message}</span>
          )}
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Key Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔑</span>
              <span className="text-sm text-white">OPENAI_API_KEY</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${status?.openai?.configured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {status?.openai?.configured ? 'Set' : 'Not Set'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔑</span>
              <span className="text-sm text-white">ANTHROPIC_API_KEY</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${status?.anthropic?.configured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {status?.anthropic?.configured ? 'Set' : 'Not Set'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔑</span>
              <span className="text-sm text-white">BLAND_AI_API_KEY</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${status?.bland?.configured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {status?.bland?.configured ? 'Set' : 'Not Set'}
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Add API keys to your <code className="bg-dark-200 px-1 py-0.5 rounded">.env</code> file to enable AI features.
        </p>
      </div>
    </div>
  )
}