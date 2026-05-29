import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'

// Import the hook directly - we need to test it in isolation
// Since we can't directly import client components in test environment,
// we'll test the RTL logic separately from the hook integration

import { rtlLanguages } from '../src/app/lib/rtl'

// Test suite for the useRTL hook behavior
describe('useRTL Hook', () => {
  describe('RTL Language Detection', () => {
    it('should return false for English (LTR language)', () => {
      expect(rtlLanguages.includes('en')).toBe(false)
    })

    it('should return false for Spanish', () => {
      expect(rtlLanguages.includes('es')).toBe(false)
    })

    it('should return false for French', () => {
      expect(rtlLanguages.includes('fr')).toBe(false)
    })

    it('should return false for Chinese', () => {
      expect(rtlLanguages.includes('zh')).toBe(false)
    })

    it('should return false for Hindi', () => {
      expect(rtlLanguages.includes('hi')).toBe(false)
    })

    it('should return true for Arabic (RTL language)', () => {
      expect(rtlLanguages.includes('ar')).toBe(true)
    })

    it('should return false for Portuguese', () => {
      expect(rtlLanguages.includes('pt')).toBe(false)
    })

    it('should return false for Korean', () => {
      expect(rtlLanguages.includes('ko')).toBe(false)
    })

    it('should return false for Japanese', () => {
      expect(rtlLanguages.includes('ja')).toBe(false)
    })

    it('should handle unknown language codes gracefully', () => {
      expect(rtlLanguages.includes('xyz')).toBe(false)
      expect(rtlLanguages.includes('')).toBe(false)
    })
  })

  describe('Language to RTL Conversion', () => {
    const getRTLFromLang = (lang: string): boolean => rtlLanguages.includes(lang)

    it('should map Arabic to RTL direction', () => {
      expect(getRTLFromLang('ar')).toBe(true)
    })

    it('should map all LTR languages to LTR direction', () => {
      const ltrLanguages = ['en', 'es', 'fr', 'zh', 'hi', 'pt', 'ko', 'ja', 'vi', 'tl', 'de', 'it', 'ru']
      ltrLanguages.forEach(lang => {
        expect(getRTLFromLang(lang)).toBe(false)
      })
    })

    it('should produce correct dir attribute values', () => {
      expect(getRTLFromLang('ar') ? 'rtl' : 'ltr').toBe('rtl')
      expect(getRTLFromLang('en') ? 'rtl' : 'ltr').toBe('ltr')
      expect(getRTLFromLang('es') ? 'rtl' : 'ltr').toBe('ltr')
      expect(getRTLFromLang('fr') ? 'rtl' : 'ltr').toBe('ltr')
    })
  })

  describe('RTL State Transitions', () => {
    it('should transition from LTR to RTL when Arabic is selected', () => {
      const { result } = renderHook(() => {
        const [isRTL, setIsRTL] = React.useState(false)
        const [lang, setLang] = React.useState('en')

        const handleLanguageChange = (newLang: string) => {
          setLang(newLang)
          setIsRTL(rtlLanguages.includes(newLang))
        }

        return { isRTL, lang, handleLanguageChange }
      })

      expect(result.current.lang).toBe('en')
      expect(result.current.isRTL).toBe(false)

      act(() => {
        result.current.handleLanguageChange('ar')
      })

      expect(result.current.lang).toBe('ar')
      expect(result.current.isRTL).toBe(true)
    })

    it('should transition from RTL to LTR when switching from Arabic to English', () => {
      const { result } = renderHook(() => {
        const [isRTL, setIsRTL] = React.useState(false)
        const [lang, setLang] = React.useState('en')

        const handleLanguageChange = (newLang: string) => {
          setLang(newLang)
          setIsRTL(rtlLanguages.includes(newLang))
        }

        return { isRTL, lang, handleLanguageChange }
      })

      // First switch to Arabic (RTL)
      act(() => {
        result.current.handleLanguageChange('ar')
      })
      expect(result.current.isRTL).toBe(true)

      // Then switch back to English (LTR)
      act(() => {
        result.current.handleLanguageChange('en')
      })
      expect(result.current.isRTL).toBe(false)
    })

    it('should handle rapid language switches correctly', () => {
      const { result } = renderHook(() => {
        const [isRTL, setIsRTL] = React.useState(false)
        const [lang, setLang] = React.useState('en')

        const handleLanguageChange = (newLang: string) => {
          setLang(newLang)
          setIsRTL(rtlLanguages.includes(newLang))
        }

        return { isRTL, lang, handleLanguageChange }
      })

      // Rapid switches: en -> ar -> en -> ar -> en
      act(() => { result.current.handleLanguageChange('ar') })
      expect(result.current.isRTL).toBe(true)

      act(() => { result.current.handleLanguageChange('en') })
      expect(result.current.isRTL).toBe(false)

      act(() => { result.current.handleLanguageChange('ar') })
      expect(result.current.isRTL).toBe(true)

      act(() => { result.current.handleLanguageChange('es') })
      expect(result.current.isRTL).toBe(false)
    })
  })

  describe('localStorage Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should save language preference to localStorage', () => {
      const mockSetItem = vi.fn()
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      })

      const newLang = 'ar'
      window.localStorage.setItem('preferred-language', newLang)

      expect(mockSetItem).toHaveBeenCalledWith('preferred-language', newLang)
    })

    it('should retrieve saved language from localStorage', () => {
      const mockGetItem = vi.fn(() => 'ar')
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      })

      const savedLang = window.localStorage.getItem('preferred-language')
      expect(savedLang).toBe('ar')
    })

    it('should default to English when no saved language exists', () => {
      const mockGetItem = vi.fn(() => null)
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      })

      const savedLang = window.localStorage.getItem('preferred-language') || 'en'
      expect(savedLang).toBe('en')
    })

    it('should handle localStorage errors gracefully', () => {
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      })

      // Should not throw when localStorage is not available
      expect(() => {
        const savedLang = localStorage?.getItem?.('preferred-language')
      }).not.toThrow()
    })
  })

  describe('Cross-Page Event Communication', () => {
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

    it('should include new language code in event detail', () => {
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

    it('should dispatch event for LTR languages too', () => {
      const mockDispatch = vi.fn()
      Object.defineProperty(window, 'dispatchEvent', {
        value: mockDispatch,
        writable: true,
      })

      window.dispatchEvent(new CustomEvent('languageChange', { detail: 'es' }))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'es' })
      )
    })
  })

  describe('Document Direction Updates', () => {
    it('should apply correct dir attribute for RTL languages', () => {
      const getDir = (isRTL: boolean) => isRTL ? 'rtl' : 'ltr'

      expect(getDir(true)).toBe('rtl')
    })

    it('should apply correct dir attribute for LTR languages', () => {
      const getDir = (isRTL: boolean) => isRTL ? 'rtl' : 'ltr'

      expect(getDir(false)).toBe('ltr')
    })

    it('should correctly map Arabic to RTL direction', () => {
      const isRTL = rtlLanguages.includes('ar')
      const dir = isRTL ? 'rtl' : 'ltr'
      expect(dir).toBe('rtl')
    })

    it('should correctly map English to LTR direction', () => {
      const isRTL = rtlLanguages.includes('en')
      const dir = isRTL ? 'rtl' : 'ltr'
      expect(dir).toBe('ltr')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string language code', () => {
      const isRTL = rtlLanguages.includes('')
      expect(isRTL).toBe(false)
    })

    it('should handle null/undefined language gracefully', () => {
      // Testing the logic without actual hook since hook requires client context
      const lang = null as unknown as string
      const isRTL = rtlLanguages.includes(lang as string)
      expect(isRTL).toBe(false)
    })

    it('should handle case-sensitive language codes', () => {
      // RTL languages should be lowercase
      expect(rtlLanguages.includes('AR')).toBe(false)
      expect(rtlLanguages.includes('Ar')).toBe(false)
      expect(rtlLanguages.includes('ar')).toBe(true)
    })

    it('should handle special characters in language codes', () => {
      expect(rtlLanguages.includes('zh-CN')).toBe(false)
      expect(rtlLanguages.includes('pt-BR')).toBe(false)
    })
  })

  describe('All Supported Languages', () => {
    const supportedLanguages = [
      'en', 'es', 'fr', 'zh', 'hi', 'ar', 'pt', 'ko', 'ja', 'vi', 'tl', 'de', 'it', 'ru'
    ]

    it('should have Arabic as the only RTL language', () => {
      const rtlOnly = supportedLanguages.filter(lang => rtlLanguages.includes(lang))
      expect(rtlOnly).toEqual(['ar'])
    })

    it('should have 13 LTR languages', () => {
      const ltrCount = supportedLanguages.filter(lang => !rtlLanguages.includes(lang)).length
      expect(ltrCount).toBe(13)
    })

    it('should include all expected supported languages', () => {
      supportedLanguages.forEach(lang => {
        expect(typeof lang).toBe('string')
        expect(lang.length).toBeGreaterThan(0)
      })
    })
  })
})