'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Bot, Phone, MessageSquare, Users, Settings, 
  Activity, BarChart3, Globe, Bell, Lock, Key,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Minus,
  Play, Pause, RefreshCw, Trash2, Edit3, Eye, EyeOff,
  CheckCircle2, AlertCircle, X, Menu, LogOut, Save,
  Volume2, VolumeX, Mic, MicOff, Video, Mail,
  Server, Database, Cloud, Wifi, Zap, Clock,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  User, UserPlus, UserCheck, UserX, Headphones,
  Send, PhoneCall, PhoneIncoming, PhoneOutgoing,
  MessageCircle, Mail as MailIcon, Globe2, Building2,
  Fingerprint, Scan, Cpu, HardDrive, Network,
  Terminal, Code, FileText, Folder, Monitor,
  Maximize2, Minimize2, MoreVertical, Copy, Download,
  Upload, Filter, Search, Calendar, DollarSign,
  CreditCard, Wallet, Receipt, PiggyBank,
  PieChart as PieChartIcon, Activity as ActivityIcon,
  AlertTriangle, Info, HelpCircle, ExternalLink
} from 'lucide-react'
import { clsx } from 'clsx'

// ==========================================
// FORTUNE 500 OWNER DASHBOARD
// Complete Platform Control Center
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
  redDark: '#c0392b',
  green: '#26de81',
  greenDark: '#20bf6a',
  purple: '#a55eea',
  orange: '#fd9644',
  rose: '#ff6b9d'
}

// Mock platform metrics
const platformMetrics = {
  totalCalls: 12847,
  activeCalls: 23,
  missedCalls: 156,
  avgResponseTime: 1.2,
  activeAgents: 8,
  totalAgents: 12,
  uptime: 99.97,
  cpuUsage: 34,
  memoryUsage: 67,
  storageUsage: 45,
  todayRevenue: 2847.50,
  monthlyRevenue: 48720,
  activeUsers: 342,
  totalUsers: 1247
}

// Mock recent activity
const recentActivity = [
  { id: 1, type: 'call', message: 'AI call completed with +1 555-0123', time: '2 min ago', status: 'success' },
  { id: 2, type: 'agent', message: 'ARIA agent upgraded to v2.4', time: '5 min ago', status: 'info' },
  { id: 3, type: 'user', message: 'New user registered: John Smith', time: '8 min ago', status: 'success' },
  { id: 4, type: 'alert', message: 'High volume detected in queue', time: '12 min ago', status: 'warning' },
  { id: 5, type: 'call', message: 'Bland.ai call failed - retrying', time: '15 min ago', status: 'error' },
  { id: 6, type: 'system', message: 'Backup completed successfully', time: '20 min ago', status: 'success' },
]

// Mock communications
const communications = [
  { id: 1, type: 'twilio', from: '+1 555-0123', to: '+1 555-0456', duration: 245, status: 'completed', time: '10:45 AM' },
  { id: 2, type: 'bland', from: 'AI Agent', to: '+1 555-0789', duration: 180, status: 'completed', time: '10:32 AM' },
  { id: 3, type: 'sms', from: '+1 555-0456', to: '+1 555-0123', message: 'Appointment confirmed', status: 'delivered', time: '10:28 AM' },
]

// Navigation items
const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'communications', label: 'Communications', icon: Phone },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'env', label: 'Environment', icon: Key },
]

// Environment variables template
const envTemplate = {
  'TWILIO_ACCOUNT_SID': { value: '', description: 'Twilio Account SID', category: 'communication' },
  'TWILIO_AUTH_TOKEN': { value: '', description: 'Twilio Auth Token', category: 'communication', secret: true },
  'TWILIO_PHONE_NUMBER': { value: '', description: 'Twilio Phone Number', category: 'communication' },
  'BLAND_API_KEY': { value: '', description: 'Bland.ai API Key', category: 'communication', secret: true },
  'OWNER_PASSWORD_HASH': { value: '', description: 'Owner Password (SHA-256 hash)', category: 'security', secret: true },
  'PASSWORD_SALT': { value: '', description: 'Password Salt', category: 'security', secret: true },
  'NEXT_PUBLIC_APP_URL': { value: '', description: 'Application URL', category: 'general' },
  'DATABASE_URL': { value: '', description: 'PostgreSQL Database URL', category: 'database', secret: true },
  'REDIS_URL': { value: '', description: 'Redis Cache URL', category: 'database', secret: true },
  'OPENAI_API_KEY': { value: '', description: 'OpenAI API Key', category: 'ai', secret: true },
  'SMTP_HOST': { value: '', description: 'SMTP Server Host', category: 'email' },
  'SMTP_PORT': { value: '', description: 'SMTP Server Port', category: 'email' },
  'SMTP_USER': { value: '', description: 'SMTP Username', category: 'email' },
  'SMTP_PASSWORD': { value: '', description: 'SMTP Password', category: 'email', secret: true },
}

