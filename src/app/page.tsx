'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  Mic, MicOff, MessageSquare, Phone, Globe, Calendar, 
  Users, Building2, Shield, Zap, ChevronRight, Play, 
  Pause, Volume2, Bot, Sparkles, Star, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, Send, PhoneOff,
  Maximize2, Minimize2, Video, Coffee, Clock, MapPin,
  FileText, Headphones, Monitor, Wifi, Lock, Fingerprint,
  VolumeX, PhoneIncoming, PhoneOutgoing, User, Settings,
  ChevronDown, X, Plus, Minus, PlayCircle, PauseCircle,
  Building, Briefcase, Heart, Home, Stethoscope, Scale,
  Hotel, Store, GraduationCap,
  ChevronLeft, Menu, Quote, Award, Clock3, Globe2,
  Languages, MessageCircle, Headphones as SupportIcon, CircleDot,
  PhoneCall, PhoneIncoming as Incoming, PhoneOutgoing as Outgoing,
  Bot as BotIcon, Cpu, Sparkles as SparkleIcon, Shield as ShieldIcon,
  Zap as ZapIcon, Users as UsersIcon, Building2 as BuildingIcon
} from 'lucide-react'
import { clsx } from 'clsx'

// BUFFY & HERMES AI Brain Import
import { 
  buffyHermesEngine, 
  autonomousDecisionEngine,
  selfLearningEngine,
  BuffyBrain,
  HermesBrain 
} from '@/lib/ai-brain'
import type { AutonomousDecision, AgentMessage } from '@/lib/ai-brain'

// ==========================================
// 8K OFFICE ENVIRONMENT - IMMERSIVE BRANDING
// FRONTDESK AGENTS Native System
// ==========================================

const colors = {
  deepNavy: '#050810',
  midnightBlue: '#0a1220',
  slate: '#141d2f',
  steel: '#1c2942',
  silver: '#8892a4',
  gold: '#f0b429',
  goldLight: '#ffd666',
  goldDark: '#c4920a',
  white: '#ffffff',
  offWhite: '#f5f7fa',
  cyan: '#00d4ff',
  cyanLight: '#66e5ff',
  cyanDark: '#0099cc',
  red: '#ff4757',
  green: '#26de81',
  purple: '#a55eea',
  orange: '#fd9644',
  rose: '#ff6b9d'
}

// ==========================================
// 8K OFFICE ENVIRONMENT IMAGES
// Premium Corporate Workspaces
// ==========================================

const officeBackgrounds = {
  executiveLobby: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=3840&q=98',
  modernReception: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=3840&q=98',
  corporateOffice: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=3840&q=98',
  techWorkspace: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=3840&q=98',
  executiveSuite: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3840&q=98',
  glassOffice: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=3840&q=98',
  contemporaryOffice: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=3840&q=98',
  executiveLounge: 'https://images.unsplash.com/photo-1605369263802-1e1b44cb2f7c?w=3840&q=98',
  cityOfficeView: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=3840&q=98',
  modernInterior: 'https://images.unsplash.com/photo-1493501953787-2f0b99f931d6?w=3840&q=98'
}

// Real Professional Human Images for AI Agents
const humanAvatars = {
  aria: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=95',
  chronos: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=95',
  nova: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200&q=95',
  atlas: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=1200&q=95',
  buffy: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=1200&q=95',
  hermes: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=95'
}

// Office Zone Backgrounds
const officeZones = [
  { id: 'lobby', name: 'Executive Lobby', image: officeBackgrounds.executiveLobby, ambiance: 'Professional & Welcoming' },
  { id: 'reception', name: 'Modern Reception', image: officeBackgrounds.modernReception, ambiance: 'Contemporary & Efficient' },
  { id: 'office', name: 'Corporate Office', image: officeBackgrounds.corporateOffice, ambiance: 'Innovative & Dynamic' },
  { id: 'lounge', name: 'Executive Lounge', image: officeBackgrounds.executiveLounge, ambiance: 'Luxurious & Comfortable' },
]

// Industries with Branding
const industries = [
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope, description: 'Patient-first virtual reception with HIPAA compliance', features: ['Appointment Scheduling', 'Patient Intake', 'Insurance Verification', 'Wait Time Updates'], color: '#26de81' },
  { id: 'legal', name: 'Legal', icon: Scale, description: 'Professional client intake and case management', features: ['Client Intake', 'Consultation Booking', 'Document Handling', 'Confidentiality'], color: '#a55eea' },
  { id: 'realestate', name: 'Real Estate', icon: Home, description: 'Property showcase reception and lead capture', features: ['Listing Information', 'Showing Scheduling', 'Lead Capture', 'Virtual Tours'], color: '#fd9644' },
  { id: 'hospitality', name: 'Hospitality', icon: Hotel, description: 'Luxury guest services and concierge', features: ['Reservation Management', 'Concierge Services', 'Room Service', 'Local Recommendations'], color: '#00d4ff' },
  { id: 'corporate', name: 'Corporate', icon: Building2, description: 'Enterprise visitor management and security', features: ['Security Check-in', 'Meeting Rooms', 'Employee Services', 'Visitor Notifications'], color: '#f0b429' },
  { id: 'finance', name: 'Finance', icon: Briefcase, description: 'Secure financial services and appointments', features: ['Account Inquiries', 'Appointment Scheduling', 'Document Sharing', 'Compliance'], color: '#ff6b9d' },
  { id: 'retail', name: 'Retail', icon: Store, description: 'Customer service and shopping assistance', features: ['Product Info', 'Inventory Check', 'Order Tracking', 'Returns'], color: '#ff4757' },
  { id: 'government', name: 'Government', icon: Building, description: 'Citizen services and public information', features: ['Service Navigation', 'Appointment Booking', 'Form Assistance', 'Language Support'], color: '#8892a4' },
]

