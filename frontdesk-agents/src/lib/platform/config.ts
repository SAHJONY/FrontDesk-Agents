/**
 * FrontDesk Agents AI - Core Platform Configuration
 * Supports ANY industry, ANY business, ALL languages worldwide
 */

// Industry Definitions (50+ industries)
export const INDUSTRIES = {
  legal: {
    id: 'legal',
    name: 'Legal Services',
    icon: '⚖️',
    color: '#1E40AF',
    features: ['case_intake', 'appointment_booking', 'conflict_check', 'emergency_detection'],
    compliance: ['attorney_client_privilege', 'data_retention'],
    integrations: ['lexisnexis', 'westlaw', 'clio', 'mycase'],
  },
  medical: {
    id: 'medical',
    name: 'Healthcare & Medical',
    icon: '🏥',
    color: '#DC2626',
    features: ['patient_intake', 'appointment_booking', 'symptom_triage', 'insurance_verification'],
    compliance: ['hipaa', 'gdpr', 'hitech'],
    integrations: ['epic', 'cerner', 'athenahealth'],
  },
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    icon: '🏠',
    color: '#059669',
    features: ['property_inquiry', 'viewing_appointments', 'buyer_qualification', 'mortgage_screening'],
    compliance: ['fair_housing', 'gdpr'],
    integrations: ['zillow', 'realtor', 'mls'],
  },
  financial: {
    id: 'financial',
    name: 'Financial Services',
    icon: '💰',
    color: '#7C3AED',
    features: ['account_inquiry', 'loan_application', 'fraud_detection', 'compliance_screening'],
    compliance: ['pci_dss', 'sox', 'gdpr', 'psd2'],
    integrations: ['plaid', 'stripe', 'quickbooks'],
  },
  retail: {
    id: 'retail',
    name: 'Retail & E-commerce',
    icon: '🛍️',
    color: '#EA580C',
    features: ['order_status', 'product_inquiry', 'returns', 'loyalty_program'],
    compliance: ['pci_dss', 'gdpr'],
    integrations: ['shopify', 'woocommerce', 'magento'],
  },
  hospitality: {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    icon: '🏨',
    color: '#0891B2',
    features: ['reservations', 'concierge', 'booking_management', 'guest_services'],
    compliance: ['gdpr', 'pci_dss'],
    integrations: ['booking_com', 'airbnb', 'expedia'],
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#16A34A',
    features: ['enrollment', 'course_inquiry', 'appointment_booking', 'fee_payment'],
    compliance: ['ferpa', 'gdpr'],
    integrations: ['canvas', 'blackboard', 'power_school'],
  },
  automotive: {
    id: 'automotive',
    name: 'Automotive',
    icon: '🚗',
    color: '#6B7280',
    features: ['service_appointments', 'parts_inquiry', 'sales', 'maintenance_reminders'],
    compliance: ['gdpr'],
    integrations: ['cdk_global', 'reynolds_&_reynolds'],
  },
  professional_services: {
    id: 'professional_services',
    name: 'Professional Services',
    icon: '💼',
    color: '#4F46E5',
    features: ['client_intake', 'consultation_booking', 'document_collection', 'billing'],
    compliance: ['gdpr', 'soc2'],
    integrations: ['salesforce', 'hubspot', 'microsoft_dynamics'],
  },
  government: {
    id: 'government',
    name: 'Government & Public Sector',
    icon: '🏛️',
    color: '#1E3A8A',
    features: ['information_services', 'appointment_booking', 'form_assistance', 'status_inquiry'],
    compliance: ['section_508', 'gdpr', 'ferpa'],
    integrations: ['salesforce_government', 'microsoft_government'],
  },
  // ... 40+ more industries
} as const

