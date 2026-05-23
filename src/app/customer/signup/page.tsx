'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sun, Moon, Building2, Globe } from 'lucide-react'

// Tesla-style colors
const tesla = {
  black: '#000000',
  darkGray: '#171717',
  mediumGray: '#393c41',
  lightGray: '#5c5c5c',
  white: '#ffffff',
  offWhite: '#f4f4f4',
  gold: '#f0b429',
  goldDark: '#c4920a'
}

const industries = [
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'realestate', label: 'Real Estate', icon: '🏢' },
  { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { value: 'automotive', label: 'Automotive', icon: '🔧' },
  { value: 'professional', label: 'Professional', icon: '💼' }
]

export default function CustomerSignupPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    email: '',
    password: '',
    industry: 'professional'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(true)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        window.location.href = '/customer/dashboard?welcome=true'
      } else {
        setError(data.message || 'Failed to create account')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-5 ${isDark ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className={`max-w-5xl mx-auto flex items-center justify-between`}>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{ background: `linear-gradient(135deg, ${tesla.gold}, ${tesla.goldDark})` }}>
              <span className='text-lg font-bold' style={{ color: tesla.black }}>FA</span>
            </div>
            <span className='text-xl font-semibold tracking-wide'>FRONTDESK</span>
          </Link>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}
          >
            {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-6 pt-24 pb-16'>
        <motion.div 
          className='w-full max-w-lg'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className='text-center mb-10'>
            <h1 className={`text-4xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
            <p className={`text-base ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Get your AI receptionist in minutes</p>
          </div>

          {/* Signup Card */}
          <div className={`rounded-2xl p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-black/10'}`}>
            {error && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
              </div>
            )}

            <form className='space-y-5' onSubmit={handleSignup}>
              {/* Business Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Business Name</label>
                <div className='relative'>
                  <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='text'
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder='Acme Corporation'
                    className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-colors ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30 focus:bg-white/10' 
                        : 'bg-white border border-black/10 text-gray-900 placeholder-gray-400 focus:border-black/30'
                    }`}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Website</label>
                <div className='relative'>
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='url'
                    required
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder='https://acmecorp.com'
                    className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-colors ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30 focus:bg-white/10' 
                        : 'bg-white border border-black/10 text-gray-900 placeholder-gray-400 focus:border-black/30'
                    }`}
                  />
                </div>
              </div>

              {/* Industry Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Industry</label>
                <div className='grid grid-cols-3 gap-3'>
                  {industries.map((ind) => (
                    <button
                      key={ind.value}
                      type='button'
                      onClick={() => setFormData(prev => ({ ...prev, industry: ind.value }))}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.industry === ind.value
                          ? isDark 
                            ? 'border-white bg-white text-black' 
                            : 'border-black bg-black text-white'
                          : isDark 
                            ? 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40' 
                            : 'border-black/20 bg-white text-gray-600 hover:border-black/40'
                      }`}
                    >
                      <span className='text-2xl block mb-1'>{ind.icon}</span>
                      <span className='text-sm font-medium'>{ind.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Email</label>
                <div className='relative'>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='email'
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder='you@company.com'
                    className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-colors ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30 focus:bg-white/10' 
                        : 'bg-white border border-black/10 text-gray-900 placeholder-gray-400 focus:border-black/30'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Password</label>
                <div className='relative'>
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder='Min 8 characters'
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-base transition-colors ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30 focus:bg-white/10' 
                        : 'bg-white border border-black/10 text-gray-900 placeholder-gray-400 focus:border-black/30'
                    }`}
                    minLength={8}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                  >
                    {showPassword ? (
                      <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                  loading 
                    ? `${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed` 
                    : 'text-black'
                }`}
                style={!loading ? { background: `linear-gradient(135deg, ${tesla.gold}, ${tesla.goldDark})` } : {}}
              >
                {loading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Setting up your AI...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </button>

              <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                14-day free trial • No credit card required
              </p>
            </form>

            {/* Divider */}
            <div className={`my-6 flex items-center gap-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
              <span className='text-sm'>or</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            </div>

            {/* Sign In Link */}
            <div className='text-center'>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <Link href='/customer/login' className='font-semibold' style={{ color: tesla.gold }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`px-8 py-6 text-center ${isDark ? 'border-t border-white/10' : 'border-t border-black/10'}`}>
        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          © 2026 FRONTDESK AGENTS. All rights reserved.
        </p>
      </footer>
    </div>
  )
}