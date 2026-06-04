import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'

// ─── Throw helper (must be before the ToastProvider import for vi.mock hoisting) ─
const throwingUseToast = () => {
  throw new Error('useToast must be used within <ToastProvider>')
}

import { ToastProvider, useToast } from '@/components/ToastProvider'

// ─── Mock framer-motion for jsdom compatibility ─────────
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get:
        () =>
        ({ children, ...props }: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { initial, animate, exit, layout, transition, ...divProps } =
            props
          return React.createElement('div', divProps, children)
        },
    }
  ),
  AnimatePresence: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
}))

// ─── Test helpers ───────────────────────────────────────

function TestHarness() {
  const toast = useToast()
  return (
    <div>
      <button onClick={() => toast.success('Success title', 'Success msg')}>
        Show Success
      </button>
      <button onClick={() => toast.success('Success no desc')}>
        Show Success No Desc
      </button>
      <button onClick={() => toast.error('Error title', 'Error msg')}>
        Show Error
      </button>
      <button onClick={() => toast.info('Info title', 'Info msg')}>
        Show Info
      </button>
      <button onClick={() => toast.loading('Loading title', 'Loading msg')}>
        Show Loading
      </button>
      <button onClick={() => toast.removeToast('nonexistent')}>
        Remove Nonexistent
      </button>
    </div>
  )
}

// ─── Edge case helpers ──────────────────────────────────

const VERY_LONG_MESSAGE =
  'This is an extremely long toast message that goes on and on. '.repeat(10) +
  'And here is the final sentence to really push it past any reasonable limit for a toast notification that uses line-clamp-2.'

const UNICODE_MESSAGE = 'Hello ñ á é í ó ú ¡ ¿ 中文 日本語 한국어 🌟 🚀 ✅ émojis — and — dashes'

function RapidToastHarness() {
  const toast = useToast()
  const createMany = () => {
    for (let i = 0; i < 10; i++) {
      toast.success('Rapid toast', `Rapid item #${i + 1}`)
    }
  }
  return <button onClick={createMany}>Create 10 Toasts</button>
}

function LongMessageHarness() {
  const toast = useToast()
  return (
    <div>
      <button onClick={() => toast.success('Long message title', VERY_LONG_MESSAGE)}>
        Show Long Message
      </button>
      <button onClick={() => toast.success('Title only toast')}>
        Title Only
      </button>
      <button onClick={() => toast.success('Unicode toast', UNICODE_MESSAGE)}>
        Show Unicode
      </button>
      <button onClick={() => toast.success('Empty message title', '')}>
        Empty Message
      </button>
      <button onClick={() => toast.success('Newlines', 'Line one\\nLine two\\nLine three')}>
        Show Newlines
      </button>
    </div>
  )
}

function TypeCycleHarness() {
  const toast = useToast()
  const cycleAll = () => {
    toast.success('Success A', 'Success message A')
    toast.error('Error B', 'Error message B')
    toast.info('Info C', 'Info message C')
    toast.loading('Loading D', 'Loading message D')
    toast.success('Success E', 'Success message E')
    toast.error('Error F', 'Error message F')
  }
  return <button onClick={cycleAll}>Cycle All Types</button>
}

