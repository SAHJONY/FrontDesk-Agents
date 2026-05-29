/**
 * Theme Translation Hook
 * 
 * Provides dark mode / light mode translations that are common across all pages.
 * This reduces duplication of these specific keys while keeping page-specific
 * translations local to each page.
 * 
 * Usage in a page:
 * ```typescript
 * import { useThemeTranslations } from '@/lib/useTranslations'
 * 
 * export default function MyPage() {
 *   const { t } = useThemeTranslations()
 *   // t.darkMode, t.lightMode are available
 * }
 * ```
 */

import { useState, useEffect } from 'react'

// Theme translations for all 14 supported languages
const themeTranslations = {
  en: { darkMode: 'Dark Mode', lightMode: 'Light Mode' },
  es: { darkMode: 'Modo Oscuro', lightMode: 'Modo Claro' },
  fr: { darkMode: 'Mode Sombre', lightMode: 'Mode Clair' },
  zh: { darkMode: '深色模式', lightMode: '浅色模式' },
  hi: { darkMode: 'डार्क मोड', lightMode: 'लाइट मोड' },
  ar: { darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح' },
  pt: { darkMode: 'Modo Escuro', lightMode: 'Modo Claro' },
  ko: { darkMode: '다크 모드', lightMode: '라이트 모드' },
  ja: { darkMode: 'ダークモード', lightMode: 'ライトモード' },
  vi: { darkMode: 'Chế độ Tối', lightMode: 'Chế độ Sáng' },
  tl: { darkMode: 'Dark Mode', lightMode: 'Light Mode' },
  de: { darkMode: 'Dunkler Modus', lightMode: 'Heller Modus' },
  it: { darkMode: 'Modalità Scura', lightMode: 'Modalità Chiara' },
  ru: { darkMode: 'Тёмный режим', lightMode: 'Светлый режим' },
}

export interface ThemeTranslations {
  darkMode: string
  lightMode: string
}

export function useThemeTranslations() {
  const [theme, setTheme] = useState<ThemeTranslations>(themeTranslations.en)

  useEffect(() => {
    // Get current language from localStorage
    const lang = localStorage.getItem('preferred-language') || 'en'
    setTheme(themeTranslations[lang as keyof typeof themeTranslations] || themeTranslations.en)

    // Listen for language changes
    const handleLanguageChange = (e: CustomEvent<{ lang: string }>) => {
      const newLang = e.detail?.lang || 'en'
      setTheme(themeTranslations[newLang as keyof typeof themeTranslations] || themeTranslations.en)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  return theme
}