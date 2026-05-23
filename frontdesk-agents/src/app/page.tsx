'use client'

import { useState } from 'react'
import { Phone, Globe, Shield, Zap, Check, Play, Mail, Bot } from 'lucide-react'

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Thank you! We'll contact ${email} shortly.`)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">FrontDesk Agents</span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <a href="#features" className="text-gray-300 hover:text-white">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white">Pricing</a>
            <a href="#faq" className="text-gray-300 hover:text-white">FAQ</a>
            <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 text-gray-300 hover:text-white">
              <Play className="w-4 h-4" /> Demo
            </button>
            <a href="/customer/login" className="text-gray-300 hover:text-white">Sign In</a>
            <a href="/customer/signup" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            World's Most Advanced<br />
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">AI Receptionist</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Reduce costs by 80% while capturing every missed opportunity. Handle 10k+ calls/month with zero staffing.
          </p>
          
          {/* Email Capture */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-500"
              required
            />
            <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg">
              Start Free Trial
            </button>
          </form>
          <p className="text-sm text-gray-500">No credit card required • 14-day free trial</p>

          <div className="mt-8">
            <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg">
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6">TRUSTED BY INNOVATIVE COMPANIES</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 opacity-60">
            {['TechCorp', 'MediCare', 'LegalEase', 'RealtyPro', 'FinanceHub'].map((name, i) => (
              <div key={i} className="h-12 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Intelligent by Design</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: '50+ Languages', desc: 'Real-time translation and native accent support.' },
              { icon: Zap, title: 'Sub-Second Response', desc: 'Average answer time ≤ 2 seconds.' },
              { icon: Shield, title: 'HIPAA & SOC2', desc: 'Enterprise-grade security with encryption.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <feature.icon className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$299', features: ['1 AI Agent', '1,000 minutes', 'Basic Routing'] },
              { name: 'Professional', price: '$499', features: ['3 AI Agents', '3,000 minutes', 'HIPAA Compliance', 'Custom Integrations'], highlight: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited Agents', 'Unlimited Minutes', '24/7 Support', 'SLA Guarantees'] },
            ].map((tier, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${tier.highlight ? 'border-green-500 bg-green-900/20' : 'border-white/10 bg-black'}`}>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold mb-4">{tier.price}<span className="text-lg text-gray-400">/mo</span></div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium ${tier.highlight ? 'bg-green-600 hover:bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}>
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does the AI receptionist work?', a: 'Our AI uses advanced voice recognition to answer calls, schedule appointments, and route calls just like a human receptionist.' },
              { q: 'Is it HIPAA compliant?', a: 'Yes. We are HIPAA compliant and SOC2 Type II certified with end-to-end encryption.' },
              { q: 'Can I try it before buying?', a: 'Yes! We offer a 14-day free trial with full access to Professional features. No credit card required.' },
            ].map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl p-6">
                <summary className="font-bold cursor-pointer list-none flex justify-between">
                  {item.q}
                  <span className="transform group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="mt-4 text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-400">© 2026 FRONTDESK AGENTS. All Rights Reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
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
                <button onClick={() => setShowVideo(false)} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