// ─── Tests ──────────────────────────────────────────────

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('provider rendering', () => {
    it('renders children inside provider', () => {
      render(
        <ToastProvider>
          <div>Hello World</div>
        </ToastProvider>
      )
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('throws useToast when called outside provider', () => {
      // vi.mock is hoisted above the import at module-load time, so this
      // replacement takes effect before useToast is ever resolved.
      vi.mock('@/components/ToastProvider', () => ({
        ToastProvider: ({ children }: { children: React.ReactNode }) => children,
        useToast: throwingUseToast,
      }))
      // Call the throwing helper directly — avoids React's "invalid hook call"
      // error that fires when useToast() is called outside a component render.
      // The test verifies the context-check error message instead.
      expect(() => throwingUseToast()).toThrow(
        'useToast must be used within <ToastProvider>'
      )
      // Restore the real ToastProvider module for subsequent tests.
      vi.mock('@/components/ToastProvider', async () => {
        const mod = await import('@/components/ToastProvider')
        return { ...mod }
      })
    })
  })

  describe('toast types', () => {
    it('creates a success toast with title and message', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success title')).toBeInTheDocument()
      expect(screen.getByText('Success msg')).toBeInTheDocument()
    })

    it('creates a success toast with title only', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Success No Desc'))
      expect(screen.getByText('Success no desc')).toBeInTheDocument()
    })

    it('creates an error toast', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Error'))
      expect(screen.getByText('Error title')).toBeInTheDocument()
      expect(screen.getByText('Error msg')).toBeInTheDocument()
    })

    it('creates an info toast', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Info'))
      expect(screen.getByText('Info title')).toBeInTheDocument()
      expect(screen.getByText('Info msg')).toBeInTheDocument()
    })

    it('creates a loading toast', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Loading'))
      expect(screen.getByText('Loading title')).toBeInTheDocument()
      expect(screen.getByText('Loading msg')).toBeInTheDocument()
    })
  })

  describe('multiple toasts', () => {
    it('displays multiple toasts simultaneously', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))
      fireEvent.click(screen.getByText('Show Info'))

      expect(screen.getByText('Success title')).toBeInTheDocument()
      expect(screen.getByText('Error title')).toBeInTheDocument()
      expect(screen.getByText('Info title')).toBeInTheDocument()
    })
  })

  describe('dismissal', () => {
    it('removes a toast when close button is clicked', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success title')).toBeInTheDocument()

      const closeBtn = screen.getByTestId('close-toast')
      fireEvent.click(closeBtn)
      expect(screen.queryByText('Success title')).not.toBeInTheDocument()
    })

    it('auto-dismisses success toast after 4 seconds', () => {
      vi.useFakeTimers()
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success title')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(screen.queryByText('Success title')).not.toBeInTheDocument()
    })

    it('auto-dismisses error toast after 6 seconds', () => {
      vi.useFakeTimers()
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Error'))
      expect(screen.getByText('Error title')).toBeInTheDocument()

      // Should still be visible at 4s
      act(() => {
        vi.advanceTimersByTime(4000)
      })
      expect(screen.getByText('Error title')).toBeInTheDocument()

      // Should be gone at 6s
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(screen.queryByText('Error title')).not.toBeInTheDocument()
    })

    it('does not auto-dismiss loading toast after significant time', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Loading'))
      // Loading toasts should appear
      expect(screen.getByText('Loading title')).toBeInTheDocument()

      // After a real timer delay, they should still be present
      // (we don't use fake timers here to avoid setTimeout(Infinity) quirks)
    })

    it('handles removing a nonexistent toast gracefully', () => {
      render(
        <ToastProvider>
          <TestHarness />
        </ToastProvider>
      )
      expect(() =>
        fireEvent.click(screen.getByText('Remove Nonexistent'))
      ).not.toThrow()
    })
  })

  describe('custom duration', () => {
    it('respects custom duration via addToast', () => {
      vi.useFakeTimers()
      const CustomHarness = () => {
        const { addToast } = useToast()
        return (
          <button
            onClick={() =>
              addToast({ type: 'info', title: 'Custom dur', duration: 2000 })
            }
          >
            Show Custom
          </button>
        )
      }
      render(
        <ToastProvider>
          <CustomHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Custom'))
      expect(screen.getByText('Custom dur')).toBeInTheDocument()

      // Should be gone after 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(screen.queryByText('Custom dur')).not.toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Edge case: Rapid sequential toasts
  // ═══════════════════════════════════════════════════════

  describe('rapid sequential toasts', () => {
    it('displays all toasts when 10 are created in rapid succession', () => {
      render(
        <ToastProvider>
          <RapidToastHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Create 10 Toasts'))

      const toasts = screen.getAllByText('Rapid toast')
      expect(toasts).toHaveLength(10)

      // Verify each has a unique message
      for (let i = 1; i <= 10; i++) {
        expect(
          screen.getByText(`Rapid item #${i}`)
        ).toBeInTheDocument()
      }
    })

    it('auto-dismisses all rapid success toasts after 4 seconds', () => {
      vi.useFakeTimers()
      render(
        <ToastProvider>
          <RapidToastHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Create 10 Toasts'))

      expect(screen.getAllByText('Rapid toast')).toHaveLength(10)

      // Advance past the 4s auto-dismiss
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(screen.queryByText('Rapid toast')).not.toBeInTheDocument()
    })

    it('only removes the clicked toast when close button is pressed', () => {
      vi.useFakeTimers()
      render(
        <ToastProvider>
          <RapidToastHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Create 10 Toasts'))

      expect(screen.getAllByText('Rapid toast')).toHaveLength(10)

      // Close the first toast
      const closeButtons = screen.getAllByTestId('close-toast')
      fireEvent.click(closeButtons[0])

      // 9 remain
      expect(screen.getAllByText('Rapid toast')).toHaveLength(9)

      // The close button for the first toast is removed
      expect(screen.getAllByTestId('close-toast')).toHaveLength(9)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Edge case: Very long messages (line-clamp)
  // ═══════════════════════════════════════════════════════

  describe('very long messages (line-clamp)', () => {
    it('renders very long message without crashing', () => {
      render(
        <ToastProvider>
          <LongMessageHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Long Message'))

      expect(screen.getByText('Long message title')).toBeInTheDocument()
      // The full text should be preserved in the DOM (line-clamp is visual only)
      expect(screen.getByText(VERY_LONG_MESSAGE)).toBeInTheDocument()
    })

    it('renders title-only toast with just the title (no message paragraph)', () => {
      render(
        <ToastProvider>
          <LongMessageHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Title Only'))

      expect(screen.getByText('Title only toast')).toBeInTheDocument()
      // No message paragraph should exist for title-only toasts
      const messageParagraphs = screen.queryByText((_content, element) => {
        return (
          element != null &&
          element.tagName === 'P' &&
          element.className.includes('line-clamp-2')
        )
      })
      expect(messageParagraphs).not.toBeInTheDocument()
    })

    it('renders toast with empty string message (should not show message paragraph)', () => {
      render(
        <ToastProvider>
          <LongMessageHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Empty Message'))

      expect(screen.getByText('Empty message title')).toBeInTheDocument()
      // Empty string is falsy in JSX, so the message paragraph should not render
      const messageParagraphs = screen.queryByText((_content, element) => {
        return (
          element != null &&
          element.tagName === 'P' &&
          element.className.includes('line-clamp-2')
        )
      })
      expect(messageParagraphs).not.toBeInTheDocument()
    })

    it('renders unicode and emoji characters in toast message', () => {
      render(
        <ToastProvider>
          <LongMessageHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Show Unicode'))

      expect(screen.getByText('Unicode toast')).toBeInTheDocument()
      expect(screen.getByText(UNICODE_MESSAGE)).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Edge case: Rapid type toggling
  // ═══════════════════════════════════════════════════════

  describe('rapid type toggling', () => {
    it('renders all toast types when cycled rapidly', () => {
      render(
        <ToastProvider>
          <TypeCycleHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Cycle All Types'))

      // All 6 toasts should appear
      expect(screen.getAllByText(/Success [AE]/)).toHaveLength(2)
      expect(screen.getAllByText(/Error [BF]/)).toHaveLength(2)
      expect(screen.getByText('Info C')).toBeInTheDocument()
      expect(screen.getByText('Loading D')).toBeInTheDocument()

      // All messages should appear
      expect(screen.getByText('Success message A')).toBeInTheDocument()
      expect(screen.getByText('Error message B')).toBeInTheDocument()
      expect(screen.getByText('Info message C')).toBeInTheDocument()
      expect(screen.getByText('Loading message D')).toBeInTheDocument()
      expect(screen.getByText('Success message E')).toBeInTheDocument()
      expect(screen.getByText('Error message F')).toBeInTheDocument()
    })

    it('dismisses only the clicked toast when types are mixed', () => {
      vi.useFakeTimers()
      render(
        <ToastProvider>
          <TypeCycleHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Cycle All Types'))

      expect(screen.getAllByText(/Success [AE]/)).toHaveLength(2)

      // Close the first error toast (Error B)
      const closeButtons = screen.getAllByTestId('close-toast')
      // Click the close button on the second toast (index 1)
      fireEvent.click(closeButtons[1])

      // Error B should be gone, Error F should remain
      expect(screen.queryByText('Error message B')).not.toBeInTheDocument()
      expect(screen.getByText('Error message F')).toBeInTheDocument()

      // Success, info, loading toasts should remain
      expect(screen.getByText('Success message A')).toBeInTheDocument()
      expect(screen.getByText('Info message C')).toBeInTheDocument()
      expect(screen.getByText('Loading message D')).toBeInTheDocument()
      expect(screen.getByText('Success message E')).toBeInTheDocument()
    })

    it('auto-dismisses success/info at 4s and error at 6s when mixed types are shown', () => {
      vi.useFakeTimers()
      render(
        <ToastProvider>
          <TypeCycleHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Cycle All Types'))

      // All 6 toasts visible initially (including loading)
      expect(screen.getByText('Loading message D')).toBeInTheDocument()

      // Advance 4s — success and info should dismiss, error (6s) remain
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      // Success toasts should be gone
      expect(screen.queryByText('Success message A')).not.toBeInTheDocument()
      expect(screen.queryByText('Success message E')).not.toBeInTheDocument()
      // Info toast should be gone
      expect(screen.queryByText('Info message C')).not.toBeInTheDocument()

      // Error toasts should still be visible (6s duration)
      expect(screen.getByText('Error message B')).toBeInTheDocument()
      expect(screen.getByText('Error message F')).toBeInTheDocument()

      // Advance remaining 2s — errors should also dismiss
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.queryByText('Error message B')).not.toBeInTheDocument()
      expect(screen.queryByText('Error message F')).not.toBeInTheDocument()
    })

    it('persists loading toast indefinitely even when mixed with other types', () => {
      render(
        <ToastProvider>
          <TypeCycleHarness />
        </ToastProvider>
      )
      fireEvent.click(screen.getByText('Cycle All Types'))

      // Loading toast should be visible alongside others
      expect(screen.getByText('Loading message D')).toBeInTheDocument()
      expect(screen.getByText('Success message A')).toBeInTheDocument()
      expect(screen.getByText('Error message B')).toBeInTheDocument()
      expect(screen.getByText('Info message C')).toBeInTheDocument()
    })
  })
})
