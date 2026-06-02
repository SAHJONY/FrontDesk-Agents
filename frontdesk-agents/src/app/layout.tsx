import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TranslationProvider } from '@/lib/i18n/useTranslation'
import { ToastProvider } from '@/components/ToastProvider'
import { MotionConfig } from 'framer-motion'
import './globals.css'

const inter = Inter({ subsets: ['latin'] }) // auto-deploy: dashboard settings fixed

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app'),
  title: "FrontDesk Agents AI - The World's Most Advanced AI Receptionist",
  description: 'Professional AI agents that speak 200+ languages, available 24/7/365. Any industry, any language, worldwide.',
  keywords: 'AI receptionist, voice AI, multi-language, global business, 24/7 availability, front desk automation',
  authors: [{ name: 'FrontDesk Agents AI' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "FrontDesk Agents AI - The World's Most Advanced AI Receptionist",
    description: 'Professional AI agents that speak 200+ languages, available 24/7/365.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          <MotionConfig reducedMotion="user">
          <ToastProvider>
            {children}
          </ToastProvider>
          </MotionConfig>
        </TranslationProvider>
      </body>
    </html>
  )
}
