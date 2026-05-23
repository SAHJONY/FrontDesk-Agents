'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Bot, Sun, Moon, Save, Plus, Trash2, Eye, EyeOff, 
  Check, X, RefreshCw, AlertCircle, Key, Phone, 
  Building2, Globe, Zap, Shield, MessageSquare 
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btjscudzrtarfommgegw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface EnvVar {
  key: string
  value: string
  description: string
  category: 'supabase' | 'ai' | 'communication' | 'general'
  required: boolean
}

const defaultEnvVars: EnvVar[] = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://btjscudzrtarfommgegw.supabase.co', description: 'Supabase project URL', category: 'supabase', required: true },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: '', description: 'Supabase anonymous key', category: 'supabase', required: true },
  { key: 'BLANDAI_API_KEY', value: '', description: 'Bland.ai API key for AI voice calls', category: 'communication', required: false },
  { key: 'BLANDAI_PHONE_NUMBER', value: '', description: 'Bland.ai phone number', category: 'communication', required: false },
  { key: 'TWILIO_ACCOUNT_SID', value: '', description: 'Twilio Account SID', category: 'communication', required: false },
  { key: 'TWILIO_AUTH_TOKEN', value: '', description: 'Twilio Auth Token', category: 'communication', required: false },
  { key: 'TWILIO_PHONE_NUMBER', value: '', description: 'Twilio phone number', category: 'communication', required: false },
  { key: 'OPENAI_API_KEY', value: '', description: 'OpenAI API key', category: 'ai', required: false },
  { key: 'ANTHROPIC_API_KEY', value: '', description: 'Anthropic API key', category: 'ai', required: false }
]

export default function EnvSetup() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [showValues, setShowValues] = useState<{[key: string]: boolean}>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    const saved = localStorage.getItem('envVars')
    if (saved) {
      setEnvVars(JSON.parse(saved))
    } else {
      setEnvVars(defaultEnvVars)
    }
    setLoading(false)
  }, [])

  const toggleShow = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateVar = (key: string, value: string) => {
    setEnvVars(prev => prev.map(v => v.key === key ? { ...v, value } : v))
  }

  const addVar = (newVar: EnvVar) => {
    setEnvVars(prev => [...prev, newVar])
  }

  const deleteVar = (key: string) => {
    setEnvVars(prev => prev.filter(v => v.key !== key))
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      localStorage.setItem('envVars', JSON.stringify(envVars))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (error) {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const categories = [
    { id: 'supabase', name: 'Supabase', icon: DatabaseIcon },
    { id: 'communication', name: 'Communication', icon: Phone },
    { id: 'ai', name: 'AI Services', icon: Zap },
    { id: 'general', name: 'General', icon: Globe }
  ]

  function DatabaseIcon(props: any) {
    return <Building2 {...props} />
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#f0b429' }} />
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 border-b ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0b429, #c4920a)' }}>
              <Bot className="w-6 h-6" style={{ color: '#050810' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold">FRONTDESK</h1>
              <p className="text-xs font-bold tracking-wider" style={{ color: '#f0b429' }}>AGENTS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a href="/owner/dashboard" className={`px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200'}`}>
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Environment Variables</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Configure API keys and service integrations</p>
        </div>

        {/* Status Banner */}
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Configuration saved successfully</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">Failed to save configuration</span>
          </div>
        )}

        {/* Categories */}
        {categories.map(category => {
          const categoryVars = envVars.filter(v => v.category === category.id)
          if (categoryVars.length === 0) return null

          return (
            <div key={category.id} className={`mb-8 rounded-2xl border p-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <category.icon className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <h3 className="text-xl font-bold">{category.name}</h3>
              </div>

              <div className="space-y-4">
                {categoryVars.map(envVar => (
                  <div key={envVar.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {envVar.key}
                        {envVar.required && <span className="text-red-400 ml-2">*</span>}
                      </label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleShow(envVar.key)} className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                          {showValues[envVar.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteVar(envVar.key)} className={`p-1.5 rounded hover:bg-red-500/20 text-red-400`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type={showValues[envVar.key] ? 'text' : 'password'}
                      value={envVar.value}
                      onChange={(e) => updateVar(envVar.key, e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      placeholder={`Enter ${envVar.key}`}
                    />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{envVar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Add Custom Variable */}
        <div className={`rounded-2xl border p-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className="text-xl font-bold mb-4">Add Custom Variable</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700 transition">
            <Plus className="w-5 h-5" />
            Add Environment Variable
          </button>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </main>
    </div>
  )
}
