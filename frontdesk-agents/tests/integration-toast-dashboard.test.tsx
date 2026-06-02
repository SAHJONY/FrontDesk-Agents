import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import React from 'react'

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

// ─── Mock download helpers ──────────────────────────────
// downloadCSV: mocks Blob, URL.createObjectURL, document.createElement
// downloadPDF: mocks html2canvas and jspdf dynamic imports
vi.mock('@/lib/export-utils', async () => {
  const actual = await vi.importActual('@/lib/export-utils')
  return {
    ...actual,
    downloadCSV: vi.fn(),
    downloadPDF: vi.fn(),
    downloadMergedCSV: vi.fn(),
  }
})

import { ToastProvider, useToast } from '@/components/ToastProvider'
import { useRefreshWithToast } from '@/hooks/useRefreshWithToast'
import { downloadCSV, downloadPDF, downloadMergedCSV } from '@/lib/export-utils'

// ═══════════════════════════════════════════════════════
//  Test harness components  (mimicking dashboard patterns)
// ═══════════════════════════════════════════════════════

/**
 * ExportCSVHarness — mimics the customer dashboard's handleExportCSV pattern.
 */
function ExportCSVHarness() {
  const { success, error: toastError } = useToast()

  const handleExportCSV = () => {
    try {
      downloadMergedCSV(
        [{ title: 'Test Report', rows: [{ Metric: 'MRR', Value: 1000 }] }],
        'test-report'
      )
      success('CSV Exported', 'Test report downloaded as test-report.csv')
    } catch (err) {
      toastError(
        'Export Failed',
        err instanceof Error ? err.message : 'Could not generate CSV'
      )
    }
  }

  return (
    <div>
      <button onClick={handleExportCSV}>Export CSV</button>
      <button
        onClick={() => {
          try {
            throw new Error('Disk full')
          } catch (err) {
            toastError(
              'Export Failed',
              err instanceof Error ? err.message : 'Could not generate CSV'
            )
          }
        }}
      >
        Export CSV Error
      </button>
    </div>
  )
}

/**
 * ExportPDFHarness — mimics the owner dashboard's handleExportPDF pattern.
 */
function ExportPDFHarness() {
  const { success, error: toastError } = useToast()

  const handleExportPDF = () => {
    const elementId = 'dashboard-content'
    const filename = 'report'
    downloadPDF(elementId, filename, {
      onSuccess: () => success('PDF Exported', 'Dashboard exported as PDF'),
      onError: (msg) => toastError('PDF Export Failed', msg),
    })
  }

  return (
    <div>
      <div id="dashboard-content">Content</div>
      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  )
}

/**
 * RefreshHarness — mimics the dashboard data-fetching pattern with showToast.
 */
function RefreshHarness() {
  const { notifySuccess, notifyError } = useRefreshWithToast()
  const [lastResult, setLastResult] = React.useState<string | null>(null)

  const handleRefresh = async () => {
    try {
      const res = await fetch('/api/test')
      if (!res.ok) throw new Error('HTTP 500')
      await res.json()
      notifySuccess()
      setLastResult('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed'
      notifyError(msg)
      setLastResult('error')
    }
  }

  const handleSilentLoad = async () => {
    try {
      const res = await fetch('/api/test')
      if (!res.ok) throw new Error('HTTP 500')
      await res.json()
      // No toast — initial load
      setLastResult('loaded')
    } catch {
      setLastResult('failed')
    }
  }

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      <button onClick={handleSilentLoad}>Silent Load</button>
      <div data-testid="last-result">{lastResult}</div>
    </div>
  )
}

/**
 * RetryHarness — mimics the dashboard's retry button pattern (showToast=true).
 */
function RetryHarness() {
  const { notifySuccess, notifyError } = useRefreshWithToast()
  const [error, setError] = React.useState<string | null>('Initial error')

  const handleRetry = async () => {
    setError(null)
    try {
      const res = await fetch('/api/retry')
      if (!res.ok) throw new Error('Still failing')
      const data = await res.json()
      notifySuccess()
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed'
      setError(msg)
      notifyError(msg)
    }
  }

  if (error) {
    return (
      <div>
        <div data-testid="error-msg">{error}</div>
        <button onClick={handleRetry}>Retry</button>
      </div>
    )
  }

  return <div data-testid="loaded">Loaded</div>
}

// ═══════════════════════════════════════════════════════
//  Tests
// ═══════════════════════════════════════════════════════

