'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-300 leading-relaxed">
            We use essential cookies to keep the site running and optional analytics cookies to understand how you use FrontDesk Agents AI.
            Read our{' '}
            <a href="/privacy-policy" className="text-aurora-cyan hover:underline">
              Privacy Policy
            </a>{' '}
            for details.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-aurora-cyan to-blue-600 rounded-lg hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
