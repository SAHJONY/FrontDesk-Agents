'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Icons ───────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
)

// ─── Plans Data ──────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    yearlyPrice: 79,
    desc: 'Perfect for small businesses getting started',
    features: ['500 calls/month', '1 Phone Number', 'Basic Analytics', 'Email Support', 'Standard Voice', 'Appointment Booking'],
    color: 'from-gray-500 to-gray-400',
    borderColor: 'border-gray-500/30',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 149,
    yearlyPrice: 119,
    desc: 'For growing businesses',
    features: ['2,000 calls/month', '3 Phone Numbers', 'Advanced Analytics', 'Priority Support', 'Custom Voice', '24/7 Coverage', 'SMS Integration', 'Multi-language (5)'],
    color: 'from-aurora-cyan to-blue-600',
    borderColor: 'border-aurora-cyan/30',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    yearlyPrice: 239,
    desc: 'For high-volume businesses',
    features: ['Unlimited Calls', '10 Phone Numbers', 'Real-time Dashboard', 'API Access', 'Dedicated Support', 'Custom Voice', '200+ Languages', 'CRM Integration'],
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
  },
]

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            i < currentStep 
              ? 'bg-green-500 text-white' 
              : i === currentStep 
                ? 'bg-aurora-cyan text-white' 
                : 'bg-white/10 text-gray-500'
          }`}>
            {i < currentStep ? <CheckIcon /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-8 h-0.5 transition-all ${i < currentStep ? 'bg-green-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Form Input ──────────────────────────────────────────────────────────────
function FormInput({ label, type, placeholder, value, onChange, required, icon: Icon, error }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl bg-white/5 border ${
            error ? 'border-red-500/50' : 'border-white/10'
          } text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors`}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerSignup() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Account
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Business
    businessName: '',
    industry: '',
    website: '',
    employeeCount: '',
    // Step 3: Plan
    selectedPlan: 'growth',
    // Step 4: Phone (provisioned after signup)
    assignedPhoneNumber: '',
    callerId: '',
  })

  const totalSteps = 4

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const selectPlan = (planId: string) => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }))
  }

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }

  const validateStep = (): boolean => {
    switch (step) {
      case 0: // Account
        if (!formData.email || !formData.password) {
          setError('Email and password are required')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return false
        }
        return true
      case 1: // Business
        if (!formData.businessName) {
          setError('Business name is required')
          return false
        }
        return true
      case 2: // Plan
        return true
      case 3: // Review & Pay
        return true
      default:
        return true
    }
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    try {
      // 1. Create customer account
      const signupRes = await fetch('/api/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          industry: formData.industry,
          website: formData.website,
          employeeCount: formData.employeeCount,
          plan: formData.selectedPlan,
          billing: isYearly ? 'yearly' : 'monthly',
        }),
      })

      const signupData = await signupRes.json()
      if (!signupRes.ok) {
        throw new Error(signupData.error || 'Failed to create account')
      }

      // 2. Create Stripe checkout session
      const checkoutRes = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: formData.selectedPlan,
          billing: isYearly ? 'yearly' : 'monthly',
          customerId: signupData.customerId,
          email: formData.email,
        }),
      })

      const checkoutData = await checkoutRes.json()
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || 'Failed to create checkout session')
      }

      // 3. Redirect to Stripe or success page
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        // For demo purposes, skip Stripe and go to dashboard
        router.push(`/customer/dashboard?welcome=true&customerId=${signupData.customerId}`)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const selectedPlanData = PLANS.find(p => p.id === formData.selectedPlan) || PLANS[1]
  const displayPrice = isYearly ? selectedPlanData.yearlyPrice : selectedPlanData.price

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-white/[0.03]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-bold">GlobalVoice AI</span>
          </Link>
          <Link href="/customer/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 0: Account Setup */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
                <p className="text-gray-400">Start your 14-day free trial</p>
              </div>

              <FormInput
                label="Email Address"
                type="email"
                placeholder="you@business.com"
                value={formData.email}
                onChange={(e: any) => handleInputChange('email', e.target.value)}
                required
                icon={UserIcon}
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e: any) => handleInputChange('password', e.target.value)}
                required
              />

              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e: any) => handleInputChange('confirmPassword', e.target.value)}
                required
              />

              <button
                onClick={() => { if (validateStep()) nextStep() }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 1: Business Info */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Business Information</h1>
                <p className="text-gray-400">Tell us about your business</p>
              </div>

              <FormInput
                label="Business Name"
                type="text"
                placeholder="Your Business LLC"
                value={formData.businessName}
                onChange={(e: any) => handleInputChange('businessName', e.target.value)}
                required
                icon={BuildingIcon}
              />

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e: any) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                >
                  <option value="">Select your industry</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="legal">Legal</option>
                  <option value="dental">Dental</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="hvac">HVAC / Home Services</option>
                  <option value="automotive">Automotive</option>
                  <option value="insurance">Insurance</option>
                  <option value="medical_spa">Medical Spa</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <FormInput
                label="Website (Optional)"
                type="url"
                placeholder="https://yourbusiness.com"
                value={formData.website}
                onChange={(e: any) => handleInputChange('website', e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Number of Employees</label>
                <select
                  value={formData.employeeCount}
                  onChange={(e: any) => handleInputChange('employeeCount', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan/50 transition-colors"
                >
                  <option value="">Select range</option>
                  <option value="1">Just me</option>
                  <option value="2-5">2-5 employees</option>
                  <option value="6-10">6-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51+">51+ employees</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => { if (validateStep()) nextStep() }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
                <p className="text-gray-400">14-day free trial, cancel anytime</p>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                <button
                  onClick={() => setIsYearly(!isYearly)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-aurora-cyan' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isYearly ? 'left-7' : 'left-1'}`} />
                </button>
                <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                  Yearly <span className="text-xs text-green-400 ml-1">Save 20%</span>
                </span>
              </div>

              {/* Plans */}
              <div className="space-y-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => selectPlan(plan.id)}
                    className={`w-full p-5 rounded-xl border transition-all text-left ${
                      formData.selectedPlan === plan.id
                        ? `border-aurora-cyan/50 bg-aurora-cyan/5`
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{plan.name}</h3>
                          {plan.popular && (
                            <span className="px-2 py-0.5 rounded-full bg-aurora-cyan/10 text-aurora-cyan text-xs">Popular</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                        <ul className="mt-3 space-y-1">
                          {plan.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="text-green-400"><CheckIcon /></span>
                              {f}
                            </li>
                          ))}
                          {plan.features.length > 4 && (
                            <li className="text-xs text-gray-500">+{plan.features.length - 4} more</li>
                          )}
                        </ul>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${isYearly ? plan.yearlyPrice : plan.price}</div>
                        <div className="text-xs text-gray-500">/mo</div>
                        {isYearly && (
                          <div className="text-xs text-green-400 mt-1">Save ${(plan.price - plan.yearlyPrice) * 12}/yr</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => { if (validateStep()) nextStep() }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Pay */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Review & Activate</h1>
                <p className="text-gray-400">Your AI receptionist will be ready in minutes</p>
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="font-semibold text-white">Order Summary</h3>
                
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <div>
                    <p className="text-white font-medium">{selectedPlanData.name} Plan</p>
                    <p className="text-xs text-gray-500">{isYearly ? 'Billed annually' : 'Billed monthly'}</p>
                  </div>
                  <p className="text-white font-bold">${displayPrice}/mo</p>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <div>
                    <p className="text-white font-medium">14-Day Free Trial</p>
                    <p className="text-xs text-gray-500">Full access, no credit card required</p>
                  </div>
                  <p className="text-green-400 font-bold">$0</p>
                </div>

                <div className="flex justify-between items-center py-3">
                  <p className="text-gray-400">After trial:</p>
                  <p className="text-white font-bold">${displayPrice}/{isYearly ? 'mo (billed annually)' : 'mo'}</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="font-semibold text-white mb-4">What you'll get:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: PhoneIcon, text: 'Phone number provisioned automatically' },
                    { icon: CheckIcon, text: 'AI receptionist configured for your business' },
                    { icon: CheckIcon, text: '24/7 call handling in 200+ languages' },
                    { icon: CheckIcon, text: 'Call recordings and transcripts' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
                        <item.icon />
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Note */}
              <div className="p-4 rounded-xl bg-aurora-cyan/5 border border-aurora-cyan/20">
                <p className="text-sm text-gray-300">
                  <span className="text-aurora-cyan font-medium">No payment required</span> for your 14-day trial. 
                  After trial, your card will be charged ${displayPrice}/month. Cancel anytime with one click.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Start Free Trial →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            <br />
            Need help? <a href="/contact" className="text-aurora-cyan hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
    </div>
  )
}