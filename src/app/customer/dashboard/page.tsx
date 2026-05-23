'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Building2, User, Phone, Mail, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CustomerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/customer/login')
          return
        }

        // Fetch customer profile
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('contact_email', user.email)
          .single()

        if (error) throw error
        setCustomer(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/customer/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{customer?.company_name || 'Your Business'}</h1>
              <p className="text-sm text-gray-400 capitalize">{customer?.plan_type || 'Free'} Plan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{customer?.contact_name || 'User'}</p>
              <p className="text-xs text-gray-400">{customer?.contact_email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Account Status */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold">Account Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400 capitalize font-medium">{customer?.status || 'Active'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tier</span>
                <span className="text-yellow-400 capitalize font-medium">{customer?.plan_type || 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Limit</span>
                <span className="text-white font-medium">
                  {customer?.monthly_limit ? customer.monthly_limit.toLocaleString() : '1,000'} calls
                </span>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">Business Info</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-white">{customer?.company_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-white">{customer?.contact_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-white">{customer?.contact_email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold">Active Features</h3>
            </div>
            <div className="space-y-2">
              {customer?.metadata?.business_units?.map((unit: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 capitalize">{unit.replace('_', ' ')}</span>
                </div>
              )) || (
                <span className="text-gray-400">No features configured</span>
              )}
              {customer?.metadata?.legal_research_enabled && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                  <CheckCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">Legal Research Engine ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legal Research */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition cursor-pointer"
               onClick={() => router.push('/legal')}>
            <h3 className="text-xl font-bold mb-2">🇺🇸 US Legal Research Engine</h3>
            <p className="text-gray-400 mb-4">
              Search federal & state laws, cases, and local rules with AI-powered semantic search.
            </p>
            <div className="flex items-center gap-2 text-blue-400 font-medium">
              Open Legal Research →
            </div>
          </div>

          {/* AI Receptionist */}
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition">
            <h3 className="text-xl font-bold mb-2">🤖 AI Receptionist</h3>
            <p className="text-gray-400 mb-4">
              Configure your AI phone agent, voice settings, and call routing.
            </p>
            <div className="flex items-center gap-2 text-yellow-400 font-medium">
              Coming Soon →
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
