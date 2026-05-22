'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, BarChart3, Users, MessageSquare, Settings, ChevronLeft,
  Activity, Phone, Shield, Zap, Globe, Key, Database, Server,
  Eye, EyeOff, Plus, Minus, Play, Pause, RefreshCw, CheckCircle2,
  AlertCircle, Clock, TrendingUp, TrendingDown, DollarSign, PhoneCall,
  Send, MessageCircle, Mail, Globe2, Star, ArrowUpRight, ArrowDownRight,
  Cpu, HardDrive, Wifi, ShieldAlert, UserCheck, UserX, FileText,
  Briefcase, Building2, Calendar, Monitor, Bell, Menu, X, Loader2
} from 'lucide-react'
import { clsx } from 'clsx'

// BUFFY & HERMES AI Brain Import
import {
  buffyHermesEngine,
  autonomousDecisionEngine,
  selfLearningEngine
} from '@/lib/ai-brain'

// ==========================================
// 8K OFFICE ENVIRONMENT - OWNER COMMAND CENTER
// FRONTDESK AGENTS Native System 100%
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
  commandCenter: 'https://images.unsplash.com/photo-1605382758033-2d8091d2b0b3?w=3840&q=98',
  glassOffice: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=3840&q=98',
}

// Real Professional Human Images for AI Agents & Team
const humanAvatars = {
  buffy: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=95',
  hermes: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=95',
  ceo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=95',
  cto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=95',
  manager: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=95',
  analyst: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=95',
}

// ==========================================
// TYPES
// ==========================================

interface Agent {
  id: string
  name: string
  type: string
  status: 'online' | 'busy' | 'offline'
  avatar: string
  role: string
  conversations: number
  avgResponseTime: string
  satisfaction: number
  color: string
}

interface ActivityItem {
  id: string
  type: string
  message: string
  time: string
  status: 'success' | 'warning' | 'error' | 'info'
}

interface MetricCard {
  title: string
  value: string | number
  change: number
  icon: any
  color: string
  trend: 'up' | 'down' | 'neutral'
}

// ==========================================
// MOCK DATA - Realistic Office Environment
// ==========================================

const platformMetrics = {
  totalCalls: 24847,
  activeUsers: 1842,
  aiAccuracy: 99.7,
  revenue: 89420,
  callsToday: 847,
  avgWaitTime: '0.8s',
  satisfactionScore: 4.9,
  activeAgents: 6
}

const systemHealth = {
  twilio: { status: 'operational', latency: '45ms', callsToday: 1247 },
  blandai: { status: 'operational', latency: '120ms', callsToday: 892 },
  database: { status: 'healthy', connections: 847, queries: 24847 },
  api: { status: 'operational', uptime: 99.99, errors: 0.01 }
}

const agents: Agent[] = [
  { id: 'buffy', name: 'BUFFY', type: 'buffy', status: 'online', avatar: humanAvatars.buffy, role: 'Chief Strategic Intelligence', conversations: 8947, avgResponseTime: '0.8ms', satisfaction: 99.8, color: colors.cyan },
  { id: 'hermes', name: 'HERMES', type: 'hermes', status: 'online', avatar: humanAvatars.hermes, role: 'Chief Operations Executor', conversations: 7842, avgResponseTime: '0.3ms', satisfaction: 99.9, color: colors.gold },
  { id: 'aria', name: 'ARIA', type: 'reception', status: 'busy', avatar: humanAvatars.manager, role: 'Chief Reception Officer', conversations: 4521, avgResponseTime: '< 1s', satisfaction: 98.7, color: colors.green },
  { id: 'chronos', name: 'CHRONOS', type: 'scheduling', status: 'online', avatar: humanAvatars.ceo, role: 'Scheduling Specialist', conversations: 2341, avgResponseTime: '< 2s', satisfaction: 97.5, color: colors.purple },
  { id: 'nova', name: 'NOVA', type: 'information', status: 'online', avatar: humanAvatars.analyst, role: 'Information Analyst', conversations: 1892, avgResponseTime: '< 1s', satisfaction: 98.2, color: colors.orange },
  { id: 'atlas', name: 'ATLAS', type: 'escalation', status: 'online', avatar: humanAvatars.cto, role: 'Escalation Manager', conversations: 304, avgResponseTime: '< 3s', satisfaction: 99.1, color: colors.rose },
]

