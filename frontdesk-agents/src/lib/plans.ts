// Single source of truth for subscription plans
// Shared between server (checkout, webhooks) and client (pricing page)
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 11900, // $119/month
    features: [
      'AI Receptionist',
      '100 calls/month',
      'Email support',
      'Basic analytics',
      'HIPAA-ready compliance'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Growth',
    price: 34900, // $349/month
    features: [
      'Unlimited AI Receptionist',
      '1,000 calls/month',
      'Priority support',
      'Advanced analytics',
      'Custom Voice',
      'Priority onboarding',
      'SMS integration',
      'Voice mail'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Pro',
    price: 119900, // $1,199/month
    features: [
      'Everything in Growth',
      'Unlimited calls',
      '24/7 Support',
      'Dedicated SLA',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      'Optional on-prem / private-cloud'
    ]
  },
  ultimate: {
    id: 'ultimate',
    name: 'Premium',
    price: 159900, // $1,599/month
    features: [
      'Everything in Pro',
      'Custom model training',
      '24/7 dedicated engineer',
      '12-month data retention',
      'Unlimited calls',
      'API access',
      'SLA guarantee',
      'White-label options'
    ]
  }
} as const

export type PlanId = keyof typeof PLANS
