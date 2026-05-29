// RTL language codes
export const rtlLanguages: string[] = ['ar']

// Check if a language code is RTL
export function getRTLFromLang(lang: string): boolean {
  return rtlLanguages.includes(lang as typeof rtlLanguages[number])
}

// Get initial RTL state from stored language preference
export function getInitialRTL(): boolean {
  if (typeof window === 'undefined') return false
  const storedLang = localStorage.getItem('preferred-language')
  return storedLang ? getRTLFromLang(storedLang) : false
}