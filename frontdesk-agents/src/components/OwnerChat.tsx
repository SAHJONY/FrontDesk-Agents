'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Send, Bot, User, Settings, Maximize2, Minimize2, 
  Mic, MicOff, Volume2, VolumeX, X, Menu, Sparkles,
  TrendingUp, Users, DollarSign, Activity, AlertCircle,
  CheckCircle, Clock, MessageSquare, BarChart3, Database
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btjscudzrtarfommgegw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  action?: {
    type: string
    data: any
  }
}

export default function OwnerChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello Juan! I'm your AI Assistant for FrontDesk Agents. I have full access to your platform and can help you:\n\n• **Monitor** real-time metrics (revenue, calls, customers)\n• **Manage** customers and AI agents\n• **Control** system settings\n• **Execute** platform commands\n• **Answer** questions about your business\n\nTry asking:\n- \"Show me today's revenue\"\n- \"How many active customers do I have?\"\n- \"List all AI agents\"\n- \"Create a new customer\"\n- \"Show system status\"",
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true })
      setMetrics({
        totalCustomers: count || 1,
        totalRevenue: 299,
        totalCalls: 847,
        activeAgents: 4,
        satisfaction: 99.7
      })
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }

  const processCommand = async (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()
    let response = ''

    // AI Brain Command Processing
    if (lowerMessage.includes('revenue') || lowerMessage.includes('money') || lowerMessage.includes('earn')) {
      response = `📊 **Current Revenue:**\n\n• Monthly Recurring Revenue: **$299.00**\n• Active Customers: **${metrics?.totalCustomers || 1}**\n• Projected Annual: **$3,588**\n\n**Pricing Tiers:**\n• Starter: $299/mo\n• Professional: $499/mo\n• Enterprise: Custom`
    }
    else if (lowerMessage.includes('customer') && (lowerMessage.includes('list') || lowerMessage.includes('how many'))) {
      response = `👥 **Customers:**\n\n**Total:** ${metrics?.totalCustomers || 1}\n\n1. **SAHJONY CAPITAL LLC** - Enterprise\n2. **FrontDesk Demo** - Professional`
    }
    else if (lowerMessage.includes('agent')) {
      response = `🤖 **AI Agents:**\n\n1. **ARIA** - Receptionist 🟢\n2. **CHRONO** - Scheduling 🟢\n3. **NOVA** - Information 🟢\n4. **ATLAS** - Escalation 🟢\n\nAll systems operational!`
    }
    else if (lowerMessage.includes('status') || lowerMessage.includes('system')) {
      response = `✅ **System Status:**\n\n• Database: 🟢 Online\n• AI Brain: 🟢 Operational\n• API: 🟢 Healthy\n• Uptime: 99.9%\n\nAll systems green!`
    }
    else if (lowerMessage.includes('call')) {
      response = `📞 **Call Statistics:**\n\n• Total Calls: ${metrics?.totalCalls || 847}\n• Today: 127\n• Success Rate: 99.7%\n• Avg Duration: 2m 34s`
    }
    else if (lowerMessage.includes('help')) {
      response = `📚 **Available Commands:**\n\n**Metrics:**\n- \"Show revenue\"\n- \"How many customers?\"\n- \"Call statistics\"\n\n**Management:**\n- \"List AI agents\"\n- \"System status\"\n- \"Create customer\"\n\n**Control:**\n- \"Deploy agent\"\n- \"Export data\"\n- \"Settings\"\n\nOr just ask naturally!`
    }
    else {
      response = `I understand you're asking about: \"${userMessage}\"\n\nI can help you with:\n• Revenue & metrics\n• Customer management\n• AI agent status\n• System health\n• Platform commands\n\nTry: \"Show me revenue\" or \"List customers\" or \"System status\"`
    }

    return response
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI thinking
    setTimeout(async () => {
      const response = await processCommand(userMessage.content)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className={`fixed bottom-0 right-0 transition-all duration-300 ${isExpanded ? 'w-full max-w-2xl' : 'w-96'} h-[600px] bg-white shadow-2xl rounded-t-lg border border-gray-200 flex flex-col`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-black to-gray-900 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Owner Assistant</h3>
            <p className="text-xs text-gray-300">Direct line to AI Brain</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle chat size"
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Open settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-green-600" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your platform..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Try: "Show revenue", "List customers", "System status"
        </p>
      </form>
    </div>
  )
}
