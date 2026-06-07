// Single source of truth for subscription plans
// Shared between server (checkout, webhooks) and client (pricing page)
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9900, // $99/month
    features: [
      'Basic AI Receptionist',
      '100 calls/month',
      'Email support',
      'Basic analytics'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 29900, // $299/month
    features: [
      'Unlimited AI Receptionist',
      '1,000 calls/month',
      'Priority support',
      'Advanced analytics',
      'SMS integration',
      'Voice mail'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79900, // $799/month
    features: [
      'Everything in Professional',
      'Unlimited calls',
      '24/7 Support',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager'
    ]
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate',
    price: 199900, // $1,999/month
    features: [
      'Everything in Enterprise',
      'Unlimited calls',
      '24/7 phone support',
      'Custom AI training',
      'White-label options',
      'API access',
      'Dedicated account manager',
      'SLA guarantee'
    ]
  }
} as const

export type PlanId = keyof typeof PLANS