// ==========================================
// DASHBOARD COMPONENTS
// ==========================================

// Premium Stat Card
const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = colors.gold,
  subvalue
}: { 
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  icon: any
  color?: string
  subvalue?: string
}) => (
  <motion.div
    className='relative group'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
  >
    <div 
      className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500'
      style={{ background: `linear-gradient(135deg, ${color}30, ${colors.cyan}30)` }}
    />
    <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
      <div className='flex items-start justify-between mb-4'>
        <div 
          className='w-12 h-12 rounded-xl flex items-center justify-center'
          style={{ background: `${color}20` }}
        >
          <Icon className='w-6 h-6' style={{ color }} />
        </div>
        {change && (
          <div className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            changeType === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {changeType === 'up' ? <ArrowUp className='w-3 h-3' /> : <ArrowDown className='w-3 h-3' />}
            {change}
          </div>
        )}
      </div>
      <p className='text-sm text-silver mb-1'>{title}</p>
      <p className='text-3xl font-bold text-white mb-1'>{value}</p>
      {subvalue && <p className='text-xs text-silver/60'>{subvalue}</p>}
    </div>
  </motion.div>
)

// Activity Item
const ActivityItem = ({ activity }: { activity: { type: string; message: string; time: string; status: string } }) => {
  const icons: Record<string, any> = {
    call: PhoneCall,
    agent: Bot,
    user: UserPlus,
    alert: AlertTriangle,
    system: Settings
  }
  const iconColors: Record<string, string> = {
    success: colors.green,
    info: colors.cyan,
    warning: colors.orange,
    error: colors.red
  }
  const Icon = icons[activity.type] || Activity

  return (
    <div className='flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'>
      <div 
        className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0'
        style={{ background: `${iconColors[activity.status]}20` }}
      >
        <Icon className='w-5 h-5' style={{ color: iconColors[activity.status] }} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-white'>{activity.message}</p>
        <p className='text-xs text-silver mt-1'>{activity.time}</p>
      </div>
    </div>
  )
}

// Communication Item
const CommunicationItem = ({ comm }: { comm: any }) => (
  <div className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'>
    <div className={clsx(
      'w-12 h-12 rounded-xl flex items-center justify-center',
      comm.type === 'twilio' ? 'bg-purple-500/20' : comm.type === 'bland' ? 'bg-cyan-500/20' : 'bg-green-500/20'
    )}>
      {comm.type === 'twilio' ? <Phone className='w-5 h-5 text-purple-400' /> :
       comm.type === 'bland' ? <Bot className='w-5 h-5 text-cyan-400' /> :
       <MessageSquare className='w-5 h-5 text-green-400' />}
    </div>
    <div className='flex-1'>
      <p className='text-sm text-white'>{comm.from} → {comm.to}</p>
      <p className='text-xs text-silver'>{comm.message || `${comm.duration}s`}</p>
    </div>
    <div className='text-right'>
      <span className={clsx(
        'px-2 py-1 rounded-full text-xs font-medium',
        comm.status === 'completed' || comm.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
        comm.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
      )}>
        {comm.status}
      </span>
      <p className='text-xs text-silver mt-1'>{comm.time}</p>
    </div>
  </div>
)

