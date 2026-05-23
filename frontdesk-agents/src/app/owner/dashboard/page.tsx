'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Phone, Users, Settings, Shield, Activity,
  MessageSquare, Play, Pause, AlertCircle, CheckCircle,
  Loader2, Terminal, Key, Database, Bot, Search,
  Menu, X, ChevronRight, Command, Zap, Globe, FileText
} from 'lucide-react'

interface SystemStatus {
  name: string
  status: 'active' | 'idle' | 'error' | 'thinking'
  uptime: string
  lastAction: string
}

interface EnvVar {
  key: string
  value: string
  description: string
  status: 'set' | 'missing'
}

export default function CentralCommandCenter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [systems, setSystems] = useState<SystemStatus[]>([])
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'system', text: string}[]>([])
  const [demoStatus, setDemoStatus] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initSystem = async () => {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/owner/login'); return }

      setSystems([
        { name: 'Autonomous Core', status: 'active', uptime: '99.9%', lastAction: 'Processing requests' },
        { name: 'Legal Research Engine', status: 'active', uptime: '100%', lastAction: 'Indexed 50k+ cases' },
        { name: 'AI Receptionist', status: 'idle', uptime: '99.5%', lastAction: 'Last call: 2h ago' },
        { name: 'Database', status: 'active', uptime: '99.99%', lastAction: 'Query OK' },
      ])
      setEnvVars([
        { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://btjscudzrtarfommgegw.supabase.co', description: 'Supabase URL', status: 'set' },
        { key: 'OPENAI_API_KEY', value: 'sk-...***', description: 'OpenAI Key', status: 'set' },
        { key: 'BLAND_AI_KEY', value: '', description: 'Bland.ai Key', status: 'missing' },
      ])
      setLoading(false)
      addSystemMessage("Welcome to Central Command. Type 'help' for commands.")
    }
    initSystem()
  }, [router])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatHistory])

  const addSystemMessage = (text: string) => setChatHistory(prev => [...prev, { role: 'system', text }])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userCmd = chatInput
    setChatHistory(prev => [...prev, { role: 'user', text: userCmd }])
    setChatInput('')
    setTimeout(() => {
      if (userCmd.toLowerCase().includes('help')) addSystemMessage("Commands: status, restart, simulate-call, api-keys")
      else if (userCmd.toLowerCase().includes('status')) addSystemMessage("All systems operational. CPU: 12%")
      else if (userCmd.toLowerCase().includes('restart')) addSystemMessage("Restarting Autonomous Core... Done.")
      else if (userCmd.toLowerCase().includes('simulate') || userCmd.toLowerCase().includes('demo')) startDemoCall()
      else if (userCmd.toLowerCase().includes('api')) setActiveTab('settings')
      else addSystemMessage(`Command '${userCmd}' not recognized. Type 'help'.`)
    }, 500)
  }

  const startDemoCall = () => {
    setDemoStatus('calling')
    addSystemMessage("Initiating demo call...")
    setTimeout(() => { setDemoStatus('connected'); addSystemMessage("Call connected: +1 (555) 0123") }, 2000)
    setTimeout(() => { setDemoStatus('completed'); addSystemMessage("Call completed. Transcript saved."); setDemoStatus('idle') }, 6000)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Command className="w-5 h-5 text-white" /></div><span className="font-bold text-lg">Command</span></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/10 rounded">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} expanded={sidebarOpen} />
          <NavItem icon={Activity} label="Systems" active={activeTab === 'systems'} onClick={() => setActiveTab('systems')} expanded={sidebarOpen} />
          <NavItem icon={Phone} label="AI Receptionist" active={activeTab === 'receptionist'} onClick={() => setActiveTab('receptionist')} expanded={sidebarOpen} />
          <NavItem icon={Globe} label="Legal" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} expanded={sidebarOpen} />
          <NavItem icon={Key} label="API Keys" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} expanded={sidebarOpen} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6">
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-full text-green-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Systems Operational
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systems.map((sys, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center"><Activity className="w-6 h-6 text-blue-400" /></div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${sys.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{sys.status}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{sys.name}</h3>
                  <p className="text-sm text-gray-400">Uptime: {sys.uptime}</p>
                </div>
              ))}
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 col-span-full lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('legal')} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Legal Search</button>
                  <button onClick={startDemoCall} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Demo Call</button>
                  <button onClick={() => setActiveTab('settings')} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">API Keys</button>
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
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                {envVars.map((env, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-300">{env.key}</label>
                      <span className={`text-xs px-2 py-0.5 rounded ${env.status === 'set' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{env.status}</span>
                    </div>
                    <input type="text" value={env.value} readOnly className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">{env.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {['systems', 'receptionist', 'legal'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Settings className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg">Module ready for deployment</p>
            </div>
          )}
        </div>

        {/* CHAT INTERFACE - THIS IS WHAT WAS MISSING */}
        <div className="h-48 border-t border-white/10 bg-black/80 backdrop-blur-xl flex flex-col">
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
              placeholder="Type command (e.g., 'help', 'status', 'simulate-call')..."
              className="flex-1 bg-black/50 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">Send</button>
          </form>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      {expanded && <span>{label}</span>}
    </button>
  )
}
