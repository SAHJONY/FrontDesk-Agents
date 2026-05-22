'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, DollarSign, Users, PhoneCall, MessageSquare, Mail,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, Star, CheckCircle2, AlertCircle, BarChart3,
  Settings, Bell, ChevronLeft, ChevronRight, Eye, EyeOff,
  Play, Pause, RefreshCw, Plus, Minus, X, Menu, Globe, Shield,
  Video, FileText, Send, MessageCircle, Phone, User, Building2,
  Briefcase, CreditCard, Receipt, PiggyBank, Wallet, Landmark,
  ArrowRight, ArrowUp, ArrowDown, Minus as MinusIcon, Plus as PlusIcon,
  PieChart, Target
} from 'lucide-react'
import { clsx } from 'clsx'

// ==========================================
// 8K OFFICE ENVIRONMENT - CUSTOMER PORTAL
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
  businessOffice: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=3840&q=98',
  meetingRoom: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=3840&q=98',
  corporateLounge: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=3840&q=98',
  executiveOffice: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3840&q=98',
  modernWorkspace: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=3840&q=98',
}

// Real Professional Human Images
const humanAvatars = {
  ceo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=95',
  manager: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=95',
  analyst: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=95',
  receptionist: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=95',
  buffy: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=95',
  hermes: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=95',
}

// ==========================================
// MOCK DATA - Real Business Financials
// ==========================================

const businessData = {
  businessName: 'Acme Corporation',
  industry: 'Technology Solutions',
  plan: 'Enterprise',
  totalRevenue: 487520,
  monthlyRevenue: 42350,
  callsThisMonth: 1247,
  leadsGenerated: 89,
  conversionRate: 23.5,
  avgCallDuration: '4m 32s',
  satisfactionScore: 4.8,
  aiAgentsActive: 4,
}

const financialMetrics = [
  { id: 'revenue', label: 'Total Revenue', value: 487520, change: 18.5, trend: 'up', period: 'All Time', icon: DollarSign, color: colors.green },
  { id: 'monthly', label: 'Monthly Revenue', value: 42350, change: 12.3, trend: 'up', period: 'This Month', icon: Landmark, color: colors.gold },
  { id: 'calls', label: 'Call Revenue', value: 18740, change: 8.7, trend: 'up', period: 'This Month', icon: PhoneCall, color: colors.cyan },
  { id: 'leads', label: 'Lead Value', value: 23610, change: 22.1, trend: 'up', period: 'This Month', icon: Users, color: colors.purple },
]

const revenueBreakdown = [
  { category: 'AI Call Handling', amount: 18740, percentage: 44, color: colors.cyan },
  { category: 'SMS Communications', amount: 8920, percentage: 21, color: colors.gold },
  { category: 'Appointment Booking', amount: 7430, percentage: 18, color: colors.green },
  { category: 'Lead Capture', amount: 5120, percentage: 12, color: colors.purple },
  { category: 'Customer Support', amount: 2140, percentage: 5, color: colors.orange },
]

const callHistory = [
  { id: '1', caller: '+1 (555) 123-4567', type: 'inbound', duration: '5m 23s', status: 'completed', time: '2 min ago', outcome: 'Appointment Scheduled', revenue: 150 },
  { id: '2', caller: '+1 (555) 987-6543', type: 'outbound', duration: '3m 45s', status: 'completed', time: '15 min ago', outcome: 'Lead Qualified', revenue: 85 },
  { id: '3', caller: '+1 (555) 246-8135', type: 'inbound', duration: '2m 10s', status: 'completed', time: '32 min ago', outcome: 'Information Provided', revenue: 0 },
  { id: '4', caller: '+1 (555) 369-2580', type: 'ai', duration: '4m 55s', status: 'completed', time: '1 hour ago', outcome: 'Sale Closed', revenue: 350 },
  { id: '5', caller: '+1 (555) 741-8520', type: 'inbound', duration: '6m 12s', status: 'completed', time: '2 hours ago', outcome: 'Appointment Scheduled', revenue: 150 },
]

