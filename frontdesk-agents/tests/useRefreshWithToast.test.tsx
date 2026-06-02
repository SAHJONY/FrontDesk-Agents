import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}))

import { useRefreshWithToast } from '@/hooks/useRefreshWithToast'

describe('useRefreshWithToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns notifySuccess and notifyError functions', () => {
    const { result } = renderHook(() => useRefreshWithToast())
    expect(result.current.notifySuccess).toBeDefined()
    expect(typeof result.current.notifySuccess).toBe('function')
    expect(result.current.notifyError).toBeDefined()
    expect(typeof result.current.notifyError).toBe('function')
  })

  describe('notifySuccess', () => {
    it('calls success with correct messages', () => {
      const { result } = renderHook(() => useRefreshWithToast())
      result.current.notifySuccess()
      expect(mockSuccess).toHaveBeenCalledWith(
        'Dashboard refreshed',
        'Data updated successfully'
      )
    })

    it('calls success exactly once per invocation', () => {
      const { result } = renderHook(() => useRefreshWithToast())
      result.current.notifySuccess()
      result.current.notifySuccess()
      expect(mockSuccess).toHaveBeenCalledTimes(2)
    })
  })

  describe('notifyError', () => {
    it('calls error with correct messages', () => {
      const { result } = renderHook(() => useRefreshWithToast())
      result.current.notifyError('Something went wrong')
      expect(mockError).toHaveBeenCalledWith(
        'Refresh failed',
        'Something went wrong'
      )
    })

    it('passes through different error messages', () => {
      const { result } = renderHook(() => useRefreshWithToast())
      result.current.notifyError('Network error')
      expect(mockError).toHaveBeenCalledWith('Refresh failed', 'Network error')

      result.current.notifyError('500 Internal Server Error')
      expect(mockError).toHaveBeenCalledWith(
        'Refresh failed',
        '500 Internal Server Error'
      )
    })
  })
})
