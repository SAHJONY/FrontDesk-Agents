'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, EyeOff, Lock, Shield, Fingerprint, 
  ChevronRight, AlertCircle, Loader2, Bot,
  Sparkles, Activity, Settings, Users
} from 'lucide-react'
import { clsx } from 'clsx'

// ==========================================
// FORTUNE 500 OWNER LOGIN - ELITE SECURITY
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
  purple: '#a55eea'
}

export default function OwnerLoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setLoginSuccess(true)
        setTimeout(() => {
          window.location.href = '/owner/dashboard'
        }, 1500)
      } else {
        setError(data.message || 'Authentication failed')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen relative overflow-hidden' style={{ background: colors.deepNavy }}>
      {/* Animated Background */}
      <div className='absolute inset-0'>
        {/* Base gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-midnightBlue via-slate to-deepNavy' />
        
        {/* Gold light beam */}
        <motion.div 
          className='absolute top-0 left-1/4 w-[800px] h-full bg-gradient-to-b from-gold/10 via-amber-500/5 to-transparent'
          style={{ transform: 'rotate(-15deg)', transformOrigin: 'top center' }}
          animate={{ opacity: [0.3, 0.6, 0.3], x: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Cyan accent */}
        <motion.div 
          className='absolute top-0 right-1/4 w-[600px] h-full bg-gradient-to-b from-cyan/10 via-cyan-500/5 to-transparent'
          style={{ transform: 'rotate(12deg)', transformOrigin: 'top center' }}
          animate={{ opacity: [0.2, 0.5, 0.2], x: [0, -80, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Grid overlay */}
        <div 
          className='absolute inset-0 opacity-[0.03]' 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} 
        />

        {/* Vignette */}
        <div 
          className='absolute inset-0' 
          style={{ 
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,8,16,0.5) 50%, rgba(5,8,16,0.9) 100%)' 
          }} 
        />
      </div>

      {/* Floating particles */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className='absolute w-1 h-1 rounded-full'
            style={{ 
              background: i % 3 === 0 ? colors.gold : i % 3 === 1 ? colors.cyan : colors.silver,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -200, -400],
              opacity: [0, 0.8, 0],
              scale: [1, 1.5, 0.5]
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className='relative z-10 min-h-screen flex'>
        {/* Left Panel - Branding */}
        <motion.div 
          className='hidden lg:flex lg:w-[55%] flex-col justify-center items-center p-16'
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -50 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className='text-center max-w-lg'>
            {/* Logo */}
            <motion.div 
              className='relative w-32 h-32 mx-auto mb-10'
              initial={{ scale: 0 }}
              animate={{ scale: mounted ? 1 : 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
            >
              {/* Rotating rings */}
              <motion.div 
                className='absolute inset-0 rounded-full border border-gold/30'
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div 
                className='absolute inset-3 rounded-full border border-cyan-500/30'
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div 
                className='absolute inset-6 rounded-full border border-purple-500/30'
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Center icon */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div 
                  className='w-20 h-20 rounded-2xl flex items-center justify-center'
                  style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
                >
                  <Shield className='w-10 h-10 text-deepNavy' />
                </div>
              </div>
            </motion.div>

            {/* Brand text */}
            <motion.h1 
              className='text-5xl font-bold text-white mb-4 tracking-tight'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ delay: 0.7 }}
            >
              FRONTDESK AGENTS
            </motion.h1>
            <motion.p 
              className='text-xl font-semibold mb-6'
              style={{ color: colors.gold, letterSpacing: '0.3em' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: mounted ? 1 : 0 }}
              transition={{ delay: 0.9 }}
            >
              OWNER PORTAL
            </motion.p>
            <motion.p 
              className='text-silver text-lg leading-relaxed'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ delay: 1.1 }}
            >
              Command center for complete platform control. 
              Monitor, manage, and optimize your AI reception ecosystem.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className='grid grid-cols-3 gap-6 mt-16'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ delay: 1.3 }}
            >
              {[
                { icon: Users, value: '100%', label: 'Control' },
                { icon: Activity, value: '24/7', label: 'Monitoring' },
                { icon: Settings, value: '360°', label: 'Management' }
              ].map((stat, i) => (
                <div key={i} className='text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm'>
                  <stat.icon className='w-6 h-6 mx-auto mb-2' style={{ color: colors.gold }} />
                  <p className='text-2xl font-bold text-white'>{stat.value}</p>
                  <p className='text-xs text-silver'>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div 
          className='flex-1 flex items-center justify-center p-8'
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 50 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className='w-full max-w-md'>
            {/* Mobile logo */}
            <div className='lg:hidden text-center mb-10'>
              <div 
                className='w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4'
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
              >
                <Shield className='w-10 h-10 text-deepNavy' />
              </div>
              <h1 className='text-3xl font-bold text-white'>OWNER PORTAL</h1>
            </div>

            {/* Login Card */}
            <motion.div
              className='relative'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ delay: 0.5 }}
            >
              {/* Glow effect */}
              <div 
                className='absolute -inset-0.5 rounded-3xl blur-lg opacity-30'
                style={{ background: `linear-gradient(135deg, ${colors.gold}40, ${colors.cyan}40)` }}
              />

              <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-10'>
                {/* Header */}
                <div className='text-center mb-10'>
                  <motion.div
                    className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6'
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.9 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Lock className='w-4 h-4 text-gold' />
                    <span className='text-gold text-sm font-semibold'>SECURE ACCESS</span>
                  </motion.div>
                  <h2 className='text-3xl font-bold text-white mb-2'>Welcome Back</h2>
                  <p className='text-silver'>Enter your credentials to access the command center</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className='space-y-6'>
                  {/* Password Input */}
                  <div className='relative'>
                    <label className='block text-sm font-medium text-silver mb-2'>
                      Owner Password
                    </label>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder='Enter your password'
                        className={clsx(
                          'w-full px-5 py-4 rounded-xl bg-white/5 border text-white placeholder:text-white/30 transition-all duration-300',
                          focused 
                            ? 'border-gold/50 shadow-lg shadow-gold/10' 
                            : 'border-white/10 hover:border-white/20'
                        )}
                        style={{ fontSize: '16px' }}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors'
                      >
                        {showPassword ? (
                          <EyeOff className='w-5 h-5 text-silver' />
                        ) : (
                          <Eye className='w-5 h-5 text-silver' />
                        )}
                      </button>
                    </div>

                    {/* Focus glow */}
                    <motion.div
                      className='absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full'
                      style={{ background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)` }}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: focused ? '100%' : 0,
                        opacity: focused ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30'
                      >
                        <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0' />
                        <span className='text-red-400 text-sm'>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type='submit'
                    disabled={isLoading || !password}
                    className={clsx(
                      'w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300',
                      isLoading 
                        ? 'bg-slate cursor-not-allowed'
                        : loginSuccess
                          ? 'bg-green-500 text-white'
                          : password
                            ? 'bg-gradient-to-r from-gold to-goldDark text-deepNavy shadow-lg hover:shadow-xl hover:scale-[1.02]'
                            : 'bg-slate text-white/50 cursor-not-allowed'
                    )}
                    style={!isLoading && password && !loginSuccess ? { boxShadow: `0 10px 40px ${colors.gold}40` } : {}}
                    whileHover={!isLoading && password && !loginSuccess ? { scale: 1.02 } : {}}
                    whileTap={!isLoading && password && !loginSuccess ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        <span>Authenticating...</span>
                      </>
                    ) : loginSuccess ? (
                      <>
                        <Sparkles className='w-5 h-5' />
                        <span>Access Granted!</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className='w-5 h-5' />
                        <span>Access Command Center</span>
                        <ChevronRight className='w-5 h-5' />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Security Note */}
                <div className='mt-8 pt-6 border-t border-white/10'>
                  <div className='flex items-center justify-center gap-2 text-xs text-silver'>
                    <Shield className='w-4 h-4' />
                    <span>256-bit AES Encryption • Secure Session • Monitored Access</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p
              className='text-center text-xs text-white/30 mt-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: mounted ? 1 : 0 }}
              transition={{ delay: 1 }}
            >
              © 2026 FRONTDESK AGENTS • All Rights Reserved
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}