describe('Toast integration: Export CSV pattern', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast on successful CSV export', () => {
    render(
      <ToastProvider>
        <ExportCSVHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Export CSV'))

    expect(downloadMergedCSV).toHaveBeenCalledOnce()
    expect(screen.getByText('CSV Exported')).toBeInTheDocument()
    expect(
      screen.getByText('Test report downloaded as test-report.csv')
    ).toBeInTheDocument()
  })

  it('shows error toast when CSV export throws', () => {
    render(
      <ToastProvider>
        <ExportCSVHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Export CSV Error'))

    expect(screen.getByText('Export Failed')).toBeInTheDocument()
    expect(screen.getByText('Disk full')).toBeInTheDocument()
  })
})

describe('Toast integration: Export PDF pattern', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast when PDF export succeeds via callbacks', () => {
    // Make downloadPDF call its onSuccess callback
    vi.mocked(downloadPDF).mockImplementation(
      (_elementId: string, _filename: string, callbacks?: any) => {
        callbacks?.onSuccess?.()
        return Promise.resolve()
      }
    )

    render(
      <ToastProvider>
        <ExportPDFHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Export PDF'))

    expect(downloadPDF).toHaveBeenCalledWith(
      'dashboard-content',
      'report',
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    )
    expect(screen.getByText('PDF Exported')).toBeInTheDocument()
    expect(
      screen.getByText('Dashboard exported as PDF')
    ).toBeInTheDocument()
  })

  it('shows error toast when PDF export fails via callbacks', () => {
    vi.mocked(downloadPDF).mockImplementation(
      (_elementId: string, _filename: string, callbacks?: any) => {
        callbacks?.onError?.('Element #dashboard-content not found')
        return Promise.resolve()
      }
    )

    render(
      <ToastProvider>
        <ExportPDFHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Export PDF'))

    expect(screen.getByText('PDF Export Failed')).toBeInTheDocument()
    expect(
      screen.getByText('Element #dashboard-content not found')
    ).toBeInTheDocument()
  })
})

describe('Toast integration: Data refresh pattern (useRefreshWithToast)', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Dashboard refreshed" toast on successful refresh', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )

    render(
      <ToastProvider>
        <RefreshHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Refresh'))

    await waitFor(() => {
      expect(screen.getByText('Dashboard refreshed')).toBeInTheDocument()
    })
    expect(
      screen.getByText('Data updated successfully')
    ).toBeInTheDocument()
  })

  it('shows "Refresh failed" toast on failed refresh', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(
      <ToastProvider>
        <RefreshHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Refresh'))

    await waitFor(() => {
      expect(screen.getByText('Refresh failed')).toBeInTheDocument()
    })
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('does NOT show any toast on silent/initial load (no showToast)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )

    render(
      <ToastProvider>
        <RefreshHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Silent Load'))

    // Wait for the load to complete
    await waitFor(() => {
      expect(screen.getByTestId('last-result')).toHaveTextContent('loaded')
    })

    // No toast should appear
    expect(
      screen.queryByText('Dashboard refreshed')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Refresh failed')).not.toBeInTheDocument()
  })
})

describe('Toast integration: Retry button pattern', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast when retry succeeds', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
    )

    render(
      <ToastProvider>
        <RetryHarness />
      </ToastProvider>
    )

    // Should initially show error state
    expect(screen.getByTestId('error-msg')).toHaveTextContent('Initial error')

    // Click retry
    fireEvent.click(screen.getByText('Retry'))

    // Should show success toast
    await waitFor(() => {
      expect(screen.getByText('Dashboard refreshed')).toBeInTheDocument()
    })
  })

  it('shows error toast when retry fails again', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Server timeout'))

    render(
      <ToastProvider>
        <RetryHarness />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Retry'))

    await waitFor(() => {
      expect(screen.getByText('Refresh failed')).toBeInTheDocument()
    })
    // Error text appears in both the error state div and the toast
    expect(screen.getAllByText('Server timeout')).toHaveLength(2)
  })
})

describe('Toast integration: Multiple sequential toasts', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('shows and dismisses multiple toasts in sequence', () => {
    vi.useFakeTimers()

    render(
      <ToastProvider>
        <ExportCSVHarness />
      </ToastProvider>
    )

    // Export CSV twice
    fireEvent.click(screen.getByText('Export CSV'))
    fireEvent.click(screen.getByText('Export CSV'))

    // Both toasts should be visible
    const titles = screen.getAllByText('CSV Exported')
    expect(titles).toHaveLength(2)

    // After auto-dismiss (4s), both should be gone
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.queryByText('CSV Exported')).not.toBeInTheDocument()
  })
})
