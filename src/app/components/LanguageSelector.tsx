'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

interface LanguageSelectorProps {
  currentLang?: string
  onChange?: (lang: string) => void
}

export default function LanguageSelector({ currentLang = 'en', onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(currentLang)

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setSelectedLang(savedLang)
  }, [])

  const handleSelect = (langCode: string) => {
    setSelectedLang(langCode)
    setIsOpen(false)
    localStorage.setItem('preferred-language', langCode)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: langCode }))
    if (onChange) {
      onChange(langCode)
    }
  }

  const currentLanguage = languages.find(l => l.code === selectedLang) || languages[0]

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors'
      >
        <Globe className='w-4 h-4 text-gray-300' />
        <span className='text-sm text-gray-300'>{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
      </button>
      
      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden z-50'>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                selectedLang === lang.code ? 'bg-green-500/20' : ''
              }`}
            >
              <span className='text-lg'>{lang.flag}</span>
              <span className='text-sm text-white'>{lang.name}</span>
              {selectedLang === lang.code && (
                <span className='ml-auto text-green-500 text-xs'>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}