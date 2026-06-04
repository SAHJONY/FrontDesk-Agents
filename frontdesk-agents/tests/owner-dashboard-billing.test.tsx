import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// ─── Mock framer-motion first (before any component imports) ───────────────────
vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', section: 'section', nav: 'nav', header: 'header', main: 'main', footer: 'footer', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ─── Mock recharts ────────────────────────────────────────────────────────────
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div />,
  Legend: () => <div />,
}))

// ─── Mock ToastProvider ────────────────────────────────────────────────────────
const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ success: mockSuccess, error: mockError }),
}))

// ─── Mock next/navigation ─────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/owner/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// ─── Mock LanguagePreviewSwitcher (shared component used in owner dashboard) ──
vi.mock('@/components/LanguagePreviewSwitcher', () => ({
  default: ({ subtitle }: { subtitle?: string }) => (
    <div data-testid="language-preview-switcher">Preview Language — {subtitle ?? 'default'}</div>
  ),
}))

// ─── Global fetch mock ─────────────────────────────────────────────────────────
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// ─── TranslationProvider wrapper ──────────────────────────────────────────────
// Provides the TranslationContext that useTranslation() requires.
// Import useTranslation mock so the provider works in tests without real i18n data.
vi.mock('@/lib/useTranslation', () => ({
  TranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTranslation: () => ({ t: (k: string) => k, language: 'en', setLanguage: vi.fn(), translations: {}, languages: [], isLoaded: true }),
  SUPPORTED_LANGUAGES: [],
}))

// ─── Helper factories ──────────────────────────────────────────────────────────

function makeDashData() {
  return {
    metrics: { mrr: 15000, arr: 180000, activeCustomers: 10, totalCustomers: 10, evaluations: [], churnRate: 0.05 },
    sales: {
      pipeline: [],
      salesMetrics: { totalLeads: 15, conversionRate: 0.25, averageScore: 72 },
      leadsByTier: { hot: 3, warm: 10, cold: 5 },
      leads: [],
    },
    health: { healthyCount: 8, atRiskCount: 2, totalCustomers: 10, customers: [], upsellOpportunities: [], reviewCandidates: [], healthChecks: [] },
    partners: { totalPartners: 5, activePartners: 3, totalReferrals: 12, convertedReferrals: 8, conversionRate: 0.67, totalCommission: 4500, totalRevenueGenerated: 25000 },
    projections: {},
    charts: { revenueTrend: [], churnHistory: [] },
  }
}

function makeEmptyDash() {
  return {
    metrics: { mrr: 0, arr: 0, activeCustomers: 0, totalCustomers: 0, evaluations: [], churnRate: 0 },
    sales: { pipeline: [], salesMetrics: { totalLeads: 0, conversionRate: 0, averageScore: 0 }, leadsByTier: { hot: 0, warm: 0, cold: 0 }, leads: [] },
    health: { healthyCount: 0, atRiskCount: 0, totalCustomers: 0, customers: [], upsellOpportunities: [], reviewCandidates: [], healthChecks: [] },
    partners: { totalPartners: 0, activePartners: 0, totalReferrals: 0, convertedReferrals: 0, conversionRate: 0, totalCommission: 0, totalRevenueGenerated: 0 },
    projections: {},
    charts: { revenueTrend: [], churnHistory: [] },
  }
}

function makeRec(ov: Record<string, unknown> = {}) {
  return Object.assign({
    id: 'bill_001',
    customer_id: 'cus_001',
    invoice_id: 'INV-001',
    subscription_id: 'sub_001',
    amount: 2999,
    currency: 'usd',
    status: 'succeeded',
    description: 'Monthly subscription',
    billing_reason: 'subscription_cycle',
    invoice_pdf_url: 'https://example.com/invoice.pdf',
    period_start: '2025-05-01T00:00:00Z',
    period_end: '2025-06-01T00:00:00Z',
    created_at: '2025-05-01T00:00:00Z',
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    business_name: 'Test Business',
  }, ov)
}

