'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, MessageSquare, Phone, Globe, Calendar, 
  Users, Building2, Shield, Zap, ChevronRight, Play, 
  Pause, Volume2, Bot, Sparkles, Star, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, Send, PhoneOff,
  Maximize2, Minimize2
} from 'lucide-react'
import { clsx } from 'clsx'

// Types
interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  agentType?: 'greeting' | 'scheduling' | 'information' | 'escalation' | 'multilingual'
}

interface Agent {
  id: string
  name: string
  type: 'greeting' | 'scheduling' | 'information' | 'escalation' | 'multilingual'
  status: 'online' | 'busy' | 'offline'
  avatar: string
  capabilities: string[]
  languages: string[]
}

interface Appointment {
  id: string
  clientName: string
  service: string
  dateTime: Date
  status: 'confirmed' | 'pending' | 'completed'
}

// AI Agents Configuration
const agents: Agent[] = [
  {
    id: 'agent-1',
    name: 'ARIA - Primary Receptionist',
    type: 'greeting',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    capabilities: ['Warm Welcome', 'Company Overview', 'Visitor Management'],
    languages: ['English', 'Spanish', 'French', 'Mandarin']
  },
  {
    id: 'agent-2',
    name: 'CHRONOS - Scheduling Agent',
    type: 'scheduling',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
    capabilities: ['Appointment Booking', 'Calendar Management', 'Reminders'],
    languages: ['English', 'Spanish', 'German']
  },
  {
    id: 'agent-3',
    name: 'KNOWLEDGE - Info Agent',
    type: 'information',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
    capabilities: ['FAQ Answers', 'Product Info', 'Directions', 'Policies'],
    languages: ['English', 'Japanese', 'Korean']
  },
  {
    id: 'agent-4',
    name: 'ESCALATE - Human Handoff',
    type: 'escalation',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
    capabilities: ['Complex Issues', 'Complaints', 'Special Requests'],
    languages: ['English', 'Arabic', 'Portuguese']
  }
]

// Industry Templates
const industries = [
  { id: 'healthcare', name: 'Healthcare & Medical', icon: '🏥', description: 'Patient intake, appointment scheduling, medical FAQs' },
  { id: 'legal', name: 'Legal & Law Firms', icon: '⚖️', description: 'Client intake, case inquiries, consultation booking' },
  { id: 'realestate', name: 'Real Estate', icon: '🏠', description: 'Property inquiries, showing scheduling, lead qualification' },
  { id: 'hospitality', name: 'Hospitality & Hotels', icon: '🏨', description: 'Guest services, reservations, concierge support' },
  { id: 'corporate', name: 'Corporate & Enterprise', icon: '🏢', description: 'Visitor management, employee services, meeting rooms' },
  { id: 'retail', name: 'Retail & E-commerce', icon: '🛍️', description: 'Product info, order status, returns processing' },
  { id: 'education', name: 'Education & Universities', icon: '🎓', description: 'Admissions, course info, student services' },
  { id: 'government', name: 'Government & Public', icon: '🏛️', description: 'Service inquiries, appointment booking, information desk' }
]

// AI Response Generator
const generateAIResponse = (userMessage: string, agentType: string): string => {
  const lowerMsg = userMessage.toLowerCase()
  
  if (lowerMsg.includes('appointment') || lowerMsg.includes('schedule') || lowerMsg.includes('book')) {
    return 'I would be happy to help you schedule an appointment! Please let me know your preferred date and time, and I will check availability for you. What service are you looking to book today?'
  }
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return 'Welcome! I am ARIA, your AI receptionist. How may I assist you today? I can help with appointments, information about our services, or connect you with the right department.'
  }
  if (lowerMsg.includes('location') || lowerMsg.includes('address') || lowerMsg.includes('where')) {
    return 'Our office is located at 1250 Innovation Drive, Suite 400. You can find us on the 4th floor of the West Tower. Would you like me to provide driving directions or public transit options?'
  }
  if (lowerMsg.includes('hour') || lowerMsg.includes('open') || lowerMsg.includes('close')) {
    return 'Our business hours are Monday through Friday, 8:00 AM to 6:00 PM. For urgent matters outside these hours, our emergency line is available 24/7. How may I help you?'
  }
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('fee')) {
    return 'Thank you for your inquiry about our pricing. Our services are customized based on your specific needs. Would you like me to schedule a consultation with our team to discuss a tailored package for you?'
  }
  
  return `Thank you for your message. I am processing your request and will provide you with the most relevant information. Is there anything specific you would like to know more about regarding our services?`
}

