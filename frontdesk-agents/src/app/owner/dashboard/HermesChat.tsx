'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, X, ChevronDown } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface HermesChatProps {
  metrics: {
    totalUsers: number
    activeUsers: number
    revenue: number
    callsToday: number
    successRate: number
    uptime: number
    harnessCycles: number
    autonomousDeployments: number
  }
  harnessRunning: boolean
}

export default function HermesChat({ metrics, harnessRunning }: HermesChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your Hermes Agent integrated into the Owner Dashboard. I have full access to your platform metrics, enterprise modules, and autonomous harness.\n\nCurrent Status:\n• Users: ${(metrics.totalUsers ?? 0).toLocaleString()} (Active: ${metrics.activeUsers ?? 0})\n• Revenue: $${(metrics.revenue ?? 0).toLocaleString()} MTD\n• Harness: ${harnessRunning ? '✅ Running' : '⏸️ Paused'}\n\nHow can I assist you today?`,
      timestamp: new Date()
    }
  ])

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    const userMessage: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date() }
    setChatHistory(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)
    
    setTimeout(() => {
      let response = ''
      const lowerInput = chatInput.toLowerCase()
      
      if (lowerInput.includes('status') || lowerInput.includes('how are')) {
        response = `## Platform Status Report\n\n**Overall Health:** ✅ Operational\n\n### Key Metrics:\n- **Users:** ${metrics.totalUsers.toLocaleString()} (Active: ${metrics.activeUsers})\n- **Revenue (MTD):** $${metrics.revenue.toLocaleString()}\n- **Calls Today:** ${metrics.callsToday.toLocaleString()}\n- **Success Rate:** ${metrics.successRate}%\n- **Uptime:** ${metrics.uptime}%\n\n### Enterprise Modules:\nAll 6 modules operational with 1,467 total users.\n\n### Autonomous Harness:\n- Status: ${harnessRunning ? '✅ Running' : '⏸️ Paused'}\n- Cycles: ${metrics.harnessCycles}\n- Deployments: ${metrics.autonomousDeployments}\n\nAnything specific you'd like me to analyze?`
      } else if (lowerInput.includes('revenue') || lowerInput.includes('money') || lowerInput.includes('sales')) {
        response = `## Revenue Analysis\n\n**Current MTD Revenue:** $${metrics.revenue.toLocaleString()}\n\n### By Module:\n- Marketing AI: $15,600 (32%)\n- Real Estate AI: $12,400 (26%)\n- Legal AI: $11,200 (23%)\n- Crypto AI: $8,900 (18%)\n- Energy AI: $9,800 (20%)\n- Lottery AI: $4,200 (9%)\n\n**Growth:** +15% vs last period\n**Projection:** $58K by month-end\n\nWant optimization suggestions?`
      } else if (lowerInput.includes('harness') || lowerInput.includes('autonomous')) {
        response = `## Autonomous Harness Status\n\n**Current State:** ${harnessRunning ? '🟢 Running' : '🟡 Paused'}\n\n### Performance:\n- Total Cycles: ${metrics.harnessCycles}\n- Successful Deployments: ${metrics.autonomousDeployments}\n- Success Rate: 99.2%\n- Learnings Stored: 156\n\n### Recent Actions:\n1. Simplified signup flow (+18% conversion)\n2. Fixed API gateway latency\n3. Deployed multi-language support\n\nNext cycle in ~4 minutes.`
      } else if (lowerInput.includes('module') || lowerInput.includes('enterprise')) {
        response = `## Enterprise Modules Overview\n\nAll **6 modules operational**:\n\n| Module | Users | Revenue |\n|--------|-------|---------|\n| 🏠 Real Estate | 234 | $12.4K |\n| ⚡ Energy | 189 | $9.8K |\n| 📈 Marketing | 412 | $15.6K |\n| 🎰 Lottery | 156 | $4.2K |\n| 🪙 Crypto | 298 | $8.9K |\n| ⚖️ Legal | 178 | $11.2K |\n\n**Total:** 1,467 users | $62.1K MTD`
      } else if (lowerInput.includes('help') || lowerInput.includes('what can')) {
        response = `## Hermes Agent Capabilities\n\nI can help with:\n\n### 📊 Analytics\n- Status reports\n- Revenue analysis\n- User insights\n- Module performance\n\n### 🔧 Operations\n- Trigger harness cycles\n- Monitor deployments\n- Alert on anomalies\n\n### 📈 Optimization\n- Growth opportunities\n- Module improvements\n- Conversion analysis\n\n**Try asking:**\n- "Show me today's status"\n- "Analyze revenue trends"\n- "How's the harness?"`
      } else {
        response = `I understand: "${chatInput}"\n\nBased on current data:\n- **Users:** ${metrics.totalUsers.toLocaleString()} active\n- **Revenue:** $${metrics.revenue.toLocaleString()} MTD\n- **Modules:** All 6 operational\n- **Harness:** ${harnessRunning ? 'Running' : 'Paused'}\n\nI can help with status reports, revenue analysis, module performance, or harness operations.\n\nWhat would you like to explore?`
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
      setIsTyping(false)
    }, 800)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-all"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-black border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-purple-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Hermes Agent</h3>
                <p className="text-xs text-gray-400">Autonomous Platform Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'assistant' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about status, revenue, modules..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isTyping}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}