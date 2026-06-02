import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Industries We Serve — AI Receptionist for Every Business | FrontDesk Agents AI',
  description: 'Industry-specific AI phone agents for healthcare, legal, dental, real estate, HVAC, medical spas, automotive, and insurance. Trained on your terminology and compliance requirements.',
  openGraph: {
    title: 'AI Receptionist for Every Industry — Healthcare, Legal, HVAC & More | FrontDesk Agents AI',
    description: 'From HIPAA-compliant patient intake to 50-state legal call handling to emergency HVAC dispatch. Purpose-built AI agents for 8+ industries.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/industries',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
