import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "AI Receptionist for Law Firms | FrontDesk Agents AI",
  description: "Purpose-built AI receptionist for law firms. Covers all 50 US states and 94 federal districts with win probability scoring, client intake, and cinematic AI avatars. Start your free trial.",
  keywords: 'AI receptionist for law firms, legal AI intake, win probability calculator, federal district coverage, client intake AI, cinematic AI avatars, law firm automation, legal receptionist',
  openGraph: {
    title: "AI Receptionist for Law Firms | FrontDesk Agents AI",
    description: "Purpose-built AI receptionist for law firms. Covers all 50 US states and 94 federal districts with win probability scoring and cinematic AI avatars.",
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/ai-receptionist',
    siteName: 'FrontDesk Agents AI',
    images: [
      {
        url: '/assets/og-image.svg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function AIReceptionistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