// Environment Variable Row
const EnvVarRow = ({ 
  key_, 
  config, 
  onUpdate 
}: { 
  key_: string
  config: any
  onUpdate: (key: string, value: string) => void
}) => {
  const [showValue, setShowValue] = useState(!config.secret)
  const [value, setValue] = useState(config.value)

  return (
    <div className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group'>
      <div className='w-8 h-8 rounded-lg bg-slate flex items-center justify-center'>
        {config.secret ? <Lock className='w-4 h-4 text-silver' /> : <Key className='w-4 h-4 text-silver' />}
      </div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-white'>{key_}</p>
        <p className='text-xs text-silver'>{config.description}</p>
      </div>
      <div className='flex items-center gap-2'>
        <input
          type={showValue ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onUpdate(key_, e.target.value)
          }}
          placeholder='Enter value'
          className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm w-64 focus:outline-none focus:border-gold/50'
        />
        <button
          onClick={() => setShowValue(!showValue)}
          className='p-2 rounded-lg hover:bg-white/10 transition-colors'
        >
          {showValue ? <EyeOff className='w-4 h-4 text-silver' /> : <Eye className='w-4 h-4 text-silver' />}
        </button>
        <button className='p-2 rounded-lg hover:bg-white/10 transition-colors'>
          <Copy className='w-4 h-4 text-silver' />
        </button>
      </div>
    </div>
  )
}

// Agent Card
const AgentCard = ({ agent }: { agent: any }) => (
  <motion.div
    className='relative group'
    whileHover={{ y: -5 }}
  >
    <div 
      className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500'
      style={{ background: `linear-gradient(135deg, ${agent.color}30, ${colors.cyan}30)` }}
    />
    <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
      <div className='flex items-center gap-4 mb-4'>
        <div 
          className='w-14 h-14 rounded-xl flex items-center justify-center text-2xl'
          style={{ background: `${agent.color}20` }}
        >
          {agent.avatar}
        </div>
        <div>
          <h3 className='text-lg font-bold text-white'>{agent.name}</h3>
          <p className='text-sm' style={{ color: agent.color }}>{agent.title}</p>
        </div>
      </div>
      
      <div className='space-y-3 mb-4'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-silver'>Status</span>
          <span className='flex items-center gap-1.5'>
            <span className={clsx(
              'w-2 h-2 rounded-full',
              agent.status === 'online' ? 'bg-green-400' : 'bg-slate-400'
            )} />
            <span className='text-white capitalize'>{agent.status}</span>
          </span>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-silver'>Response Time</span>
          <span className='text-white'>{agent.responseTime}</span>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-silver'>Languages</span>
          <span className='text-white'>{agent.languages.length}</span>
        </div>
      </div>

      <div className='flex gap-2'>
        <button className='flex-1 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2'>
          <Settings className='w-4 h-4' />
          Configure
        </button>
        <button className='flex-1 py-2 rounded-lg bg-gold/20 text-sm text-gold hover:bg-gold/30 transition-colors flex items-center justify-center gap-2'>
          <Eye className='w-4 h-4' />
          Monitor
        </button>
      </div>
    </div>
  </motion.div>
)

// ==========================================
// MAIN DASHBOARD PAGE
// ==========================================

