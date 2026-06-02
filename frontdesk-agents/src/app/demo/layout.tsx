import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist Demo — See It In Action | FrontDesk Agents AI',
  description: 'Watch FrontDesk Agents AI handle real calls, book appointments, and qualify leads in 200+ languages. Book a live demo tailored to your industry — healthcare, legal, dental, real estate, and more.',
  openGraph: {
    title: 'See Our AI Receptionist in Action — Live Demo | FrontDesk Agents AI',
    description: 'Real-time call handling, appointment booking, lead qualification — experience the full AI receptionist platform in a personalized demo.',
    url: 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app/demo',
    siteName: 'FrontDesk Agents AI',
  },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
