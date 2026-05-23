'use client'
import { useState } from 'react'
import { Phone, Globe, Shield, Zap, Check, Play } from 'lucide-react'

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')

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
            <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 text-gray-300 hover:text-white"><Play className="w-4 h-4" /> Demo</button>
            <a href="/customer/login" className="text-gray-300 hover:text-white">Sign In</a>
            <a href="/customer/signup" className="px-4 py-2 bg-green-600 rounded-lg">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">World'\''s Most Advanced<br /><span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">AI Receptionist</span></h1>
          <p className="text-xl text-gray-400 mb-8">Reduce costs by 80%. Handle 10k+ calls/month.</p>
          <form onSubmit={(e) => { e.preventDefault(); setEmail('') }} className="max-w-md mx-auto mb-8 flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg" required />
            <button type="submit" className="px-6 py-3 bg-green-600 rounded-lg">Start Trial</button>
          </form>
          <p className="text-sm text-gray-500">No credit card required</p>
        </div>
      </section>

      <section className="py-12 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6">TRUST BY INNOVATIVE COMPANIES</p>
          <div className="grid grid-cols-5 gap-4 opacity-60">
            {['TechCorp', 'MediCare', 'LegalEase', 'RealtyPro', 'FinanceHub'].map((n, i) => <div key={i} className="h-10 bg-white/20 rounded flex items-center justify-center text-xs">{n}</div>)}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Intelligent by Design</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ icon: Globe, title: '50+ Languages', desc: 'Real-time translation' }, { icon: Zap, title: 'Fast Response', desc: '< 2 seconds' }, { icon: Shield, title: 'HIPAA', desc: 'Enterprise security' }].map((f, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <f.icon className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ name: 'Starter', price: '99' }, { name: 'Pro', price: '99' }, { name: 'Enterprise', price: 'Custom' }].map((t, i) => (
              <div key={i} className="p-8 rounded-2xl border border-white/10 bg-black">
                <h3 className="text-2xl font-bold mb-2">{t.name}</h3>
                <div className="text-4xl font-bold mb-4">{t.price}</div>
                <button className="w-full py-3 bg-green-600 rounded-lg">Start Trial</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10 text-center text-sm text-gray-400">© 2026 FrontDesk Agents</footer>
      {showVideo && <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setShowVideo(false)}><div className="p-8"><button onClick={() => setShowVideo(false)} className="px-6 py-2 bg-green-600 rounded">Close</button></div></div>}
    </div>
  )
}
