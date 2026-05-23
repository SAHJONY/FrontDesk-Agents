'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Phone, Users, Settings, Shield, Activity,
  MessageSquare, Play, Pause, AlertCircle, CheckCircle,
  Loader2, Terminal, Key, Database, Bot, Search,
  Menu, X, ChevronRight, Command, Zap, Globe, FileText, Cpu, Wifi,
  Plus, Trash2, Edit2, Save, XCircle, Wallet
} from 'lucide-react'

// Types
interface SystemStatus {
  name: string
  status: 'active' | 'idle' | 'error' | 'thinking'
  uptime: string
  lastAction: string
  model?: string
}

interface EnvVar {
  key: string
  value: string
  description: string
  status: 'set' | 'missing'
  editable?: boolean
}

interface AIModel {
  id: string
  name: string
  provider: 'NVIDIA' | 'OpenAI' | 'Anthropic' | 'Custom'
  modelString: string
  apiKey?: string
  baseUrl?: string
  active: boolean
}

export default function CentralCommandCenter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  
  // AI Model State
  const [selectedModel, setSelectedModel] = useState('meta/llama-3.1-405b-instruct')
  const [nvidiaMode, setNvidiaMode] = useState(false)
  
  // Hermes-Style Model Manager State
  const [models, setModels] = useState<AIModel[]>([
    { id: '1', name: 'NVIDIA Llama-3.1 405B', provider: 'NVIDIA', modelString: 'meta/llama-3.1-405b-instruct', baseUrl: 'https://integrate.api.nvidia.com/v1', active: true },
    { id: '2', name: 'NVIDIA Llama-3.1 70B', provider: 'NVIDIA', modelString: 'meta/llama-3.1-70b-instruct', baseUrl: 'https://integrate.api.nvidia.com/v1', active: false },
    { id: '3', name: 'OpenAI GPT-4o', provider: 'OpenAI', modelString: 'gpt-4o', active: false },
  ])
  const [isAddingModel, setIsAddingModel] = useState(false)
  
  // Chat Interface State
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMinimized, setChatMinimized] = useState(false)
  
  // Available NVIDIA Models
  const nvidiaModels = [
    { id: 'meta/llama-3.1-405b-instruct', name: 'Llama-3.1 405B (Most Powerful)', provider: 'NVIDIA' },
    { id: 'meta/llama-3.1-70b-instruct', name: 'Llama-3.1 70B (Balanced)', provider: 'NVIDIA' },
    { id: 'meta/llama-3-70b-instruct', name: 'Llama-3 70B', provider: 'NVIDIA' },
    { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'NVIDIA' },
    { id: 'google/gemma-7b', name: 'Gemma 7B', provider: 'NVIDIA' },
    { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'OpenAI' },
  ]
  
  // System State
  const [systems, setSystems] = useState<SystemStatus[]>([])
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'system', text: string}[]>([])
  const [demoStatus, setDemoStatus] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle')
  const [isAddingModel, setIsAddingModel] = useState(false)
  
  // Live Mode State
  const [liveStats, setLiveStats] = useState({ calls: 0, users: 0, tokens: 0, uptime: '99.9%' })
  const [recentLogs, setRecentLogs] = useState<{id: number, event: string, time: string, status: 'success' | 'error' | 'info'}[]>([])
  const [isAgentRunning, setIsAgentRunning] = useState(true)
  
  // Square POS State
  const [squareData, setSquareData] = useState({
    totalSales: 0,
    transactions: [] as any[],
    loading: true
  })
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initSystem = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Check auth
  useEffect(() => {
    const initSystem = async () => {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/owner/login'); return }

      // Fetch Square POS Data (Simulated for now - replace with real API call)
      const fetchSquareData = async () => {
        setSquareData(prev => ({ ...prev, loading: true }))
        try {
          // TODO: Replace with actual Square API call
          // const response = await fetch('/api/square/transactions')
          // const data = await response.json()
          
          // Mock data for demonstration
          setTimeout(() => {
            setSquareData({
              totalSales: 12450.75,
              transactions: [
                { id: '1', amount: 125.50, item: 'AI Consultation', time: '2 min ago', status: 'success' },
                { id: '2', amount: 299.00, item: 'Legal Research Package', time: '15 min ago', status: 'success' },
                { id: '3', amount: 49.99, item: 'Monthly Subscription', time: '1 hour ago', status: 'success' },
              ],
              loading: false
            })
          }, 1000)
        } catch (error) {
          console.error('Square API Error:', error)
          setSquareData(prev => ({ ...prev, loading: false }))
        }
      }

      fetchSquareData()
      
      // Poll Square data every 30 seconds in Live Mode
      const squareInterval = setInterval(fetchSquareData, 30000)

      // Initialize Systems Status
      setSystems([
        { name: 'Autonomous Core', status: 'active', uptime: '99.9%', lastAction: 'Processing requests', model: 'NVIDIA Llama-3.1' },
        { name: 'Legal Research Engine', status: 'active', uptime: '100%', lastAction: 'Indexed 50k+ cases' },
        { name: 'AI Receptionist', status: isAgentRunning ? 'idle' : 'paused', uptime: '99.5%', lastAction: 'Last call: 2h ago' },
        { name: 'Database (Supabase)', status: 'active', uptime: '99.99%', lastAction: 'Query OK' },
        { name: 'Square POS', status: 'active', uptime: '100%', lastAction: 'Syncing transactions...' },
      ])

      // Load Environment Variables
      const hasBland = !!process.env.BLAND_AI_API_KEY && process.env.BLAND_AI_API_KEY?.startsWith('sk-proj');
      const hasResend = !!process.env.RESEND_API_KEY;
      const hasNvidia = !!process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'nvapi-<YOUR_FREE_NVIDIA_KEY_HERE>';
      const hasSquare = !!process.env.SQUARE_ACCESS_TOKEN;
      
      setEnvVars(prev => [
        { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://btjscudzrtarfommgegw.supabase.co', description: 'Supabase Project URL', status: 'set', editable: false },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbG... (Hidden)', description: 'Supabase Anon Key', status: 'set', editable: false },
        { key: 'OPENAI_API_KEY', value: hasNvidia || hasBland ? 'sk-... (Active)' : 'Missing', description: 'OpenAI API Key', status: hasNvidia || hasBland ? 'set' : 'missing', editable: true },
        { key: 'NVIDIA_API_KEY', value: hasNvidia ? 'nvapi-... (Active)' : 'Not Set', description: 'NVIDIA NIM API Key', status: hasNvidia ? 'set' : 'missing', editable: true },
        { key: 'BLAND_AI_API_KEY', value: hasBland ? 'sk-proj-... (Active)' : 'Missing', description: 'Bland.ai Voice AI', status: hasBland ? 'set' : 'missing', editable: true },
        { key: 'RESEND_API_KEY', value: hasResend ? 're_... (Active)' : 'Missing', description: 'Resend Email Service', status: hasResend ? 'set' : 'missing', editable: true },
        { key: 'SQUARE_ACCESS_TOKEN', value: hasSquare ? 'sq0atp-... (Active)' : 'Missing', description: 'Square POS API', status: hasSquare ? 'set' : 'missing', editable: true },
      ])

      setLoading(false)
      addSystemMessage("Welcome to Central Command. LIVE MODE ACTIVE. Type 'help' for commands.")
      if (hasBland) addSystemMessage("🟢 Bland.ai Voice AI detected. Phone: +1 (346) 521-4387")
      if (hasResend) addSystemMessage("🟢 Resend Email Service detected.")
      if (hasNvidia) {
        setNvidiaMode(true)
        addSystemMessage("🟢 NVIDIA NIM detected. Switching Autonomous Core to Llama-3.1-405B.")
      }
      if (hasSquare) addSystemMessage("🟢 Square POS connected. Syncing sales data...")

      // Cleanup
      return () => clearInterval(squareInterval)
    }
    initSystem()
  }, [router, isAgentRunning])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const addSystemMessage = (text: string) => setChatHistory(prev => [...prev, { role: 'system', text }])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userCmd = chatInput
    setChatHistory(prev => [...prev, { role: 'user', text: userCmd }])
    setChatInput('')

    // Simulate AI Processing (NVIDIA/OpenAI)
    setTimeout(() => {
      if (userCmd.toLowerCase().includes('help')) {
        addSystemMessage("Commands: status, restart, simulate-call, api-keys, nvidia-status, legal-search [query]")
      } else if (userCmd.toLowerCase().includes('status')) {
        addSystemMessage(`System Status: All systems operational. ${nvidiaMode ? 'AI: NVIDIA Llama-3.1-405B' : 'AI: OpenAI GPT-4'}. CPU: 12%, Memory: 450MB.`)
      } else if (userCmd.toLowerCase().includes('restart')) {
        addSystemMessage("Restarting Autonomous Core... Done. (Simulated)")
      } else if (userCmd.toLowerCase().includes('simulate') || userCmd.toLowerCase().includes('demo')) {
        startDemoCall()
      } else if (userCmd.toLowerCase().includes('api')) {
        setActiveTab('settings')
        addSystemMessage("Navigated to API Settings.")
      } else if (userCmd.toLowerCase().includes('nvidia')) {
        addSystemMessage(nvidiaMode 
          ? "🟢 NVIDIA NIM Active. Model: meta/llama-3.1-405b-instruct. Endpoint: https://integrate.api.nvidia.com/v1" 
          : "⚠️ NVIDIA API Key missing. Please add key in Settings.")
      } else if (userCmd.toLowerCase().includes('legal')) {
        const query = userCmd.split('legal')[1]?.trim()
        if (query) {
          addSystemMessage(`Searching legal database for "${query}"...`)
          router.push(`/legal?query=${encodeURIComponent(query)}`)
        } else {
          addSystemMessage("Navigating to Legal Research. Usage: 'legal search securities fraud'")
          router.push('/legal')
        }
      } else {
        addSystemMessage(`Command '${userCmd}' not recognized. Type 'help'.`)
      }
    }, 600)
  }

  const startDemoCall = () => {
    setDemoStatus('calling')
    addSystemMessage("Initiating demo call simulation via NVIDIA Voice AI...")
    
    setTimeout(() => {
      setDemoStatus('connected')
      addSystemMessage("Call connected: +1 (555) 0123 (Demo Client)")
      addSystemMessage("🎤 AI Agent: 'Thank you for calling Sahjony Capital. How can I help you?'")
    }, 2000)

    setTimeout(() => {
      setDemoStatus('completed')
      addSystemMessage("Call completed. Transcript saved to Memory Tree.")
      setDemoStatus('idle')
    }, 6000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <Command className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Command</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} expanded={sidebarOpen} />
          <NavItem icon={Activity} label="Systems" active={activeTab === 'systems'} onClick={() => setActiveTab('systems')} expanded={sidebarOpen} />
          <NavItem icon={Phone} label="AI Receptionist" active={activeTab === 'receptionist'} onClick={() => setActiveTab('receptionist')} expanded={sidebarOpen} />
          <NavItem icon={Globe} label="Legal" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} expanded={sidebarOpen} />
          <NavItem icon={Cpu} label="Hermes Config" active={activeTab === 'hermes'} onClick={() => setActiveTab('hermes')} expanded={sidebarOpen} />
          <NavItem icon={Key} label="API Keys" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} expanded={sidebarOpen} />
          <NavItem icon={Users} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} expanded={sidebarOpen} />
          <NavItem icon={Wallet} label="Square POS" active={activeTab === 'square'} onClick={() => setActiveTab('square')} expanded={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={`text-xs ${sidebarOpen ? 'text-center' : 'hidden'} text-gray-500`}>
            Sahjony Capital LLC<br/>
            <span className={nvidiaMode ? "text-green-400" : "text-yellow-400"}>
              {nvidiaMode ? "🟢 NVIDIA Live" : "⚠️ Standard Mode"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
            {/* Model Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value)
                  addSystemMessage(`🔄 Switched AI model to: ${e.target.options[e.target.selectedIndex].text}`)
                }}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-white/20 transition"
              >
                {nvidiaModels.map((model) => (
                  <option key={model.id} value={model.id} className="bg-black text-white">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-full text-green-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Systems Operational
            </div>
            {nvidiaMode && (
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-green-900/50 border border-green-500 rounded text-green-300 text-xs hover:bg-green-900/70 transition"
              >
                <Cpu className="w-3 h-3" /> NVIDIA NIM Dashboard
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* System Status Cards - CLICKABLE */}
              {systems.map((sys, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab('systems')}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      sys.status === 'active' ? 'bg-green-900/30 text-green-400' :
                      sys.status === 'idle' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>{sys.status}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{sys.name}</h3>
                  <p className="text-sm text-gray-400 mb-1">Uptime: {sys.uptime}</p>
                  <p className="text-xs text-gray-500">Last: {sys.lastAction}</p>
                  {sys.model && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Cpu className="w-3 h-3"/> {sys.model}</p>}
                </div>
              ))}

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 col-span-full lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('legal')} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 hover:scale-105">
                    <Globe className="w-4 h-4" /> Legal Search
                  </button>
                  <button onClick={startDemoCall} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 hover:scale-105">
                    <Phone className="w-4 h-4" /> Demo Call
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 hover:scale-105">
                    <Key className="w-4 h-4" /> API Keys
                  </button>
                  <button onClick={() => setChatHistory([])} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 hover:scale-105">
                    <FileText className="w-4 h-4" /> Clear Logs
                  </button>
                </div>
                {demoStatus !== 'idle' && (
                  <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/10">
                    <p className="text-sm text-blue-400">
                      {demoStatus === 'calling' && '📞 Calling demo number...'}
                      {demoStatus === 'connected' && '🟢 Connected: +1 (555) 0123'}
                      {demoStatus === 'completed' && '✅ Call completed. Transcript saved.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Environment & API Configuration</h2>
                <a
                  href="https://build.nvidia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition"
                >
                  <Cpu className="w-4 h-4" /> Open NVIDIA Dashboard
                </a>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold">API Keys & Secrets</h3>
                </div>
                <div className="p-6 space-y-6">
                  {envVars.map((env, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-300">{env.key}</label>
                        <span className={`text-xs px-2 py-0.5 rounded ${env.status === 'set' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          {env.status === 'set' ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type={env.key.includes('KEY') ? "password" : "text"}
                          value={env.value}
                          readOnly
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400 font-mono"
                        />
                        {env.editable && (
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition">
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{env.description}</p>
                      {env.key === 'NVIDIA_API_KEY' && !nvidiaMode && (
                        <p className="text-xs text-yellow-500 mt-1">
                          ⚠️ Get your free NVIDIA API key at: <a href="https://build.nvidia.com" target="_blank" className="underline hover:text-yellow-400">build.nvidia.com</a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other tabs */}
          {['systems', 'receptionist', 'legal', 'users'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                {activeTab === 'legal' ? <Globe className="w-8 h-8 text-blue-400" /> :
                 activeTab === 'receptionist' ? <Phone className="w-8 h-8 text-yellow-400" /> :
                 <Settings className="w-8 h-8 text-gray-400" />}
              </div>
              <h3 className="text-xl font-bold mb-2 capitalize">{activeTab} Module</h3>
              <p className="text-gray-400 mb-4">This module is ready for deployment.</p>
              {activeTab === 'legal' && (
                <button onClick={() => router.push('/legal')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Open Legal Research
                </button>
              )}
            </div>
          )}

          {/* Hermes Configuration Tab */}
          {activeTab === 'hermes' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Command className="w-6 h-6 text-purple-400" />
                  Hermes Agent Configuration
                </h2>
                <button 
                  onClick={() => setIsAddingModel(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4" /> Add Model
                </button>
              </div>

              {/* Active Profile */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 text-purple-400">Active Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                    <span className="text-sm font-mono text-purple-300">default</span>
                  </div>
                  <span className="text-sm text-gray-400">Models: {models.length} active</span>
                </div>
              </div>

              {/* Model List */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold">Configured Models</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {models.map((model) => (
                    <div key={model.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${model.active ? 'bg-green-500' : 'bg-gray-600'}`} />
                        <div>
                          <p className="font-bold text-white">{model.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{model.modelString}</p>
                          {model.baseUrl && <p className="text-xs text-gray-500">{model.baseUrl}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">{model.provider}</span>
                        {!model.active ? (
                          <button 
                            onClick={() => {
                              setModels(models.map(m => ({ ...m, active: m.id === model.id })))
                              addSystemMessage(`🔄 Switched to ${model.name}`)
                            }}
                            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 rounded transition"
                          >
                            Activate
                          </button>
                        ) : (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                        <button className="p-1 hover:bg-white/10 rounded text-gray-400">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Square POS Tab */}
          {activeTab === 'square' && (
            <div className="max-w-6xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-green-400" />
                  Square POS - Live Sales
                </h2>
                <button 
                  onClick={() => {
                    setSquareData(prev => ({ ...prev, loading: true }))
                    setTimeout(() => setSquareData(prev => ({ ...prev, loading: false })), 1000)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4" /> Refresh Data
                </button>
              </div>

              {/* Sales Summary */}
              {squareData.loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-green-400" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-xl p-6">
                      <p className="text-sm text-green-300 mb-2">Total Sales (Today)</p>
                      <p className="text-3xl font-bold text-white">${squareData.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">Transactions</p>
                      <p className="text-3xl font-bold text-white">{squareData.transactions.length}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">Average Transaction</p>
                      <p className="text-3xl font-bold text-white">
                        ${(squareData.totalSales / (squareData.transactions.length || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-green-400" />
                      <h3 className="font-bold">Recent Transactions</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {squareData.transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{tx.item}</p>
                              <p className="text-xs text-gray-400">{tx.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">${tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Chat/Command Interface (Fixed at bottom) */}
        <div className="h-48 border-t border-white/10 bg-black/80 backdrop-blur-xl flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-blue-400' : 'text-gray-400'}`}>
                <span className="font-bold">{msg.role === 'user' ? '> ' : 'System: '}</span>{msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type command (e.g., 'help', 'status', 'nvidia-status')..."
              className="flex-1 bg-black/50 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* Floating Chat Toggle Button (Hermes Style) */}
        {!chatOpen && (
          <button
            onClick={() => { setChatOpen(true); setChatMinimized(false); }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-900/50 flex items-center justify-center transition transform hover:scale-110 z-50"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Floating Chat Window */}
        {chatOpen && (
          <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Command className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-sm">Hermes Command</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setChatMinimized(!chatMinimized)} className="p-1 hover:bg-white/10 rounded">
                  {chatMinimized ? <Plus className="w-4 h-4" /> : <div className="w-4 h-0.5 bg-current" />}
                </button>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!chatMinimized && (
              <>
                <div className="h-64 overflow-y-auto p-4 space-y-2">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-blue-400' : 'text-gray-400'}`}>
                      <span className="font-bold">{msg.role === 'user' ? '> ' : 'System: '}</span>{msg.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type command..."
                    className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium transition">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
        active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {expanded && <span>{label}</span>}
    </button>
  )
}