async function renderDash(recs?: Record<string, unknown>[]) {
  mockFetch.mockImplementation((url: string) => {
    if (url === '/api/dashboard') return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
    if (url === '/api/owner/session') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
    if (url.startsWith('/api/harness')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ running: false, totalCycles: 0, successfulDeployments: 0, learningsStored: 0, lastCycle: null, currentMetrics: null }) })
    if (url.includes('/api/owner/billing')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: recs || [makeRec({ id: 'bill_001', invoice_id: 'INV-001', amount: 2999 }), makeRec({ id: 'bill_002', invoice_id: 'INV-002', amount: 4999, status: 'pending' })], pagination: { hasMore: false } }) })
    if (url === '/api/billing/send-invoice') return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, message: 'Invoice sent!' }) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
  const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
  return render(React.createElement(OwnerDashboard))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OwnerDashboard - Recent Invoices', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockSuccess.mockClear()
    mockError.mockClear()
  })

  it('renders the Recent Invoices section with fetched records', async () => {
    await renderDash()
    await waitFor(() => expect(screen.getByText('Recent Invoices')).toBeInTheDocument())
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('INV-002')).toBeInTheDocument()
    expect(screen.getAllByText('Test Customer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('$49.99')).toBeInTheDocument()
    expect(screen.getByText('succeeded')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getAllByText('Send Invoice').length).toBeGreaterThanOrEqual(2)
  })

  it('shows a loading spinner while fetching', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/dashboard') return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
      if (url === '/api/owner/session') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
      if (url.startsWith('/api/harness')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ running: false, totalCycles: 0, successfulDeployments: 0, learningsStored: 0, lastCycle: null, currentMetrics: null }) })
      if (url === '/api/owner/billing?page=1&limit=5') return new Promise(() => {})
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
    render(React.createElement(OwnerDashboard))
    await waitFor(() => expect(screen.getByText('Recent Invoices')).toBeInTheDocument())
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('shows empty state when no invoices', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/dashboard') return Promise.resolve({ ok: true, json: () => Promise.resolve(makeEmptyDash()) })
      if (url === '/api/owner/session') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
      if (url.startsWith('/api/harness')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ running: false, totalCycles: 0, successfulDeployments: 0, learningsStored: 0, lastCycle: null, currentMetrics: null }) })
      if (url === '/api/owner/billing?page=1&limit=5') return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [], pagination: { hasMore: false } }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
    render(React.createElement(OwnerDashboard))
    await waitFor(() => expect(screen.getByText('No recent invoices found.')).toBeInTheDocument())
  })

  it('opens confirmation dialog on Send Invoice click', async () => {
    await renderDash()
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('This will email the invoice PDF to the customer')).toBeInTheDocument())
    expect(screen.getAllByText('Test Customer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Test Business')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getAllByText('$29.99').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('INV-001').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Monthly subscription')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('closes dialog on Cancel click', async () => {
    await renderDash()
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() => expect(screen.queryByText('Cancel')).not.toBeInTheDocument())
  })

  it('sends invoice and shows success toast', async () => {
    await renderDash()
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    const btns = screen.getAllByText('Send Invoice')
    fireEvent.click(btns[1])
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/billing/send-invoice', expect.objectContaining({ method: 'POST' })))
    await waitFor(() => expect(mockSuccess).toHaveBeenCalledWith('Invoice Sent', expect.stringContaining('INV-001')))
    await waitFor(() => expect(screen.queryByText('Cancel')).not.toBeInTheDocument())
  })

  it('shows sending state while waiting for response', async () => {
    let resolveSend: () => void = () => {}
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/dashboard') return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
      if (url === '/api/owner/session') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
      if (url.startsWith('/api/harness')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ running: false, totalCycles: 0, successfulDeployments: 0, learningsStored: 0, lastCycle: null, currentMetrics: null }) })
      if (url === '/api/owner/billing?page=1&limit=5') return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', invoice_id: 'INV-001', amount: 2999 })], pagination: { hasMore: false } }) })
      if (url === '/api/billing/send-invoice') return new Promise((resolve) => { resolveSend = () => resolve({ ok: true, json: () => Promise.resolve({ success: true, message: 'Invoice sent!' }) }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
    render(React.createElement(OwnerDashboard))
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    const btns = screen.getAllByText('Send Invoice')
    fireEvent.click(btns[1])
    await waitFor(() => expect(screen.getByText('Sending...')).toBeInTheDocument())
    resolveSend()
    await waitFor(() => expect(screen.queryByText('Sending...')).not.toBeInTheDocument())
  })

  it('shows error toast on API error', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/dashboard') return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
      if (url === '/api/owner/session') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
      if (url.startsWith('/api/harness')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ running: false, totalCycles: 0, successfulDeployments: 0, learningsStored: 0, lastCycle: null, currentMetrics: null }) })
      if (url === '/api/owner/billing?page=1&limit=5') return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', invoice_id: 'INV-001', amount: 2999 })], pagination: { hasMore: false } }) })
      if (url === '/api/billing/send-invoice') return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: false, error: 'Invoice already sent' }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
    render(React.createElement(OwnerDashboard))
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    const btns = screen.getAllByText('Send Invoice')
    fireEvent.click(btns[1])
    await waitFor(() => expect(mockError).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Invoice already sent')))
  })

  it('shows error toast on network failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/dashboard') return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
      if (url === '/api/owner/session') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
      if (url.startsWith('/api/harness')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ running: false, totalCycles: 0, successfulDeployments: 0, learningsStored: 0, lastCycle: null, currentMetrics: null }) })
      if (url === '/api/owner/billing?page=1&limit=5') return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [makeRec({ id: 'bill_001', invoice_id: 'INV-001', amount: 2999 })], pagination: { hasMore: false } }) })
      if (url === '/api/billing/send-invoice') return Promise.reject(new Error('Network error'))
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
    render(React.createElement(OwnerDashboard))
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    const btns = screen.getAllByText('Send Invoice')
    fireEvent.click(btns[1])
    await waitFor(() => expect(mockError).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Please try again')))
  })

  it('closes dialog on backdrop click', async () => {
    await renderDash()
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Send Invoice')[0])
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument())
    const backdrop = screen.getByText('Cancel').closest('.fixed')
    if (backdrop) fireEvent.click(backdrop)
    await waitFor(() => expect(screen.queryByText('Cancel')).not.toBeInTheDocument())
  })
})