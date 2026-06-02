'use client'

import { useToast } from '@/components/ToastProvider'
import { useCallback } from 'react'

/**
 * useRefreshWithToast
 *
 * Encapsulates the common pattern of showing success/error toast notifications
 * around data refresh actions. Extracts the specific toast messages so callers
 * don't need to repeat them.
 *
 * Usage:
 *   const { notifySuccess, notifyError } = useRefreshWithToast()
 *
 *   // Inside fetch callback with showToast flag:
 *   if (showToast) notifySuccess()
 *   if (showToast) notifyError(msg)
 */
export function useRefreshWithToast() {
  const { success, error: toastError } = useToast()

  const notifySuccess = useCallback(() => {
    success('Dashboard refreshed', 'Data updated successfully')
  }, [success])

  const notifyError = useCallback(
    (msg: string) => {
      toastError('Refresh failed', msg)
    },
    [toastError]
  )

  return { notifySuccess, notifyError }
}
