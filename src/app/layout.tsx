import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FRONTDESK AGENTS | World Most Advanced AI Receptionist',
  description: 'Transform your business reception with cutting-edge AI agent technology. 8K cinematic visuals, multi-language support, and universal industry compatibility.',
  keywords: 'AI receptionist, artificial intelligence, virtual receptionist, AI agent, chatbot, customer service, front desk automation',
  authors: [{ name: 'FRONTDESK AGENTS' }],
  openGraph: {
    title: 'FRONTDESK AGENTS - Hollywood-Grade AI Receptionist',
    description: 'The world most advanced AI agentic receptionist with 8K cinematic visuals',
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