export default function OwnerDashboardPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [envVars, setEnvVars] = useState(envTemplate)
  const [systemStatus, setSystemStatus] = useState({
    twilio: 'connected',
    bland: 'connected',
    database: 'healthy',
    cache: 'healthy',
    ai: 'operational'
  })

  // Update environment variable
  const handleEnvUpdate = useCallback((key: string, value: string) => {
    setEnvVars(prev => {
      const newEnvVars = { ...prev } as typeof prev;
      if (newEnvVars[key as keyof typeof prev]) {
        (newEnvVars[key as keyof typeof prev] as any).value = value;
      }
      return newEnvVars;
    })
  }, [])

  // Filter environment variables by category
  const filteredEnvs = Object.entries(envVars).filter(([_, config]) => {
    if (activeSection === 'env') return true
    if (activeSection === 'settings') return true
    return true
  })

  // AI Agents data
  const aiAgents = [
    { id: 'buffy', name: 'BUFFY', title: 'Chief Strategic Intelligence', avatar: '🧠', status: 'online', responseTime: '0.8ms', languages: ['All'], color: colors.cyan },
    { id: 'hermes', name: 'HERMES', title: 'Chief Operations Executor', avatar: '⚡', status: 'online', responseTime: '0.3ms', languages: ['All'], color: colors.gold },
    { id: 'aria', name: 'ARIA', title: 'Chief Reception Officer', avatar: '👩‍💼', status: 'online', responseTime: '< 1s', languages: ['4'], color: colors.gold },
    { id: 'chronos', name: 'CHRONOS', title: 'Scheduling Specialist', avatar: '⏰', status: 'online', responseTime: '< 2s', languages: ['3'], color: colors.cyan },
    { id: 'nova', name: 'NOVA', title: 'Information Analyst', avatar: '🔮', status: 'busy', responseTime: '< 1s', languages: ['3'], color: colors.green },
    { id: 'atlas', name: 'ATLAS', title: 'Escalation Manager', avatar: '🏔️', status: 'online', responseTime: '< 3s', languages: ['3'], color: colors.purple },
  ]

  return (
    <div className='min-h-screen bg-deepNavy text-white flex'>
      {/* Sidebar */}
      <motion.aside
        className={clsx(
          'fixed left-0 top-0 h-full z-50 bg-gradient-to-b from-slate to-midnightBlue border-r border-white/10 transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-20'
        )}
        initial={{ x: -288 }}
        animate={{ x: 0 }}
      >
        {/* Logo */}
        <div className='h-20 flex items-center justify-center border-b border-white/10 px-4'>
          <div className='flex items-center gap-3'>
            <div 
              className='w-12 h-12 rounded-xl flex items-center justify-center'
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
            >
              <Shield className='w-6 h-6 text-deepNavy' />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className='text-lg font-bold text-white'>OWNER</h1>
                <p className='text-xs font-bold tracking-widest' style={{ color: colors.gold }}>DASHBOARD</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className='p-4 space-y-2'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                activeSection === item.id
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-silver hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className='w-5 h-5 flex-shrink-0' />
              {sidebarOpen && <span className='font-medium'>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='absolute -right-4 top-24 w-8 h-8 rounded-full bg-slate border border-white/20 flex items-center justify-center hover:bg-steel transition-colors'
        >
          {sidebarOpen ? <ChevronLeft className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
        </button>

        {/* Logout */}
        <div className='absolute bottom-4 left-0 right-0 px-4'>
          <button
            onClick={() => window.location.href = '/owner/login'}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors'
          >
            <LogOut className='w-5 h-5' />
            {sidebarOpen && <span className='font-medium'>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={clsx('flex-1 transition-all duration-300', sidebarOpen ? 'ml-72' : 'ml-20')}>
        {/* Header */}
        <header className='h-20 border-b border-white/10 px-6 flex items-center justify-between bg-gradient-to-r from-slate/50 to-transparent'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden p-2 rounded-lg hover:bg-white/10'
            >
              <Menu className='w-6 h-6' />
            </button>
            <div>
              <h2 className='text-xl font-bold text-white capitalize'>{activeSection === 'env' ? 'Environment Variables' : activeSection}</h2>
              <p className='text-sm text-silver'>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <button className='p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative'>
              <Bell className='w-5 h-5' />
              <span className='absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500' />
            </button>
            <div className='flex items-center gap-3 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30'>
              <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
              <span className='text-sm font-medium text-green-400'>All Systems Operational</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className='p-6 overflow-y-auto' style={{ height: 'calc(100vh - 5rem)' }}>
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className='space-y-6'>
              {/* Stats Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <StatCard
                  title='Total Calls Today'
                  value={platformMetrics.totalCalls.toLocaleString()}
                  change='+12%'
                  changeType='up'
                  icon={PhoneCall}
                  color={colors.cyan}
                  subvalue='vs yesterday'
                />
                <StatCard
                  title='Active Agents'
                  value={platformMetrics.activeAgents}
                  icon={Bot}
                  color={colors.gold}
                  subvalue={`of ${platformMetrics.totalAgents} total`}
                />
                <StatCard
                  title='Response Time'
                  value={`${platformMetrics.avgResponseTime}s`}
                  change='-8%'
                  changeType='up'
                  icon={Zap}
                  color={colors.green}
                  subvalue='avg across all channels'
                />
                <StatCard
                  title='Platform Uptime'
                  value={`${platformMetrics.uptime}%`}
                  icon={Activity}
                  color={colors.purple}
                  subvalue='last 30 days'
                />
              </div>

              {/* Secondary Stats */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <StatCard
                  title='Today Revenue'
                  value={`$${platformMetrics.todayRevenue.toFixed(2)}`}
                  change='+23%'
                  changeType='up'
                  icon={DollarSign}
                  color={colors.gold}
                />
                <StatCard
                  title='Active Users'
                  value={platformMetrics.activeUsers}
                  icon={Users}
                  color={colors.cyan}
                  subvalue={`${platformMetrics.totalUsers} total registered`}
                />
                <StatCard
                  title='Missed Calls'
                  value={platformMetrics.missedCalls}
                  change='-15%'
                  changeType='up'
                  icon={PhoneOutgoing}
                  color={colors.orange}
                />
              </div>

              {/* System Status */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Recent Activity */}
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Recent Activity</h3>
                  <div className='space-y-3'>
                    {recentActivity.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>System Health</h3>
                  <div className='space-y-4'>
                    {[
                      { name: 'Twilio Integration', status: 'connected', icon: Phone },
                      { name: 'Bland.ai Integration', status: 'connected', icon: Bot },
                      { name: 'Database', status: 'healthy', icon: Database },
                      { name: 'Cache (Redis)', status: 'healthy', icon: Server },
                      { name: 'AI Brain (BUFFY & HERMES)', status: 'operational', icon: Cpu },
                    ].map((system) => (
                      <div key={system.name} className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                        <div className='flex items-center gap-3'>
                          <system.icon className='w-5 h-5 text-silver' />
                          <span className='text-white'>{system.name}</span>
                        </div>
                        <span className={clsx(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          system.status === 'connected' || system.status === 'operational' || system.status === 'healthy'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        )}>
                          {system.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {[
                  { label: 'CPU Usage', value: platformMetrics.cpuUsage, color: colors.cyan },
                  { label: 'Memory Usage', value: platformMetrics.memoryUsage, color: colors.gold },
                  { label: 'Storage', value: platformMetrics.storageUsage, color: colors.green },
                ].map((resource) => (
                  <div key={resource.label} className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-white font-medium'>{resource.label}</span>
                      <span className='text-2xl font-bold' style={{ color: resource.color }}>{resource.value}%</span>
                    </div>
                    <div className='h-3 bg-white/10 rounded-full overflow-hidden'>
                      <motion.div
                        className='h-full rounded-full'
                        style={{ background: `linear-gradient(90deg, ${resource.color}, ${resource.color}80)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${resource.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI AGENTS SECTION */}
          {activeSection === 'agents' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>AI Agents</h3>
                  <p className='text-silver'>Manage and monitor your AI workforce</p>
                </div>
                <button className='px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold flex items-center gap-2 hover:scale-105 transition-transform'>
                  <Plus className='w-5 h-5' />
                  Add New Agent
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {aiAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>

              {/* Agent Performance */}
              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Agent Performance Metrics</h3>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  {[
                    { label: 'Total Interactions', value: '48,293', change: '+15%' },
                    { label: 'Avg Satisfaction', value: '94.7%', change: '+2%' },
                    { label: 'Escalation Rate', value: '3.2%', change: '-0.5%' },
                    { label: 'Resolution Time', value: '1.4s', change: '-12%' },
                  ].map((metric) => (
                    <div key={metric.label} className='p-4 rounded-xl bg-white/5 text-center'>
                      <p className='text-2xl font-bold text-white mb-1'>{metric.value}</p>
                      <p className='text-sm text-silver mb-2'>{metric.label}</p>
                      <span className='text-xs text-green-400 font-medium'>{metric.change} vs last week</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COMMUNICATIONS SECTION */}
          {activeSection === 'communications' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>Communications Hub</h3>
                  <p className='text-silver'>Manage Twilio, Bland.ai, and SMS integrations</p>
                </div>
                <div className='flex gap-3'>
                  <button className='px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium flex items-center gap-2 hover:bg-purple-500/30 transition-colors'>
                    <Phone className='w-4 h-4' />
                    Configure Twilio
                  </button>
                  <button className='px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium flex items-center gap-2 hover:bg-cyan-500/30 transition-colors'>
                    <Bot className='w-4 h-4' />
                    Configure Bland.ai
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-gradient-to-br from-purple-500/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6'>
                  <div className='flex items-center gap-4 mb-4'>
                    <div className='w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center'>
                      <Phone className='w-6 h-6 text-purple-400' />
                    </div>
                    <div>
                      <h4 className='text-white font-bold'>Twilio</h4>
                      <span className='text-xs text-green-400 flex items-center gap-1'>
                        <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
                        Connected
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Calls Today</span>
                      <span className='text-white'>342</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Minutes Used</span>
                      <span className='text-white'>1,847</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-silver'>SMS Sent</span>
                      <span className='text-white'>156</span>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-cyan-500/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6'>
                  <div className='flex items-center gap-4 mb-4'>
                    <div className='w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center'>
                      <Bot className='w-6 h-6 text-cyan-400' />
                    </div>
                    <div>
                      <h4 className='text-white font-bold'>Bland.ai</h4>
                      <span className='text-xs text-green-400 flex items-center gap-1'>
                        <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
                        Connected
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-silver'>AI Calls</span>
                      <span className='text-white'>89</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Avg Duration</span>
                      <span className='text-white'>2m 34s</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Success Rate</span>
                      <span className='text-white'>97.2%</span>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-green-500/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6'>
                  <div className='flex items-center gap-4 mb-4'>
                    <div className='w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center'>
                      <MessageSquare className='w-6 h-6 text-green-400' />
                    </div>
                    <div>
                      <h4 className='text-white font-bold'>SMS Gateway</h4>
                      <span className='text-xs text-green-400 flex items-center gap-1'>
                        <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
                        Active
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Messages</span>
                      <span className='text-white'>1,234</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Delivered</span>
                      <span className='text-white'>98.9%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-silver'>Failed</span>
                      <span className='text-white'>12</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Communications */}
              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Recent Communications</h3>
                <div className='space-y-3'>
                  {communications.map((comm) => (
                    <CommunicationItem key={comm.id} comm={comm} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <button className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center gap-4 hover:border-gold/30 transition-colors group'>
                  <div className='w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors'>
                    <PhoneCall className='w-7 h-7 text-gold' />
                  </div>
                  <div className='text-left'>
                    <h4 className='text-white font-bold'>Make Test Call</h4>
                    <p className='text-sm text-silver'>Test Twilio integration</p>
                  </div>
                </button>

                <button className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center gap-4 hover:border-cyan/30 transition-colors group'>
                  <div className='w-14 h-14 rounded-xl bg-cyan/20 flex items-center justify-center group-hover:bg-cyan/30 transition-colors'>
                    <Bot className='w-7 h-7 text-cyan' />
                  </div>
                  <div className='text-left'>
                    <h4 className='text-white font-bold'>Test AI Call</h4>
                    <p className='text-sm text-silver'>Test Bland.ai integration</p>
                  </div>
                </button>

                <button className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center gap-4 hover:border-green/30 transition-colors group'>
                  <div className='w-14 h-14 rounded-xl bg-green/20 flex items-center justify-center group-hover:bg-green/30 transition-colors'>
                    <MessageSquare className='w-7 h-7 text-green' />
                  </div>
                  <div className='text-left'>
                    <h4 className='text-white font-bold'>Send Test SMS</h4>
                    <p className='text-sm text-silver'>Verify SMS delivery</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* USERS SECTION */}
          {activeSection === 'users' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>User Management</h3>
                  <p className='text-silver'>Manage platform users and access control</p>
                </div>
                <button className='px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold flex items-center gap-2 hover:scale-105 transition-transform'>
                  <UserPlus className='w-5 h-5' />
                  Add User
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                {[
                  { label: 'Total Users', value: platformMetrics.totalUsers, icon: Users, color: colors.cyan },
                  { label: 'Active Now', value: platformMetrics.activeUsers, icon: UserCheck, color: colors.green },
                  { label: 'New This Week', value: 47, icon: UserPlus, color: colors.gold },
                  { label: 'Pending Approval', value: 12, icon: Clock, color: colors.orange },
                ].map((stat) => (
                  <div key={stat.label} className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                    <stat.icon className='w-6 h-6 mb-3' style={{ color: stat.color }} />
                    <p className='text-3xl font-bold text-white mb-1'>{stat.value}</p>
                    <p className='text-sm text-silver'>{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'>
                <div className='p-6 border-b border-white/10'>
                  <h3 className='text-lg font-bold text-white'>All Users</h3>
                </div>
                <div className='p-6'>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex items-center gap-4 py-4 border-b border-white/5 last:border-0'>
                      <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-xl'>
                        👤
                      </div>
                      <div className='flex-1'>
                        <p className='text-white font-medium'>User {i + 1}</p>
                        <p className='text-sm text-silver'>user{i + 1}@company.com</p>
                      </div>
                      <span className='px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400'>
                        Active
                      </span>
                      <button className='p-2 rounded-lg hover:bg-white/10'>
                        <Settings className='w-4 h-4 text-silver' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS SECTION */}
          {activeSection === 'analytics' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-2xl font-bold text-white'>Analytics Dashboard</h3>
                <p className='text-silver'>Comprehensive platform insights and metrics</p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Call Volume Chart */}
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Call Volume (30 days)</h3>
                  <div className='h-64 flex items-end gap-2'>
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        className='flex-1 rounded-t-lg'
                        style={{ 
                          background: `linear-gradient(to top, ${colors.gold}, ${colors.goldDark})`,
                          height: `${Math.random() * 60 + 20}%`
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.random() * 60 + 20}%` }}
                        transition={{ delay: i * 0.02 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Revenue Trend</h3>
                  <div className='h-64 flex items-end gap-2'>
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        className='flex-1 rounded-t-lg'
                        style={{ 
                          background: `linear-gradient(to top, ${colors.cyan}, ${colors.cyanDark})`,
                          height: `${Math.random() * 70 + 15}%`
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.random() * 70 + 15}%` }}
                        transition={{ delay: i * 0.02 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Channel Performance</h3>
                  <div className='space-y-4'>
                    {[
                      { channel: 'Voice Calls', percentage: 45, color: colors.cyan },
                      { channel: 'AI Voice (Bland)', percentage: 28, color: colors.gold },
                      { channel: 'Chat', percentage: 18, color: colors.green },
                      { channel: 'SMS', percentage: 9, color: colors.purple },
                    ].map((item) => (
                      <div key={item.channel}>
                        <div className='flex justify-between text-sm mb-2'>
                          <span className='text-silver'>{item.channel}</span>
                          <span className='text-white'>{item.percentage}%</span>
                        </div>
                        <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                          <motion.div
                            className='h-full rounded-full'
                            style={{ background: item.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Industry Distribution</h3>
                  <div className='space-y-4'>
                    {[
                      { industry: 'Healthcare', percentage: 32 },
                      { industry: 'Legal', percentage: 24 },
                      { industry: 'Real Estate', percentage: 18 },
                      { industry: 'Finance', percentage: 14 },
                      { industry: 'Other', percentage: 12 },
                    ].map((item) => (
                      <div key={item.industry}>
                        <div className='flex justify-between text-sm mb-2'>
                          <span className='text-silver'>{item.industry}</span>
                          <span className='text-white'>{item.percentage}%</span>
                        </div>
                        <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                          <motion.div
                            className='h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500'
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS SECTION */}
          {activeSection === 'integrations' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-2xl font-bold text-white'>Integrations</h3>
                <p className='text-silver'>Connect with external services and APIs</p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[
                  { name: 'Twilio', description: 'Voice and SMS communications', icon: Phone, status: 'connected', color: colors.purple },
                  { name: 'Bland.ai', description: 'AI-powered voice calls', icon: Bot, status: 'connected', color: colors.cyan },
                  { name: 'OpenAI', description: 'Advanced AI language model', icon: Cpu, status: 'configured', color: colors.gold },
                  { name: 'Stripe', description: 'Payment processing', icon: CreditCard, status: 'available', color: colors.green },
                  { name: 'Slack', description: 'Team notifications', icon: MessageCircle, status: 'available', color: colors.orange },
                  { name: 'Zapier', description: 'Workflow automation', icon: Zap, status: 'available', color: colors.rose },
                ].map((integration) => (
                  <motion.div
                    key={integration.name}
                    className='relative group'
                    whileHover={{ y: -5 }}
                  >
                    <div 
                      className='absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                      style={{ background: `linear-gradient(135deg, ${integration.color}30, ${colors.cyan}30)` }}
                    />
                    <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                      <div className='flex items-center gap-4 mb-4'>
                        <div 
                          className='w-14 h-14 rounded-xl flex items-center justify-center'
                          style={{ background: `${integration.color}20` }}
                        >
                          <integration.icon className='w-7 h-7' style={{ color: integration.color }} />
                        </div>
                        <div>
                          <h4 className='text-white font-bold'>{integration.name}</h4>
                          <span className={clsx(
                            'text-xs px-2 py-0.5 rounded-full',
                            integration.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                            integration.status === 'configured' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate text-silver'
                          )}>
                            {integration.status}
                          </span>
                        </div>
                      </div>
                      <p className='text-sm text-silver mb-4'>{integration.description}</p>
                      <button className={clsx(
                        'w-full py-2 rounded-lg text-sm font-medium transition-colors',
                        integration.status === 'connected'
                          ? 'bg-white/10 text-silver hover:bg-white/20'
                          : `bg-${integration.color}/20 text-${integration.color} hover:bg-${integration.color}/30`
                      )}>
                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-2xl font-bold text-white'>Platform Settings</h3>
                <p className='text-silver'>Configure platform behavior and preferences</p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>General Settings</h3>
                  <div className='space-y-4'>
                    {[
                      { label: 'Platform Name', value: 'FRONTDESK AGENTS' },
                      { label: 'Timezone', value: 'America/New_York' },
                      { label: 'Language', value: 'English (US)' },
                    ].map((setting) => (
                      <div key={setting.label} className='flex items-center justify-between py-3 border-b border-white/5 last:border-0'>
                        <span className='text-silver'>{setting.label}</span>
                        <div className='flex items-center gap-2'>
                          <span className='text-white'>{setting.value}</span>
                          <Edit3 className='w-4 h-4 text-silver cursor-pointer hover:text-white' />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Security Settings</h3>
                  <div className='space-y-4'>
                    {[
                      { label: 'Two-Factor Auth', enabled: true },
                      { label: 'Session Timeout', value: '7 days' },
                      { label: 'IP Allowlist', enabled: false },
                    ].map((setting) => (
                      <div key={setting.label} className='flex items-center justify-between py-3 border-b border-white/5 last:border-0'>
                        <span className='text-silver'>{setting.label}</span>
                        {setting.enabled !== undefined ? (
                          <button className={clsx(
                            'w-12 h-6 rounded-full transition-colors relative',
                            setting.enabled ? 'bg-gold' : 'bg-slate'
                          )}>
                            <span className={clsx(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                              setting.enabled ? 'left-7' : 'left-1'
                            )} />
                          </button>
                        ) : (
                          <span className='text-white'>{setting.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-br from-red-500/10 to-slate/90 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Danger Zone</h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                    <div>
                      <p className='text-white font-medium'>Reset All Settings</p>
                      <p className='text-sm text-silver'>Restore all settings to default values</p>
                    </div>
                    <button className='px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium'>
                      Reset
                    </button>
                  </div>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-white/5'>
                    <div>
                      <p className='text-white font-medium'>Clear All Data</p>
                      <p className='text-sm text-silver'>Delete all platform data and start fresh</p>
                    </div>
                    <button className='px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium'>
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ENVIRONMENT VARIABLES SECTION */}
          {activeSection === 'env' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-bold text-white'>Environment Variables</h3>
                  <p className='text-silver'>Configure API keys and sensitive settings</p>
                </div>
                <button className='px-4 py-2 rounded-xl bg-gold/20 text-gold border border-gold/30 font-medium flex items-center gap-2 hover:bg-gold/30 transition-colors'>
                  <Download className='w-4 h-4' />
                  Export .env
                </button>
              </div>

              <div className='bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'>
                <div className='p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent'>
                  <div className='flex items-center gap-3'>
                    <AlertTriangle className='w-5 h-5 text-amber-400' />
                    <p className='text-sm text-amber-400'>These values are stored securely. Never share or commit these to version control.</p>
                  </div>
                </div>
                <div className='p-4 space-y-3'>
                  {Object.entries(envVars).map(([key, config]) => (
                    <EnvVarRow
                      key={key}
                      key_={key}
                      config={config}
                      onUpdate={handleEnvUpdate}
                    />
                  ))}
                </div>
              </div>

              <div className='flex justify-end gap-4'>
                <button className='px-6 py-3 rounded-xl bg-white/10 text-silver font-medium hover:bg-white/20 transition-colors'>
                  Cancel
                </button>
                <button className='px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-goldDark text-deepNavy font-bold flex items-center gap-2 hover:scale-105 transition-transform'>
                  <Save className='w-5 h-5' />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}