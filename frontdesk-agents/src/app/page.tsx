'use client'

import { useState } from 'react'
import Head from 'next/head'
import { 
  Phone, 
  Globe, 
  Shield, 
  Zap, 
  Check, 
  Menu, 
  X, 
  Play, 
  Mail, 
  Building2, 
  Users, 
  Activity,
  Clock,
  BarChart3,
  Award
} from 'lucide-react'

// Types
interface PricingTier {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  highlight?: boolean
  cta: string
}

interface FAQItem {
  question: string
  answer: string
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')
  const [comparePlans, setComparePlans] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Thank you! We'll contact ${email} shortly.`)
    setEmail('')
  }

  const pricingTiers: PricingTier[] = [
    {
      name: 'Starter',
      price: '$299',
      period: '/mo',
      description: 'Perfect for small businesses getting started with AI.',
      features: [
        '1 AI Receptionist Agent',
        '1,000 minutes/month',
        'Basic Call Routing',
        'Email Support',
        'Standard Analytics',
        '5 Languages'
      ],
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: '$499',
      period: '/mo',
      description: 'For growing businesses needing advanced features.',
      features: [
        '3 AI Receptionist Agents',
        '3,000 minutes/month',
        'Advanced Call Routing',
        'Priority Support',
        'Custom Integrations (Square, CRM)',
        'Multi-language (50+)',
        'HIPAA Compliance',
        'Custom Voice Cloning'
      ],
      highlight: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with custom needs.',
      features: [
        'Unlimited AI Agents',
        'Unlimited Minutes',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom AI Training',
        'On-premise Deployment',
        'SLA Guarantees',
        'Advanced Security (SOC2)'
      ],
      cta: 'Contact Sales'
    }
  ]

  const faqs: FAQItem[] = [
    {
      question: "How does the AI receptionist work?",
      answer: "Our AI uses advanced voice recognition and natural language processing to answer calls, schedule appointments, and route calls just like a human receptionist. It integrates with your calendar and CRM to provide seamless service."
    },
    {
      question: "Is my data secure and HIPAA compliant?",
      answer: "Yes. We are HIPAA compliant and SOC2 Type II certified. All data is encrypted in transit and at rest. Enterprise plans include BAA agreements."
    },
    {
      question: "Can it integrate with my existing tools?",
      answer: "Absolutely. We integrate with Square, Google Calendar, Salesforce, HubSpot, Zapier, and 50+ other platforms. Custom integrations are available on Professional and Enterprise plans."
    },
    {
      question: "How accurate is the voice recognition?",
      answer: "Our AI achieves 98% accuracy in voice recognition across 50+ languages and various accents, powered by NVIDIA's latest speech models."
    },
    {
      question: "Can I try it before buying?",
      answer: "Yes! We offer a 14-day free trial with full access to Professional features. No credit card required to start."
    }
  ]

  return (
    <>
      <Head>
        <title>FrontDesk Agents | World's Most Advanced AI Receptionist</title>
        <meta name="description" content="Transform your business with AI-powered receptionists. Reduce costs by 80%, capture every call, and scale effortlessly. Start your free trial today." />
        <meta name="keywords" content="AI receptionist, virtual assistant, phone answering service, AI phone agent, business automation" />
        
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "FrontDesk Agents",
              "description": "AI-powered receptionist service for businesses",
              "brand": {
                "@type": "Brand",
                "name": "FrontDesk Agents"
              },
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "299",
                "highPrice": "2999",
                "priceCurrency": "USD",
                "offerCount": "3"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "127"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">FrontDesk Agents</span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                <a href="#industries" className="text-gray-300 hover:text-white transition">Industries</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                <a href="#faq" className="text-gray-300 hover:text-white transition">FAQ</a>
                <button 
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  <Play className="w-4 h-4" /> View Demo
                </button>
                <a href="/customer/login" className="text-gray-300 hover:text-white transition">Sign In</a>
                <a href="/customer/signup" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition">
                  Get Started
                </a>
              </div>

              {/* Mobile menu button */}
              <button 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black border-b border-white/10">
              <div className="px-4 py-4 space-y-4">
                <a href="#features" className="block text-gray-300">Features</a>
                <a href="#industries" className="block text-gray-300">Industries</a>
                <a href="#pricing" className="block text-gray-300">Pricing</a>
                <a href="/customer/login" className="block text-gray-300">Sign In</a>
                <a href="/customer/signup" className="block px-4 py-2 bg-green-600 rounded-lg text-center">
                  Get Started
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black z-0" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Now with 50+ Languages & Real-Time Translation</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                World's Most Advanced<br />
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  AI Receptionist
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                Reduce costs by 80% while capturing every missed opportunity. Handle 10k+ calls/month with zero staffing. 
                Start your free trial today.
              </p>

              {/* Email Capture Form */}
              <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-500 transition"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition whitespace-nowrap"
                  >
                    Start Free Trial
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">No credit card required • 14-day free trial</p>
              </form>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  <Play className="w-5 h-5" /> Watch Demo (30s)
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center animate-pulse">
                    <Phone className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-400">AI Agent Active • Ready to Take Calls</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 border-y border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-gray-500 text-sm mb-6">TRUSTED BY INNOVATIVE COMPANIES</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
              {['TechCorp', 'MediCare', 'LegalEase', 'RealtyPro', 'FinanceHub'].map((logo, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="h-12 bg-white/20 rounded-lg w-32 flex items-center justify-center text-xs font-bold">
                    {logo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Intelligent by Design</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Built for performance, security, and seamless integration with your existing workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: '50+ Languages',
                  desc: 'Real-time translation and native accent support for global reach.'
                },
                {
                  icon: Clock,
                  title: 'Sub-Second Response',
                  desc: 'Average answer time ≤ 2 seconds. Never miss a call again.'
                },
                {
                  icon: Shield,
                  title: 'HIPAA & SOC2',
                  desc: 'Enterprise-grade security with end-to-end encryption.'
                },
                {
                  icon: Zap,
                  title: 'Instant Integration',
                  desc: 'Connect with Square, Salesforce, Google Calendar & 50+ tools.'
                },
                {
                  icon: BarChart3,
                  title: 'Smart Analytics',
                  desc: 'Real-time insights on call volume, sentiment, and outcomes.'
                },
                {
                  icon: Award,
                  title: '98% Accuracy',
                  desc: 'Powered by NVIDIA\'s latest speech recognition models.'
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-green-500/50 transition">
                  <feature.icon className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-400 mb-6">No hidden fees. Cancel anytime.</p>
              
              <button
                onClick={() => setComparePlans(!comparePlans)}
                className="text-green-400 hover:text-green-300 flex items-center gap-2 mx-auto"
              >
                {comparePlans ? 'Hide' : 'Compare'} Plans Detailed View
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, i) => (
                <div 
                  key={i} 
                  className={`p-8 rounded-2xl border ${
                    tier.highlight 
                      ? 'bg-gradient-to-b from-green-900/30 to-black border-green-500' 
                      : 'bg-black border-white/10'
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-gray-400">{tier.period}</span>