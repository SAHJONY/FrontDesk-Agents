import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | FrontDesk Agents AI',
  description: 'FrontDesk Agents AI terms of service — subscription plans, acceptable use policy, intellectual property rights, billing terms, and liability limitations for our AI receptionist platform.',
  openGraph: {
    title: 'Terms of Service — AI Receptionist Platform | FrontDesk Agents AI',
    description: 'Clear subscription terms, 14-day free trial, usage policies, and IP protection for businesses using our AI phone agents.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/terms-of-service',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