// Particle Background Component
const ParticleBackground = () => {
  return (
    <div className='particles'>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className='particle'
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  )
}

// Cinematic Loading Component
const CinematicLoader = () => (
  <motion.div 
    className='fixed inset-0 z-50 flex items-center justify-center bg-deep-space'
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
  >
    <div className='text-center'>
      <motion.div
        className='relative w-32 h-32 mx-auto mb-8'
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className='absolute inset-0 rounded-full border-4 border-hollywood-gold/20' />
        <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-hollywood-gold' />
        <div className='absolute inset-4 rounded-full border-4 border-transparent border-t-cinematic-red' />
        <div className='absolute inset-8 rounded-full border-4 border-transparent border-t-aurora-cyan' />
      </motion.div>
      <motion.h2 
        className='text-2xl font-display font-bold gold-gradient-text mb-2'
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        INITIALIZING FRONTDESK AGENTS
      </motion.h2>
      <p className='text-soft-white/60 text-sm'>Loading Hollywood-grade AI Receptionist...</p>
    </div>
  </motion.div>
)

// Avatar Component
const ReceptionistAvatar = ({ agent, isSpeaking, isListening }: { agent: Agent, isSpeaking: boolean, isListening: boolean }) => (
  <motion.div 
    className='relative avatar-container'
    animate={{ 
      scale: isSpeaking ? [1, 1.02, 1] : 1,
      rotateY: isListening ? [0, 5, 0] : 0
    }}
    transition={{ duration: isSpeaking ? 0.5 : 2, repeat: isSpeaking ? Infinity : 0 }}
  >
    <div className={clsx(
      'relative w-64 h-64 rounded-full overflow-hidden border-4',
      'bg-gradient-to-br from-premium-navy to-midnight-blue',
      isSpeaking ? 'border-hollywood-gold gold-glow' : 'border-aurora-cyan/50'
    )}>
      {/* Office Background */}
      <div className='absolute inset-0 bg-gradient-to-b from-deep-space/80 to-midnight-blue/90' />
      
      {/* Avatar Image */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='relative w-full h-full'>
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className='w-full h-full object-cover object-top'
          />
          {/* Overlay Effects */}
          <div className='absolute inset-0 bg-gradient-to-t from-deep-space via-transparent to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-cinematic-red/20 to-transparent' />
        </div>
      </div>

      {/* Status Ring */}
      <div className={clsx(
        'absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full',
        'flex items-center gap-2 text-xs font-semibold',
        agent.status === 'online' ? 'bg-aurora-cyan/20 text-aurora-cyan' : 'bg-gray-500/20 text-gray-400'
      )}>
        <span className={clsx('w-2 h-2 rounded-full', agent.status === 'online' ? 'bg-aurora-cyan status-online' : 'bg-gray-400')} />
        {agent.status.toUpperCase()}
      </div>
    </div>

    {/* Speaking Indicators */}
    {isSpeaking && (
      <div className='absolute -right-4 top-1/2 -translate-y-1/2 voice-wave'>
        {[...Array(5)].map((_, i) => (
          <motion.span 
            key={i}
            initial={{ scaleY: 0.5 }}
            animate={{ scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    )}

    {/* Agent Name Badge */}
    <motion.div 
      className='absolute -bottom-12 left-1/2 -translate-x-1/2 text-center'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className='font-display font-bold text-hollywood-gold'>{agent.name}</h3>
      <p className='text-xs text-soft-white/60 capitalize'>{agent.type} Agent</p>
    </motion.div>
  </motion.div>
)

// Message Bubble Component
const MessageBubble = ({ message }: { message: Message }) => {
  const isAgent = message.role === 'agent'
  const isSystem = message.role === 'system'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex gap-3 mb-4',
        isAgent ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {isAgent && (
        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-premium-navy to-midnight-blue flex-shrink-0 overflow-hidden border border-hollywood-gold/30'>
          <img src={agents[0].avatar} alt='AI' className='w-full h-full object-cover' />
        </div>
      )}
      
      <div className={clsx(
        'max-w-[75%] px-4 py-3 rounded-2xl',
        isSystem 
          ? 'bg-gradient-to-r from-hollywood-gold/20 to-transparent border border-hollywood-gold/30 text-hollywood-gold text-sm'
          : isAgent 
            ? 'bg-premium-navy/80 backdrop-blur-sm border border-aurora-cyan/20 text-soft-white'
            : 'bg-cinematic-red/90 backdrop-blur-sm text-white'
      )}>
        {isSystem && <Sparkles className='w-4 h-4 inline-block mr-2' />}
        <p className='text-sm leading-relaxed'>{message.content}</p>
        <p className='text-xs text-soft-white/40 mt-1'>{message.timestamp.toLocaleTimeString()}</p>
      </div>
      
      {!isAgent && !isSystem && (
        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-cinematic-red to-neon-purple flex-shrink-0 flex items-center justify-center'>
          <User className='w-5 h-5 text-white' />
        </div>
      )}
    </motion.div>
  )
}

// User Icon for message
const User = ({ className }: { className?: string }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
)

// Main Page Component
export default function FrontdeskAgentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'hero' | 'demo' | 'features' | 'industries'>('hero')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: 'Welcome to FRONTDESK AGENTS! I am ARIA, your AI receptionist. I am here to assist you with appointments, information, and connecting you to the right services. How may I help you today?',
      timestamp: new Date(),
      agentType: 'greeting'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0])
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    
    // Simulate AI thinking
    setIsSpeaking(true)
    setTimeout(() => {
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: generateAIResponse(inputValue, selectedAgent.type),
        timestamp: new Date(),
        agentType: selectedAgent.type
      }
      setMessages(prev => [...prev, agentMessage])
      setIsSpeaking(false)
    }, 1500)
  }

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setIsListening(false)
        const voiceMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: 'I would like to schedule an appointment for tomorrow at 2 PM.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, voiceMessage])
      }, 3000)
    }
  }

  if (isLoading) {
    return <CinematicLoader />
  }

  return (
    <main className='min-h-screen bg-deep-space relative overflow-hidden'>
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Cinematic Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Gradient Orbs */}
        <motion.div 
          className='absolute top-0 left-1/4 w-96 h-96 bg-cinematic-red/10 rounded-full blur-3xl'
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className='absolute bottom-0 right-1/4 w-96 h-96 bg-aurora-cyan/10 rounded-full blur-3xl'
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div 
          className='absolute top-1/2 right-0 w-64 h-64 bg-hollywood-gold/10 rounded-full blur-3xl'
          animate={{ 
            x: [0, -30, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Grid Lines */}
        <div className='absolute inset-0' style={{
          backgroundImage: `linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Navigation */}
      <nav className='relative z-50 flex items-center justify-between px-8 py-4'>
        <motion.div 
          className='flex items-center gap-3'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-cinematic-red to-neon-purple flex items-center justify-center hollywood-glow'>
            <Bot className='w-7 h-7 text-white' />
          </div>
          <div>
            <h1 className='font-display font-bold text-xl text-white'>FRONTDESK</h1>
            <p className='text-xs text-hollywood-gold font-semibold tracking-wider'>AGENTS</p>
          </div>
        </motion.div>

        <motion.div 
          className='flex items-center gap-6'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => setCurrentView('features')}
            className='text-soft-white/80 hover:text-hollywood-gold transition-colors text-sm font-medium'
          >
            Features
          </button>
          <button 
            onClick={() => setCurrentView('industries')}
            className='text-soft-white/80 hover:text-hollywood-gold transition-colors text-sm font-medium'
          >
            Industries
          </button>
          <button 
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={clsx(
              'px-6 py-2 rounded-lg font-semibold text-sm transition-all',
              isDemoMode 
                ? 'bg-hollywood-gold text-deep-space' 
                : 'bg-cinematic-red text-white hover:bg-cinematic-red/80'
            )}
          >
            {isDemoMode ? 'Exit Demo' : 'Try Demo'}
          </button>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className='relative z-10 container mx-auto px-4 py-8'>
        
        {/* Hero Section */}
        {currentView === 'hero' && (
          <motion.div 
            className='text-center py-20'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className='inline-block px-4 py-2 rounded-full bg-hollywood-gold/10 text-hollywood-gold text-sm font-semibold mb-6 border border-hollywood-gold/20'>
                ✨ WORLD'S MOST ADVANCED AI RECEPTIONIST
              </span>
            </motion.div>
            
            <motion.h1 
              className='font-display text-6xl md:text-8xl font-bold mb-6 leading-tight'
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className='gold-gradient-text'>FRONTDESK</span>
              <br />
              <span className='text-white'>AGENTS</span>
            </motion.h1>
            
            <motion.p 
              className='text-xl md:text-2xl text-soft-white/70 mb-8 max-w-3xl mx-auto'
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Hollywood-grade AI receptionist with 8K cinematic visuals, 
              multi-language support, and universal industry compatibility.
            </motion.p>
            
            <motion.div 
              className='flex flex-wrap justify-center gap-4 mb-12'
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button 
                onClick={() => setIsDemoMode(true)}
                className='cinematic-btn flex items-center gap-2'
              >
                <Play className='w-5 h-5' />
                Experience Demo
              </button>
              <button 
                onClick={() => setCurrentView('features')}
                className='px-6 py-3 rounded-lg border-2 border-hollywood-gold/30 text-hollywood-gold font-semibold hover:bg-hollywood-gold/10 transition-all flex items-center gap-2'
              >
                <Star className='w-5 h-5' />
                Explore Features
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className='grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto'
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {[
                { value: '50+', label: 'Languages' },
                { value: '8K', label: 'Video Quality' },
                { value: '99.9%', label: 'Uptime' },
                { value: '100+', label: 'Industries' }
              ].map((stat, i) => (
                <div key={i} className='text-center'>
                  <p className='text-4xl font-bold text-hollywood-gold mb-2'>{stat.value}</p>
                  <p className='text-soft-white/60 text-sm'>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Demo Section */}
        {isDemoMode && (
          <motion.div 
            className={clsx(
              'fixed inset-0 z-50 bg-deep-space p-4 md:p-8',
              isFullscreen && 'inset-0'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={clsx(
              'h-full glass-strong rounded-3xl overflow-hidden flex flex-col',
              isFullscreen ? '' : 'max-w-6xl mx-auto'
            )}>
              {/* Demo Header */}
              <div className='flex items-center justify-between px-6 py-4 border-b border-hollywood-gold/10'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-cinematic-red/20 flex items-center justify-center'>
                    <Bot className='w-5 h-5 text-cinematic-red' />
                  </div>
                  <div>
                    <h2 className='font-semibold text-white'>Live AI Receptionist Demo</h2>
                    <p className='text-xs text-aurora-cyan'>Powered by Advanced Agentic AI</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className='p-2 rounded-lg hover:bg-white/10 text-soft-white/60 hover:text-white transition-colors'
                  >
                    {isFullscreen ? <Minimize2 className='w-5 h-5' /> : <Maximize2 className='w-5 h-5' />}
                  </button>
                  <button 
                    onClick={() => setIsDemoMode(false)}
                    className='p-2 rounded-lg hover:bg-white/10 text-soft-white/60 hover:text-white transition-colors'
                  >
                    <ArrowRight className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Demo Content */}
              <div className='flex-1 flex flex-col lg:flex-row overflow-hidden'>
                {/* Avatar Section */}
                <div className='lg:w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-midnight-blue/50 to-deep-space'>
                  <ReceptionistAvatar 
                    agent={selectedAgent} 
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                  />
                  
                  {/* Agent Selector */}
                  <div className='flex gap-2 mt-8 flex-wrap justify-center'>
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        className={clsx(
                          'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                          selectedAgent.id === agent.id
                            ? 'bg-hollywood-gold/20 text-hollywood-gold border border-hollywood-gold/30'
                            : 'bg-premium-navy/50 text-soft-white/60 hover:text-white border border-transparent'
                        )}
                      >
                        {agent.name.split(' - ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className='flex items-center gap-4 mt-8'>
                    <motion.button
                      onClick={handleVoiceToggle}
                      className={clsx(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                        isListening 
                          ? 'bg-cinematic-red hollywood-glow' 
                          : 'bg-premium-navy hover:bg-premium-navy/80 border border-aurora-cyan/30'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isListening ? (
                        <MicOff className='w-6 h-6 text-white' />
                      ) : (
                        <Mic className='w-6 h-6 text-aurora-cyan' />
                      )}
                    </motion.button>
                    
                    <button className='w-12 h-12 rounded-full bg-premium-navy/50 flex items-center justify-center hover:bg-premium-navy/80 transition-colors'>
                      <Volume2 className='w-5 h-5 text-soft-white/60' />
                    </button>
                  </div>

                  {isListening && (
                    <motion.p 
                      className='mt-4 text-aurora-cyan text-sm animate-pulse'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      🎤 Listening...
                    </motion.p>
                  )}
                </div>

                {/* Chat Section */}
                <div className='lg:w-1/2 flex flex-col bg-deep-space/50'>
                  {/* Messages */}
                  <div className='flex-1 overflow-y-auto p-6'>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className='p-4 border-t border-hollywood-gold/10'>
                    <div className='flex gap-3'>
                      <input
                        ref={inputRef}
                        type='text'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder='Type your message...'
                        className='flex-1 bg-premium-navy/50 border border-aurora-cyan/20 rounded-xl px-4 py-3 text-white placeholder:text-soft-white/40 focus:outline-none focus:border-hollywood-gold/50 transition-colors'
                      />
                      <motion.button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className={clsx(
                          'px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2',
                          inputValue.trim()
                            ? 'bg-cinematic-red text-white hover:bg-cinematic-red/80'
                            : 'bg-premium-navy/50 text-soft-white/40 cursor-not-allowed'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send className='w-4 h-4' />
                      </motion.button>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className='flex gap-2 mt-3 flex-wrap'>
                      {['Book Appointment', 'Office Hours', 'Location', 'Speak to Human'].map((action) => (
                        <button
                          key={action}
                          onClick={() => setInputValue(action)}
                          className='px-3 py-1 rounded-full bg-premium-navy/30 text-xs text-soft-white/60 hover:text-hollywood-gold hover:bg-premium-navy/50 transition-colors'
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        {currentView === 'features' && (
          <motion.div 
            className='py-20'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className='text-center mb-16'>
              <span className='text-hollywood-gold text-sm font-semibold tracking-wider'>CUTTING-EDGE TECHNOLOGY</span>
              <h2 className='font-display text-5xl font-bold text-white mt-4 mb-6'>Hollywood-Grade AI Capabilities</h2>
              <p className='text-soft-white/60 text-lg max-w-2xl mx-auto'>
                Experience the future of customer interaction with our revolutionary AI agent technology
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              {[
                {
                  icon: <Bot className='w-8 h-8' />,
                  title: 'Multi-Agent System',
                  description: 'Coordinated AI agents work together to handle any receptionist task with precision and empathy.',
                  color: 'from-cinematic-red to-neon-purple'
                },
                {
                  icon: <Globe className='w-8 h-8' />,
                  title: '50+ Languages',
                  description: 'Fluently communicate with visitors in any language, breaking down global communication barriers.',
                  color: 'from-aurora-cyan to-blue-500'
                },
                {
                  icon: <Calendar className='w-8 h-8' />,
                  title: 'Smart Scheduling',
                  description: 'AI-powered appointment booking that learns your business patterns and optimizes availability.',
                  color: 'from-hollywood-gold to-orange-500'
                },
                {
                  icon: <Shield className='w-8 h-8' />,
                  title: 'Enterprise Security',
                  description: 'Bank-grade encryption and compliance with GDPR, HIPAA, and SOC2 standards.',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: <Zap className='w-8 h-8' />,
                  title: 'Instant Response',
                  description: 'Sub-second response times with intelligent caching and predictive assistance.',
                  color: 'from-yellow-500 to-amber-500'
                },
                {
                  icon: <Users className='w-8 h-8' />,
                  title: 'Human Handoff',
                  description: 'Seamless escalation to human staff when AI reaches confidence thresholds.',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className='glass-strong rounded-2xl p-6 hover:border-hollywood-gold/30 transition-all group'
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className='font-semibold text-xl text-white mb-2'>{feature.title}</h3>
                  <p className='text-soft-white/60'>{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className='text-center mt-12'>
              <button 
                onClick={() => setCurrentView('industries')}
                className='cinematic-btn inline-flex items-center gap-2'
              >
                View Industry Solutions
                <ChevronRight className='w-5 h-5' />
              </button>
            </div>
          </motion.div>
        )}

        {/* Industries Section */}
        {currentView === 'industries' && (
          <motion.div 
            className='py-20'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className='text-center mb-16'>
              <span className='text-hollywood-gold text-sm font-semibold tracking-wider'>UNIVERSAL COMPATIBILITY</span>
              <h2 className='font-display text-5xl font-bold text-white mt-4 mb-6'>Works With Every Industry</h2>
              <p className='text-soft-white/60 text-lg max-w-2xl mx-auto'>
                From healthcare to government, FRONTDESK AGENTS adapts to your unique business needs
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto'>
              {industries.map((industry, i) => (
                <motion.div
                  key={industry.id}
                  className={clsx(
                    'glass rounded-xl p-6 cursor-pointer transition-all',
                    activeIndustry === industry.id 
                      ? 'border-hollywood-gold/50 bg-hollywood-gold/5' 
                      : 'hover:border-aurora-cyan/30'
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveIndustry(activeIndustry === industry.id ? null : industry.id)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className='text-4xl mb-4'>{industry.icon}</div>
                  <h3 className='font-semibold text-white mb-2'>{industry.name}</h3>
                  <p className='text-soft-white/60 text-sm'>{industry.description}</p>
                  
                  {activeIndustry === industry.id && (
                    <motion.div 
                      className='mt-4 pt-4 border-t border-hollywood-gold/20'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className='flex items-center gap-2 text-hollywood-gold text-sm'>
                        <CheckCircle2 className='w-4 h-4' />
                        Active Integration
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className='text-center mt-12'>
              <button 
                onClick={() => setIsDemoMode(true)}
                className='cinematic-btn inline-flex items-center gap-2'
              >
                <Sparkles className='w-5 h-5' />
                Try It Now - Free Demo
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className='relative z-10 border-t border-hollywood-gold/10 py-8'>
        <div className='container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <Bot className='w-5 h-5 text-cinematic-red' />
            <span className='text-soft-white/60 text-sm'>© 2026 FRONTDESK AGENTS. All rights reserved.</span>
          </div>
          <div className='flex items-center gap-6'>
            <span className='text-soft-white/40 text-xs'>Powered by Advanced AI Agent Technology</span>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-aurora-cyan status-online' />
              <span className='text-aurora-cyan text-xs'>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}