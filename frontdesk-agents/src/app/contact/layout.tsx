import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — Get Started with FrontDesk Agents AI',
  description: 'Contact the FrontDesk Agents AI team. Schedule a live demo, send a message, or call us at +1 (888) 555-AGENTS. Available 24/7. Response within 2 hours.',
  openGraph: {
    title: 'Contact FrontDesk Agents AI — Get Your AI Receptionist Today',
    description: 'Ready to transform your business communications? Schedule a demo, send a message, or give us a call. Available 24/7 across multiple channels.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/contact',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