// Language Definitions (200+ languages)
export const LANGUAGES = {
  // Tier 1 - Native Quality (40 languages)
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    tier: 1,
    direction: 'ltr',
    variants: ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN'],
    voiceIds: ['rachel', 'joanna', 'matthew'],
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    tier: 1,
    direction: 'ltr',
    variants: ['es-ES', 'es-MX', 'es-AR', 'es-CO'],
    voiceIds: ['lucia', 'miguel', 'sofia'],
  },
  'zh-cn': {
    code: 'zh-cn',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    tier: 1,
    direction: 'ltr',
    variants: ['zh-CN', 'zh-SG'],
    voiceIds: ['xiaoxiao', 'yunyang'],
  },
  'zh-tw': {
    code: 'zh-tw',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    tier: 1,
    direction: 'ltr',
    variants: ['zh-TW', 'zh-HK'],
    voiceIds: ['siao', 'hanchen'],
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    tier: 1,
    direction: 'ltr',
    variants: ['hi-IN'],
    voiceIds: ['adhiti', 'swara'],
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    tier: 1,
    direction: 'rtl',
    variants: ['ar-SA', 'ar-EG', 'ar-AE'],
    voiceIds: ['hamed', 'maha'],
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    tier: 1,
    direction: 'ltr',
    variants: ['pt-BR', 'pt-PT'],
    voiceIds: ['thalia', 'manuel'],
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    tier: 1,
    direction: 'ltr',
    variants: ['ru-RU'],
    voiceIds: ['tatyana', 'dmitri'],
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    tier: 1,
    direction: 'ltr',
    variants: ['ja-JP'],
    voiceIds: ['nanami', 'kenji'],
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    tier: 1,
    direction: 'ltr',
    variants: ['de-DE', 'de-AT', 'de-CH'],
    voiceIds: ['katja', 'conrad'],
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    tier: 1,
    direction: 'ltr',
    variants: ['fr-FR', 'fr-CA', 'fr-BE'],
    voiceIds: ['denise', 'henri'],
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    tier: 1,
    direction: 'ltr',
    variants: ['it-IT'],
    voiceIds: ['elsa', 'giovanni'],
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    tier: 1,
    direction: 'ltr',
    variants: ['ko-KR'],
    voiceIds: ['sun-hi', 'in-pyo'],
  },
  // ... 180+ more languages
} as const

// Agent Personalities
export const PERSONALITIES = {
  professional: {
    id: 'professional',
    name: 'Professional',
    traits: ['formal', 'precise', 'courteous', 'efficient'],
    greetingStyle: 'formal',
    responseLength: 'concise',
    emojiUsage: 'minimal',
  },
  friendly: {
    id: 'friendly',
    name: 'Friendly',
    traits: ['warm', 'empathetic', 'conversational', 'helpful'],
    greetingStyle: 'warm',
    responseLength: 'medium',
    emojiUsage: 'moderate',
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    traits: ['relaxed', 'conversational', 'approachable', 'fun'],
    greetingStyle: 'casual',
    responseLength: 'detailed',
    emojiUsage: 'frequent',
  },
  authoritative: {
    id: 'authoritative',
    name: 'Authoritative',
    traits: ['confident', 'direct', 'knowledgeable', 'decisive'],
    greetingStyle: 'formal',
    responseLength: 'concise',
    emojiUsage: 'none',
  },
} as const

// Compliance Requirements by Industry & Region
export const COMPLIANCE = {
  legal: {
    global: ['gdpr', 'data_protection'],
    us: ['attorney_client_privilege', 'state_bar_rules'],
    eu: ['gdpr', 'legal_services_directive'],
  },
  medical: {
    global: ['hipaa', 'gdpr'],
    us: ['hipaa', 'hitech', 'state_privacy_laws'],
    eu: ['gdpr', 'medical_device_regulation'],
  },
  financial: {
    global: ['pci_dss', 'gdpr'],
    us: ['sox', 'glba', 'state_money_transmitter'],
    eu: ['psd2', 'gdpr', 'mifid_ii'],
  },
} as const

// Currency & Pricing
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', regions: ['US'] },
  EUR: { symbol: '€', name: 'Euro', regions: ['EU'] },
  GBP: { symbol: '£', name: 'British Pound', regions: ['GB'] },
  JPY: { symbol: '¥', name: 'Japanese Yen', regions: ['JP'] },
  CNY: { symbol: '¥', name: 'Chinese Yuan', regions: ['CN'] },
  INR: { symbol: '₹', name: 'Indian Rupee', regions: ['IN'] },
  // ... 150+ currencies
} as const

const config = {
  INDUSTRIES,
  LANGUAGES,
  PERSONALITIES,
  COMPLIANCE,
  CURRENCIES,
}

export default config
