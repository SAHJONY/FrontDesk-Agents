'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseThemeReturn {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

/**
 * Centralized theme state management hook.
 * Handles:
 * - Dark/light mode state with localStorage persistence
 * - System preference detection on first visit
 * - Theme toggle function
 * - Cross-page synchronization via custom events
 * 
 * Usage:
 * ```tsx
 * const { isDark, toggleTheme } = useTheme()
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [isDark, setIsDark] = useState(true)

  // Load saved theme from localStorage on mount, default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred-theme')
    if (savedTheme !== null) {
      setIsDark(savedTheme === 'dark')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
    }
  }, [])

  // Sync with document class for Tailwind dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Listen for theme changes from other pages (cross-page sync)
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail === 'dark')
    }
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev
      localStorage.setItem('preferred-theme', newValue ? 'dark' : 'light')
      // Dispatch event to sync with other pages
      window.dispatchEvent(new CustomEvent('themeChange', { detail: newValue ? 'dark' : 'light' }))
      return newValue
    })
  }, [])

  const setTheme = useCallback((isDark: boolean) => {
    setIsDark(isDark)
    localStorage.setItem('preferred-theme', isDark ? 'dark' : 'light')
    // Dispatch event to sync with other pages
    window.dispatchEvent(new CustomEvent('themeChange', { detail: isDark ? 'dark' : 'light' }))
  }, [])

  return {
    isDark,
    toggleTheme,
    setTheme,
  }
}