'use client'
import { useState } from 'react'
import { Phone, Globe, Shield, Zap, Check, Play, Mail, Bot } from 'lucide-react'

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setEmail('') }

  return (
    <div className="min-h-screen bg-black text-white">
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
            <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 text-gray-300 hover:text-white"><Play className="w-4 h-4" /> Demo</button>
            <a href="/customer/login" className="text-gray-300 hover:text-white">Sign In</a>
            <a href="/customer/signup" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">World's Most Advanced<br /><span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">AI Receptionist</span></h1>
          <p className="text-xl text-gray-400 mb-8">Reduce costs by 80% while capturing every missed opportunity. Handle 10k+ calls/month with zero staffing.</p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your work email" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-500" required />
            <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg">Start Free Trial</button>
          </form>
          <p className="text-sm text-gray-500">No credit card required • 14-day free trial</p>
          <button onClick={() => setShowVideo(true)} className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg"><Play className="w-5 h-5" /> Watch Demo</button>
        </div>
      </section>

      {/* Trust Signals - Premium */}
      <section className="py-16 border-y border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm font-medium mb-8 uppercase tracking-widest">Trusted by Industry Leaders Worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {['Healthcare', 'Legal', 'Real Estate', 'Finance', 'Hospitality'].map((industry, i) => (
              <div key={i} className="group flex flex-col items-center justify-center p-4 hover:bg-white/5 rounded-xl transition-all duration-300">
                <div className="text-3xl mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  {['🏥', '⚖️', '🏢', '💼', '🏨'][i]}
                </div>
                <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wide">{industry}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">10k+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Calls/Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">98%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">50+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">24/7</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Pricing Section */}
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
                <button className={`w-full py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 ${tier.popular ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ name: 'Starter', price: '$299', features: ['1 AI Agent', '1,000 minutes', 'Basic Routing'] }, { name: 'Professional', price: '$499', features: ['3 AI Agents', '3,000 minutes', 'HIPAA Compliance', 'Custom Integrations'], highlight: true }, { name: 'Enterprise', price: 'Custom', features: ['Unlimited Agents', 'Unlimited Minutes', '24/7 Support', 'SLA Guarantees'] }].map((tier, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${tier.highlight ? 'border-green-500 bg-green-900/20' : 'border-white/10 bg-black'}`}>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold mb-4">{tier.price}<span className="text-lg text-gray-400">/mo</span></div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> {f}</li>))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium ${tier.highlight ? 'bg-green-600 hover:bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}>{tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[{ q: 'How does the AI receptionist work?', a: 'Our AI uses advanced voice recognition to answer calls, schedule appointments, and route calls just like a human receptionist.' }, { q: 'Is it HIPAA compliant?', a: 'Yes. We are HIPAA compliant and SOC2 Type II certified with end-to-end encryption.' }, { q: 'Can I try it before buying?', a: 'Yes! We offer a 14-day free trial with full access to Professional features. No credit card required.' }].map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl p-6">
                <summary className="font-bold cursor-pointer list-none flex justify-between">{item.q}<span className="transform group-open:rotate-180 transition">▼</span></summary>
                <p className="mt-4 text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
            <span className="text-sm text-gray-400">© 2026 FRONTDESK AGENTS. All Rights Reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>

      {showVideo && (<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}><div className="max-w-4xl w-full aspect-video bg-black rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}><div className="h-full flex items-center justify-center text-center p-8"><div><Play className="w-16 h-16 mx-auto mb-4 text-green-400" /><p className="text-xl font-bold mb-2">Demo Video</p><p className="text-gray-400 mb-4">See our AI receptionist in action (30 seconds)</p><button onClick={() => setShowVideo(false)} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg">Close</button></div></div></div></div>)}
    </div>
  )
}
