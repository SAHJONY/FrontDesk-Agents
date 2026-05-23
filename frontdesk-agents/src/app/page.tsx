'use client'
import { useState, useEffect } from 'react'
import { Phone, Globe, Shield, Zap, Check, Play, Menu, X } from 'lucide-react'

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [currentLang, setCurrentLang] = useState('en')
  const heroTitle = "World's Most Advanced"
  
  // Autonomous Language Detection
  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'
    
    // Detect user's language
    const userLang = navigator.language || (navigator as any).userLanguage
    const langCode = userLang.split('-')[0]
    const supportedLangs = ['en', 'es', 'zh', 'fr', 'de', 'ja', 'pt', 'it']
    
    if (supportedLangs.includes(langCode)) {
      setCurrentLang(langCode)
      document.documentElement.lang = langCode
    }
    
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault()
    alert(`Thank you! We'll contact ${email || 'you'} shortly.`)
    setEmail('')
  }

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'trust', label: 'Trust' },
  ]

  // Translations
  const translations: Record<string, any> = {
    en: {
      nav: { features: 'Features', pricing: 'Pricing', trust: 'Trust', demo: 'Demo', signIn: 'Sign In', getStarted: 'Get Started' },
      hero: { title: "World's Most Advanced", subtitle: 'AI Receptionist', desc: 'Reduce costs by 80%. Handle 10k+ calls/month.', email: 'Enter your work email', trial: 'Start Free Trial', noCredit: 'No credit card required', watchDemo: 'Watch Demo' },
      trust: { title: 'Trusted by Industry Leaders Worldwide', healthcare: 'Healthcare', legal: 'Legal', realEstate: 'Real Estate', finance: 'Finance', hospitality: 'Hospitality' },
      stats: { calls: 'Calls/Month', accuracy: 'Accuracy Rate', languages: 'Languages', support: 'Support' },
      features: { title: 'Intelligent by Design', desc: 'Built for performance, security, and seamless integration.' },
      featureItems: [
        { title: '50+ Languages', desc: 'Real-time translation with native accent support' },
        { title: 'Sub-Second Response', desc: 'Average answer time under 2 seconds' },
        { title: 'HIPAA & SOC2', desc: 'Enterprise-grade security with end-to-end encryption' }
      ],
      pricing: { title: 'Simple, Transparent Pricing', desc: 'No hidden fees. Cancel anytime. 14-day free trial.', trial: 'Start Free Trial', contact: 'Contact Sales', popular: 'Most Popular' },
      footer: '© 2026 FrontDesk Agents. All rights reserved.'
    },
    es: {
      nav: { features: 'Características', pricing: 'Precios', trust: 'Confianza', demo: 'Demo', signIn: 'Iniciar Sesión', getStarted: 'Comenzar' },
      hero: { title: "El Más Avanzado del Mundo", subtitle: 'Recepcionista IA', desc: 'Reduzca costos un 80%. Maneje 10k+ llamadas/mes.', email: 'Ingrese su email laboral', trial: 'Prueba Gratis', noCredit: 'Sin tarjeta requerida', watchDemo: 'Ver Demo' },
      trust: { title: 'Líderes de la Industria Confían en Nosotros', healthcare: 'Salud', legal: 'Legal', realEstate: 'Inmobiliaria', finance: 'Finanzas', hospitality: 'Hotelería' },
      stats: { calls: 'Llamadas/Mes', accuracy: 'Precisión', languages: 'Idiomas', support: 'Soporte' },
      features: { title: 'Inteligente por Diseño', desc: 'Construido para rendimiento, seguridad e integración.' },
      featureItems: [
        { title: '50+ Idiomas', desc: 'Traducción en tiempo real con acentos nativos' },
        { title: 'Respuesta Rápida', desc: 'Tiempo de respuesta menor a 2 segundos' },
        { title: 'HIPAA y SOC2', desc: 'Seguridad empresarial con cifrado extremo' }
      ],
      pricing: { title: 'Precios Simples y Transparentes', desc: 'Sin cargos ocultos. Cancela cuando quieras. 14 días gratis.', trial: 'Prueba Gratis', contact: 'Contactar Ventas', popular: 'Más Popular' },
      footer: '© 2026 FrontDesk Agents. Todos los derechos reservados.'
    },
    zh: {
      nav: { features: '功能', pricing: '定价', trust: '信任', demo: '演示', signIn: '登录', getStarted: '开始' },
      hero: { title: "全球最先进", subtitle: 'AI 接待员', desc: '降低成本 80%。每月处理 10k+ 通话。', email: '输入工作邮箱', trial: '免费试用', noCredit: '无需信用卡', watchDemo: '观看演示' },
      trust: { title: '受行业领导者信赖', healthcare: '医疗', legal: '法律', realEstate: '房地产', finance: '金融', hospitality: '酒店' },
      stats: { calls: '通话/月', accuracy: '准确率', languages: '语言', support: '支持' },
      features: { title: '智能设计', desc: '为性能、安全和无缝集成而构建。' },
      featureItems: [
        { title: '50+ 种语言', desc: '实时翻译，支持 native 口音' },
        { title: '秒级响应', desc: '平均响应时间低于 2 秒' },
        { title: 'HIPAA 和 SOC2', desc: '企业级端到端加密安全' }
      ],
      pricing: { title: '简单透明定价', desc: '无隐藏费用。随时取消。14 天免费试用。', trial: '开始试用', contact: '联系销售', popular: '最受欢迎' },
      footer: '© 2026 FrontDesk Agents. 保留所有权利。'
    }
  }

  const t = translations[currentLang] || translations.en

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">FrontDesk Agents</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-4 items-center">
            {navLinks.map((link) => (
              <a 
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t.nav[link.id as keyof typeof t.nav]}
              </a>
            ))}
            <button 
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Play className="w-4 h-4" /> {t.nav.demo}
            </button>
            <a href="/customer/login" className="text-gray-300 hover:text-white transition-colors">{t.nav.signIn}</a>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            
            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors cursor-pointer border border-white/20"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="zh">🇨🇳 ZH</option>
            </select>
            
            <a 
              href="/customer/signup" 
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
            >
              {t.nav.getStarted}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-white/10 py-4">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a href="/customer/login" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Sign In</a>
            <a href="/customer/signup" className="block px-4 py-3 mx-4 mt-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-center">Get Started</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {heroTitle}<br />
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">{t.hero.subtitle}</span>
          </h1>
          <p className="text-xl mb-8 opacity-80">{t.hero.desc}</p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.hero.email} className="flex-1 px-4 py-4 bg-white/10 border border-white/20 rounded-xl" required />
            <button type="submit" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold uppercase">{t.hero.trial}</button>
          </form>
          <p className="text-sm opacity-60 mb-6">{t.hero.noCredit}</p>
          <button onClick={() => setShowVideo(true)} className="mx-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold uppercase flex items-center gap-2">
            <Play className="w-5 h-5" /> {t.hero.watchDemo}
          </button>
        </div>
      </section>
        </div>
      </section>

      {/* Trust Signals - Premium */}
      <section id="trust" className="py-20 border-y border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-sm font-bold uppercase tracking-[0.3em] mb-4">Trusted by Industry Leaders Worldwide</p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center mb-16">
            {[
              { name: 'Healthcare', icon: '🏥', color: 'from-blue-500 to-cyan-500' },
              { name: 'Legal', icon: '⚖️', color: 'from-purple-500 to-pink-500' },
              { name: 'Real Estate', icon: '🏢', color: 'from-green-500 to-emerald-500' },
              { name: 'Finance', icon: '💼', color: 'from-yellow-500 to-orange-500' },
              { name: 'Hospitality', icon: '🏨', color: 'from-red-500 to-rose-500' }
            ].map((item, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className="text-4xl mb-3 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">{item.icon}</div>
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors duration-300 uppercase tracking-wider block text-center">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10k+', label: 'Calls/Month', color: 'from-green-400 to-cyan-400' },
              { value: '98%', label: 'Accuracy Rate', color: 'from-blue-400 to-purple-400' },
              { value: '50+', label: 'Languages', color: 'from-purple-400 to-pink-400' },
              { value: '24/7', label: 'Support', color: 'from-yellow-400 to-orange-400' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>{stat.value}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Intelligent by Design</h2>
          <p className="text-gray-400 text-center mb-12">Built for performance, security, and seamless integration.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: '50+ Languages', desc: 'Real-time translation with native accent support', color: 'from-blue-400 to-cyan-400' },
              { icon: Zap, title: 'Sub-Second Response', desc: 'Average answer time under 2 seconds', color: 'from-yellow-400 to-orange-400' },
              { icon: Shield, title: 'HIPAA & SOC2', desc: 'Enterprise-grade security with end-to-end encryption', color: 'from-green-400 to-emerald-400' }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-black to-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-12">No hidden fees. Cancel anytime. 14-day free trial.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$299', period: '/mo', features: ['1 AI Agent', '1,000 minutes', 'Basic Call Routing', 'Email Support'], color: 'from-blue-500 to-cyan-500' },
              { name: 'Professional', price: '$499', period: '/mo', features: ['3 AI Agents', '3,000 minutes', 'Advanced Routing', 'HIPAA Compliance', 'Priority Support', 'Custom Integrations'], color: 'from-green-500 to-emerald-500', popular: true },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Agents', 'Unlimited Minutes', 'Dedicated Manager', '24/7 Phone Support', 'SLA Guarantees', 'Custom Training'], color: 'from-purple-500 to-pink-500' }
            ].map((tier, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${tier.popular ? 'border-green-500 bg-gradient-to-b from-green-900/20 to-black' : 'border-white/10 bg-black hover:border-white/20'}`}>
                {tier.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-bold uppercase tracking-wide">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>{tier.price}</span>
                  <span className="text-gray-400">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg ${tier.popular ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black shadow-lg shadow-green-500/25' : 'bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white border border-white/10'}`}>
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-sm text-gray-400">
        © 2026 FrontDesk Agents. All rights reserved.
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="max-w-4xl w-full aspect-video bg-black rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <Play className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <p className="text-xl font-bold mb-2">Demo Video</p>
                <p className="text-gray-400 mb-4">See our AI receptionist in action (30 seconds)</p>
                <button onClick={() => setShowVideo(false)} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
