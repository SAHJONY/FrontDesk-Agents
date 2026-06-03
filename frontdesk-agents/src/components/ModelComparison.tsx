'use client'

import { useState, useEffect } from 'react'
import { MODEL_CATEGORIES, getModelsByCategory } from '@/lib/nvidia-integration'
import { getAvailableModels as getOpenAIModels } from '@/lib/openai-integration'
import { getAvailableModels as getClaudeModels } from '@/lib/anthropic-integration'

// Helper to parse JSON response once
function parseResponse(response: string): { parsed: any; isJSON: boolean } {
  try {
    const parsed = JSON.parse(response)
    return { parsed, isJSON: typeof parsed === 'object' }
  } catch {
    return { parsed: null, isJSON: false }
  }
}

// Extract key metrics from parsed JSON
function extractMetrics(parsed: any): string[] {
  if (!parsed || typeof parsed !== 'object') return []
  const metrics: string[] = []
  if (parsed.sentiment) {
    const emoji = parsed.sentiment === 'positive' ? '😊' : parsed.sentiment === 'negative' ? '😞' : '😐'
    metrics.push(`${emoji} ${parsed.sentiment}`)
  }
  if (parsed.score !== undefined) metrics.push(`Score: ${(parsed.score * 100).toFixed(0)}%`)
  if (parsed.intent) metrics.push(`Intent: ${parsed.intent}`)
  if (parsed.action) metrics.push(`Action: ${parsed.action}`)
  if (parsed.confidence !== undefined) metrics.push(`Confidence: ${(parsed.confidence * 100).toFixed(0)}%`)
  if (parsed.summary) {
    const summaryText = parsed.summary.length > 50 ? parsed.summary.substring(0, 50) + '...' : parsed.summary
    metrics.push(`Summary: ${summaryText}`)
  }
  return metrics
}

interface ComparisonResult {
  provider: 'openai' | 'nvidia' | 'anthropic'
  status: 'pending' | 'success' | 'error'
  response?: string
  latency?: number
  tokens?: number
  error?: string
  model: string
  rating?: number
  notes?: string
}

interface SavedComparison {
  id: string
  timestamp: Date
  scenario: TestScenario
  systemPrompt: string
  userPrompt: string
  results: ComparisonResult[]
  overallRating?: number
}

interface ModelOption {
  id: string
  name: string
  provider: string
}

export type TestScenario = 
  | 'general'
  | 'sentiment'
  | 'call_handling'
  | 'intent_classification'
  | 'customer_service'
  | 'code_generation'

interface ScenarioConfig {
  id: TestScenario
  name: string
  icon: string
  description: string
  systemPrompt: string
  userPromptTemplate: string
}

const TEST_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'general',
    name: 'General Conversation',
    icon: '💬',
    description: 'Basic conversation and Q&A',
    systemPrompt: 'You are a helpful AI assistant.',
    userPromptTemplate: 'Explain quantum computing in simple terms'
  },
  {
    id: 'sentiment',
    name: 'Sentiment Analysis',
    icon: '🎭',
    description: 'Analyze customer emotions from text',
    systemPrompt: 'You are a customer sentiment analyzer. Always respond with valid JSON in this exact format: {"sentiment": "positive|negative|neutral", "score": 0-1, "summary": "brief summary"}',
    userPromptTemplate: 'Customer message: "I am extremely frustrated with your service. I have been waiting for a callback for 3 days! This is unacceptable."'
  },
  {
    id: 'call_handling',
    name: 'Call Handling Decision',
    icon: '📞',
    description: 'Decide how to handle an incoming call',
    systemPrompt: 'You are an autonomous call handling AI. Always respond with valid JSON: {"action": "transfer_to_agent|leave_voicemail|schedule_callback|provide_information|escalate_urgent", "confidence": 0-1, "reasoning": "brief explanation", "nextSteps": ["step1", "step2"]}',
    userPromptTemplate: 'Caller: Hi, I need to speak with someone about rescheduling my appointment from tomorrow to next week.'
  },
  {
    id: 'intent_classification',
    name: 'Intent Classification',
    icon: '🏷️',
    description: 'Classify what the caller wants',
    systemPrompt: 'You are an intent classification AI for a voice platform. Always respond with valid JSON: {"intent": "schedule_appointment|ask_pricing|file_claim|get_support|general_inquiry", "confidence": 0-1, "entities": {}, "suggestedResponse": "recommended text"}',
    userPromptTemplate: 'Customer: Hi, do you do teeth cleanings and how much does it cost without insurance?'
  },
  {
    id: 'customer_service',
    name: 'Customer Service Response',
    icon: '⭐',
    description: 'Generate professional CS replies',
    systemPrompt: 'You are a professional customer service AI. Generate empathetic, helpful responses that resolve customer issues.',
    userPromptTemplate: 'An angry customer says: I have been charged $200 for a service I never received! I want a refund immediately!'
  },
  {
    id: 'code_generation',
    name: 'Code Generation',
    icon: '💻',
    description: 'Write code snippets',
    systemPrompt: 'You are a code generation AI. Write clean, well-commented code.',
    userPromptTemplate: 'Write a JavaScript function that validates a phone number and returns true if valid, false otherwise.'
  },
]

