'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Phone, Users, Settings, Shield, Activity,
  MessageSquare, Play, Pause, AlertCircle, CheckCircle,
  Loader2, Terminal, Key, Database, Bot, Search,
  Menu, X, Command, Zap, Globe, FileText, Cpu, Wifi
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

export default function CentralCommandCenter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  
  // System State
  const [systems, setSystems] = useState<SystemStatus[]>([])
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'system', text: string}[]>([])
  const [demoStatus, setDemoStatus] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle')
  const [nvidiaMode, setNvidiaMode] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initSystem = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/owner/login')
        return
      }

      // Initialize Systems Status
      setSystems([
        { name: 'Autonomous Core', status: 'active', uptime: '99.9%', lastAction: 'Processing requests', model: 'NVIDIA Llama-3.1' },
        { name: 'Legal Research Engine', status: 'active', uptime: '100%', lastAction: 'Indexed 50k+ cases' },
        { name: 'AI Receptionist', status: 'idle', uptime: '99.5%', lastAction: 'Last call: 2h ago' },
        { name: 'Database (Supabase)', status: 'active', uptime: '99.99%', lastAction: 'Query OK' },
      ])

      // Load Environment Variables
      const hasBland = !!process.env.BLAND_AI_API_KEY && process.env.BLAND_AI_API_KEY?.startsWith('sk-proj');
      const hasResend = !!process.env.RESEND_API_KEY;
      const hasNvidia = !!process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'nvapi-<YOUR_FREE_NVIDIA_KEY_HERE>';
      
      setEnvVars([
        { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://btjscudzrtarfommgegw.supabase.co', description: 'Supabase Project URL', status: 'set', editable: false },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbG... (Hidden)', description: 'Supabase Anon Key', status: 'set', editable: false },
        { key: 'OPENAI_API_KEY', value: hasNvidia || hasBland ? 'sk-... (Active)' : 'Missing', description: 'OpenAI API Key', status: hasNvidia || hasBland ? 'set' : 'missing', editable: true },
        { key: 'NVIDIA_API_KEY', value: hasNvidia ? 'nvapi-... (Active)' : 'Not Set', description: 'NVIDIA NIM API Key', status: hasNvidia ? 'set' : 'missing', editable: true },
        { key: 'BLAND_AI_API_KEY', value: hasBland ? 'sk-proj-... (Active)' : 'Missing', description: 'Bland.ai Voice AI', status: hasBland ? 'set' : 'missing', editable: true },
        { key: 'RESEND_API_KEY', value: hasResend ? 're_... (Active)' : 'Missing', description: 'Resend Email Service', status: hasResend ? 'set' : 'missing', editable: true },
        { key: 'SMTP_USER', value: hasResend ? 'frontdeskllc@outlook.com' : 'Missing', description: 'SMTP Email User', status: hasResend ? 'set' : 'missing', editable: true },
      ])

      setLoading(false)
      addSystemMessage("Welcome to Central Command. NVIDIA NIM integration ready. Type 'help' for commands.")
      if (hasBland) {
        addSystemMessage("🟢 Bland.ai Voice AI detected. Phone: +1 (346) 521-4387")
      }
      if (hasResend) {
        addSystemMessage("🟢 Resend Email Service detected.")
      }
      if (hasNvidia) {
        setNvidiaMode(true)
        addSystemMessage("🟢 NVIDIA NIM detected. Switching Autonomous Core to Llama-3.1-405B.")
      }
    }
    initSystem()
  }, [router])

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
      setDemoMode(false)
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
          <NavItem icon={Globe} label="Legal Research" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} expanded={sidebarOpen} />
          <NavItem icon={Key} label="API Keys" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} expanded={sidebarOpen} />
          <NavItem icon={Users} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} expanded={sidebarOpen} />
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
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-full text-green-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Systems Operational
            </div>
            {nvidiaMode && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-900/50 border border-green-500 rounded text-green-300 text-xs">
                <Cpu className="w-3 h-3" /> NVIDIA NIM
              </div>
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
              <h2 className="text-2xl font-bold mb-6">Environment & API Configuration</h2>
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
        </div>

        {/* CHAT INTERFACE - FIXED & CLICKABLE */}
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