const recentActivity: ActivityItem[] = [
  { id: '1', type: 'call', message: 'BUFFY processed complex scheduling request', time: '2 min ago', status: 'success' },
  { id: '2', type: 'ai', message: 'HERMES executed 847 message deliveries', time: '5 min ago', status: 'success' },
  { id: '3', type: 'user', message: 'New enterprise customer onboarded', time: '12 min ago', status: 'info' },
  { id: '4', type: 'system', message: 'Twilio integration health check passed', time: '15 min ago', status: 'success' },
  { id: '5', type: 'alert', message: 'High volume detected - auto-scaling active', time: '18 min ago', status: 'warning' },
  { id: '6', type: 'call', message: 'Bland.ai AI call completed successfully', time: '22 min ago', status: 'success' },
]

const envTemplate: Record<string, { value: string; description: string; category: string; secret?: boolean }> = {
  TWILIO_ACCOUNT_SID: { value: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Twilio Account SID', category: 'Communication', secret: true },
  TWILIO_AUTH_TOKEN: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Twilio Auth Token', category: 'Communication', secret: true },
  TWILIO_PHONE_NUMBER: { value: '+1234567890', description: 'Twilio Phone Number', category: 'Communication' },
  BLAND_API_KEY: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Bland.ai API Key', category: 'Communication', secret: true },
  OPENAI_API_KEY: { value: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx', description: 'OpenAI API Key', category: 'AI', secret: true },
  DATABASE_URL: { value: 'postgresql://localhost:5432/frontdesk', description: 'Database Connection URL', category: 'Database', secret: true },
  ENCRYPTION_KEY: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Data Encryption Key', category: 'Security', secret: true },
  SESSION_SECRET: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Session Secret Key', category: 'Security', secret: true },
  REDIS_URL: { value: 'redis://localhost:6379', description: 'Redis Cache URL', category: 'Cache' },
  AWS_ACCESS_KEY: { value: 'AKIAXXXXXXXXXXXXXXXX', description: 'AWS Access Key', category: 'Infrastructure', secret: true },
  AWS_SECRET_KEY: { value: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'AWS Secret Key', category: 'Infrastructure', secret: true },
  SENTRY_DSN: { value: 'https://xxxxx@sentry.io/xxxxx', description: 'Sentry DSN for Error Tracking', category: 'Monitoring' },
}

// ==========================================
// COMPONENTS
// ==========================================

// Office Environment Background
const OfficeBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <div className='absolute inset-0 z-0 overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-deepNavy via-midnightBlue to-slate' />
      
      <motion.div
        className='absolute inset-0 opacity-25'
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', stiffness: 30, damping: 20 }}
      >
        <img
          src={officeBackgrounds.commandCenter}
          alt='Command Center'
          className={clsx(
            'w-full h-full object-cover transition-opacity duration-1000',
            loaded ? 'opacity-25' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
      
      <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5' />
      <div className='absolute inset-0 bg-gradient-to-t from-deepNavy via-transparent to-transparent' />
      <div className='absolute inset-0' style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,8,16,0.5) 100%)'
      }} />
    </div>
  )
}

