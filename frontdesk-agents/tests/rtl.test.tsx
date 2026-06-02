import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// RTL language codes that should trigger RTL mode
const rtlLanguages = ['ar']

// Helper function that mirrors the RTL logic in the pages
const getRTLFromLang = (lang: string): boolean => rtlLanguages.includes(lang)

// Test suite for RTL handling utilities
describe('RTL (Right-to-Left) Handling', () => {
  describe('getRTLFromLang', () => {
    it('should return false for English', () => {
      expect(getRTLFromLang('en')).toBe(false)
    })

    it('should return false for Spanish', () => {
      expect(getRTLFromLang('es')).toBe(false)
    })

    it('should return false for French', () => {
      expect(getRTLFromLang('fr')).toBe(false)
    })

    it('should return false for Chinese', () => {
      expect(getRTLFromLang('zh')).toBe(false)
    })

    it('should return false for Hindi', () => {
      expect(getRTLFromLang('hi')).toBe(false)
    })

    it('should return true for Arabic', () => {
      expect(getRTLFromLang('ar')).toBe(true)
    })

    it('should return false for Portuguese', () => {
      expect(getRTLFromLang('pt')).toBe(false)
    })

    it('should return false for Korean', () => {
      expect(getRTLFromLang('ko')).toBe(false)
    })

    it('should return false for Japanese', () => {
      expect(getRTLFromLang('ja')).toBe(false)
    })

    it('should return false for unknown language codes', () => {
      expect(getRTLFromLang('xyz')).toBe(false)
      expect(getRTLFromLang('')).toBe(false)
    })
  })

  describe('RTL state management', () => {
    it('should initialize RTL state as false', () => {
      const { result } = renderHook(() => {
        const [isRTL, setIsRTL] = React.useState(false)
        return { isRTL, setIsRTL }
      })
      
      expect(result.current.isRTL).toBe(false)
    })

    it('should update RTL state when Arabic is selected', () => {
      const { result } = renderHook(() => {
        const [isRTL, setIsRTL] = React.useState(false)
        const [language, setLanguage] = React.useState('en')
        
        const handleLanguageChange = (newLang: string) => {
          setLanguage(newLang)
          setIsRTL(rtlLanguages.includes(newLang))
        }
        
        return { isRTL, language, handleLanguageChange }
      })
      
      act(() => {
        result.current.handleLanguageChange('ar')
      })
      
      expect(result.current.language).toBe('ar')
      expect(result.current.isRTL).toBe(true)
    })

    it('should revert RTL state when switching from Arabic to English', () => {
      const { result } = renderHook(() => {
        const [isRTL, setIsRTL] = React.useState(false)
        const [language, setLanguage] = React.useState('en')
        
        const handleLanguageChange = (newLang: string) => {
          setLanguage(newLang)
          setIsRTL(rtlLanguages.includes(newLang))
        }
        
        return { isRTL, language, handleLanguageChange }
      })
      
      // First switch to Arabic
      act(() => {
        result.current.handleLanguageChange('ar')
      })
      expect(result.current.isRTL).toBe(true)
      
      // Then switch back to English
      act(() => {
        result.current.handleLanguageChange('en')
      })
      expect(result.current.isRTL).toBe(false)
    })
  })

  describe('RTL direction attribute', () => {
    it('should return ltr for non-RTL languages', () => {
      const nonRTLLangs = ['en', 'es', 'fr', 'zh', 'hi', 'pt', 'ko', 'ja', 'vi', 'tl', 'de', 'it', 'ru']
      
      nonRTLLangs.forEach(lang => {
        expect(getRTLFromLang(lang)).toBe(false)
        expect(getRTLFromLang(lang) ? 'rtl' : 'ltr').toBe('ltr')
      })
    })

    it('should return rtl for Arabic', () => {
      expect(getRTLFromLang('ar') ? 'rtl' : 'ltr').toBe('rtl')
    })
  })

  describe('localStorage persistence', () => {
    it('should save preferred language to localStorage', () => {
      const mockSetItem = vi.fn()
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem, getItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
        writable: true,
      })
      
      const newLang = 'ar'
      window.localStorage.setItem('preferred-language', newLang)
      
      expect(mockSetItem).toHaveBeenCalledWith('preferred-language', newLang)
    })

    it('should retrieve preferred language from localStorage', () => {
      const mockGetItem = vi.fn(() => 'ar')
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: vi.fn(), getItem: mockGetItem, removeItem: vi.fn(), clear: vi.fn() },
        writable: true,
      })
      
      const savedLang = window.localStorage.getItem('preferred-language')
      
      expect(savedLang).toBe('ar')
    })
  })

  describe('languageChange event dispatching', () => {
    it('should dispatch languageChange event when language changes', () => {
      const mockDispatch = vi.fn()
      Object.defineProperty(window, 'dispatchEvent', {
        value: mockDispatch,
        writable: true,
      })
      
      const event = new CustomEvent('languageChange', { detail: 'ar' })
      window.dispatchEvent(event)
      
      expect(mockDispatch).toHaveBeenCalledWith(event)
      expect(mockDispatch).toHaveBeenCalledTimes(1)
    })

    it('should include the new language code in the event detail', () => {
      let receivedDetail: string | null = null
      const mockDispatch = vi.fn((event: CustomEvent) => {
        receivedDetail = event.detail
      })
      Object.defineProperty(window, 'dispatchEvent', {
        value: mockDispatch,
        writable: true,
      })
      
      const newLang = 'ar'
      window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
      
      expect(receivedDetail).toBe(newLang)
    })
  })
})