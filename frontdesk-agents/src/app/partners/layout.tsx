import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner & Reseller Program | FrontDesk Agents AI',
  description: 'Join the FrontDesk Agents AI partner program. Earn up to 25% commission, white-label our AI receptionist for law firms and businesses. Tiered commissions, co-branded materials, and dedicated support.',
  openGraph: {
    title: 'Partner & Reseller Program — Earn Commission with FrontDesk Agents AI',
    description: 'Join the FrontDesk Agents AI partner program. Earn up to 25% commission reselling FrontDesk Agents AI — the AI receptionist built for law firms.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/partners',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children
}
