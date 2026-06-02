'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  success: (title: string, message?: string) => string
  error: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
  loading: (title: string, message?: string) => string
}

// ─── Context ────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// ─── Icons ──────────────────────────────────────────────

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertTriangle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  loading: <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />,
}

const borderColors: Record<ToastType, string> = {
  success: 'border-green-500/40',
  error: 'border-red-500/40',
  info: 'border-blue-500/40',
  loading: 'border-yellow-500/40',
}

// ─── Component ──────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((prev) => [...prev, { ...toast, id }])

      // Auto-dismiss for non-loading toasts
      // loading toasts don't auto-dismiss; errors get 6s, others get 4s
  const duration = toast.duration ?? (toast.type === 'loading' ? Infinity : toast.type === 'error' ? 6000 : 4000)
      setTimeout(() => removeToast(id), duration)

      return id
    },
    [removeToast]
  )

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  )
  const error = useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  )
  const info = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  )
  const loading = useCallback(
    (title: string, message?: string) => addToast({ type: 'loading', title, message }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, loading }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto p-4 rounded-xl backdrop-blur-xl border ${
                borderColors[toast.type]
              } bg-black/80 shadow-2xl shadow-black/50`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  {toast.message && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{toast.message}</p>
                  )}
                </div>
                <button
                  data-testid="close-toast"
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
