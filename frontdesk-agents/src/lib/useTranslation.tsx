'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import allTranslations from './translations.json'

type Language = 'en' | 'es' | 'zh' | 'fr' | 'de' | 'ja' | string

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const

export interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translations: Record<string, string>
  languages: typeof SUPPORTED_LANGUAGES
  isLoaded: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

function getLangTranslations(lang: string): Record<string, string> {
  return (allTranslations as Record<string, Record<string, string>>)[lang] || allTranslations['en'] || {}
}

export function TranslationProvider({ children }: { children: ReactNode }): ReactNode {
  const [language, setLanguageState] = useState<Language>('en')
  const [translations, setTranslations] = useState<Record<string, string>>(() => getLangTranslations('en'))
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved language AFTER hydration to prevent server/client mismatch
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language')
    const browserLang = navigator.language.split('-')[0]
    const initialLang = (savedLang || browserLang) as Language
    setLanguageState(initialLang)
    setTranslations(getLangTranslations(initialLang))
    setIsLoaded(true)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    setTranslations(getLangTranslations(lang))
    localStorage.setItem('preferred-language', lang)
  }, [])

  const t = useCallback((key: string): string => {
    return translations[key] || key
  }, [translations])

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, translations, languages: SUPPORTED_LANGUAGES, isLoaded }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
