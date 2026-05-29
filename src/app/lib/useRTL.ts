'use client'

import { useState, useEffect, useCallback } from 'react'
import { rtlLanguages } from './rtl'

interface UseRTLReturn {
  lang: string
  setLang: (lang: string) => void
  isRTL: boolean
  handleLanguageChange: (newLang: string) => void
}

/**
 * Centralized RTL state management hook.
 * Handles:
 * - Language state with localStorage persistence
 * - RTL direction based on language
 * - document.dir and document.lang updates
 * - Cross-page language change events
 * 
 * Usage:
 * ```tsx
 * const { lang, setLang, isRTL, handleLanguageChange } = useRTL()
 * ```
 */
export function useRTL(): UseRTLReturn {
  const [lang, setLangState] = useState('en')
  const [isRTL, setIsRTL] = useState(false)

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setLangState(savedLang)
    setIsRTL(rtlLanguages.includes(savedLang))
  }, [])

  // Sync document.dir and document.lang with state
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [isRTL, lang])

  const handleLanguageChange = useCallback((newLang: string) => {
    setLangState(newLang)
    setIsRTL(rtlLanguages.includes(newLang))
    localStorage.setItem('preferred-language', newLang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
  }, [])

  return {
    lang,
    setLang: setLangState,
    isRTL,
    handleLanguageChange,
  }
}