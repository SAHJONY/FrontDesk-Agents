'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown, RefreshCw } from 'lucide-react'
import { useTranslation, SUPPORTED_LANGUAGES } from '@/lib/useTranslation'

export interface LanguagePreviewSwitcherProps {
  /** Subtitle text shown in the dropdown header. Defaults to "Preview Language". */
  subtitle?: string
}

export default function LanguagePreviewSwitcher({ subtitle }: LanguagePreviewSwitcherProps) {
  const { language: sessionLang, setLanguage } = useTranslation()
  const [previewLang, setPreviewLang] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const activeLang = previewLang || sessionLang
  const activeLabel = SUPPORTED_LANGUAGES.find(l => l.code === activeLang)
  const sessionLabel = SUPPORTED_LANGUAGES.find(l => l.code === sessionLang)

  const applyPreview = (code: string) => {
    setLanguage(code as any)
    setPreviewLang(code)
    setIsExpanded(false)
  }

  const resetToSession = () => {
    setLanguage(sessionLang as any)
    setPreviewLang(null)
    setIsExpanded(false)
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          previewLang
            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:border-amber-500/50'
            : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15 hover:text-white'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>{activeLabel?.flag} {activeLabel?.name}</span>
        {previewLang && (
          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-300 font-bold uppercase tracking-wide">
            Preview
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-white/10">
                <p className="text-xs text-gray-400 font-medium">
                  {subtitle ?? 'Preview Language'}
                </p>
              </div>
              <div className="p-1.5 max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isActive = lang.code === activeLang
                  const isPreview = lang.code === previewLang
                  const isSession = lang.code === sessionLang
                  return (
                    <button
                      key={lang.code}
                      onClick={() => isSession ? resetToSession() : applyPreview(lang.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-aurora-cyan/15 text-aurora-cyan'
                          : 'text-gray-300 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.name}</span>
                      {isSession && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                          Session
                        </span>
                      )}
                      {isPreview && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          Preview
                        </span>
                      )}
                      {isActive && !isPreview && !isSession && (
                        <span className="text-amber-400 text-xs">Active</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {previewLang && (
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={resetToSession}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to session ({sessionLabel?.flag} {sessionLabel?.name})
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}