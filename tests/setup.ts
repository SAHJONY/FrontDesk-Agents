import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
})

// Restore default CustomEvent behavior in tests
// CustomEvent is already available in jsdom, no mock needed

// Mock window.addEventListener and removeEventListener
window.addEventListener = vi.fn()
window.removeEventListener = vi.fn()