// AI Agents with Real Human Images
const aiAgents = [
  { id: 'buffy', name: 'BUFFY', title: 'Chief Strategic Intelligence', type: 'buffy', status: 'online', avatar: humanAvatars.buffy, specialties: ['Strategic Planning', 'Decision Making', 'Business Optimization', 'Pattern Recognition', 'Autonomous Learning'], languages: ['All Languages'], responseTime: '0.8ms', color: '#00f5ff', isAI: true },
  { id: 'hermes', name: 'HERMES', title: 'Chief Operations Executor', type: 'hermes', status: 'online', avatar: humanAvatars.hermes, specialties: ['Lightning Delivery', 'Multi-channel Communication', 'Message Optimization', 'Real-time Execution'], languages: ['All Languages'], responseTime: '0.3ms', color: '#ffd700', isAI: true },
  { id: 'aria', name: 'ARIA', title: 'Chief Reception Officer', type: 'reception', status: 'online', avatar: humanAvatars.aria, specialties: ['First Impressions', 'VIP Treatment', 'Multilingual Support'], languages: ['English', 'Spanish', 'French', 'Mandarin'], responseTime: '< 1 sec', color: '#f0b429', isAI: false },
  { id: 'chronos', name: 'CHRONOS', title: 'Scheduling Specialist', type: 'scheduling', status: 'online', avatar: humanAvatars.chronos, specialties: ['Calendar Management', 'Appointment Optimization', 'Reminders'], languages: ['English', 'German', 'Portuguese'], responseTime: '< 2 sec', color: '#00d4ff', isAI: false },
  { id: 'nova', name: 'NOVA', title: 'Information Analyst', type: 'information', status: 'online', avatar: humanAvatars.nova, specialties: ['Knowledge Base', 'FAQ Expert', 'Directions'], languages: ['English', 'Japanese', 'Korean'], responseTime: '< 1 sec', color: '#26de81', isAI: false },
  { id: 'atlas', name: 'ATLAS', title: 'Escalation Manager', type: 'escalation', status: 'online', avatar: humanAvatars.atlas, specialties: ['Complex Cases', 'Crisis Management', 'Human Handoff'], languages: ['English', 'Arabic', 'Hindi'], responseTime: '< 3 sec', color: '#a55eea', isAI: false },
]

// ==========================================
// TYPES
// ==========================================

interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  agentType?: string
}

// ==========================================
// AI RESPONSE ENGINE
// ==========================================

const generateAIResponse = (userMessage: string, agentType: string): string => {
  const msg = userMessage.toLowerCase()
  
  if (msg.includes('appointment') || msg.includes('schedule') || msg.includes('book')) {
    return 'I would be delighted to help you schedule an appointment! Our intelligent scheduling system shows optimal availability. Would you prefer morning or afternoon?'
  }
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return 'Good day! Welcome to our office. I am your dedicated AI receptionist, here to ensure your experience is exceptional. How may I assist you today?'
  }
  
  if (msg.includes('location') || msg.includes('address') || msg.includes('where')) {
    return 'Our office is located at 1250 Innovation Boulevard, Suite 400, in the prestigious West Tower building. We have secure underground parking and easy Metro access.'
  }
  
  if (msg.includes('hour') || msg.includes('open') || msg.includes('close')) {
    return 'Our business hours are Monday through Friday, 8:00 AM to 7:00 PM EST. For urgent matters outside these hours, our 24/7 virtual concierge is available.'
  }
  
  if (msg.includes('price') || msg.includes('cost') || msg.includes('quote')) {
    return 'Thank you for your inquiry. We offer customized solutions tailored to your specific needs. May I schedule a complimentary consultation with our team?'
  }
  
  if (msg.includes('services') || msg.includes('offer') || msg.includes('help')) {
    return 'We offer: appointment scheduling, visitor registration, information retrieval, multilingual support, and seamless human handoff. How may I direct your inquiry?'
  }
  
  if (msg.includes('thank') || msg.includes('thanks')) {
    return 'You are most welcome! It is my pleasure to assist you. Is there anything else I can help you with today?'
  }
  
  if (msg.includes('bye') || msg.includes('goodbye')) {
    return 'Thank you for visiting! Have a wonderful day ahead. Please do not hesitate to reach out if you need anything further.'
  }
  
  if (msg.includes('speak to') || msg.includes('human') || msg.includes('real person')) {
    return 'I understand you would like to speak with a team member. I am connecting you with our guest services team who will be with you shortly.'
  }
  
  return 'I understand your inquiry. Let me process that information and provide you with the most relevant assistance. Could you share more details?'
}

// ==========================================
// COMPONENTS
// ==========================================

// Immersive Office Background with Parallax
const OfficeBackground = ({ zone }: { zone: string }) => {
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  const zoneData = officeZones.find(z => z.id === zone) || officeZones[0]
  
  return (
    <div className='absolute inset-0 z-0 overflow-hidden'>
      {/* Base Gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-deepNavy via-midnightBlue to-slate' />
      
      {/* 8K Office Image with Parallax */}
      <motion.div 
        className='absolute inset-0 opacity-30'
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', stiffness: 30, damping: 20 }}
      >
        <img 
          src={zoneData.image}
          alt='Premium Office Environment'
          className={clsx(
            'w-full h-full object-cover transition-opacity duration-1500',
            loaded ? 'opacity-30' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
      
      {/* Multiple Light Overlays for Depth */}
      <div className='absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-cyan-500/8' />
      <div className='absolute inset-0 bg-gradient-to-bl from-purple-500/5 via-transparent to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-t from-deepNavy via-transparent to-transparent' />
      
      {/* Atmospheric Depth */}
      <motion.div 
        className='absolute inset-0'
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(30,40,60,0.9) 0%, transparent 70%)' }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      {/* Vignette for Focus */}
      <div className='absolute inset-0' style={{ 
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,8,16,0.4) 40%, rgba(5,8,16,0.9) 100%)' 
      }} />
      
      {/* Subtle Grid for Tech Feel */}
      <div className='absolute inset-0 opacity-[0.02]' 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '80px 80px'
           }} 
      />
    </div>
  )
}

