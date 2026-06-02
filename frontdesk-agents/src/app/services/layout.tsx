import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist Services & Capabilities | FrontDesk Agents AI',
  description: 'Full AI receptionist platform: neural voice answering, smart appointment booking, lead qualification, 200+ languages, real-time analytics, CRM integration. 24/7 availability.',
  openGraph: {
    title: 'AI Receptionist Services — Full Capability Breakdown | FrontDesk Agents AI',
    description: 'From neural voice calls to smart scheduling to multi-language support — enterprise-grade AI receptionist capabilities. Deploy-ready in hours.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/services',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