// Ambient Particles
const AmbientParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? colors.gold : colors.cyan
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
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`
          }}
          animate={{
            y: [-15, -150],
            opacity: [0, 0.4, 0],
            scale: [1, 1.2, 0.8]
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

// Premium Metric Card
const MetricCard = ({ metric, delay = 0 }: { metric: MetricCard; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className='relative group'
  >
    <div className='absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold/20 via-cyan/20 to-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm' />
    
    <div className='relative bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl rounded-2xl border border-white/10 p-5 overflow-hidden'>
      <div className='absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10' style={{ background: `radial-gradient(circle, ${metric.color}, transparent)` }} />
      
      <div className='flex items-start justify-between mb-3'>
        <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ background: `${metric.color}20` }}>
          <metric.icon className='w-6 h-6' style={{ color: metric.color }} />
        </div>
        <div className={clsx(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
          metric.trend === 'up' ? 'bg-green-500/20 text-green-400' :
          metric.trend === 'down' ? 'bg-red-500/20 text-red-400' :
          'bg-white/10 text-white/60'
        )}>
          {metric.trend === 'up' ? <ArrowUpRight className='w-3 h-3' /> :
           metric.trend === 'down' ? <ArrowDownRight className='w-3 h-3' /> : null}
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </div>
      </div>
      
      <p className='text-3xl font-bold text-white mb-1'>{metric.value}</p>
      <p className='text-sm text-silver'>{metric.title}</p>
    </div>
  </motion.div>
)

// Glass Card
const GlassCard = ({ children, className, title, icon: Icon, glowColor = colors.gold, delay = 0 }: { children: React.ReactNode; className?: string; title?: string; icon?: any; glowColor?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={clsx('relative group', className)}
  >
    <div className='absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold/10 via-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
    
    <div className='relative bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'>
      {title && (
        <div className='flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent'>
          {Icon && <Icon className='w-5 h-5' style={{ color: glowColor }} />}
          <h3 className='text-lg font-bold text-white'>{title}</h3>
        </div>
      )}
      <div className='p-6'>{children}</div>
    </div>
  </motion.div>
)

// Agent Avatar Card
const AgentCard = ({ agent, delay = 0 }: { agent: Agent; delay?: number }) => {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className='relative'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className='absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500' style={{
        background: `linear-gradient(135deg, ${agent.color}30, transparent, ${agent.color}30)`,
        filter: 'blur(8px)'
      }} />
      
      <div className='relative bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl rounded-2xl border border-white/10 p-5 overflow-hidden'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='relative'>
            <div className='w-16 h-16 rounded-full overflow-hidden border-2 shadow-lg' style={{ borderColor: `${agent.color}50` }}>
              {!loaded && <div className='w-full h-full bg-slate animate-pulse' />}
              {!imgError ? (
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className={clsx('w-full h-full object-cover transition-all duration-500', hovered && 'scale-110', loaded ? 'opacity-100' : 'opacity-0')}
                  onLoad={() => setLoaded(true)}
                  onError={() => setImgError(true)}
                  style={{ filter: 'contrast(1.05) saturate(1.1)' }}
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-slate to-midnightBlue flex items-center justify-center'>
                  <Bot className='w-8 h-8 text-gold' />
                </div>
              )}
            </div>
            <motion.div
              className={clsx(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate',
                agent.status === 'online' ? 'bg-green-400' :
                agent.status === 'busy' ? 'bg-amber-400' : 'bg-slate-400'
              )}
              animate={agent.status === 'online' ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div className='flex-1'>
            <h4 className='text-lg font-bold text-white' style={{ textShadow: `0 0 20px ${agent.color}40` }}>{agent.name}</h4>
            <p className='text-xs text-silver'>{agent.role}</p>
            <span className={clsx(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1',
              agent.status === 'online' ? 'bg-green-500/20 text-green-400' :
              agent.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-500/20 text-slate-400'
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', agent.status === 'online' ? 'bg-green-400' : agent.status === 'busy' ? 'bg-amber-400' : 'bg-slate-400')} />
              {agent.status}
            </span>
          </div>
        </div>
        
        <div className='grid grid-cols-3 gap-3 text-center'>
          <div className='p-2 rounded-xl bg-white/5'>
            <p className='text-lg font-bold text-white'>{agent.conversations.toLocaleString()}</p>
            <p className='text-xs text-silver'>Chats</p>
          </div>
          <div className='p-2 rounded-xl bg-white/5'>
            <p className='text-lg font-bold text-white'>{agent.avgResponseTime}</p>
            <p className='text-xs text-silver'>Response</p>
          </div>
          <div className='p-2 rounded-xl bg-white/5'>
            <p className='text-lg font-bold' style={{ color: agent.color }}>{agent.satisfaction}%</p>
            <p className='text-xs text-silver'>Satisfaction</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function OwnerDashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [envVars, setEnvVars] = useState(envTemplate)
  const [showEnvValues, setShowEnvValues] = useState<Record<string, boolean>>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const metrics: MetricCard[] = [
    { title: 'Total Calls', value: platformMetrics.totalCalls.toLocaleString(), change: 12.5, icon: PhoneCall, color: colors.cyan, trend: 'up' },
    { title: 'Active Users', value: platformMetrics.activeUsers.toLocaleString(), change: 8.2, icon: Users, color: colors.gold, trend: 'up' },
    { title: 'AI Accuracy', value: `${platformMetrics.aiAccuracy}%`, change: 0.3, icon: Bot, color: colors.green, trend: 'up' },
    { title: 'Revenue (MRR)', value: `$${platformMetrics.revenue.toLocaleString()}`, change: 15.7, icon: DollarSign, color: colors.purple, trend: 'up' },
    { title: 'Calls Today', value: platformMetrics.callsToday.toLocaleString(), change: 23.1, icon: Activity, color: colors.orange, trend: 'up' },
    { title: 'Avg Wait Time', value: platformMetrics.avgWaitTime, change: -15.2, icon: Clock, color: colors.rose, trend: 'up' },
  ]
  
  const handleEnvUpdate = useCallback((key: string, value: string) => {
    setEnvVars(prev => {
      const newEnvVars = { ...prev } as typeof prev;
      if (newEnvVars[key as keyof typeof prev]) {
        (newEnvVars[key as keyof typeof prev] as any).value = value;
      }
      return newEnvVars;
    })
  }, [])
  
  const toggleEnvVisibility = (key: string) => {
    setShowEnvValues(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'env', label: 'Environment', icon: Key },
  ]
  
  return (
    <div className='min-h-screen bg-deepNavy text-white relative overflow-hidden'>
      <OfficeBackground />
      <AmbientParticles />
      
      {/* Header - Native Branding */}
      <motion.header
        className='fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4'
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className='max-w-[95vw] mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <motion.div
              className='flex items-center gap-3 cursor-pointer'
              whileHover={{ scale: 1.02 }}
            >
              <div
                className='w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-goldDark flex items-center justify-center shadow-lg'
                style={{ boxShadow: `0 8px 32px ${colors.gold}40` }}
              >
                <Bot className='w-6 h-6 text-deepNavy' />
              </div>
              <div>
                <h1 className='text-xl font-bold tracking-wide text-white'>FRONTDESK</h1>
                <p className='text-xs font-bold tracking-[0.3em] text-gold'>OWNER PORTAL</p>
              </div>
            </motion.div>
            
            <div className='hidden md:flex items-center gap-2 ml-8'>
              {sections.slice(0, 5).map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm',
                    activeSection === section.id
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <section.icon className='w-4 h-4' />
                  {section.label}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <motion.div
              className='hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30'
              animate={{ opacity: [0.8, 1, 0.8] }}
            >
              <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
              <span className='text-sm text-green-400 font-medium'>System Operational</span>
            </motion.div>
            
            <motion.button
              className='p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className='w-6 h-6 text-white' />
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className='fixed top-0 right-0 bottom-0 w-80 z-[60] bg-slate/95 backdrop-blur-xl border-l border-white/10 p-6 pt-24 overflow-y-auto'
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className='absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10'
            >
              <X className='w-6 h-6 text-white' />
            </button>
            
            <div className='space-y-2'>
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setMobileMenuOpen(false) }}
                  className={clsx(
                    'w-full px-4 py-3 rounded-xl text-left font-medium transition-all flex items-center gap-3',
                    activeSection === section.id
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <section.icon className='w-5 h-5' />
                  {section.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className='relative pt-24 px-4 md:px-6 pb-12'>
        <div className='max-w-[95vw] mx-auto'>
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-2'>Command Center</h2>
                <p className='text-silver'>Full platform control with real-time monitoring - FRONTDESK AGENTS Native System 100%</p>
              </div>
              
              {/* Metrics Grid */}
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
                {metrics.map((metric, i) => (
                  <MetricCard key={i} metric={metric} delay={i * 0.1} />
                ))}
              </div>
              
              {/* Main Content Grid */}
              <div className='grid lg:grid-cols-3 gap-6'>
                {/* System Health */}
                <GlassCard title='System Health' icon={Shield} className='lg:col-span-2' glowColor={colors.green}>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {[
                      { name: 'Twilio', ...systemHealth.twilio, icon: Phone },
                      { name: 'Bland.ai', ...systemHealth.blandai, icon: Bot },
                      { name: 'Database', ...systemHealth.database, icon: Database },
                      { name: 'API', ...systemHealth.api, icon: Server },
                    ].map((sys, i) => (
                      <div key={i} className='p-4 rounded-xl bg-white/5 border border-white/10'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center gap-2'>
                            <sys.icon className='w-5 h-5' style={{ color: sys.status === 'operational' ? colors.green : colors.red }} />
                            <span className='font-semibold text-white'>{sys.name}</span>
                          </div>
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            sys.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                            sys.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          )}>
                            {sys.status}
                          </span>
                        </div>
                        <p className='text-xs text-silver'>Latency: {(sys as any).latency || (sys as any).uptime || 'N/A'}</p>
                        <p className='text-xs text-silver'>Calls: {(sys as any).callsToday?.toLocaleString() || (sys as any).connections || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
                
                {/* Recent Activity */}
                <GlassCard title='Recent Activity' icon={Activity} glowColor={colors.cyan}>
                  <div className='space-y-3 max-h-80 overflow-y-auto scrollbar-thin'>
                    {recentActivity.map((item) => (
                      <div key={item.id} className='flex items-start gap-3 p-3 rounded-xl bg-white/5'>
                        <div className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          item.status === 'success' ? 'bg-green-500/20' :
                          item.status === 'warning' ? 'bg-amber-500/20' :
                          item.status === 'error' ? 'bg-red-500/20' :
                          'bg-cyan-500/20'
                        )}>
                          {item.status === 'success' ? <CheckCircle2 className='w-4 h-4 text-green-400' /> :
                           item.status === 'warning' ? <AlertCircle className='w-4 h-4 text-amber-400' /> :
                           item.status === 'error' ? <AlertCircle className='w-4 h-4 text-red-400' /> :
                           <Activity className='w-4 h-4 text-cyan-400' />}
                        </div>
                        <div className='flex-1'>
                          <p className='text-sm text-white'>{item.message}</p>
                          <p className='text-xs text-silver mt-1'>{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
              
              {/* AI Agents Overview */}
              <GlassCard title='AI Agent Fleet' icon={Bot} className='mt-6' glowColor={colors.gold}>
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {agents.map((agent, i) => (
                    <AgentCard key={agent.id} agent={agent} delay={i * 0.1} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Agents Section */}
          {activeSection === 'agents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-white mb-2'>AI Agent Fleet</h2>
                  <p className='text-silver'>Manage and monitor all AI agents - BUFFY & HERMES System</p>
                </div>
                <motion.button
                  className='px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-semibold flex items-center gap-2'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className='w-5 h-5' />
                  Add Agent
                </motion.button>
              </div>
              
              <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {agents.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} delay={i * 0.1} />
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Communications Section */}
          {activeSection === 'communications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Communication Department</h2>
                <p className='text-silver'>Twilio & Bland.ai Integration Hub - Secret Sauce Active</p>
              </div>
              
              <div className='grid md:grid-cols-2 gap-6'>
                {/* Twilio */}
                <GlassCard title='Twilio Integration' icon={Phone} glowColor={colors.cyan}>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center'>
                          <Phone className='w-6 h-6 text-cyan-400' />
                        </div>
                        <div>
                          <p className='font-semibold text-white'>Voice & SMS</p>
                          <p className='text-sm text-silver'>1,247 calls today</p>
                        </div>
                      </div>
                      <span className='px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium'>Active</span>
                    </div>
                    
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='p-4 rounded-xl bg-white/5 text-center'>
                        <p className='text-2xl font-bold text-cyan-400'>1,247</p>
                        <p className='text-sm text-silver'>Voice Calls</p>
                      </div>
                      <div className='p-4 rounded-xl bg-white/5 text-center'>
                        <p className='text-2xl font-bold text-cyan-400'>3,842</p>
                        <p className='text-sm text-silver'>SMS Messages</p>
                      </div>
                    </div>
                    
                    <div className='p-4 rounded-xl bg-white/5'>
                      <p className='text-sm text-silver mb-2'>Configuration</p>
                      <p className='text-xs text-white/50'>TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER</p>
                    </div>
                  </div>
                </GlassCard>
                
                {/* Bland.ai */}
                <GlassCard title='Bland.ai AI Calls' icon={Bot} glowColor={colors.gold}>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center'>
                          <Bot className='w-6 h-6 text-gold' />
                        </div>
                        <div>
                          <p className='font-semibold text-white'>AI-Powered Calls</p>
                          <p className='text-sm text-silver'>892 calls today</p>
                        </div>
                      </div>
                      <span className='px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium'>Active</span>
                    </div>
                    
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='p-4 rounded-xl bg-white/5 text-center'>
                        <p className='text-2xl font-bold text-gold'>892</p>
                        <p className='text-sm text-silver'>AI Calls</p>
                      </div>
                      <div className='p-4 rounded-xl bg-white/5 text-center'>
                        <p className='text-2xl font-bold text-gold'>99.2%</p>
                        <p className='text-sm text-silver'>Success Rate</p>
                      </div>
                    </div>
                    
                    <div className='p-4 rounded-xl bg-white/5'>
                      <p className='text-sm text-silver mb-2'>API Key</p>
                      <p className='text-xs text-white/50'>BLAND_API_KEY configured for AI outbound calls</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
          
          {/* Users Section */}
          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-white mb-2'>User Management</h2>
                  <p className='text-silver'>Customer accounts and access control</p>
                </div>
                <motion.button
                  className='px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-semibold flex items-center gap-2'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className='w-5 h-5' />
                  Add Customer
                </motion.button>
              </div>
              
              <GlassCard title='Customer Accounts' icon={Users} glowColor={colors.green}>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-white/10'>
                        <th className='text-left py-3 px-4 text-sm font-semibold text-silver'>Customer</th>
                        <th className='text-left py-3 px-4 text-sm font-semibold text-silver'>Plan</th>
                        <th className='text-left py-3 px-4 text-sm font-semibold text-silver'>Status</th>
                        <th className='text-left py-3 px-4 text-sm font-semibold text-silver'>Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Acme Corporation', plan: 'Enterprise', status: 'active', usage: '87%' },
                        { name: 'TechStart Inc', plan: 'Professional', status: 'active', usage: '45%' },
                        { name: 'Global Services LLC', plan: 'Enterprise', status: 'active', usage: '92%' },
                        { name: 'Innovate Co', plan: 'Starter', status: 'trial', usage: '23%' },
                      ].map((user, i) => (
                        <tr key={i} className='border-b border-white/5 hover:bg-white/5 transition-colors'>
                          <td className='py-4 px-4'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gold to-goldDark flex items-center justify-center'>
                                <Building2 className='w-5 h-5 text-deepNavy' />
                              </div>
                              <span className='font-medium text-white'>{user.name}</span>
                            </div>
                          </td>
                          <td className='py-4 px-4'>
                            <span className={clsx(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              user.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                              user.plan === 'Professional' ? 'bg-cyan-500/20 text-cyan-400' :
                              'bg-slate-500/20 text-slate-400'
                            )}>
                              {user.plan}
                            </span>
                          </td>
                          <td className='py-4 px-4'>
                            <span className={clsx(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            )}>
                              {user.status}
                            </span>
                          </td>
                          <td className='py-4 px-4'>
                            <div className='flex items-center gap-2'>
                              <div className='w-24 h-2 rounded-full bg-white/10 overflow-hidden'>
                                <div className='h-full rounded-full bg-gradient-to-r from-cyan-500 to-gold' style={{ width: user.usage }} />
                              </div>
                              <span className='text-sm text-silver'>{user.usage}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Platform Analytics</h2>
                <p className='text-silver'>Real-time metrics and performance insights</p>
              </div>
              
              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                {metrics.slice(0, 4).map((metric, i) => (
                  <MetricCard key={i} metric={metric} delay={i * 0.1} />
                ))}
              </div>
              
              <GlassCard title='Performance Trends' icon={TrendingUp} glowColor={colors.cyan}>
                <div className='h-64 flex items-center justify-center bg-white/5 rounded-xl'>
                  <div className='text-center'>
                    <BarChart3 className='w-16 h-16 text-white/20 mx-auto mb-4' />
                    <p className='text-white/40'>Advanced analytics dashboard</p>
                    <p className='text-xs text-white/30 mt-2'>Charts and graphs rendering</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Integrations Hub</h2>
                <p className='text-silver'>Third-party services and API connections - Secret Sauce Ready</p>
              </div>
              
              <div className='grid md:grid-cols-3 gap-6'>
                {[
                  { name: 'Twilio', desc: 'Voice & SMS Communications', icon: Phone, status: 'connected', color: colors.cyan },
                  { name: 'Bland.ai', desc: 'AI-Powered Outbound Calls', icon: Bot, status: 'connected', color: colors.gold },
                  { name: 'OpenAI', desc: 'GPT Language Processing', icon: Cpu, status: 'connected', color: colors.green },
                  { name: 'AWS', desc: 'Cloud Infrastructure', icon: Server, status: 'connected', color: colors.orange },
                  { name: 'PostgreSQL', desc: 'Database Storage', icon: Database, status: 'connected', color: colors.purple },
                  { name: 'Redis', desc: 'Cache & Sessions', icon: HardDrive, status: 'connected', color: colors.rose },
                ].map((integration, i) => (
                  <GlassCard key={i} delay={i * 0.1} glowColor={integration.color}>
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='w-14 h-14 rounded-xl flex items-center justify-center' style={{ background: `${integration.color}20` }}>
                        <integration.icon className='w-7 h-7' style={{ color: integration.color }} />
                      </div>
                      <div>
                        <h4 className='text-lg font-bold text-white'>{integration.name}</h4>
                        <span className='px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium'>
                          {integration.status}
                        </span>
                      </div>
                    </div>
                    <p className='text-sm text-silver mb-4'>{integration.desc}</p>
                    <motion.button
                      className='w-full py-2 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Configure
                    </motion.button>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Settings Section */}
          {activeSection === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Platform Settings</h2>
                <p className='text-silver'>System configuration and preferences</p>
              </div>
              
              <GlassCard title='General Settings' icon={Settings} glowColor={colors.gold}>
                <div className='space-y-4'>
                  {[
                    { label: 'Platform Name', value: 'FRONTDESK AGENTS' },
                    { label: 'Version', value: '2.0.0' },
                    { label: 'Region', value: 'US East (N. Virginia)' },
                    { label: 'Timezone', value: 'America/New_York (EST)' },
                  ].map((setting, i) => (
                    <div key={i} className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                      <span className='text-white/70'>{setting.label}</span>
                      <span className='font-semibold text-white'>{setting.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Environment Section - Secret Sauce */}
          {activeSection === 'env' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-white mb-2'>Environment Variables</h2>
                  <p className='text-silver'>Secret Sauce Configuration - Handle with Care 🔐</p>
                </div>
                <motion.button
                  className='px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold flex items-center gap-2'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className='w-5 h-5' />
                  Save Changes
                </motion.button>
              </div>
              
              <GlassCard title='API Keys & Secrets' icon={Key} glowColor={colors.red}>
                <div className='space-y-3'>
                  {Object.entries(envVars).map(([key, config]) => (
                    <div key={key} className='p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-3'>
                          <span className='px-2 py-1 rounded-lg bg-white/10 text-xs font-mono text-gold'>{key}</span>
                          <span className='px-2 py-1 rounded-full bg-white/5 text-xs text-silver'>{config.category}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          {config.secret && (
                            <span className='px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium'>Secret</span>
                          )}
                          <motion.button
                            onClick={() => toggleEnvVisibility(key)}
                            className='p-2 rounded-lg hover:bg-white/10 transition-colors'
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showEnvValues[key] ? <EyeOff className='w-4 h-4 text-white/50' /> : <Eye className='w-4 h-4 text-white/50' />}
                          </motion.button>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <input
                          type={showEnvValues[key] ? 'text' : 'password'}
                          value={config.value}
                          onChange={(e) => handleEnvUpdate(key, e.target.value)}
                          className='flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 font-mono text-sm focus:outline-none focus:border-gold/50'
                        />
                      </div>
                      <p className='text-xs text-silver mt-2'>{config.description}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className='relative py-6 px-4 md:px-6 border-t border-white/10 mt-12'>
        <div className='max-w-[95vw] mx-auto flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}>
              <Bot className='w-4 h-4 text-deepNavy' />
            </div>
            <span className='text-sm text-silver'>FRONTDESK AGENTS Owner Portal © 2026</span>
          </div>
          
          <div className='flex items-center gap-4 text-xs text-silver'>
            <span>Native System 100%</span>
            <span className='flex items-center gap-1'>
              <div className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