// Ambient Golden Particles
const AmbientParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 10,
      color: Math.random() > 0.5 ? colors.gold : Math.random() > 0.3 ? colors.cyan : colors.silver
    })), [])
  
  return (
    <div className='fixed inset-0 pointer-events-none overflow-hidden z-[1]'>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className='absolute rounded-full'
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`
          }}
          animate={{
            y: [-20, -250, -500],
            opacity: [0, 0.5, 0],
            scale: [1, 1.3, 0.7]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

// Light Beams Effect
const LightBeams = () => (
  <div className='fixed inset-0 pointer-events-none z-[1] overflow-hidden'>
    <motion.div 
      className='absolute top-0 left-[15%] w-[700px] h-full bg-gradient-to-b from-amber-500/12 via-orange-500/6 to-transparent'
      style={{ transform: 'rotate(-10deg)', transformOrigin: 'top center' }}
      animate={{ opacity: [0.4, 0.7, 0.4], x: [0, 60, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className='absolute top-0 right-[10%] w-[500px] h-full bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent'
      style={{ transform: 'rotate(8deg)', transformOrigin: 'top center' }}
      animate={{ opacity: [0.3, 0.6, 0.3], x: [0, -50, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div 
      className='absolute top-0 left-1/2 w-[400px] h-full bg-gradient-to-b from-purple-500/8 via-pink-500/4 to-transparent'
      style={{ transform: 'translateX(-50%)', transformOrigin: 'top center' }}
      animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    />
  </div>
)

// Real Human Avatar with Professional Presence
const HumanAvatar = ({ agent, isSpeaking, isListening, size = 'large' }: { agent: any, isSpeaking: boolean, isListening: boolean, size?: 'small' | 'large' }) => {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  
  const dimensions = size === 'large' 
    ? { container: 'w-72 h-72 md:w-80 md:h-80', outer: '-inset-4' } 
    : { container: 'w-24 h-24 md:w-28 md:h-28', outer: '-inset-2' }
  
  return (
    <motion.div 
      className='relative cursor-pointer'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ scale: isSpeaking ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
    >
      {/* Outer Glow Ring */}
      <motion.div 
        className={clsx('absolute rounded-full', dimensions.outer)}
        animate={{ 
          boxShadow: isSpeaking 
            ? `0 0 60px ${agent.color}, 0 0 120px ${agent.color}50, inset 0 0 60px ${agent.color}40`
            : hovered 
              ? `0 0 50px ${agent.color}60, 0 0 100px ${agent.color}30`
              : `0 0 40px ${agent.color}20, 0 0 80px ${agent.color}10`
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Main Avatar Container */}
      <div className={clsx('relative', dimensions.container)}>
        {/* Rotating Outer Ring */}
        <motion.div 
          className='absolute inset-0 rounded-full'
          style={{ border: `2px solid ${isSpeaking ? agent.color : colors.cyan}40` }}
          animate={{ rotate: isSpeaking ? 360 : 0 }}
          transition={{ duration: 20, repeat: isSpeaking ? Infinity : 0, ease: 'linear' }}
        />
        
        {/* Inner Rings */}
        <div className='absolute -inset-1 rounded-full border border-white/5 backdrop-blur-sm' />
        <div className='absolute -inset-2 rounded-full border border-white/10 backdrop-blur-sm' />
        
        {/* Avatar Image Container */}
        <div className='absolute inset-1 rounded-full overflow-hidden bg-gradient-to-br from-slate to-midnightBlue shadow-2xl'>
          {!loaded && (
            <div className='absolute inset-0 bg-gradient-to-br from-slate to-midnightBlue animate-pulse' />
          )}
          
          {!imgError ? (
            <motion.img 
              src={agent.avatar}
              alt={agent.name}
              className={clsx(
                'w-full h-full object-cover object-center transition-all duration-700',
                hovered && 'scale-105',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setLoaded(true)}
              onError={() => setImgError(true)}
              style={{ filter: 'contrast(1.05) saturate(1.1) brightness(1.02)' }}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-slate to-midnightBlue'>
              <Bot className='w-1/3 h-1/3 text-gold' />
            </div>
          )}
          
          {/* Professional Lighting */}
          <div className='absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-cyan-500/10 pointer-events-none' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none' />
        </div>
        
        {/* Status Badge */}
        <motion.div 
          className={clsx(
            'absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full backdrop-blur-md border',
            agent.status === 'online' ? 'bg-green-500/25 border-green-500/60' :
            agent.status === 'busy' ? 'bg-amber-500/25 border-amber-500/60' :
            'bg-slate/25 border-slate/60'
          )}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className='flex items-center gap-1.5'>
            <motion.span 
              className={clsx(
                'w-1.5 h-1.5 rounded-full',
                agent.status === 'online' ? 'bg-green-400' :
                agent.status === 'busy' ? 'bg-amber-400' : 'bg-slate-400'
              )}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className='text-[10px] font-semibold text-white/90 uppercase tracking-wider'>
              {agent.status}
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Voice Visualization */}
      {isSpeaking && (
        <div className='absolute -right-10 md:-right-14 top-1/2 -translate-y-1/2 flex items-center gap-0.5 h-12 md:h-16'>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className='w-1 rounded-full'
              style={{ background: `linear-gradient(to top, ${agent.color}, ${colors.white})` }}
              animate={{ height: [4, Math.random() * 44 + 20, 4] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
      
      {/* Listening Pulse */}
      {isListening && (
        <>
          <motion.div 
            className='absolute inset-0 rounded-full border-2'
            style={{ borderColor: `${agent.color}60` }}
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className='absolute inset-0 rounded-full border'
            style={{ borderColor: `${agent.color}30` }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
      
      {/* Agent Label */}
      <motion.div 
        className='absolute -bottom-14 left-1/2 -translate-x-1/2 text-center whitespace-nowrap'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className='text-lg font-bold text-white tracking-wide' style={{ textShadow: `0 0 20px ${agent.color}60` }}>{agent.name}</h3>
        <p className='text-xs font-medium' style={{ color: agent.color }}>{agent.title}</p>
      </motion.div>
    </motion.div>
  )
}

// Premium Chat Bubble
const PremiumBubble = ({ message, isAgent, agentColor = colors.gold }: { message: Message, isAgent: boolean, agentColor?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
    className={clsx('flex gap-3 mb-4', isAgent ? 'flex-row' : 'flex-row-reverse')}
  >
    {isAgent && (
      <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 shadow-lg' style={{ borderColor: `${agentColor}60` }}>
        <img src={aiAgents[0].avatar} alt='AI' className='w-full h-full object-cover' />
      </div>
    )}
    
    <div className={clsx(
      'max-w-[85%] px-5 py-3.5 rounded-2xl backdrop-blur-xl',
      isAgent 
        ? 'bg-gradient-to-br from-slate/90 to-midnightBlue/90 border border-white/10 rounded-tl-md' 
        : 'bg-gradient-to-br from-gold/95 to-goldDark/95 border border-gold/30 rounded-tr-md shadow-lg'
    )}>
      <p className='text-sm leading-relaxed text-white'>{message.content}</p>
      <div className='flex items-center gap-2 mt-2'>
        <span className='text-xs text-white/50'>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isAgent && message.agentType && (
          <span className='px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium'>
            {message.agentType}
          </span>
        )}
      </div>
    </div>
    
    {!isAgent && (
      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gold to-goldDark flex-shrink-0 flex items-center justify-center shadow-lg border-2 border-gold/50'>
        <User className='w-5 h-5 text-deepNavy' />
      </div>
    )}
  </motion.div>
)

// Glass Morphism Card
const GlassCard = ({ children, className, delay = 0, glowColor = colors.gold }: { children: React.ReactNode, className?: string, delay?: number, glowColor?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay }}
    className={clsx('relative group', className)}
  >
    <div 
      className='absolute -inset-0.5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700'
      style={{ background: `linear-gradient(135deg, ${glowColor}30, ${colors.cyan}30, ${colors.purple}30)` }}
    />
    
    <div className='relative bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 overflow-hidden'>
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent' />
      <div 
        className='absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20'
        style={{ background: `radial-gradient(circle, ${glowColor}40, transparent)` }}
      />
      {children}
    </div>
  </motion.div>
)

// Cinematic Loading
const CinematicLoader = () => (
  <motion.div 
    className='fixed inset-0 z-[100] flex items-center justify-center bg-deepNavy overflow-hidden'
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5, ease: 'easeInOut' }}
  >
    <div className='absolute inset-0'>
      <div className='absolute inset-0 bg-gradient-to-br from-midnightBlue via-slate to-deepNavy' />
      <motion.div 
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]'
        style={{ background: 'radial-gradient(circle, rgba(240,180,41,0.15) 0%, transparent 60%)' }}
        animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
    
    <div className='text-center z-10'>
      <motion.div className='relative w-40 h-40 mx-auto mb-10'>
        <motion.div 
          className='absolute inset-0 rounded-full border border-gold/40'
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className='absolute inset-3 rounded-full border border-cyan-500/30'
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className='absolute inset-6 rounded-full border border-purple-500/30'
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Bot className='w-16 h-16 text-gold drop-shadow-lg' />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <motion.h2 
          className='text-3xl font-bold text-white mb-3 tracking-[0.3em]'
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          INITIALIZING
        </motion.h2>
        <p className='text-gold text-xl font-bold tracking-[0.4em]'>FRONTDESK AGENTS</p>
      </motion.div>
      
      <motion.div 
        className='w-80 h-1 bg-white/10 rounded-full mt-10 mx-auto overflow-hidden'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div 
          className='h-full bg-gradient-to-r from-gold via-cyan to-gold'
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  </motion.div>
)

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function FrontdeskAgentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(aiAgents[0])
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedZone, setSelectedZone] = useState('lobby')
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentView, setCurrentView] = useState<'hero' | 'features' | 'industries' | 'pricing'>('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -100])
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 4000)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])
  
  useEffect(() => {
    if (!isLoading && showWelcome) {
      setTimeout(() => {
        setMessages([{
          id: 'welcome-' + Date.now(),
          role: 'agent',
          content: 'Welcome to the future of office reception. I am ARIA, your AI-powered virtual concierge. How may I assist you today?',
          timestamp: new Date(),
          agentType: 'ARIA'
        }])
        setShowWelcome(false)
      }, 800)
    }
  }, [isLoading, showWelcome])
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMsg])
    const currentInput = inputValue
    setInputValue('')
    setIsSpeaking(true)
    
    try {
      const agentMessage: AgentMessage = {
        id: 'msg-' + Date.now(),
        agent: 'BUFFY-HERMES',
        content: currentInput,
        timestamp: new Date(),
        priority: 'medium',
        sentiment: 'neutral'
      }
      
      const result = await buffyHermesEngine.process(agentMessage, {
        industry: 'corporate',
        customerTier: 'pro',
        conversationCount: messages.length,
        lastMessage: currentInput,
        sentiment: 'neutral',
        intent: 'general_inquiry',
        entities: [],
        isVoiceActive: isListening,
        officeZone: selectedZone
      })
      
      const aiResponse = generateAIResponse(currentInput, selectedAgent.type)
      
      const agentMsg: Message = {
        id: 'agent-' + Date.now(),
        role: 'agent',
        content: aiResponse,
        timestamp: new Date(),
        agentType: selectedAgent.name
      }
      setMessages(prev => [...prev, agentMsg])
      
    } catch (error) {
      console.error('Processing error:', error)
      const agentMsg: Message = {
        id: 'agent-' + Date.now(),
        role: 'agent',
        content: generateAIResponse(currentInput, selectedAgent.type),
        timestamp: new Date(),
        agentType: selectedAgent.name
      }
      setMessages(prev => [...prev, agentMsg])
    }
    
    setIsSpeaking(false)
  }
  
  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        const voiceMsg: Message = {
          id: 'voice-' + Date.now(),
          role: 'user',
          content: 'I need to schedule an appointment for tomorrow at 2 PM.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, voiceMsg])
      }, 3000)
    }
  }
  
  const handleQuickAction = (action: string) => {
    setInputValue(action)
    inputRef.current?.focus()
  }
  
  if (isLoading) {
    return <CinematicLoader />
  }
  
  return (
    <div className='min-h-screen bg-deepNavy text-white overflow-x-hidden relative'>
      <OfficeBackground zone={selectedZone} />
      <AmbientParticles />
      <LightBeams />
      
      {/* Navigation - Native FRONTDESK AGENTS Branding */}
      <motion.nav 
        className='fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4'
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          {/* FRONTDESK AGENTS Logo */}
          <motion.div 
            className='flex items-center gap-3 cursor-pointer'
            whileHover={{ scale: 1.02 }}
            onClick={() => setCurrentView('hero')}
          >
            <div className='relative'>
              <div 
                className='w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-goldDark flex items-center justify-center shadow-lg'
                style={{ boxShadow: `0 8px 32px ${colors.gold}40` }}
              >
                <Bot className='w-6 h-6 text-deepNavy' />
              </div>
              <motion.div 
                className='absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-[2px] border-deepNavy'
                animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className='text-xl font-bold tracking-wide text-white'>FRONTDESK</h1>
              <p className='text-xs font-bold tracking-[0.3em] text-gold'>AGENTS</p>
            </div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-2'>
            {[
              { id: 'features', label: 'Features', icon: Zap },
              { id: 'industries', label: 'Industries', icon: Building2 },
              { id: 'pricing', label: 'Pricing', icon: Calendar },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={clsx(
                  'px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 backdrop-blur-sm',
                  currentView === item.id 
                    ? 'bg-gold/20 text-gold border border-gold/30 shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className='w-4 h-4' />
                {item.label}
              </motion.button>
            ))}
          </div>
          
          {/* CTA Button */}
          <motion.button
            onClick={() => setIsDemoOpen(true)}
            className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold text-sm flex items-center gap-2 shadow-lg'
            style={{ boxShadow: `0 8px 32px ${colors.gold}40` }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className='w-4 h-4' />
            Try Demo
          </motion.button>
          
          <motion.button
            className='md:hidden p-2 rounded-xl bg-white/5'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className='w-6 h-6 text-white' />
          </motion.button>
        </div>
        
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='md:hidden mt-4 p-4 rounded-2xl bg-slate/90 backdrop-blur-xl border border-white/10'
            >
              {[
                { id: 'features', label: 'Features', icon: Zap },
                { id: 'industries', label: 'Industries', icon: Building2 },
                { id: 'pricing', label: 'Pricing', icon: Calendar },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id as any); setMobileMenuOpen(false) }}
                  className='w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors'
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className='w-5 h-5' />
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className='relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8 pt-24 pb-16'
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <div className='text-center max-w-6xl mx-auto relative z-10'>
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/30 mb-8 shadow-lg'
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Star className='w-5 h-5 text-gold' />
            </motion.div>
            <span className='text-gold text-sm font-semibold tracking-wide'>World's Most Advanced AI Receptionist</span>
          </motion.div>
          
          {/* Main Headline - FRONTDESK AGENTS Branding */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='text-5xl md:text-7xl lg:text-[5rem] font-bold mb-8 leading-[1.1] tracking-tight'
          >
            <span className='bg-gradient-to-r from-white via-offWhite to-silver bg-clip-text text-transparent'>
              THE FUTURE OF
            </span>
            <br />
            <span className='bg-gradient-to-r from-gold via-goldLight to-gold bg-clip-text text-transparent' style={{ textShadow: `0 0 60px ${colors.gold}40` }}>
              OFFICE RECEPTION
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='text-lg md:text-xl text-silver max-w-3xl mx-auto mb-12 leading-relaxed'
          >
            Experience the world's most sophisticated AI-powered virtual receptionist. 
            Photorealistic avatars, hyper-realistic 8K office environments, and human-like 
            conversations that transform how businesses greet their visitors.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className='flex flex-wrap justify-center gap-4 mb-20'
          >
            <motion.button
              onClick={() => setIsDemoOpen(true)}
              className='px-10 py-5 rounded-2xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold text-lg flex items-center gap-3 shadow-2xl'
              style={{ boxShadow: `0 20px 60px ${colors.gold}40` }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayCircle className='w-7 h-7' />
              Experience the Demo
            </motion.button>
            
            <motion.button
              onClick={() => setCurrentView('features')}
              className='px-10 py-5 rounded-2xl bg-white/5 border border-white/20 text-white font-semibold text-lg flex items-center gap-3 backdrop-blur-sm'
              whileHover={{ scale: 1.05, y: -3, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className='w-7 h-7' />
              Explore Features
            </motion.button>
          </motion.div>
          
          {/* Stats Grid - Native Branding */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto'
          >
            {[
              { value: '50+', label: 'Languages', icon: Languages, color: colors.cyan },
              { value: '8K', label: 'Video Quality', icon: Video, color: colors.gold },
              { value: '99.9%', label: 'Accuracy', icon: Zap, color: colors.green },
              { value: '24/7', label: 'Availability', icon: Clock3, color: colors.purple },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className='text-center p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm'
                whileHover={{ scale: 1.05, y: -5, borderColor: `${stat.color}40` }}
              >
                <stat.icon className='w-7 h-7 mx-auto mb-3' style={{ color: stat.color }} />
                <p className='text-3xl md:text-4xl font-bold text-white mb-1'>{stat.value}</p>
                <p className='text-sm text-silver'>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className='absolute bottom-10 left-1/2 -translate-x-1/2'
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className='flex flex-col items-center gap-2'>
            <span className='text-xs text-white/40 tracking-widest'>SCROLL</span>
            <ChevronDown className='w-6 h-6 text-white/50' />
          </div>
        </motion.div>
      </motion.section>
      
      {/* Features Section */}
      {currentView === 'features' && (
        <motion.section 
          className='relative py-32 px-4 md:px-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='max-w-7xl mx-auto'>
            <div className='text-center mb-20'>
              <motion.span 
                className='text-gold text-sm font-bold tracking-[0.3em] uppercase'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Revolutionary Technology
              </motion.span>
              <motion.h2 
                className='text-4xl md:text-6xl font-bold text-white mt-6 mb-6'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                8K Office Experience
              </motion.h2>
              <motion.p 
                className='text-silver text-lg md:text-xl max-w-2xl mx-auto'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Every pixel, every animation, every interaction designed to perfection
              </motion.p>
            </div>
            
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[
                { icon: BotIcon, title: 'AI Agents', desc: 'Multi-agent AI system with specialized roles working in coordination', color: colors.gold, delay: 0 },
                { icon: Languages, title: '50+ Languages', desc: 'Fluent multilingual support breaking language barriers worldwide', color: colors.cyan, delay: 0.1 },
                { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered appointment optimization and calendar management', color: colors.green, delay: 0.2 },
                { icon: ShieldIcon, title: 'Enterprise Security', desc: 'Bank-grade encryption and compliance with global standards', color: colors.purple, delay: 0.3 },
                { icon: ZapIcon, title: 'Instant Response', desc: 'Sub-second intelligent responses with human-like accuracy', color: colors.orange, delay: 0.4 },
                { icon: UsersIcon, title: 'Seamless Handoff', desc: 'Smooth escalation to human agents when complexity requires it', color: colors.rose, delay: 0.5 },
                { icon: Globe2, title: 'Universal Industry', desc: 'Adaptable to any business type from healthcare to government', color: colors.gold, delay: 0.6 },
                { icon: MessageCircle, title: 'Voice & Text', desc: 'Natural voice conversations and text chat in one interface', color: colors.cyan, delay: 0.7 },
                { icon: SupportIcon, title: '24/7 Support', desc: 'Round-the-clock availability for global operations', color: colors.green, delay: 0.8 },
              ].map((feature, i) => (
                <GlassCard key={i} delay={feature.delay} glowColor={feature.color}>
                  <div 
                    className='w-16 h-16 rounded-2xl flex items-center justify-center mb-6'
                    style={{ background: `${feature.color}20` }}
                  >
                    <feature.icon className='w-8 h-8' style={{ color: feature.color }} />
                  </div>
                  <h3 className='text-xl md:text-2xl font-bold text-white mb-3'>{feature.title}</h3>
                  <p className='text-silver leading-relaxed'>{feature.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      
      {/* Industries Section */}
      {currentView === 'industries' && (
        <motion.section 
          className='relative py-32 px-4 md:px-8 bg-gradient-to-b from-transparent via-slate/30 to-transparent'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='max-w-7xl mx-auto'>
            <div className='text-center mb-20'>
              <motion.span 
                className='text-cyan text-sm font-bold tracking-[0.3em] uppercase'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Universal Solutions - FRONTDESK AGENTS Native
              </motion.span>
              <motion.h2 
                className='text-4xl md:text-6xl font-bold text-white mt-6 mb-6'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Works With Any Industry
              </motion.h2>
              <motion.p 
                className='text-silver text-lg md:text-xl max-w-2xl mx-auto'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                From Fortune 500 to startups, FRONTDESK AGENTS adapts to your unique needs
              </motion.p>
            </div>
            
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {industries.map((industry, i) => (
                <GlassCard key={industry.id} delay={i * 0.1} glowColor={industry.color}>
                  <div 
                    className='w-14 h-14 rounded-2xl flex items-center justify-center mb-5'
                    style={{ background: `${industry.color}20` }}
                  >
                    <industry.icon className='w-7 h-7' style={{ color: industry.color }} />
                  </div>
                  <h3 className='text-xl font-bold text-white mb-2'>{industry.name}</h3>
                  <p className='text-silver text-sm mb-5'>{industry.description}</p>
                  <div className='space-y-2'>
                    {industry.features.slice(0, 3).map((f) => (
                      <div key={f} className='flex items-center gap-2 text-sm text-white/60'>
                        <CheckCircle2 className='w-4 h-4 flex-shrink-0' style={{ color: industry.color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      
      {/* Pricing Section */}
      {currentView === 'pricing' && (
        <motion.section 
          className='relative py-32 px-4 md:px-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='max-w-5xl mx-auto'>
            <div className='text-center mb-20'>
              <motion.span 
                className='text-purple text-sm font-bold tracking-[0.3em] uppercase'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Simple Pricing - FRONTDESK AGENTS
              </motion.span>
              <motion.h2 
                className='text-4xl md:text-6xl font-bold text-white mt-6 mb-6'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Choose Your Plan
              </motion.h2>
              <motion.p 
                className='text-silver text-lg max-w-2xl mx-auto'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Start free, scale as you grow. No hidden fees, no surprises.
              </motion.p>
            </div>
            
            <div className='grid md:grid-cols-3 gap-6'>
              {[
                { 
                  name: 'Starter', 
                  price: 'Free', 
                  desc: 'Perfect for small businesses getting started',
                  features: ['1 AI Agent', '100 conversations/month', 'Basic scheduling', 'Email support'],
                  color: colors.silver,
                  delay: 0
                },
                { 
                  name: 'Professional', 
                  price: '$99/mo', 
                  desc: 'For growing businesses with advanced needs',
                  features: ['5 AI Agents', 'Unlimited conversations', 'Advanced NLP', 'Priority support', 'Custom branding'],
                  color: colors.gold,
                  delay: 0.1,
                  popular: true
                },
                { 
                  name: 'Enterprise', 
                  price: 'Custom', 
                  desc: 'For large organizations with complex requirements',
                  features: ['Unlimited AI Agents', 'White-label solution', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
                  color: colors.cyan,
                  delay: 0.2
                },
              ].map((plan, i) => (
                <GlassCard key={i} delay={plan.delay} glowColor={plan.color}>
                  {plan.popular && (
                    <div className='absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold to-goldDark text-deepNavy text-xs font-bold'>
                      MOST POPULAR
                    </div>
                  )}
                  <div className='text-center mb-8'>
                    <h3 className='text-xl font-bold text-white mb-2'>{plan.name}</h3>
                    <p className='text-4xl font-bold mb-2' style={{ color: plan.color }}>{plan.price}</p>
                    <p className='text-sm text-silver'>{plan.desc}</p>
                  </div>
                  <div className='space-y-3 mb-8'>
                    {plan.features.map((f) => (
                      <div key={f} className='flex items-center gap-3 text-sm text-white/80'>
                        <CheckCircle2 className='w-5 h-5 flex-shrink-0' style={{ color: plan.color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    className={clsx(
                      'w-full py-3 rounded-xl font-semibold transition-all',
                      plan.popular 
                        ? 'bg-gradient-to-r from-gold to-goldDark text-deepNavy' 
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </motion.button>
                </GlassCard>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      
      {/* Demo Modal */}
      <AnimatePresence>
        {isDemoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              'fixed inset-0 z-[80] bg-deepNavy/98 backdrop-blur-2xl',
              isFullscreen ? 'inset-0' : 'inset-4 md:inset-8 rounded-3xl'
            )}
          >
            <div className={clsx(
              'h-full glass-card overflow-hidden flex flex-col',
              !isFullscreen && 'max-w-7xl mx-auto'
            )}>
              {/* Demo Header - Native Branding */}
              <div className='flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate/50 to-transparent'>
                <div className='flex items-center gap-4'>
                  <div 
                    className='w-12 h-12 rounded-xl flex items-center justify-center'
                    style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
                  >
                    <Bot className='w-6 h-6 text-deepNavy' />
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-white'>AI Receptionist Demo</h2>
                    <p className='text-sm' style={{ color: colors.cyan }}>Powered by FRONTDESK AGENTS</p>
                  </div>
                </div>
                
                <div className='hidden md:flex items-center gap-2'>
                  {officeZones.map((zone) => (
                    <motion.button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone.id)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        selectedZone === zone.id
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/50 hover:text-white/70'
                      )}
                      whileHover={{ scale: 1.05 }}
                    >
                      {zone.name}
                    </motion.button>
                  ))}
                </div>
                
                <div className='flex items-center gap-3'>
                  <motion.button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className='p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isFullscreen ? <Minimize2 className='w-5 h-5 text-white' /> : <Maximize2 className='w-5 h-5 text-white' />}
                  </motion.button>
                  <motion.button
                    onClick={() => setIsDemoOpen(false)}
                    className='p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className='w-5 h-5 text-red-400' />
                  </motion.button>
                </div>
              </div>
              
              {/* Demo Content */}
              <div className='flex-1 flex flex-col lg:flex-row overflow-hidden'>
                {/* Avatar Section */}
                <div className='lg:w-[45%] p-6 md:p-10 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-slate/20 to-transparent'>
                  <HumanAvatar 
                    agent={selectedAgent}
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    size='large'
                  />
                  
                  {/* Agent Selector */}
                  <div className='flex gap-2 mt-10 flex-wrap justify-center'>
                    {aiAgents.map((agent) => (
                      <motion.button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        className={clsx(
                          'px-4 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm',
                          selectedAgent.id === agent.id
                            ? 'text-white border'
                            : 'text-white/60 bg-white/5 border border-transparent hover:text-white'
                        )}
                        style={selectedAgent.id === agent.id ? { 
                          background: `${agent.color}20`, 
                          borderColor: `${agent.color}50`,
                          color: agent.color
                        } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {agent.name}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Controls */}
                  <div className='flex items-center gap-4 mt-8'>
                    <motion.button
                      onClick={handleVoiceToggle}
                      className={clsx(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg',
                        isListening
                          ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/50'
                          : 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-2 border-cyan-500/40 hover:border-cyan-500/70'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isListening ? (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                          <MicOff className='w-6 h-6 text-white' />
                        </motion.div>
                      ) : (
                        <Mic className='w-6 h-6 text-cyan-400' />
                      )}
                    </motion.button>
                    
                    <motion.button
                      className='w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Volume2 className='w-5 h-5 text-white/70' />
                    </motion.button>
                  </div>
                  
                  {isListening && (
                    <motion.p
                      className='mt-4 text-cyan-400 font-medium animate-pulse flex items-center gap-2'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
                      Listening to your request...
                    </motion.p>
                  )}
                  
                  {/* Agent Info */}
                  <div className='mt-8 text-center max-w-sm'>
                    <div className='flex items-center justify-center gap-6 text-sm text-silver'>
                      <span className='flex items-center gap-2'>
                        <Clock className='w-4 h-4' />
                        {selectedAgent.responseTime}
                      </span>
                      <span className='flex items-center gap-2'>
                        <Globe className='w-4 h-4' />
                        {selectedAgent.languages.length} Languages
                      </span>
                    </div>
                    <div className='flex flex-wrap justify-center gap-2 mt-4'>
                      {selectedAgent.specialties.map((s) => (
                        <span 
                          key={s} 
                          className='px-3 py-1 rounded-full bg-white/5 text-xs text-white/50'
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Chat Section */}
                <div className='lg:w-[55%] flex flex-col bg-gradient-to-b from-slate/30 via-midnightBlue/50 to-transparent border-t lg:border-t-0 lg:border-l border-white/10'>
                  <div className='flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin'>
                    {messages.length === 0 && (
                      <div className='text-center py-16'>
                        <motion.div
                          animate={{ y: [-10, 10, -10] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Bot className='w-20 h-20 text-white/10 mx-auto mb-6' />
                        </motion.div>
                        <p className='text-white/40 text-lg mb-2'>Start a conversation</p>
                        <p className='text-white/30 text-sm'>Your AI receptionist is ready to assist you</p>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <PremiumBubble 
                        key={msg.id} 
                        message={msg} 
                        isAgent={msg.role === 'agent'}
                        agentColor={selectedAgent.color}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className='p-5 border-t border-white/10 bg-gradient-to-t from-slate/30 to-transparent'>
                    <div className='flex gap-3'>
                      <input
                        ref={inputRef}
                        type='text'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder='Type your message...'
                        className='flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors text-sm'
                      />
                      <motion.button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className={clsx(
                          'px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2',
                          inputValue.trim()
                            ? 'bg-gradient-to-r from-gold to-goldDark text-deepNavy shadow-lg'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send className='w-4 h-4' />
                      </motion.button>
                    </div>
                    
                    <div className='flex gap-2 mt-3 flex-wrap'>
                      {['Book Appointment', 'Office Hours', 'Location Info', 'Speak to Human'].map((action) => (
                        <motion.button
                          key={action}
                          onClick={() => handleQuickAction(action)}
                          className='px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/50 hover:text-gold hover:bg-gold/10 transition-colors border border-transparent hover:border-gold/20'
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {action}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CTA Section */}
      <motion.section 
        className='relative py-32 px-4 md:px-8'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className='max-w-4xl mx-auto text-center'>
          <GlassCard>
            <div className='py-8'>
              <motion.div
                className='relative w-24 h-24 mx-auto mb-8'
              >
                <motion.div 
                  className='absolute inset-0 rounded-full border-2 border-gold/30'
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div 
                  className='absolute inset-2 rounded-full border border-cyan-500/30'
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Bot className='w-10 h-10 text-gold' />
                </div>
              </motion.div>
              
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                Ready to Transform Your Office?
              </h2>
              <p className='text-silver text-lg mb-10 max-w-2xl mx-auto'>
                Experience the future of customer interaction with our AI-powered virtual receptionist. 
                Start your free demo today.
              </p>
              <div className='flex flex-wrap justify-center gap-4'>
                <motion.button
                  onClick={() => setIsDemoOpen(true)}
                  className='px-10 py-5 rounded-2xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold text-lg flex items-center gap-3 shadow-2xl'
                  style={{ boxShadow: `0 20px 60px ${colors.gold}40` }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlayCircle className='w-7 h-7' />
                  Start Free Demo
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.section>
      
      {/* Footer - Native Branding */}
      <footer className='relative py-12 px-4 md:px-8 border-t border-white/10'>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-3'>
            <div 
              className='w-10 h-10 rounded-xl flex items-center justify-center'
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
            >
              <Bot className='w-5 h-5 text-deepNavy' />
            </div>
            <div>
              <h3 className='font-bold text-white'>FRONTDESK AGENTS</h3>
              <p className='text-xs text-silver'>World's Most Advanced AI Receptionist</p>
            </div>
          </div>
          
          <div className='flex items-center gap-6 text-sm text-silver'>
            <span>© 2026 All Rights Reserved</span>
            <div className='flex items-center gap-2'>
              <motion.span 
                className='w-2 h-2 rounded-full bg-green-400'
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}