import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | FrontDesk Agents AI',
  description: 'FrontDesk Agents AI privacy policy — learn how we protect your data with AES-256 encryption, SOC 2 compliance, HIPAA-ready infrastructure, and transparent data practices.',
  openGraph: {
    title: 'Privacy Policy — Enterprise-Grade Data Protection | FrontDesk Agents AI',
    description: 'AES-256 encryption at rest and in transit, role-based access control, 30-day data retention. Your calls and business data are protected.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/privacy-policy',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}
