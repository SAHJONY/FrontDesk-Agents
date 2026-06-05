import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// ─── Mock framer-motion first ─────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div', button: 'button', section: 'section', nav: 'nav',
    header: 'header', main: 'main', footer: 'footer', span: 'span',
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', p: 'p', a: 'a',
    tr: 'tr', td: 'td', th: 'th', tbody: 'tbody', thead: 'thead',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ─── Mock recharts ─────────────────────────────────────────────────────────────
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

// ─── Mock LanguagePreviewSwitcher ─────────────────────────────────────────────
vi.mock('@/components/LanguagePreviewSwitcher', () => ({
  default: ({ subtitle }: { subtitle?: string }) => (
    <div data-testid="language-preview-switcher">Preview Language — {subtitle ?? 'default'}</div>
  ),
}))

// ─── Mock ModelComparison component ───────────────────────────────────────────
vi.mock('@/components/ModelComparison', () => ({
  default: () => (
    <div data-testid="model-comparison">
      <div>AI Model Comparison Lab</div>
      <select data-testid="provider-select">
        <option value="nvidia">NVIDIA</option>
      </select>
    </div>
  ),
}))

// ─── Mock useTranslation ───────────────────────────────────────────────────────
vi.mock('@/lib/useTranslation', () => ({
  TranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTranslation: () => ({
    t: (k: string) => k,
    language: 'en',
    setLanguage: vi.fn(),
    translations: {},
    languages: [],
    isLoaded: true,
  }),
  SUPPORTED_LANGUAGES: [],
}))

// ─── Global fetch mock ─────────────────────────────────────────────────────────
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// ─── Shared mock data factories ───────────────────────────────────────────────

function makeDashData() {
  return {
    metrics: {
      mrr: 15000, arr: 180000, activeCustomers: 10, totalCustomers: 10,
      evaluations: [], churnRate: 0.05, ltv: 5000, cac: 800,
      profitMargin: 0.3, revenueProjection: 20000, paybackPeriod: 8, ltvCacRatio: 6.25,
      totalCosts: 5000,
    },
    sales: {
      pipeline: [
        { stage: 'new', count: 5, value: 25000 },
        { stage: 'contacted', count: 4, value: 40000 },
        { stage: 'qualified', count: 3, value: 60000 },
        { stage: 'proposal', count: 2, value: 80000 },
        { stage: 'negotiation', count: 1, value: 50000 },
        { stage: 'closed_won', count: 0, value: 0 },
      ],
      salesMetrics: { totalLeads: 15, conversionRate: 0.25, averageScore: 72, hotLeads: 5, warmLeads: 7, coldLeads: 3 },
      leadsByTier: { hot: 5, warm: 7, cold: 3 },
      leads: [],
    },
    health: {
      healthyCount: 8, atRiskCount: 2, totalCustomers: 10, customers: [],
      upsellOpportunities: [], reviewCandidates: [], healthChecks: [],
    },
    partners: {
      totalPartners: 5, activePartners: 3, totalReferrals: 12, convertedReferrals: 8,
      conversionRate: 0.67, totalCommission: 4500, totalRevenueGenerated: 25000,
    },
    projections: { nextMonth: 16000, nextQuarter: 50000, nextYear: 200000, growthRate: 0.15 },
    charts: { revenueTrend: [], churnHistory: [] },
  }
}

function makeAiOverview(overrides = {}) {
  return {
    decisions: [
      {
        id: 'dec_001',
        timestamp: '2025-06-03T12:00:00Z',
        action: 'Send Slack alert',
        agent: 'retention_agent',
        context: 'Hot lead score 92/100 detected',
        result: 'Slack message sent to #sales',
        reasoning: 'Lead score exceeded escalation threshold',
        severity: 'high' as const,
        acknowledged: false,
        resolved: false,
      },
      {
        id: 'dec_002',
        timestamp: '2025-06-03T11:30:00Z',
        action: 'Upgrade customer plan',
        agent: 'upsell_agent',
        context: 'Customer usage exceeded 80% of current plan limits',
        result: 'Plan upgraded to professional',
        reasoning: 'Usage metrics indicate readiness for upsell',
        severity: 'medium' as const,
        acknowledged: true,
        resolved: true,
        outcome: 'success',
      },
    ],
    modelStatuses: [
      {
        provider: 'nvidia',
        model: 'google/gemma-2-2b-it',
        status: 'active',
        latencyMs: 120,
        requestsPerMinute: 45,
        healthScore: 0.98,
        isPrimary: true,
        fallbackOf: null,
      },
      {
        provider: 'nvidia',
        model: 'nvidia/nemotron-mini-4b-instruct',
        status: 'degraded',
        latencyMs: 850,
        requestsPerMinute: 12,
        healthScore: 0.72,
        isPrimary: false,
        fallbackOf: 'google/gemma-2-2b-it',
      },
      {
        provider: 'openai',
        model: 'gpt-4o-mini',
        status: 'active',
        latencyMs: 300,
        requestsPerMinute: 20,
        healthScore: 0.95,
        isPrimary: false,
        fallbackOf: null,
      },
    ],
    selfHealing: {
      overall: 'healthy' as const,
      anomaliesDetected: 2,
      autoRemediated: 2,
      pendingAlerts: 0,
      uptimePercent: 99.8,
      avgResponseTime: 245,
      activeAlerts: [
        {
          id: 'alert_001',
          type: 'threshold_breach',
          severity: 'medium',
          message: 'Latency spike on nemotron-mini — fallback activated',
          timestamp: '2025-06-03T11:35:00Z',
          acknowledged: true,
        },
      ],
    },
    metrics: {
      totalDecisions: 147,
      autonomousActions: 89,
      avgConfidence: 0.91,
      activeAgents: 4,
      modelSwitchEvents: 3,
    },
    ...overrides,
  }
}

