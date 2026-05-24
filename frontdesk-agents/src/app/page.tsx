'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Globe, Play, Check, ArrowRight, MessageSquare, Phone, Calendar, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  const { t, language, setLanguage, languages } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const industries = [
    { name: t('industries.legal'), icon: '⚖️', color: 'from-blue-500 to-blue-600' },
    { name: t('industries.medical'), icon: '🏥', color: 'from-red-500 to-red-600' },
    { name: t('industries.realEstate'), icon: '🏠', color: 'from-green-500 to-green-600' },
    { name: t('industries.financial'), icon: '💰', color: 'from-purple-500 to-purple-600' },
    { name: t('industries.retail'), icon: '🛍️', color: 'from-orange-500 to-orange-600' },
    { name: t('industries.hospitality'), icon: '🏨', color: 'from-cyan-500 to-cyan-600' },
  ]

  const stats = [
    { value: '200+', label: t('stats.languages') },
    { value: '50+', label: t('stats.industries') },
    { value: '10,000+', label: t('stats.businesses') },
    { value: '99.97%', label: t('stats.uptime') },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                GlobalVoice AI
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
<select
  value={language}
  onChange={(e) => setLanguage(e.target.value as any)}
  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
>
                {Object.entries(languages).map(([code, data]: any) => (
                  <option key={code} value={code}>
                    {data.flag} {data.nativeName}
                  </option>
                ))}
              </select>

              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-200">
              {t('hero.cta')}
            </button>
            <button 
              onClick={() => setShowVideo(true)}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-full text-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              {t('hero.demo')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">{t('industries.title')}</h2>
          <p className="text-gray-400 text-center mb-12">{t('industries.subtitle')}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {industries.map((industry, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-105"
              >
                <div className={`text-5xl mb-4 bg-gradient-to-r ${industry.color} bg-clip-text text-transparent`}>
                  {industry.icon}
                </div>
                <div className="font-semibold">{industry.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">{t('features.title')}</h2>
          <p className="text-gray-400 text-center mb-12">{t('features.subtitle')}</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <Globe className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('features.multiLanguage.title')}</h3>
              <p className="text-gray-400">{t('features.multiLanguage.description')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('features.multiIndustry.title')}</h3>
              <p className="text-gray-400">{t('features.multiIndustry.description')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <Phone className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('features.available247.title')}</h3>
              <p className="text-gray-400">{t('features.available247.description')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <BarChart3 className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('features.aiPowered.title')}</h3>
              <p className="text-gray-400">{t('features.aiPowered.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Demo video placeholder</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
