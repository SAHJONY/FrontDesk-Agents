'use client'

import { useTranslation } from '@/lib/useTranslation'

function Bot() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

export default function Footer() {
  const { t } = useTranslation()

  const handleManageCookies = () => {
    localStorage.removeItem('cookie_consent')
    window.location.reload()
  }

  return (
    <footer className="py-14 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                <Bot />
              </div>
              <span className="font-bold">FrontDesk Agents AI</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              The world&apos;s most advanced AI receptionist platform. Available 24/7 in 200+ languages.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('Product')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/services" className="hover:text-gray-300 transition-colors">{t('Features')}</a></li>
              <li><a href="/industries" className="hover:text-gray-300 transition-colors">{t('Industries')}</a></li>
              <li><a href="/pricing" className="hover:text-gray-300 transition-colors">{t('Pricing')}</a></li>
              <li><a href="/demo" className="hover:text-gray-300 transition-colors">{t('Demo')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('Company')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/blog" className="hover:text-gray-300 transition-colors">{t('Blog')}</a></li>
              <li><a href="/contact" className="hover:text-gray-300 transition-colors">{t('Contact')}</a></li>
              <li className="hover:text-gray-300 transition-colors cursor-default">{t('Careers')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('Legal')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/privacy-policy" className="hover:text-gray-300 transition-colors">{t('Privacy')}</a></li>
              <li><a href="/terms-of-service" className="hover:text-gray-300 transition-colors">{t('Terms')}</a></li>
              <li>
                <button
                  onClick={handleManageCookies}
                  className="hover:text-gray-300 transition-colors cursor-pointer text-left"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} FrontDesk Agents AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
