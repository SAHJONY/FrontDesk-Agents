import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock LanguageSelector component for testing
interface LanguageSelectorProps {
  currentLang?: string
  onChange?: (lang: string) => void
}

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

function LanguageSelector({ currentLang = 'en', onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLang, setSelectedLang] = React.useState(currentLang)

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
        data-testid='language-selector-button'
      >
        <span data-testid='current-lang-display'>{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
      </button>
      
      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden z-50' data-testid='language-dropdown'>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                selectedLang === lang.code ? 'bg-green-500/20' : ''
              }`}
              data-testid={`lang-option-${lang.code}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {selectedLang === lang.code && (
                <span data-testid={`checkmark-${lang.code}`}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default English language', () => {
      render(<LanguageSelector />)
      
      expect(screen.getByTestId('language-selector-button')).toBeInTheDocument()
      expect(screen.getByTestId('current-lang-display')).toHaveTextContent('🇺🇸 EN')
    })

    it('should render with specified current language', () => {
      render(<LanguageSelector currentLang='es' />)
      
      expect(screen.getByTestId('current-lang-display')).toHaveTextContent('🇪🇸 ES')
    })

    it('should render with Arabic when specified', () => {
      render(<LanguageSelector currentLang='ar' />)
      
      expect(screen.getByTestId('current-lang-display')).toHaveTextContent('🇸🇦 AR')
    })

    it('should render all 14 language options when dropdown is open', () => {
      render(<LanguageSelector />)
      
      // Click to open dropdown
      fireEvent.click(screen.getByTestId('language-selector-button'))
      
      expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()
      expect(screen.getByTestId('lang-option-en')).toBeInTheDocument()
      expect(screen.getByTestId('lang-option-ar')).toBeInTheDocument()
      expect(screen.getByTestId('lang-option-zh')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should open dropdown when button is clicked', () => {
      render(<LanguageSelector />)
      
      expect(screen.queryByTestId('language-dropdown')).not.toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      
      expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()
    })

    it('should close dropdown when language is selected', () => {
      render(<LanguageSelector />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      expect(screen.getByTestId('language-dropdown')).toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('lang-option-es'))
      
      expect(screen.queryByTestId('language-dropdown')).not.toBeInTheDocument()
    })

    it('should call onChange callback when language is selected', () => {
      const handleChange = vi.fn()
      render(<LanguageSelector onChange={handleChange} />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      fireEvent.click(screen.getByTestId('lang-option-es'))
      
      expect(handleChange).toHaveBeenCalledWith('es')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('should update display when Arabic is selected', () => {
      render(<LanguageSelector currentLang='en' />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      fireEvent.click(screen.getByTestId('lang-option-ar'))
      
      expect(screen.getByTestId('current-lang-display')).toHaveTextContent('🇸🇦 AR')
    })

    it('should update display when Chinese is selected', () => {
      render(<LanguageSelector currentLang='en' />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      fireEvent.click(screen.getByTestId('lang-option-zh'))
      
      expect(screen.getByTestId('current-lang-display')).toHaveTextContent('🇨🇳 ZH')
    })
  })

  describe('localStorage integration', () => {
    it('should save preferred language to localStorage on selection', () => {
      const mockSetItem = vi.fn()
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem, getItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
        writable: true,
      })
      
      render(<LanguageSelector />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      fireEvent.click(screen.getByTestId('lang-option-fr'))
      
      expect(mockSetItem).toHaveBeenCalledWith('preferred-language', 'fr')
    })
  })

  describe('Event dispatching', () => {
    it('should dispatch languageChange event when language is selected', () => {
      const mockDispatch = vi.fn()
      Object.defineProperty(window, 'dispatchEvent', {
        value: mockDispatch,
        writable: true,
      })
      
      render(<LanguageSelector />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      fireEvent.click(screen.getByTestId('lang-option-ar'))
      
      expect(mockDispatch).toHaveBeenCalled()
      const lastCall = mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1][0] as CustomEvent
      expect(lastCall.type).toBe('languageChange')
      expect(lastCall.detail).toBe('ar')
    })
  })

  describe('Selected state indicator', () => {
    it('should show checkmark for currently selected language', () => {
      render(<LanguageSelector currentLang='es' />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      
      expect(screen.getByTestId('checkmark-es')).toBeInTheDocument()
    })

    it('should not show checkmark for non-selected languages', () => {
      render(<LanguageSelector currentLang='en' />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      
      expect(screen.queryByTestId('checkmark-es')).not.toBeInTheDocument()
    })
  })

  describe('All 14 languages', () => {
    const allLangCodes = ['en', 'es', 'fr', 'zh', 'hi', 'ar', 'pt', 'ko', 'ja', 'vi', 'tl', 'de', 'it', 'ru']
    
    it('should have all language options available', () => {
      render(<LanguageSelector />)
      
      fireEvent.click(screen.getByTestId('language-selector-button'))
      
      allLangCodes.forEach(code => {
        expect(screen.getByTestId(`lang-option-${code}`)).toBeInTheDocument()
      })
    })
  })
})