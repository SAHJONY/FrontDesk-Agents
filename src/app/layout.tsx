import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FrontDesk Agents | #1 AI Receptionist Platform',
  description: 'World most advanced AI receptionist. Works 24/7 for Law Firms, Dental Clinics, Med Spas, HVAC, Plumbing, Real Estate, Logistics & Insurance.',
  keywords: 'AI receptionist, virtual receptionist, automated scheduling, 24/7 answering service',
  openGraph: {
    title: 'FrontDesk Agents - World Most Advanced AI Receptionist',
    description: 'AI receptionist works 24/7, answers instantly, books appointments & qualifies leads.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        {children}
      </body>
    </html>
  )
}