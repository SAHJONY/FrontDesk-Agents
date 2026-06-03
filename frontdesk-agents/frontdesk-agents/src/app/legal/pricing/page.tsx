'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

// Shared pricing data
const PLANS = [
  {
    id: 'legal-essentials',
    name: 'Legal Essentials',
    monthlyPrice: 299,
    yearlyPrice: 269,
    description: 'Perfect for solo practitioners and small law firms getting started with AI',
    features: [
      '1 dedicated phone number',
      '500 AI-handled calls/month',
      '3 practice areas included',
      'Basic client intake forms',
      'Email notifications for new leads',
      '1 premium neural voice',
      'English language support',
      'HIPAA-compliant infrastructure',
      'Standard encryption (AES-256)',
      'Email support (48h response)',
    ],
    color: 'from-slate-500 to-slate-600',
    accentColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    popular: false,
  },
  {
    id: 'legal-professional',
    name: 'Legal Professional',
    monthlyPrice: 599,
    yearlyPrice: 539,
    description: 'Comprehensive AI reception for established firms with multiple practice areas',
    features: [
      '3 dedicated phone numbers',
      '1,500 AI-handled calls/month',
      'Unlimited practice areas',
      'Advanced intake with intelligent routing',
      'SMS + Email + Slack notifications',
      '5 premium neural voices',
      '10 languages (EN, ES, FR, DE, ZH, JP, KO, AR, HI, PT)',
      'Native CRM integrations (Clio, PracticePanther)',
      'Attorney-client privilege mode',
      'Custom business hours & holidays',
      'Priority phone support (4h response)',
      'Call recording & transcription',
      'Advanced analytics dashboard',
    ],
    color: 'from-purple-500 to-violet-600',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    popular: true,
  },
  {
    id: 'legal-enterprise',
    name: 'Legal Enterprise',
    monthlyPrice: 1299,
    yearlyPrice: 1169,
    description: 'Full-scale AI platform for large firms, legal departments, and multi-location practices',
    features: [
      'Unlimited phone numbers',
      'Unlimited AI-handled calls',
      'Unlimited practice areas',
      'Custom AI training on firm protocols',
      'All notification channels (SMS, Email, Slack, Teams)',
      'All 200+ languages with native fluency',
      'White-label deployment option',
      'Advanced analytics & custom reports',
      'Full REST API access',
      'Dedicated account manager',
      '99.9% uptime SLA guarantee',
      'Custom integrations & webhooks',
      'On-site training & implementation',
      'Quarterly strategy reviews',
    ],
    color: 'from-amber-500 to-orange-600',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    popular: false,
  },
]

const ADD_ONS = [
  { name: 'Additional Phone Number', price: 29, description: 'Per month per number' },
  { name: 'Extra Call Capacity (500)', price: 99, description: 'Per month' },
  { name: 'Additional Language Pack (10)', price: 49, description: 'Per month' },
  { name: 'White-Label Branding', price: 199, description: 'Per month' },
  { name: 'API Access', price: 149, description: 'Per month' },
  { name: 'Priority Support Upgrade', price: 99, description: 'Per month' },
]

const FAQS = [
  { q: 'What makes Legal Services AI different from your regular AI receptionist?', a: 'Legal Services AI is specifically trained on legal industry terminology, compliance requirements (HIPAA, attorney-client privilege), and law firm workflows. It understands practice areas like personal injury, family law, criminal defense, and more. Plus, it includes features like case routing by practice area, conflict checking, and integration with legal CRM platforms like Clio.' },
  { q: 'How does attorney-client privilege work with the AI?', a: 'Our AI is configured to clearly identify itself as an AI assistant and inform callers that conversations may not be fully privileged. For highly sensitive matters, callers can request immediate transfer to an attorney. We also offer an enhanced privilege mode with additional security features for firm-specific protocols.' },
  { q: 'Can I switch practice areas as my firm grows?', a: 'Absolutely! All plans support unlimited practice areas. You can configure and reconfigure your AI to handle different types of legal matters at any time through your dashboard.' },
  { q: 'What CRM integrations are available?', a: 'The Legal Professional and Enterprise plans include native integrations with Clio and PracticePanther. Enterprise customers can request custom integrations with other legal software.' },
  { q: 'Is there a minimum contract period?', a: 'No minimum! All plans are month-to-month after your 14-day free trial. You can cancel anytime without penalty.' },
]

export default function LegalPricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-deep-space text-white font-body">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-display text-lg font-bold">GlobalVoice<span className="text-purple-400"> AI</span></span>
            <span className="ml-2 px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">Legal Services</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/legal" className="text-sm text-gray-400 hover:text-white transition-colors">Back to Legal Services</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-400 mb-6">
            <ScaleIcon />
            <span>Premium AI for Legal Professionals</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display mb-6">
            Legal Services AI
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Pricing Plans</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Purpose-built AI receptionist for law firms. Handle more client inquiries, 
            never miss a potential case, and focus on practicing law.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-purple-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
              Yearly <span className="text-green-400 text-xs">Save 10%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border ${plan.popular ? plan.borderColor + ' ' + plan.bgColor : 'border-white/10 bg-white/[0.02]'} p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-xs font-semibold text-white shadow-lg shadow-purple-500/30">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
                  <ShieldIcon />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-gray-500 mt-1">billed annually</p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <span className={`${plan.accentColor} mt-0.5`}><CheckIcon /></span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={`/customer/signup?plan=${plan.id}`}
                  className={`w-full py-3 rounded-xl text-center font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  Start 14-Day Free Trial
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/10 to-transparent border border-purple-500/20 text-center">
            <p className="text-gray-300">
              All plans include <span className="text-purple-400 font-semibold">14-day free trial</span> - No credit card required - Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display mb-4">Enhance Your Plan</h2>
          <p className="text-gray-400 mb-8">Add optional features to customize your Legal AI experience</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {ADD_ONS.map((addon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{addon.name}</h4>
                  <span className="text-lg font-bold text-purple-400">+${addon.price}</span>
                </div>
                <p className="text-xs text-gray-500">{addon.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-display mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-violet-600/5 to-purple-600/10 border border-purple-500/20 rounded-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">Ready to Transform Your Law Firm&apos;s Client Intake?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of law firms using AI to capture more leads, serve clients better, and grow their practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/customer/signup?plan=legal" className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center gap-2 justify-center">
                  <PhoneIcon />
                  Start Free Trial
                </Link>
                <Link href="/demo" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-all">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} GlobalVoice AI - Legal Services Division</p>
        </div>
      </footer>
    </div>
  )
}