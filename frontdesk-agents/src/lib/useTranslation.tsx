'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }): ReactNode {
  const [language, setLanguageState] = useState<Language>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language
      const shortLang = browserLang.split('-')[0]
      const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('preferred-language') : null
      setLanguageState((savedLang || shortLang) as Language)
    }
  }, [])

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translationModule = await import('./translations.json')
        const allTranslations = translationModule.default as Record<string, any>
        const langTranslations = allTranslations[language] || allTranslations['en'] || {}
        setTranslations(langTranslations)
      } catch (error) {
        console.error('Failed to load translations:', error)
      }
    }
    loadTranslations()
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferred-language', lang)
    }
  }

  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, translations, languages: SUPPORTED_LANGUAGES }}>
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
