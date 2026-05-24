'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, Building2, Languages, Settings, LogOut,
  Globe, TrendingUp, Users, DollarSign, Activity, Phone, MessageSquare,
  Calendar, Shield, Zap, CheckCircle2, Clock, Headphones, Mic
} from 'lucide-react'

const industries = [
  { id: 'legal', name: 'Legal Services', icon: '⚖️', users: 234, revenue: '$12,400' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', users: 189, revenue: '$9,800' },
  { id: 'realestate', name: 'Real Estate', icon: '🏠', users: 412, revenue: '$15,600' },
  { id: 'finance', name: 'Financial Services', icon: '💰', users: 156, revenue: '$8,200' },
  { id: 'retail', name: 'Retail', icon: '🛍️', users: 298, revenue: '$11,900' },
  { id: 'hospitality', name: 'Hospitality', icon: '🏨', users: 178, revenue: '$7,300' },
  { id: 'education', name: 'Education', icon: '📚', users: 267, revenue: '$10,100' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', users: 145, revenue: '$6,700' },
  { id: 'professional', name: 'Professional Services', icon: '💼', users: 321, revenue: '$13,200' }
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '简体中文' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' }
]

const stats = [
  { label: 'Total Businesses', value: '1,247', change: '+12%', icon: Building2 },
  { label: 'Active Users', value: '892', change: '+8%', icon: Users },
  { label: 'Calls Today', value: '3,421', change: '+15%', icon: Phone },
  { label: 'Messages', value: '12,847', change: '+22%', icon: MessageSquare },
  { label: 'Revenue (MTD)', value: '$48.3K', change: '+18%', icon: DollarSign },
  { label: 'Success Rate', value: '99.8%', change: '+0.2%', icon: CheckCircle2 },
  { label: 'Uptime', value: '99.97%', change: 'Stable', icon: Activity },
  { label: 'Avg Response', value: '< 2s', change: '-5%', icon: Clock }
]

const features = [
  { name: 'LiveKit Voice AI', status: 'Active', icon: Mic, color: 'bg-green-500' },
  { name: 'Bland.ai Calls', status: 'Active', icon: Phone, color: 'bg-blue-500' },
  { name: 'NVIDIA NIM (Qwen3.5-397B)', status: 'Active', icon: Zap, color: 'bg-purple-500' },
  { name: 'Multi-Language (200+)', status: 'Active', icon: Globe, color: 'bg-yellow-500' },
  { name: 'Live Transcription', status: 'Active', icon: MessageSquare, color: 'bg-green-500' },
  { name: 'Smart Scheduling', status: 'Active', icon: Calendar, color: 'bg-blue-500' },
  { name: 'Enterprise Security', status: 'Active', icon: Shield, color: 'bg-purple-500' },
  { name: '24/7 Support', status: 'Active', icon: Headphones, color: 'bg-yellow-500' }
]

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isDark, setIsDark] = useState(true)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-black/90 border-white/10' : 'bg-white/90 border-black/10'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-lg font-bold text-black">FA</span>
              </div>
              <span className="text-xl font-semibold">FRONTDESK AGENTS</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:opacity-90"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">Customer Dashboard</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Manage your AI receptionist platform
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-black/10'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <span className={`text-sm ${stat.change.includes('+') ? 'text-green-500' : 'text-gray-500'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Features Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl mb-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-black/10'}`}
          >
            <h2 className="text-2xl font-bold mb-6">Platform Services Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} flex items-center gap-3`}
                >
                  <div className={`w-3 h-3 rounded-full ${feature.color}`} />
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {feature.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Industry Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-2xl mb-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-black/10'}`}
          >
            <h2 className="text-2xl font-bold mb-6">Industry Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry) => (
                <div
                  key={industry.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-100'} transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{industry.icon}</span>
                    <div>
                      <p className="font-medium">{industry.name}</p>
                      <p className="text-sm text-gray-500">{industry.users} users</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-500">{industry.revenue}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Languages Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-black/10'}`}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Globe className="w-6 h-6" />
              Multi-Language Support (200+ Languages)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-100'} transition-colors text-center`}
                >
                  <p className="text-3xl mb-2">{lang.flag}</p>
                  <p className="font-medium text-sm">{lang.native}</p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}