const aiAgents = [
  { id: 'aria', name: 'ARIA', role: 'Reception', status: 'online', avatar: humanAvatars.receptionist, callsToday: 234, revenue: 8920, color: colors.gold },
  { id: 'buffy', name: 'BUFFY', role: 'Intelligence', status: 'online', avatar: humanAvatars.buffy, callsToday: 567, revenue: 12450, color: colors.cyan },
  { id: 'hermes', name: 'HERMES', role: 'Operations', status: 'busy', avatar: humanAvatars.hermes, callsToday: 445, revenue: 9840, color: colors.gold },
  { id: 'nova', name: 'NOVA', role: 'Information', status: 'online', avatar: humanAvatars.analyst, callsToday: 189, revenue: 3420, color: colors.green },
]

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
        x: (e.clientX / window.innerWidth - 0.5) * 8,
        y: (e.clientY / window.innerHeight - 0.5) * 8
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <div className='absolute inset-0 z-0 overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-deepNavy via-midnightBlue to-slate' />
      
      <motion.div
        className='absolute inset-0 opacity-20'
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', stiffness: 30, damping: 20 }}
      >
        <img
          src={officeBackgrounds.businessOffice}
          alt='Business Office'
          className={clsx(
            'w-full h-full object-cover transition-opacity duration-1000',
            loaded ? 'opacity-20' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
      
      <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5' />
      <div className='absolute inset-0 bg-gradient-to-t from-deepNavy via-transparent to-transparent' />
      <div className='absolute inset-0' style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,8,16,0.4) 100%)'
      }} />
    </div>
  )
}

// Ambient Particles
const AmbientParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 18 + 8,
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
            y: [-10, -120],
            opacity: [0, 0.3, 0],
            scale: [1, 1.1, 0.8]
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

// Premium Financial Card
const FinancialCard = ({ metric, delay = 0 }: { metric: typeof financialMetrics[0]; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className='relative group'
  >
    <div className='absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-500/20 via-gold/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm' />
    
    <div className='relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 overflow-hidden'>
      <div className='absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10' style={{ background: `radial-gradient(circle, ${metric.color}, transparent)` }} />
      
      <div className='flex items-start justify-between mb-3'>
        <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ background: `${metric.color}20` }}>
          <metric.icon className='w-6 h-6' style={{ color: metric.color }} />
        </div>
        <div className={clsx(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
          metric.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        )}>
          {metric.trend === 'up' ? <ArrowUpRight className='w-3 h-3' /> : <ArrowDownRight className='w-3 h-3' />}
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </div>
      </div>
      
      <p className='text-3xl font-bold text-white mb-1'>
        {typeof metric.value === 'number' && metric.id !== 'calls' && metric.id !== 'leads' 
          ? `$${metric.value.toLocaleString()}`
          : metric.value.toLocaleString()}
      </p>
      <p className='text-sm text-silver mb-1'>{metric.label}</p>
      <p className='text-xs text-white/40'>{metric.period}</p>
    </div>
  </motion.div>
)

