'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Building2, Globe, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btjscudzrtarfommgegw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default function CustomerSignup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    email: '',
    password: '',
    industry: 'professional'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const industries = [
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'legal', label: 'Legal', icon: '⚖️' },
    { value: 'real-estate', label: 'Real Estate', icon: '🏢' },
    { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
    { value: 'automotive', label: 'Automotive', icon: '🔧' },
    { value: 'professional', label: 'Professional', icon: '💼' }
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Create user
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            business_name: formData.businessName,
            website: formData.website,
            industry: formData.industry,
            role: 'customer'
          }
        }
      })

      if (authError) throw authError

      // Create customer record
      await supabase.from('customers').insert([{
        email: formData.email,
        business_name: formData.businessName,
        owner_name: formData.businessName.split(' ')[0],
        website: formData.website,
        industry: formData.industry,
        plan: 'starter',
        status: 'trial'
      }])

      router.push('/customer/dashboard?welcome=true')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-space via-deep-space to-black flex items-center justify-center p-6">
      {/* Back Link */}
      <a href="/" className="absolute top-6 left-6 text-white/60 hover:text-white hover:scale-[1.05] transition-all duration-200 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to Home
      </a>

      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-display text-white mb-2">Create Your Account</h1>
          <p className="text-gray-400">Get your AI receptionist in minutes</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-cinematic-red mt-0.5" />
              <p className="text-sm text-cinematic-red">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSignup}>
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Your Business Name"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="url"
                  required
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, industry: ind.value }))}
                    className={`p-3 rounded-xl border transition-all ${
                      formData.industry === ind.value
                        ? 'border-white bg-white text-gray-900'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:scale-[1.02] transition-all duration-200'
                    }`}
                  >
                    <span className="text-2xl">{ind.icon}</span>
                    <p className="text-sm font-medium mt-1">{ind.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="you@business.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Min 8 characters"
                  minLength={8}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up your AI...
                </>
              ) : (
                <>
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              14-day free trial • No credit card required
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
