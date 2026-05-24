'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sun, Moon, Building2, Globe, Shield } from 'lucide-react'

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

// Industry options
const industries = [
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'realestate', label: 'Real Estate', icon: '🏢' },
  { id: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { id: 'financial', label: 'Financial', icon: '💼' },
  { id: 'corporate', label: 'Corporate', icon: '🏗️' }
]

export default function CustomerSignupPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    email: '',
    password: '',
    industry: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(true)
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.industry) {
      setError('Please select your industry')
      return
    }
    if (!formData.businessName || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    // Simulate signup - in production this would call your API
    setTimeout(() => {
      window.location.href = '/customer/dashboard'
      setIsLoading(false)
    }, 2000)
  }

  const handleIndustrySelect = (industryId: string) => {
    setFormData({ ...formData, industry: industryId })
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 ${isDark ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center`}>
              <Lock className='w-4 h-4 text-white' />
            </div>
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>FRONTDESK</span>
          </Link>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
          >
            {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className='min-h-screen flex items-center justify-center px-4 pt-24 pb-16'>
        <div className='w-full max-w-2xl'>
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12'
          >
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Get Started
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your FrontDesk Agents account in minutes
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='flex items-center justify-center gap-4 mb-12'
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-green-600 text-white' : isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-16 h-px ${step >= 2 ? 'bg-green-600' : isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-green-600 text-white' : isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-8 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
          >
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                </div>
              )}

              {/* Industry Selection */}
              <div>
                <label className={`block text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Your Industry
                </label>
                <div className='grid grid-cols-3 gap-3'>
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      type='button'
                      onClick={() => handleIndustrySelect(industry.id)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        formData.industry === industry.id
                          ? 'border-green-500 bg-green-500/10'
                          : isDark
                            ? 'border-white/10 bg-white/5 hover:border-white/20'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <span className='text-2xl'>{industry.icon}</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {industry.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Business Name
                </label>
                <div className='relative'>
                  <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='text'
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder='Acme Corporation'
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website
                </label>
                <div className='relative'>
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='url'
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder='https://www.yourbusiness.com'
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Work Email
                </label>
                <div className='relative'>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='you@company.com'
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className='relative'>
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder='Create a strong password'
                    className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                    minLength={8}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Must be at least 8 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className='w-5 h-5' />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={`my-6 flex items-center gap-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <span className='text-sm'>or</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>

            {/* Sign In Link */}
            <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link href='/customer/login' className='text-green-500 hover:text-green-400 font-medium'>
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-center text-xs mt-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            By creating an account, you agree to our{' '}
            <a href='#' className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terms of Service</a>
            {' '}and{' '}
            <a href='#' className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Privacy Policy</a>
          </motion.p>
        </div>
      </main>
    </div>
  )
}