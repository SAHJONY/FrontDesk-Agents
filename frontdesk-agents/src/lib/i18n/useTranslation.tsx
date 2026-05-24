'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { LANGUAGES, TRANSLATIONS, DEFAULT_LANGUAGE, getLanguage } from './index'

type LanguageCode = keyof typeof TRANSLATIONS

interface TranslationContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
  languages: typeof LANGUAGES
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  useEffect(() => {
    // Detect language from browser or URL on mount
    const detectedLang = getLanguage()
    setLanguageState(detectedLang as LanguageCode)
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang)
      document.documentElement.lang = lang
      document.documentElement.dir = LANGUAGES[lang]?.direction || 'ltr'
    }
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = TRANSLATIONS[language as keyof typeof TRANSLATIONS]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    // Fallback to English if key not found
    if (!value && language !== DEFAULT_LANGUAGE) {
      value = TRANSLATIONS[DEFAULT_LANGUAGE as keyof typeof TRANSLATIONS]
      for (const k of keys) {
        value = value?.[k]
      }
    }
    
    return value || key
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

export default useTranslation