// Glass Card
const GlassCard = ({ children, className, title, icon: Icon, glowColor = colors.gold }: { children: React.ReactNode; className?: string; title?: string; icon?: any; glowColor?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={clsx('relative group', className)}
  >
    <div className='absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
    
    <div className='relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'>
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

// Revenue Bar
const RevenueBar = ({ item, delay = 0 }: { item: typeof revenueBreakdown[0]; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
  >
    <div className='w-3 h-3 rounded-full' style={{ background: item.color }} />
    <div className='flex-1'>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium text-white'>{item.category}</span>
        <span className='text-sm font-bold' style={{ color: item.color }}>${item.amount.toLocaleString()}</span>
      </div>
      <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
        <motion.div
          className='h-full rounded-full'
          style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}80)` }}
          initial={{ width: 0 }}
          animate={{ width: `${item.percentage}%` }}
          transition={{ duration: 1, delay }}
        />
      </div>
    </div>
    <span className='text-xs text-silver w-12 text-right'>{item.percentage}%</span>
  </motion.div>
)

// Call History Item
const CallHistoryItem = ({ call, delay = 0 }: { call: typeof callHistory[0]; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
  >
    <div className={clsx(
      'w-12 h-12 rounded-xl flex items-center justify-center',
      call.type === 'inbound' ? 'bg-cyan-500/20' :
      call.type === 'outbound' ? 'bg-gold/20' : 'bg-green-500/20'
    )}>
      {call.type === 'inbound' ? <PhoneCall className='w-5 h-5 text-cyan-400' /> :
       call.type === 'outbound' ? <Send className='w-5 h-5 text-gold' /> :
       <Bot className='w-5 h-5 text-green-400' />}
    </div>
    
    <div className='flex-1 min-w-0'>
      <p className='text-sm font-medium text-white truncate'>{call.caller}</p>
      <p className='text-xs text-silver'>{call.outcome} • {call.duration}</p>
    </div>
    
    <div className='text-right'>
      <p className='text-sm font-bold text-white'>${call.revenue}</p>
      <p className='text-xs text-silver'>{call.time}</p>
    </div>
    
    <div className={clsx(
      'px-2 py-1 rounded-full text-xs font-medium',
      call.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
    )}>
      {call.status}
    </div>
  </motion.div>
)

// AI Agent Card
const AgentCard = ({ agent, delay = 0 }: { agent: typeof aiAgents[0]; delay?: number }) => {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
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
      
      <div className='relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 overflow-hidden'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='relative'>
            <div className='w-14 h-14 rounded-full overflow-hidden border-2' style={{ borderColor: `${agent.color}50` }}>
              <img
                src={agent.avatar}
                alt={agent.name}
                className={clsx('w-full h-full object-cover transition-all duration-500', hovered && 'scale-110', loaded ? 'opacity-100' : 'opacity-0')}
                onLoad={() => setLoaded(true)}
                style={{ filter: 'contrast(1.05) saturate(1.1)' }}
              />
              {!loaded && <div className='absolute inset-0 bg-slate animate-pulse' />}
            </div>
            <motion.div
              className={clsx(
                'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate',
                agent.status === 'online' ? 'bg-green-400' : 'bg-amber-400'
              )}
              animate={agent.status === 'online' ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div>
            <h4 className='text-lg font-bold text-white' style={{ textShadow: `0 0 20px ${agent.color}40` }}>{agent.name}</h4>
            <p className='text-xs text-silver'>{agent.role}</p>
          </div>
        </div>
        
        <div className='grid grid-cols-2 gap-3'>
          <div className='p-3 rounded-xl bg-white/5 text-center'>
            <p className='text-xl font-bold text-white'>{agent.callsToday}</p>
            <p className='text-xs text-silver'>Calls</p>
          </div>
          <div className='p-3 rounded-xl bg-white/5 text-center'>
            <p className='text-xl font-bold' style={{ color: agent.color }}>${agent.revenue.toLocaleString()}</p>
            <p className='text-xs text-silver'>Revenue</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function CustomerDashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showMoney, setShowMoney] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  
  const formatCurrency = (value: number) => {
    if (!showMoney) return '****'
    return `$${value.toLocaleString()}`
  }
  
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST' })
      window.location.href = '/customer/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/customer/login'
    }
  }, [])
  
  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'calls', label: 'Call History', icon: PhoneCall },
    { id: 'financial', label: 'Financials', icon: DollarSign },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
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
                <Building2 className='w-6 h-6 text-deepNavy' />
              </div>
              <div>
                <h1 className='text-lg font-bold tracking-wide text-white'>{businessData.businessName}</h1>
                <p className='text-xs font-bold tracking-[0.3em] text-gold'>{businessData.plan.toUpperCase()} PORTAL</p>
              </div>
            </motion.div>
            
            <div className='hidden md:flex items-center gap-2 ml-6'>
              {sections.slice(0, 4).map((section) => (
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
            <motion.button
              onClick={() => setShowMoney(!showMoney)}
              className='p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={showMoney ? 'Hide Financials' : 'Show Financials'}
            >
              {showMoney ? <Eye className='w-5 h-5 text-gold' /> : <EyeOff className='w-5 h-5 text-white/50' />}
            </motion.button>
            
            <motion.button
              onClick={handleLogout}
              onHoverStart={() => setLogoutHover(true)}
              onHoverEnd={() => setLogoutHover(false)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                logoutHover
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white/70 border border-transparent'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className={clsx('w-4 h-4 transition-transform', logoutHover && 'rotate-180')} />
              Logout
            </motion.button>
            
            <motion.button
              className='p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors md:hidden'
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
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-2'>Business Intelligence Hub</h2>
                <p className='text-silver'>Track your AI receptionist performance and revenue - FRONTDESK AGENTS Native System 100%</p>
              </div>
              
              {/* Financial Overview Cards */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                {financialMetrics.map((metric, i) => (
                  <FinancialCard key={metric.id} metric={metric} delay={i * 0.1} />
                ))}
              </div>
              
              {/* Main Grid */}
              <div className='grid lg:grid-cols-3 gap-6'>
                {/* Revenue Breakdown */}
                <GlassCard title='Revenue Breakdown' icon={PieChart} className='lg:col-span-2' glowColor={colors.green}>
                  <div className='space-y-3'>
                    {revenueBreakdown.map((item, i) => (
                      <RevenueBar key={i} item={item} delay={i * 0.15} />
                    ))}
                  </div>
                  
                  <div className='mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 via-gold/20 to-cyan-500/20 border border-white/10'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-silver'>Total Monthly Revenue</p>
                        <p className='text-3xl font-bold text-white'>{formatCurrency(businessData.monthlyRevenue)}</p>
                      </div>
                      <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20'>
                        <TrendingUp className='w-5 h-5 text-green-400' />
                        <span className='text-green-400 font-semibold'>+12.3%</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
                
                {/* Quick Stats */}
                <GlassCard title='Performance Metrics' icon={TrendingUp} glowColor={colors.cyan}>
                  <div className='space-y-4'>
                    {[
                      { label: 'Calls This Month', value: businessData.callsThisMonth.toLocaleString(), icon: PhoneCall, color: colors.cyan },
                      { label: 'Leads Generated', value: businessData.leadsGenerated.toString(), icon: Users, color: colors.purple },
                      { label: 'Conversion Rate', value: `${businessData.conversionRate}%`, icon: Target, color: colors.green },
                      { label: 'Avg Call Duration', value: businessData.avgCallDuration, icon: Clock, color: colors.gold },
                    ].map((stat, i) => (
                      <div key={i} className='flex items-center gap-4 p-3 rounded-xl bg-white/5'>
                        <div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{ background: `${stat.color}20` }}>
                          <stat.icon className='w-5 h-5' style={{ color: stat.color }} />
                        </div>
                        <div className='flex-1'>
                          <p className='text-xs text-silver'>{stat.label}</p>
                          <p className='text-lg font-bold text-white'>{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
              
              {/* AI Agents Overview */}
              <GlassCard title='Your AI Agent Fleet' icon={Bot} className='mt-6' glowColor={colors.gold}>
                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {aiAgents.map((agent, i) => (
                    <AgentCard key={agent.id} agent={agent} delay={i * 0.1} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Call History Section */}
          {activeSection === 'calls' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-white mb-2'>Call History & Revenue</h2>
                  <p className='text-silver'>Track every call and its financial impact</p>
                </div>
                <motion.button
                  className='px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold flex items-center gap-2'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PhoneCall className='w-5 h-5' />
                  Export Report
                </motion.button>
              </div>
              
              <GlassCard title='Recent Calls with Revenue' icon={PhoneCall} glowColor={colors.cyan}>
                <div className='space-y-3'>
                  {callHistory.map((call, i) => (
                    <CallHistoryItem key={call.id} call={call} delay={i * 0.1} />
                  ))}
                </div>
                
                <div className='mt-6 pt-6 border-t border-white/10'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-silver'>Total Call Revenue (All Time)</p>
                      <p className='text-3xl font-bold text-green-400'>{formatCurrency(18740)}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-silver'>Avg Revenue per Call</p>
                      <p className='text-xl font-bold text-white'>$15.03</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Financial Section */}
          {activeSection === 'financial' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Financial Dashboard</h2>
                <p className='text-silver'>Track your business revenue and ROI from AI receptionist services</p>
              </div>
              
              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                {financialMetrics.map((metric, i) => (
                  <FinancialCard key={metric.id} metric={metric} delay={i * 0.1} />
                ))}
              </div>
              
              <div className='grid lg:grid-cols-2 gap-6'>
                <GlassCard title='Revenue by Category' icon={PieChart} glowColor={colors.gold}>
                  <div className='space-y-4'>
                    {revenueBreakdown.map((item, i) => (
                      <div key={i} className='flex items-center gap-4'>
                        <div className='w-3 h-3 rounded-full' style={{ background: item.color }} />
                        <div className='flex-1'>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-sm text-white'>{item.category}</span>
                            <span className='text-sm font-bold text-white'>{formatCurrency(item.amount)}</span>
                          </div>
                          <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                            <div className='h-full rounded-full' style={{ width: `${item.percentage}%`, background: item.color }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
                
                <GlassCard title='ROI Summary' icon={TrendingUp} glowColor={colors.green}>
                  <div className='space-y-6'>
                    <div className='text-center p-6 rounded-xl bg-green-500/10 border border-green-500/20'>
                      <p className='text-sm text-silver mb-2'>Monthly Return on Investment</p>
                      <p className='text-5xl font-bold text-green-400'>247%</p>
                      <p className='text-xs text-green-400/70 mt-2'>Based on AI receptionist cost vs revenue generated</p>
                    </div>
                    
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='p-4 rounded-xl bg-white/5 text-center'>
                        <p className='text-2xl font-bold text-white'>{formatCurrency(42350)}</p>
                        <p className='text-xs text-silver'>Revenue Generated</p>
                      </div>
                      <div className='p-4 rounded-xl bg-white/5 text-center'>
                        <p className='text-2xl font-bold text-white'>$12,180</p>
                        <p className='text-xs text-silver'>Service Cost</p>
                      </div>
                    </div>
                    
                    <div className='p-4 rounded-xl bg-white/5'>
                      <p className='text-sm text-silver mb-2'>Net Profit This Month</p>
                      <p className='text-3xl font-bold text-green-400'>{formatCurrency(30170)}</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
          
          {/* AI Agents Section */}
          {activeSection === 'agents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Your AI Agent Fleet</h2>
                <p className='text-silver'>Monitor BUFFY & HERMES powered agents - Secret Sauce Active</p>
              </div>
              
              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {aiAgents.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} delay={i * 0.1} />
                ))}
              </div>
              
              <GlassCard title='Agent Performance Summary' icon={BarChart3} className='mt-6' glowColor={colors.cyan}>
                <div className='grid md:grid-cols-4 gap-4'>
                  <div className='text-center p-4 rounded-xl bg-white/5'>
                    <p className='text-3xl font-bold text-cyan-400'>1,435</p>
                    <p className='text-sm text-silver'>Total Calls Today</p>
                  </div>
                  <div className='text-center p-4 rounded-xl bg-white/5'>
                    <p className='text-3xl font-bold text-gold'>{formatCurrency(34630)}</p>
                    <p className='text-sm text-silver'>Combined Revenue</p>
                  </div>
                  <div className='text-center p-4 rounded-xl bg-white/5'>
                    <p className='text-3xl font-bold text-green-400'>99.7%</p>
                    <p className='text-sm text-silver'>Success Rate</p>
                  </div>
                  <div className='text-center p-4 rounded-xl bg-white/5'>
                    <p className='text-3xl font-bold text-white'>4.9</p>
                    <p className='text-sm text-silver'>Satisfaction Score</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Leads Section */}
          {activeSection === 'leads' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-6'
            >
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Lead Management</h2>
                <p className='text-silver'>Track leads generated by your AI receptionist</p>
              </div>
              
              <div className='grid md:grid-cols-3 gap-4 mb-8'>
                {[
                  { label: 'Total Leads', value: '347', change: 22, color: colors.purple },
                  { label: 'Qualified Leads', value: '89', change: 15, color: colors.cyan },
                  { label: 'Conversion Rate', value: '23.5%', change: 3.2, color: colors.green },
                ].map((stat, i) => (
                  <div key={i} className='p-5 rounded-xl bg-white/10 border border-white/10'>
                    <p className='text-sm text-silver mb-2'>{stat.label}</p>
                    <p className='text-3xl font-bold' style={{ color: stat.color }}>{stat.value}</p>
                    <p className='text-xs text-green-400 mt-1'>+{stat.change}% this month</p>
                  </div>
                ))}
              </div>
              
              <GlassCard title='Recent Leads' icon={Users} glowColor={colors.purple}>
                <div className='space-y-3'>
                  {[
                    { name: 'Sarah Mitchell', company: 'TechCorp Inc', source: 'Phone Call', value: '$5,000', status: 'Qualified' },
                    { name: 'James Chen', company: 'Innovate LLC', source: 'SMS', value: '$12,000', status: 'Qualified' },
                    { name: 'Emily Rodriguez', company: 'Global Services', source: 'Phone Call', value: '$8,500', status: 'New' },
                    { name: 'Michael Johnson', company: 'StartUp Co', source: 'AI Chat', value: '$3,200', status: 'Contacted' },
                  ].map((lead, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
                    >
                      <div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center'>
                        <User className='w-5 h-5 text-white' />
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium text-white'>{lead.name}</p>
                        <p className='text-xs text-silver'>{lead.company} • {lead.source}</p>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-green-400'>{lead.value}</p>
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-xs',
                          lead.status === 'Qualified' ? 'bg-green-500/20 text-green-400' :
                          lead.status === 'New' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-slate-500/20 text-slate-400'
                        )}>
                          {lead.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
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
                <h2 className='text-3xl font-bold text-white mb-2'>Account Settings</h2>
                <p className='text-silver'>Manage your business profile and preferences</p>
              </div>
              
              <GlassCard title='Business Information' icon={Building2} glowColor={colors.gold}>
                <div className='space-y-4'>
                  {[
                    { label: 'Business Name', value: businessData.businessName },
                    { label: 'Industry', value: businessData.industry },
                    { label: 'Plan', value: businessData.plan },
                    { label: 'AI Agents Active', value: businessData.aiAgentsActive.toString() },
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
        </div>
      </main>
      
      {/* Footer */}
      <footer className='relative py-6 px-4 md:px-6 border-t border-white/10 mt-12'>
        <div className='max-w-[95vw] mx-auto flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}>
              <Building2 className='w-4 h-4 text-deepNavy' />
            </div>
            <span className='text-sm text-silver'>FRONTDESK AGENTS Customer Portal © 2026</span>
          </div>
          
          <div className='flex items-center gap-4 text-xs text-silver'>
            <span>Powered by BUFFY & HERMES AI</span>
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

