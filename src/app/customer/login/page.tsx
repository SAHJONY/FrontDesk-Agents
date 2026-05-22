'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, EyeOff, Lock, Building2, Sparkles, Loader2,
  AlertCircle, ChevronRight, Fingerprint, Users, TrendingUp
} from 'lucide-react'
import { clsx } from 'clsx'

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
  cyan: '#00d4ff',
  green: '#26de81',
  purple: '#a55eea'
}

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        window.location.href = '/customer/dashboard'
      } else {
        setError(data.message || 'Login failed')
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
        <div className='absolute inset-0 bg-gradient-to-br from-midnightBlue via-slate to-deepNavy' />
        <motion.div 
          className='absolute top-0 left-1/4 w-[800px] h-full bg-gradient-to-b from-gold/10 via-amber-500/5 to-transparent'
          style={{ transform: 'rotate(-15deg)', transformOrigin: 'top center' }}
          animate={{ opacity: [0.3, 0.6, 0.3], x: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className='absolute inset-0 opacity-[0.03]' style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        <div className='absolute inset-0' style={{ 
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,8,16,0.5) 50%, rgba(5,8,16,0.9) 100%)' 
        }} />
      </div>

      {/* Floating particles */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className='absolute w-1 h-1 rounded-full'
            style={{ 
              background: i % 2 === 0 ? colors.gold : colors.cyan,
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
      <div className='relative z-10 min-h-screen flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          {/* Logo */}
          <motion.div 
            className='text-center mb-10'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ delay: 0.3 }}
          >
            <div 
              className='w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4'
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}
            >
              <Building2 className='w-10 h-10 text-deepNavy' />
            </div>
            <h1 className='text-3xl font-bold text-white mb-2'>BUSINESS DASHBOARD</h1>
            <p className='text-silver'>Monitor your AI Receptionist performance</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className='relative'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ delay: 0.5 }}
          >
            <div 
              className='absolute -inset-0.5 rounded-3xl blur-lg opacity-30'
              style={{ background: `linear-gradient(135deg, ${colors.gold}40, ${colors.cyan}40)` }}
            />
            <div className='relative bg-gradient-to-br from-slate/90 to-midnightBlue/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-10'>
              <div className='text-center mb-8'>
                <h2 className='text-2xl font-bold text-white mb-2'>Welcome Back</h2>
                <p className='text-silver'>Sign in to your business account</p>
              </div>

              <form onSubmit={handleLogin} className='space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-silver mb-2'>Business Email</label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='you@company.com'
                    className='w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-gold/50 transition-all'
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-silver mb-2'>Password</label>
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
                        focused ? 'border-gold/50 shadow-lg shadow-gold/10' : 'border-white/10 hover:border-white/20'
                      )}
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors'
                    >
                      {showPassword ? <EyeOff className='w-5 h-5 text-silver' /> : <Eye className='w-5 h-5 text-silver' />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30'
                  >
                    <AlertCircle className='w-5 h-5 text-red-400' />
                    <span className='text-red-400 text-sm'>{error}</span>
                  </motion.div>
                )}

                <motion.button
                  type='submit'
                  disabled={isLoading || !email || !password}
                  className={clsx(
                    'w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300',
                    isLoading ? 'bg-slate cursor-not-allowed' :
                    email && password ? 'bg-gradient-to-r from-gold to-goldDark text-deepNavy shadow-lg hover:scale-105' :
                    'bg-slate text-white/50 cursor-not-allowed'
                  )}
                  style={!isLoading && email && password ? { boxShadow: `0 10px 40px ${colors.gold}40` } : {}}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className='w-5 h-5' />
                      <span>Access Dashboard</span>
                      <ChevronRight className='w-5 h-5' />
                    </>
                  )}
                </motion.button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-sm text-silver'>New business? <a href='/customer/register' className='text-gold hover:underline'>Register here</a></p>
              </div>
            </div>
          </motion.div>

          <motion.p
            className='text-center text-xs text-white/30 mt-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 1 }}
          >
            © 2026 FRONTDESK AGENTS • Powered by BUFFY & HERMES AI
          </motion.p>
        </div>
      </div>
    </div>
  )
}