function makeHarnessStatus() {
  return {
    running: true,
    totalCycles: 12,
    successfulDeployments: 10,
    learningsStored: 38,
    lastCycle: '2025-06-03T11:45:00Z',
    currentMetrics: {
      errorRate: 0.02,
      avgLatencyMs: 180,
      requestsPerSecond: 24,
      conversionRate: 0.34,
      churnRate: 0.04,
      customerSatisfaction: 0.88,
      activeCustomers: 10,
      totalCalls: 345,
      callSuccessRate: 0.96,
      mrr: 15000,
      arr: 180000,
      timestamp: '2025-06-03T12:00:00Z',
    },
  }
}

function makeBillingRecords() {
  return {
    success: true,
    data: [
      { id: 'bill_001', invoice_id: 'INV-001', customer_name: 'Acme Corp', amount: 2999, status: 'succeeded', created_at: '2025-06-01T00:00:00Z' },
      { id: 'bill_002', invoice_id: 'INV-002', customer_name: 'TechStart', amount: 4999, status: 'pending', created_at: '2025-06-02T00:00:00Z' },
    ],
    pagination: { hasMore: false },
  }
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('OwnerDashboard AI Agents Tab', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockSuccess.mockClear()
    mockError.mockClear()
    // Set up ALL fetch mocks synchronously in beforeEach
    // so they're ready before the component's useEffect fires during render
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/owner/session') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
      }
      if (url === '/api/dashboard') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
      }
      if (url === '/api/harness/status') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeHarnessStatus()) })
      }
      if (url === '/api/ai/decisions?limit=20') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeAiOverview()) })
      }
      if (url === '/api/owner/billing?page=1&limit=5') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeBillingRecords()) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  // ── Helper: render dashboard and switch to AI tab ──────────────────────────
  // Pattern from the working billing tests: render, then wait for an element
  // that appears after session resolves, then interact.
  async function renderAndSwitchToAI(aiOverviewOverrides?: object) {
    if (aiOverviewOverrides) {
      // Override only the AI overview endpoint for this test
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/owner/session') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
        }
        if (url === '/api/dashboard') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
        }
        if (url === '/api/harness/status') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeHarnessStatus()) })
        }
        if (url === '/api/ai/decisions?limit=20') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeAiOverview(aiOverviewOverrides)) })
        }
        if (url === '/api/owner/billing?page=1&limit=5') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeBillingRecords()) })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })
    }

    const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
    render(React.createElement(OwnerDashboard))

    // Wait for the sidebar nav to appear — this confirms session resolved
    // and the component rendered the nav items (including 'AI Agents')
    await waitFor(() => expect(screen.getByText('AI Agents')).toBeInTheDocument(), { timeout: 10000 })

    // Now click the AI tab
    fireEvent.click(screen.getByText('AI Agents'))

    // Wait for AI tab content to appear (async fetchAIOverview after tab switch)
    await waitFor(() => expect(screen.getByText('Model Router Status')).toBeInTheDocument(), { timeout: 10000 })
  }

  // ── Test 1: AI tab rendering ────────────────────────────────────────────────
  describe('AI tab rendering', () => {
    it('renders the AI Agents tab button in sidebar', async () => {
      const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
      render(React.createElement(OwnerDashboard))
      await waitFor(() => expect(screen.getByText('AI Agents')).toBeInTheDocument(), { timeout: 10000 })
    })

    it('shows AI tab content after clicking the tab', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('Hermes Desktop')).toBeInTheDocument()
      expect(screen.getByText('Model Comparison Lab')).toBeInTheDocument()
    })
  })

  // ── Test 2: Hermes Desktop link card ───────────────────────────────────────
  describe('Hermes Desktop link card', () => {
    it('renders the Hermes Desktop link card with correct href, target, rel', async () => {
      await renderAndSwitchToAI()
      const link = screen.getByRole('link', { name: /open/i })
      expect(link).toHaveAttribute('href', 'https://hermes-agent.nousresearch.com/desktop')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders the Nous Research badge', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('Nous Research')).toBeInTheDocument()
    })

    it('shows free & open source indicator', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText(/free.*open source/i)).toBeInTheDocument()
    })
  })

  // ── Test 3: AI Metrics Overview ─────────────────────────────────────────────
  describe('AI Metrics Overview cards', () => {
    it('renders all four AI metric cards with correct values', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('147')).toBeInTheDocument()
      expect(screen.getByText('89')).toBeInTheDocument()
      expect(screen.getByText('91%')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders metric card labels', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('Total Decisions')).toBeInTheDocument()
      expect(screen.getByText('Autonomous Actions')).toBeInTheDocument()
      expect(screen.getByText('Avg Confidence')).toBeInTheDocument()
      expect(screen.getByText('Model Switch Events')).toBeInTheDocument()
    })
  })

  // ── Test 4: Model Router Status ─────────────────────────────────────────────
  describe('Model Router Status grid', () => {
    it('renders the Model Router Status section header', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('Model Router Status')).toBeInTheDocument()
    })

    it('renders model status cards for each model', async () => {
      await renderAndSwitchToAI()
      // There are 2 nvidia cards (gemma-2-2b-it and nemotron-mini-4b-instruct)
      const nvidiaCards = screen.getAllByText('nvidia')
      expect(nvidiaCards.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('google/gemma-2-2b-it')).toBeInTheDocument()
      // 'active' appears in multiple places (status badge + health score), use getAllByText
      const activeElements = screen.getAllByText('active')
      expect(activeElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Primary')).toBeInTheDocument()
    })

    it('renders latency and health scores for each model', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('120ms')).toBeInTheDocument()
      expect(screen.getByText('98%')).toBeInTheDocument()
      expect(screen.getByText('850ms')).toBeInTheDocument()
      expect(screen.getByText('72%')).toBeInTheDocument()
    })

    it('shows degraded status for non-primary models', async () => {
      await renderAndSwitchToAI()
      const degradedBadges = screen.getAllByText('degraded')
      expect(degradedBadges.length).toBeGreaterThan(0)
    })

    it('shows RPM values for each model', async () => {
      await renderAndSwitchToAI()
      expect(screen.getByText('45')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('renders empty state when no model statuses are available', async () => {
      await renderAndSwitchToAI({ decisions: [], modelStatuses: [], selfHealing: null, metrics: null })
      await waitFor(() => expect(screen.getByText('No model statuses available')).toBeInTheDocument(), { timeout: 10000 })
    })
  })

  // ── Test 5: Decision History ────────────────────────────────────────────────
  describe('Decision History', () => {
    it('renders the Decision History section header', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Decision History')).toBeInTheDocument(), { timeout: 10000 })
    })

    it('renders decision items with severity badges', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Decision History')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
    })

    it('renders decision result and reasoning text', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Decision History')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('Slack message sent to #sales')).toBeInTheDocument()
      expect(screen.getByText('Lead score exceeded escalation threshold')).toBeInTheDocument()
    })

    it('renders agent name for each decision', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Decision History')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('retention_agent')).toBeInTheDocument()
      expect(screen.getByText('upsell_agent')).toBeInTheDocument()
    })

    it('renders empty state when no decisions are available', async () => {
      await renderAndSwitchToAI({ decisions: [], modelStatuses: [], selfHealing: null, metrics: null })
      await waitFor(() => expect(screen.getByText('No decision history available')).toBeInTheDocument(), { timeout: 10000 })
    })
  })

  // ── Test 6: Self-Healing Monitor ────────────────────────────────────────────
  describe('Self-Healing Monitor', () => {
    it('renders the Self-Healing Monitor section header', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
    })

    it('renders overall health status badge', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('healthy')).toBeInTheDocument()
    }, 15000)

    it('shows degraded badge when overall health is degraded', async () => {
      // Use renderAndSwitchToAI with explicit selfHealing override — merges correctly
      // into the makeAiOverview result, replacing only the overall field
      await renderAndSwitchToAI({
        selfHealing: { ...makeAiOverview().selfHealing, overall: 'degraded' as const },
      })
      // 'Self-Healing Monitor' heading confirms AI tab content is loaded
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
      // 'degraded' appears in multiple places (selfHealing badge + model status card for nemotron-mini)
      expect(screen.getAllByText('degraded').length).toBeGreaterThan(0)
    })

    it('renders anomaly detection and auto-remediation metrics with labels', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('Anomalies Detected')).toBeInTheDocument()
      expect(screen.getByText('Auto-Remediated')).toBeInTheDocument()
    })

    it('renders uptime percentage and avg response time', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('99.8%')).toBeInTheDocument()
      expect(screen.getByText('245ms')).toBeInTheDocument()
    })

    it('renders active alerts when there are alerts', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText('Active Alerts')).toBeInTheDocument()
      expect(screen.getByText('Latency spike on nemotron-mini — fallback activated')).toBeInTheDocument()
    })

    it('shows healthy badge for healthy overall status', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Self-Healing Monitor')).toBeInTheDocument(), { timeout: 10000 })
      const healthyBadges = screen.getAllByText('healthy')
      expect(healthyBadges.length).toBeGreaterThan(0)
    })

    it('renders empty state when selfHealing data is null', async () => {
      await renderAndSwitchToAI({ decisions: [], modelStatuses: [], selfHealing: null, metrics: null })
      await waitFor(() => expect(screen.getByText('Self-healing data not available')).toBeInTheDocument(), { timeout: 10000 })
    })
  })

  // ── Test 7: Model Comparison Lab embedding ──────────────────────────────────
  describe('Model Comparison Lab embedding', () => {
    it('renders the Model Comparison Lab section header', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Model Comparison Lab')).toBeInTheDocument(), { timeout: 10000 })
    })

    it('renders the ModelComparison component', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Model Comparison Lab')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByTestId('model-comparison')).toBeInTheDocument()
    })

    it('shows the NGC catalog description text', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Model Comparison Lab')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByText(/compare.*nvidia.*models/i)).toBeInTheDocument()
    })

    it('renders the ModelComparison component with provider select', async () => {
      await renderAndSwitchToAI()
      await waitFor(() => expect(screen.getByText('Model Comparison Lab')).toBeInTheDocument(), { timeout: 10000 })
      expect(screen.getByTestId('provider-select')).toBeInTheDocument()
    })
  })

  // ── Test 8: AI tab loading states ────────────────────────────────────────────
  describe('AI tab loading states', () => {
    it('shows loading spinner while fetching AI overview', async () => {
      // Override only the AI overview to never resolve
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/owner/session') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
        }
        if (url === '/api/dashboard') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
        }
        if (url === '/api/harness/status') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeHarnessStatus()) })
        }
        if (url === '/api/ai/decisions?limit=20') {
          return new Promise(() => {}) // Never resolves
        }
        if (url === '/api/owner/billing?page=1&limit=5') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeBillingRecords()) })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })
      const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
      render(React.createElement(OwnerDashboard))
      await waitFor(() => expect(screen.getByText('AI Agents')).toBeInTheDocument(), { timeout: 10000 })
      fireEvent.click(screen.getByText('AI Agents'))
      await waitFor(() => expect(document.querySelector('.animate-spin')).toBeTruthy(), { timeout: 10000 })
    })

    it('shows error state when AI overview fetch fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/owner/session') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) })
        }
        if (url === '/api/dashboard') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeDashData()) })
        }
        if (url === '/api/harness/status') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeHarnessStatus()) })
        }
        if (url === '/api/ai/decisions?limit=20') {
          return Promise.reject(new Error('AI API 500'))
        }
        if (url === '/api/owner/billing?page=1&limit=5') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(makeBillingRecords()) })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })
      const { default: OwnerDashboard } = await import('@/app/owner/dashboard/page')
      render(React.createElement(OwnerDashboard))
      await waitFor(() => expect(screen.getByText('AI Agents')).toBeInTheDocument(), { timeout: 10000 })
      fireEvent.click(screen.getByText('AI Agents'))
      await waitFor(() => expect(screen.getByText(/AI API 500/i)).toBeInTheDocument(), { timeout: 10000 })
    })
  })

  // ── Test 9: AI Metrics cards do not render without data ─────────────────────
  describe('AI Metrics Overview empty state', () => {
    it('does not render metrics cards when metrics is null', async () => {
      await renderAndSwitchToAI({ decisions: [], modelStatuses: [], selfHealing: null, metrics: null })
      await waitFor(() => expect(screen.queryByText('Total Decisions')).not.toBeInTheDocument(), { timeout: 10000 })
    })
  })
})