export default function ModelComparison() {
  const [userPrompt, setUserPrompt] = useState('')
  const [systemPrompt, setSystemPrompt] = useState(TEST_SCENARIOS[0].systemPrompt)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    openai: 'gpt-4-turbo',
    nvidia: 'google/gemma-2-2b-it',
    anthropic: 'claude-sonnet-4-20250514',
  })
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>('general')
  const [comparisonHistory, setComparisonHistory] = useState<SavedComparison[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const openaiModels = getOpenAIModels()
  const claudeModels = getClaudeModels()

  const handleScenarioChange = (scenarioId: TestScenario) => {
    const scenario = TEST_SCENARIOS.find(s => s.id === scenarioId)
    if (scenario) {
      setSelectedScenario(scenarioId)
      setSystemPrompt(scenario.systemPrompt)
      setUserPrompt(scenario.userPromptTemplate)
    }
  }

  const handleModelChange = (provider: string, modelId: string) => {
    setSelectedModels(prev => ({ ...prev, [provider]: modelId }))
  }

  const runComparison = async () => {
    if (!userPrompt.trim()) return

    setLoading(true)
    setResults([
      { provider: 'openai', status: 'pending', model: selectedModels.openai },
      { provider: 'nvidia', status: 'pending', model: selectedModels.nvidia },
      { provider: 'anthropic', status: 'pending', model: selectedModels.anthropic },
    ])

    const promises = [
      testOpenAI(userPrompt, systemPrompt, selectedModels.openai),
      testNVIDIA(userPrompt, systemPrompt, selectedModels.nvidia),
      testAnthropic(userPrompt, systemPrompt, selectedModels.anthropic),
    ]

    const results_array = await Promise.allSettled(promises)
    
    const finalResults: ComparisonResult[] = results_array.map((result, index) => {
      const provider = ['openai', 'nvidia', 'anthropic'][index] as 'openai' | 'nvidia' | 'anthropic'
      
      if (result.status === 'fulfilled') {
        return { ...result.value, provider, status: 'success' as const }
      } else {
        return {
          provider,
          status: 'error' as const,
          model: selectedModels[provider],
          error: result.reason?.message || 'Unknown error'
        }
      }
    })

    setResults(finalResults)
    setLoading(false)
  }

  const saveToHistory = () => {
    if (results.every(r => r.status === 'success' || r.status === 'error')) {
      const saved: SavedComparison = {
        id: Date.now().toString(),
        timestamp: new Date(),
        scenario: selectedScenario,
        systemPrompt,
        userPrompt,
        results: [...results],
      }
      const newHistory = [saved, ...comparisonHistory].slice(0, 50)
      setComparisonHistory(newHistory)
      localStorage.setItem('modelComparisonHistory', JSON.stringify(newHistory))
    }
  }

  const loadHistory = () => {
    const stored = localStorage.getItem('modelComparisonHistory')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setComparisonHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })))
      } catch (e) {
        console.error('Failed to load history', e)
      }
    }
  }

  const rateResult = (provider: 'openai' | 'nvidia' | 'anthropic', rating: number) => {
    setResults(prev => prev.map(r => 
      r.provider === provider ? { ...r, rating } : r
    ))
  }

  const clearHistory = () => {
    setComparisonHistory([])
    localStorage.removeItem('modelComparisonHistory')
  }

  const restoreFromHistory = (comparison: SavedComparison) => {
    setSelectedScenario(comparison.scenario)
    setSystemPrompt(comparison.systemPrompt)
    setUserPrompt(comparison.userPrompt)
    setResults(comparison.results.map(r => ({ ...r })))
    setShowHistory(false)
  }

  const testOpenAI = async (prompt: string, system: string, model: string): Promise<Omit<ComparisonResult, 'provider' | 'status'>> => {
    const startTime = Date.now()
    
    const response = await fetch('/api/ai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        provider: 'openai', 
        prompt, 
        systemPrompt: system,
        model 
      })
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    if (!response.ok) throw new Error(data.error || 'OpenAI failed')

    return {
      response: data.response,
      latency,
      tokens: data.tokens,
      model: data.model
    }
  }

  const testNVIDIA = async (prompt: string, system: string, model: string): Promise<Omit<ComparisonResult, 'provider' | 'status'>> => {
    const startTime = Date.now()
    
    const response = await fetch('/api/ai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        provider: 'nvidia', 
        prompt, 
        systemPrompt: system,
        model 
      })
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    if (!response.ok) throw new Error(data.error || 'NVIDIA failed')

    return {
      response: data.response,
      latency,
      tokens: data.tokens,
      model: data.model
    }
  }

  const testAnthropic = async (prompt: string, system: string, model: string): Promise<Omit<ComparisonResult, 'provider' | 'status'>> => {
    const startTime = Date.now()
    
    const response = await fetch('/api/ai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        provider: 'anthropic', 
        prompt, 
        systemPrompt: system,
        model 
      })
    })

    const data = await response.json()
    const latency = Date.now() - startTime

    if (!response.ok) throw new Error(data.error || 'Anthropic failed')

    return {
      response: data.response,
      latency,
      tokens: data.tokens,
      model: data.model
    }
  }

  const providerColors = {
    openai: { bg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20', border: 'border-green-500/50', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300' },
    nvidia: { bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/50', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
    anthropic: { bg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  }

  const providerNames = {
    openai: 'OpenAI',
    nvidia: 'NVIDIA NIM',
    anthropic: 'Anthropic Claude',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-aurora-cyan via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Model Comparison Lab
          </h2>
          <p className="text-gray-400 mt-2">Test responses from OpenAI, NVIDIA NIM, and Anthropic Claude side-by-side</p>
        </div>
        {comparisonHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 rounded-xl border transition-all ${
              showHistory 
                ? 'bg-aurora-cyan/20 border-aurora-cyan/50 text-aurora-cyan' 
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white'
            }`}
          >
            📜 History ({comparisonHistory.length})
          </button>
        )}
      </div>

      {showHistory && comparisonHistory.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/60 rounded-2xl p-6 border border-gray-700/50 backdrop-blur mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">📜 Comparison History</h3>
            <button
              onClick={clearHistory}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comparisonHistory.map((comparison) => (
              <div
                key={comparison.id}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50 transition-colors cursor-pointer"
                onClick={() => restoreFromHistory(comparison)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TEST_SCENARIOS.find(s => s.id === comparison.scenario)?.icon}</span>
                    <span className="text-sm font-medium text-gray-200">
                      {TEST_SCENARIOS.find(s => s.id === comparison.scenario)?.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(comparison.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mb-2">
                  "{comparison.userPrompt}"
                </p>
                <div className="flex items-center gap-4">
                  {comparison.results.filter(r => r.status === 'success').map(r => (
                    <span key={r.provider} className={`text-xs ${providerColors[r.provider].text}`}>
                      {providerNames[r.provider]}: {r.rating ? '⭐'.repeat(r.rating) : '---'}
                    </span>
                  ))}
                  {comparison.results.filter(r => r.status === 'success' && r.rating).length > 0 && (
                    <span className="text-xs text-yellow-400 ml-auto">
                      Avg: {(comparison.results.filter(r => r.status === 'success' && r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / comparison.results.filter(r => r.status === 'success' && r.rating).length).toFixed(1)} ⭐
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl p-5 border border-gray-700/50 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg">🎯</span>
          <div>
            <h3 className="text-sm font-medium text-gray-300">Test Scenario</h3>
            <p className="text-xs text-gray-500">Select a scenario to auto-configure system prompt and sample</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {TEST_SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioChange(scenario.id)}
              className={`p-3 rounded-xl border text-left transition-all hover:scale-105 ${
                selectedScenario === scenario.id
                  ? 'border-aurora-cyan/50 bg-aurora-cyan/10'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="text-xl mb-1">{scenario.icon}</div>
              <div className="text-xs font-medium text-gray-200">{scenario.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{scenario.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            System Prompt <span className="text-xs text-gray-500">(auto-configured by scenario)</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Instructions for the AI model..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
            rows={2}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">User Prompt</label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Enter a prompt to compare across all three AI providers..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(['openai', 'nvidia', 'anthropic'] as const).map(provider => (
            <div key={provider} className={`p-4 rounded-xl ${providerColors[provider].bg} border ${providerColors[provider].border}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-semibold ${providerColors[provider].text}`}>{providerNames[provider]}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${providerColors[provider].badge}`}>
                  {provider === 'nvidia' ? 'NIM' : provider === 'anthropic' ? 'Claude' : 'GPT'}
                </span>
              </div>
              
              <select
                value={selectedModels[provider]}
                onChange={(e) => handleModelChange(provider, e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-gray-200 text-sm focus:outline-none cursor-pointer"
              >
                {provider === 'openai' && openaiModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {provider === 'nvidia' && (
                  <>
                    <optgroup label="⚡ Quick Test (Fast)">
                      {getModelsByCategory('QUICK_TEST').map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.verified ? '' : '(Untested)'}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌟 Balanced (Medium)">
                      {getModelsByCategory('BALANCED').map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.verified ? '' : '(Untested)'}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💪 Advanced (Larger/Slower)">
                      {getModelsByCategory('ADVANCED').map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.verified ? '' : '(Untested)'}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
                {provider === 'anthropic' && claudeModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={runComparison}
          disabled={loading || !userPrompt.trim()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-aurora-cyan to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running Comparison...
            </span>
          ) : (
            'Compare All Providers'
          )}
        </button>

        {results.length > 0 && results.every(r => r.status !== 'pending') && (
          <button
            onClick={saveToHistory}
            className="w-full py-3 mt-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-gray-300 font-medium hover:bg-gray-600/50 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <span>💾</span> Save Comparison to History
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-200">Results</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <div 
                key={result.provider}
                className={`rounded-xl border overflow-hidden ${providerColors[result.provider].bg} ${providerColors[result.provider].border}`}
              >
                <div className="p-4 border-b border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${providerColors[result.provider].text}`}>
                      {providerNames[result.provider]}
                    </span>
                    {result.status === 'success' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Success</span>
                    )}
                    {result.status === 'error' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Error</span>
                    )}
                    {result.status === 'pending' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Model: {result.model}</div>
                </div>

                <div className="p-4">
                  {result.status === 'pending' && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-aurora-cyan border-t-transparent rounded-full" />
                    </div>
                  )}

                  {result.status === 'error' && (
                    <div className="text-red-400 text-sm py-4">
                      <p className="font-medium mb-1">Error:</p>
                      <p className="text-gray-400">{result.error}</p>
                    </div>
                  )}

                  {result.status === 'success' && result.response && (() => {
                    const { parsed, isJSON } = parseResponse(result.response)
                    const metrics = extractMetrics(parsed)
                    
                    return (
                      <>
                        <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 mb-3 max-h-64 overflow-y-auto font-mono text-xs">
                          {isJSON ? (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>
                          ) : (
                            result.response
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>Latency: {result.latency}ms</span>
                          {result.tokens && <span>Tokens: ~{result.tokens}</span>}
                        </div>
                        
                        {metrics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {metrics.map((m, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-400">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-gray-700/30 pt-3 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Rate Response:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => rateResult(result.provider, star)}
                                  className={`text-lg transition-colors ${
                                    result.rating && star <= result.rating
                                      ? 'text-yellow-400' 
                                      : 'text-gray-600 hover:text-yellow-300'
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          {result.rating && (
                            <div className="text-xs text-yellow-400 mt-1">
                              {result.rating}/5 stars
                            </div>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>

          {results.every(r => r.status === 'success') && (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-semibold text-gray-200 mb-4">Quick Comparison</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                {results.map((result) => (
                  <div key={result.provider} className="p-4 rounded-lg bg-gray-800/50">
                    <div className={`text-2xl font-bold ${providerColors[result.provider].text}`}>
                      {result.latency}ms
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {providerNames[result.provider]}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {result.tokens ? `${result.tokens} tokens` : '-'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                {(() => {
                  const fastest = results.reduce((a, b) => (a.latency || 0) < (b.latency || 0) ? a : b)
                  return (
                    <span className={`text-sm ${providerColors[fastest.provider].text}`}>
                      ⚡ {providerNames[fastest.provider]} was fastest
                    </span>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-xl p-4 border border-gray-700/30">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Sample Prompts to Test</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { scenario: 'general' as TestScenario, prompt: 'Explain quantum computing in simple terms' },
            { scenario: 'sentiment' as TestScenario, prompt: 'I am very happy with your service!' },
            { scenario: 'call_handling' as TestScenario, prompt: 'I need to reschedule my appointment' },
            { scenario: 'intent_classification' as TestScenario, prompt: 'What are your pricing options?' },
            { scenario: 'customer_service' as TestScenario, prompt: 'Help me with a billing issue' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setUserPrompt(item.prompt)
                setSelectedScenario(item.scenario)
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-800/70 border border-gray-600/50 text-gray-300 hover:text-aurora-cyan hover:border-aurora-cyan/50 transition-colors"
            >
              {item.prompt.length > 35 ? item.prompt.substring(0, 35) + '...' : item.prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}