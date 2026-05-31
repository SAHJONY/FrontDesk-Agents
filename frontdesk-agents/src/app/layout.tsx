import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TranslationProvider } from '@/lib/i18n/useTranslation'
import { ToastProvider } from '@/components/ToastProvider'
import { MotionConfig } from 'framer-motion'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GlobalVoice AI - World\'s Most Advanced AI Receptionist',
  description: 'Professional AI agents that speak 200+ languages, available 24/7/365. Any industry, any language, worldwide.',
  keywords: 'AI receptionist, voice AI, multi-language, global business, 24/7 availability',
  authors: [{ name: 'GlobalVoice AI' }],
  openGraph: {
    title: 'GlobalVoice AI - World\'s Most Advanced AI Receptionist',
    description: 'Professional AI agents that speak 200+ languages, available 24/7/365.',
    url: 'https://www.globalvoice.ai',
    siteName: 'GlobalVoice AI',
    images: [
      {
        url: '/og-image.png',
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
