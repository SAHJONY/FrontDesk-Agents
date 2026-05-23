'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bot, Sun, Moon, ArrowRight, Play } from 'lucide-react'

const colors = { gold: '#f0b429', goldDark: '#c4920a', deepNavy: '#050810' }

const industries = [
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', desc: 'HIPAA-compliant patient care' },
  { id: 'legal', name: 'Legal', icon: '⚖️', desc: 'Professional client services' },
  { id: 'realestate', name: 'Real Estate', icon: '🏢', desc: 'Property & lead management' },
  { id: 'hospitality', name: 'Hospitality', icon: '🏨', desc: '5-star guest experiences' },
  { id: 'automotive', name: 'Automotive', icon: '🔧', desc: 'Service & sales automation' },
  { id: 'professional', name: 'Professional', icon: '💼', desc: 'Business excellence' }
]


export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 mb-6">
          <Bot className="w-full h-full" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#050810] text-white' : 'bg-white text-gray-900'} transition-colors duration-500`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 backdrop-blur-md bg-black/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}>
              <Bot className="w-6 h-6" style={{ color: colors.deepNavy }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">FRONTDESK</h1>
              <p className="text-xs font-bold tracking-[0.3em]" style={{ color: colors.gold }}>AGENTS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/customer/login" className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
              Sign In
            </Link>
            <Link href="/customer/signup" className="px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="px-4 py-2 rounded-full bg-white/10 text-sm">AI-Powered Receptionists</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl font-bold mt-6 mb-4">
            The Future of<br/>Office Reception
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-gray-400 mb-8">
            Reduce costs by 80% while capturing every missed opportunity
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-4 justify-center">
            <a href="/customer/signup" className="px-8 py-4 rounded-lg font-bold flex items-center gap-2" style={{ background: isDarkMode ? colors.gold : colors.goldDark }}>
              Get Started <ArrowRight className="w-5 h-5" />
            </a>
            <button className="px-8 py-4 rounded-lg font-bold border border-white/20 hover:bg-white/10 transition">View Demo</button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Intelligent by Design</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🌍', title: '50+ Languages', desc: 'Communicate fluently in any language' },
              { icon: '⚡', title: 'Instant Response', desc: 'Sub-second response times 24/7' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'HIPAA and SOC2 compliant' }
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Built for Every Industry</h2>
          <p className="text-gray-400 text-center mb-16">Tailored AI receptionists that understand your unique business needs</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((ind) => (
              <motion.div key={ind.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="p-6 rounded-xl bg-white/5 border border-white/10 text-center hover:border-yellow-500/50 transition cursor-pointer">
                <span className="text-3xl block mb-2">{ind.icon}</span>
                <h3 className="font-bold">{ind.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{ind.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-16">Start free, scale as you grow</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '$299', features: ['1 AI Agent', '500 calls/month', 'Basic scheduling', 'Email support'] },
              { name: 'Professional', price: '$499', features: ['5 AI Agents', 'Unlimited calls', 'Priority support', 'CRM integration', 'Custom branding'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited Agents', 'Unlimited calls', '24/7 Dedicated support', 'SLA guarantee', 'White-label', 'Custom integrations'] }
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-8 rounded-2xl border ${plan.popular ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5'}`}>
                <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-400">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2"><span className="text-green-400">✓</span> {f}</li>
                  ))}
                </ul>
                <a href="/customer/signup" className={`block w-full py-3 rounded-lg font-bold text-center transition ${plan.popular ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/10 hover:bg-white/20'}`}>
                  Get Started
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})` }}>
              <Bot className="w-5 h-5" style={{ color: colors.deepNavy }} />
            </div>
            <span className="text-sm text-gray-400">© 2026 FRONTDESK AGENTS. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}// Cache bust Sat, May 23, 2026  2:42:11 PM
