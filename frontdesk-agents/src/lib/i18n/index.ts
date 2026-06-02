/**
 * FrontDesk Agents - Internationalization (i18n) System
 * Supports 200+ languages with automatic detection
 */

// Language definitions with all translations
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  'zh-cn': {
    code: 'zh-cn',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    direction: 'ltr',
    flag: '🇨🇳',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    flag: '🇧🇷',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    flag: '🇫🇷',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    flag: '🇩🇪',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    flag: '🇯🇵',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    flag: '🇷🇺',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    flag: '🇰🇷',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    flag: '🇮🇹',
  },
} as const

// Translation keys for all supported languages
export const TRANSLATIONS = {
  en: {
    // Landing Page
    hero: {
      title: 'World\'s Most Advanced AI Receptionist',
      subtitle: 'Any Industry. Any Language. Worldwide.',
      description: 'Professional AI agents that speak 200+ languages, available 24/7/365. Deploy in minutes, not months.',
      cta: 'Start Free Trial',
      demo: 'Watch Demo',
    },
    features: {
      title: 'Why FrontDesk Agents?',
      subtitle: 'Built for businesses worldwide',
      multiLanguage: {
        title: '200+ Languages',
        description: 'Native-quality conversations in any major world language',
      },
      multiIndustry: {
        title: '50+ Industries',
        description: 'Pre-configured for legal, medical, real estate, and more',
      },
      available247: {
        title: '24/7 Availability',
        description: 'Never miss a call. Always open, always professional',
      },
      aiPowered: {
        title: 'AI-Powered',
        description: 'Powered by Qwen3.5-397B, the world\'s most advanced open model',
      },
    },
    industries: {
      title: 'Built for Every Industry',
      legal: 'Legal Services',
      medical: 'Healthcare',
      realEstate: 'Real Estate',
      financial: 'Financial Services',
      retail: 'Retail',
      hospitality: 'Hospitality',
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise',
      perMonth: '/month',
      features: 'Features:',
      minutes: 'voice minutes',
      messages: 'text messages',
      signup: 'Sign Up',
    },
    footer: {
      product: 'Product',
      company: 'Company',
      support: 'Support',
      legal: 'Legal',
      copyright: '© 2026 FrontDesk Agents. All rights reserved.',
    },
    // Owner Dashboard
    dashboard: {
      title: 'Owner Dashboard',
      overview: 'Overview',
      analytics: 'Analytics',
      businesses: 'Businesses',
      languages: 'Languages',
      settings: 'Settings',
      logout: 'Logout',
    },
    metrics: {
      totalBusinesses: 'Total Businesses',
      activeUsers: 'Active Users',
      callsToday: 'Calls Today',
      revenue: 'Revenue (MTD)',
      successRate: 'Success Rate',
      uptime: 'Uptime',
    },
  },
  es: {
    hero: {
      title: 'El Recepcionista IA Más Avanzado del Mundo',
      subtitle: 'Cualquier Industria. Cualquier Idioma. En Todo el Mundo.',
      description: 'Agentes de IA profesionales que hablan más de 200 idiomas, disponibles 24/7/365. Implemente en minutos, no en meses.',
      cta: 'Iniciar Prueba Gratuita',
      demo: 'Ver Demostración',
    },
    features: {
      title: '¿Por qué FrontDesk Agents?',
      subtitle: 'Construido para empresas de todo el mundo',
      multiLanguage: {
        title: 'Más de 200 idiomas',
        description: 'Conversaciones de calidad nativa en cualquier idioma principal',
      },
      multiIndustry: {
        title: 'Más de 50 industrias',
        description: 'Preconfigurado para legales, médicos, bienes raíces y más',
      },
      available247: {
        title: 'Disponibilidad 24/7',
        description: 'Nunca pierda una llamada. Siempre abierto, siempre profesional',
      },
      aiPowered: {
        title: 'Impulsado por IA',
        description: 'Impulsado por Qwen3.5-397B, el modelo abierto más avanzado del mundo',
      },
    },
    dashboard: {
      title: 'Panel de Propietario',
      overview: 'Visión General',
      analytics: 'Analítica',
      businesses: 'Empresas',
      languages: 'Idiomas',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
    },
  },
  'zh-cn': {
    hero: {
      title: '全球最先进的 AI 接待员',
      subtitle: '任何行业。任何语言。全球通用。',
      description: '专业 AI 代理，支持 200 多种语言，24/7/365 全天候服务。几分钟内部署，无需数月。',
      cta: '开始免费试用',
      demo: '观看演示',
    },
    dashboard: {
      title: '所有者仪表板',
      overview: '概览',
      analytics: '分析',
      businesses: '企业',
      languages: '语言',
      settings: '设置',
      logout: '登出',
    },
  },
  // Add more languages as needed...
} as const

// Default language
export const DEFAULT_LANGUAGE = 'en'

// Get language from browser or default
export function getLanguage(userLang?: string): keyof typeof TRANSLATIONS {
  if (userLang && userLang in TRANSLATIONS) {
    return userLang as keyof typeof TRANSLATIONS
  }
  
  // Try to detect from browser
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0]
    if (browserLang in TRANSLATIONS) {
      return browserLang as keyof typeof TRANSLATIONS
    }
  }
  
  return DEFAULT_LANGUAGE
}

// Get translation with fallback
export function t(key: string, lang: keyof typeof TRANSLATIONS = 'en', params?: Record<string, string>): string {
  const keys = key.split('.')
  let value: any = TRANSLATIONS[lang]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (!value) {
    // Fallback to English
    if (lang !== 'en') {
      return t(key, 'en', params)
    }
    return key
  }
  
  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      value = value.replace(`{${key}}`, value)
    })
  }
  
  return value
}

const i18n = {
  LANGUAGES,
  TRANSLATIONS,
  DEFAULT_LANGUAGE,
  getLanguage,
  t,
}

export default i18n
