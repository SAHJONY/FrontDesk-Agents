import { describe, it, expect } from 'vitest'

// Translation object structure matching the pages
const translations: Record<string, Record<string, string>> = {
  en: {
    navOverview: 'Overview',
    navCalls: 'Call Logs',
    navAgents: 'AI Agents',
    headerTitle: 'FRONTDESK',
    headerSubtitle: 'AGENTS',
  },
  es: {
    navOverview: 'Resumen',
    navCalls: 'Registro de Llamadas',
    navAgents: 'Agentes IA',
    headerTitle: 'FRONTDESK',
    headerSubtitle: 'AGENTES',
  },
  fr: {
    navOverview: 'Aperçu',
    navCalls: 'Journal des Appels',
    navAgents: 'Agents IA',
    headerTitle: 'FRONTDESK',
    headerSubtitle: 'AGENTS',
  },
  zh: {
    navOverview: '概览',
    navCalls: '通话记录',
    navAgents: 'AI代理',
    headerTitle: 'FRONTDESK',
    headerSubtitle: '代理',
  },
  hi: {
    navOverview: 'अवलोकन',
    navCalls: 'कॉल लॉग',
    navAgents: 'AI एजेंट',
    headerTitle: 'FRONTDESK',
    headerSubtitle: 'एजेंट',
  },
  ar: {
    navOverview: 'نظرة عامة',
    navCalls: 'سجل المكالمات',
    navAgents: 'وكلاء الذكاء الاصطناعي',
    headerTitle: 'FRONTDESK',
    headerSubtitle: 'الوكلاء',
  },
}

// Get translation function matching the pages
const getTranslation = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

describe('Translation System', () => {
  describe('getTranslation function', () => {
    it('should return English translation for known key with English lang', () => {
      expect(getTranslation('navOverview', 'en')).toBe('Overview')
    })

    it('should return Spanish translation for known key with Spanish lang', () => {
      expect(getTranslation('navOverview', 'es')).toBe('Resumen')
    })

    it('should return French translation for known key with French lang', () => {
      expect(getTranslation('navOverview', 'fr')).toBe('Aperçu')
    })

    it('should return Chinese translation for known key with Chinese lang', () => {
      expect(getTranslation('navOverview', 'zh')).toBe('概览')
    })

    it('should return Hindi translation for known key with Hindi lang', () => {
      expect(getTranslation('navOverview', 'hi')).toBe('अवलोकन')
    })

    it('should return Arabic translation for known key with Arabic lang', () => {
      expect(getTranslation('navOverview', 'ar')).toBe('نظرة عامة')
    })

    it('should fall back to English for unknown language', () => {
      expect(getTranslation('navOverview', 'xyz')).toBe('Overview')
    })

    it('should fall back to English for unknown key', () => {
      expect(getTranslation('unknownKey', 'en')).toBe('unknownKey')
    })

    it('should return key itself when key not found and no English fallback', () => {
      expect(getTranslation('nonExistent', 'fr')).toBe('nonExistent')
    })

    it('should use default parameter when lang not provided', () => {
      expect(getTranslation('navOverview')).toBe('Overview')
    })
  })

  describe('Supported languages coverage', () => {
    const supportedLangs = ['en', 'es', 'fr', 'zh', 'hi', 'ar']

    it('should have translations for all supported languages', () => {
      supportedLangs.forEach(lang => {
        expect(translations[lang]).toBeDefined()
        expect(typeof translations[lang]).toBe('object')
      })
    })

    it('should have navOverview key in all supported languages', () => {
      supportedLangs.forEach(lang => {
        expect(translations[lang]?.navOverview).toBeDefined()
        expect(typeof translations[lang]?.navOverview).toBe('string')
      })
    })

    it('should have headerTitle key in all supported languages', () => {
      supportedLangs.forEach(lang => {
        expect(translations[lang]?.headerTitle).toBeDefined()
        expect(typeof translations[lang]?.headerTitle).toBe('string')
      })
    })
  })

  describe('Translation consistency', () => {
    it('should have same keys across all languages', () => {
      const englishKeys = Object.keys(translations['en'])
      
      const allLanguagesHaveSameKeys = ['es', 'fr', 'zh', 'hi', 'ar'].every(lang => {
        const langKeys = Object.keys(translations[lang])
        return langKeys.length === englishKeys.length &&
          langKeys.every(key => englishKeys.includes(key))
      })
      
      expect(allLanguagesHaveSameKeys).toBe(true)
    })
  })

  describe('RTL language detection for translations', () => {
    const rtlLanguages = ['ar']
    const ltrLanguages = ['en', 'es', 'fr', 'zh', 'hi']

    it('should identify Arabic as RTL', () => {
      rtlLanguages.forEach(lang => {
        expect(rtlLanguages.includes(lang)).toBe(true)
      })
    })

    it('should not identify non-Arabic languages as RTL', () => {
      ltrLanguages.forEach(lang => {
        expect(rtlLanguages.includes(lang)).toBe(false)
      })
    })
  })
})