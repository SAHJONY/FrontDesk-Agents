import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — AI Receptionist Plans from $119/mo | FrontDesk Agents AI',
  description: 'Transparent AI receptionist pricing: Starter ($119/mo), Growth ($349/mo), Pro ($1,199/mo). 14-day free trial, no credit card required. Cancel anytime.',
  openGraph: {
    title: 'AI Receptionist Pricing — Plans from $119/month | FrontDesk Agents AI',
    description: 'Transparent pricing with no hidden fees. 14-day free trial, no credit card required. See how we compare to human receptionists and other AI tools.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/pricing',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
