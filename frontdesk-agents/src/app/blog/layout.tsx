import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal AI Blog — Insights for Law Firms | FrontDesk Agents AI',
  description: 'Expert insights on AI receptionists for law firms. Learn how AI call handling reduces malpractice risk, recovers lost revenue from missed calls, and handles emergency client intake across all 50 states.',
  openGraph: {
    title: 'Legal AI Blog — AI Receptionist Insights for Law Firms | FrontDesk Agents AI',
    description: 'In-depth articles on AI-powered legal intake, malpractice risk reduction, missed-call revenue recovery, and 50-state court rule compliance.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/blog',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
