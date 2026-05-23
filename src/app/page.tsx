'use client'
import { useState } from 'react'
import { Phone, Globe, Shield, Zap, Check, Play } from 'lucide-react'

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')
  const heroTitle = "World's Most Advanced"
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
            <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 text-gray-300 hover:text-white"><Play className="w-4 h-4" /> Demo</button>
            <a href="/customer/login" className="text-gray-300 hover:text-white">Sign In</a>
            <a href="/customer/signup" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-sm uppercase tracking-wide">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{heroTitle}<br /><span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">AI Receptionist</span></h1>
          <p className="text-xl text-gray-400 mb-8">Reduce costs by 80%. Handle 10k+ calls/month.</p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your work email" className="flex-1 px-4 py-4 bg-white/10 border border-white/20 rounded-xl" required />
            <button type="submit" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold uppercase">Start Free Trial</button>
          </form>
          <p className="text-sm text-gray-500 mb-6">No credit card required</p>
          <button onClick={() => setShowVideo(true)} className="mx-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold uppercase flex items-center gap-2"><Play className="w-5 h-5" /> Watch Demo</button>
        </div>
      </section>

      <section className="py-20 border-y border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-sm font-bold uppercase tracking-[0.3em] mb-8">Trusted by Industry Leaders Worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {['🏥 Healthcare', '⚖️ Legal', '🏢 Real Estate', '💼 Finance', '🏨 Hospitality'].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
                <div className="text-4xl mb-3">{item.split(' ')[0]}</div>
                <div className="text-xs font-semibold uppercase tracking-wider">{item.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{v:'10k+',l:'Calls/Month'}, {v:'98%',l:'Accuracy'}, {v:'50+',l:'Languages'}, {v:'24/7',l:'Support'}].map((s,i)=><div key={i}><div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">{s.v}</div><div className="text-xs uppercase tracking-wider text-gray-500">{s.l}</div></div>)}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Intelligent by Design</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{icon:Globe,t:'50+ Languages',d:'Real-time translation'}, {icon:Zap,t:'Fast Response',d:'< 2 seconds'}, {icon:Shield,t:'HIPAA',d:'Enterprise security'}].map((f,i)=><div key={i} className="p-8 rounded-2xl border border-white/10 bg-white/[0.02]"><f.icon className="w-12 h-12 text-green-400 mb-4 mx-auto" /><h3 className="text-xl font-bold mb-2">{f.t}</h3><p className="text-gray-400">{f.d}</p></div>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-black to-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{n:'Starter',p:'$299'}, {n:'Professional',p:'$499'}, {n:'Enterprise',p:'Custom'}].map((t,i)=><div key={i} className="p-8 rounded-2xl border border-white/10"><h3 className="text-2xl font-bold mb-4">{t.n}</h3><div className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">{t.p}</div><button className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold uppercase">Start Trial</button></div>)}
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-gray-400 text-sm">© 2026 FrontDesk Agents</footer>
      {showVideo && <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={()=>setShowVideo(false)}><div className="text-center"><Play className="w-16 h-16 mx-auto mb-4 text-green-400"/><button onClick={()=>setShowVideo(false)} className="px-6 py-2 bg-green-600 rounded-lg">Close</button></div></div>}
    </div>
  )
}
