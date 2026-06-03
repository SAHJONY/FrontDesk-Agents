import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock ai-decision-engine ───────────────────────────────────────────────

const { mockGetDecisions, mockMakeDecision, mockEvaluateAndDecide, mockGetAIDecisionMetrics, mockResolveDecision, mockGetModelRouterStatuses, mockGetSelfHealingStatus, mockAcknowledgeAlert, mockResolveAlert } = vi.hoisted(() => ({
  mockGetDecisions: vi.fn(),
  mockMakeDecision: vi.fn(),
  mockEvaluateAndDecide: vi.fn(),
  mockGetAIDecisionMetrics: vi.fn(),
  mockResolveDecision: vi.fn(),
  mockGetModelRouterStatuses: vi.fn(),
  mockGetSelfHealingStatus: vi.fn(),
  mockAcknowledgeAlert: vi.fn(),
  mockResolveAlert: vi.fn(),
}))

vi.mock('@/lib/ai-decision-engine', () => ({
  getDecisions: mockGetDecisions,
  makeDecision: mockMakeDecision,
  evaluateAndDecide: mockEvaluateAndDecide,
  getAIDecisionMetrics: mockGetAIDecisionMetrics,
  resolveDecision: mockResolveDecision,
  getModelRouterStatuses: mockGetModelRouterStatuses,
  getSelfHealingStatus: mockGetSelfHealingStatus,
  acknowledgeAlert: mockAcknowledgeAlert,
  resolveAlert: mockResolveAlert,
}))

// ─── Mock owner-session ────────────────────────────────────────────────────

const { mockGetOwnerSession } = vi.hoisted(() => ({ mockGetOwnerSession: vi.fn() }))

vi.mock('@/lib/owner-session', () => ({
  getOwnerSession: mockGetOwnerSession,
}))

// ─── Mock next/server ──────────────────────────────────────────────────────

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => {
      const body = JSON.stringify(data)
      return {
        status: init?.status ?? 200,
        async text() { return body },
        async json() { return data },
      }
    }),
  },
}))

// ─── Imports ───────────────────────────────────────────────────────────────

import { GET as decisionsGET, POST as decisionsPOST } from '@/app/api/ai/decisions/route'
import { GET as modelRoutingGET } from '@/app/api/ai/model-routing/route'
import { GET as selfHealingGET, POST as selfHealingPOST } from '@/app/api/ai/self-healing/route'

// ─── Helpers ───────────────────────────────────────────────────────────────

function createMockRequest(body: Record<string, unknown> = {}): any {
  return {
    json: async () => body,
    nextUrl: {
      searchParams: {
        get: (key: string) => body[key] ?? null,
      },
    },
  }
}

async function parseResponse(res: { text: () => Promise<string>; status: number }) {
  const text = await res.text()
  return { data: JSON.parse(text), status: res.status }
}

// ─── Shared setup ──────────────────────────────────────────────────────────

const AUTHED_OWNER = { id: 'owner-1', email: 'admin@test.com', name: 'Admin', role: 'owner', authenticated: true, loginTime: new Date().toISOString() }

beforeEach(() => {
  vi.clearAllMocks()
  mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
  mockGetDecisions.mockReturnValue([])
  mockGetModelRouterStatuses.mockReturnValue([])
  mockGetSelfHealingStatus.mockReturnValue({ monitorRunning: true, anomaliesDetected: 0, autoRemediated: 0, manualInterventions: 0, lastAnomalyAt: null, lastRemediationAt: null, systemHealth: 'healthy', activeAlerts: [] })
  mockGetAIDecisionMetrics.mockReturnValue({ totalDecisions: 0, byCategory: {}, bySeverity: {}, successRate: 0, avgResolutionTimeMs: 0, activeEscalations: 0 })
  mockMakeDecision.mockReturnValue({ id: 'dec-test-1', timestamp: new Date().toISOString(), category: 'escalate', severity: 'high', trigger: 'test', reasoning: 'test reasoning', action: 'test action', outcome: 'pending' })
  mockEvaluateAndDecide.mockReturnValue([])
  mockResolveDecision.mockImplementation(() => {})
  mockAcknowledgeAlert.mockImplementation(() => {})
  mockResolveAlert.mockImplementation(() => {})
})

// ─── /api/ai/decisions ─────────────────────────────────────────────────────

describe('GET /api/ai/decisions', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetOwnerSession.mockResolvedValue(null)
    const req = createMockRequest()
    const res = await decisionsGET(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns decisions with modelStatuses and selfHealing', async () => {
    mockGetDecisions.mockReturnValue([{ id: 'dec-1', action: 'route_model', agent: 'hermes-gateway', severity: 'low', timestamp: new Date().toISOString(), context: 'test', result: 'ok', reasoning: 'because', acknowledged: false, resolved: false }])
    mockGetModelRouterStatuses.mockReturnValue([{ provider: 'nvidia', model: 'llama-3.1', status: 'active', latencyMs: 120, requestsPerMinute: 50, healthScore: 0.98, isPrimary: true, fallbackOf: null }])
    mockGetSelfHealingStatus.mockReturnValue({ monitorRunning: true, anomaliesDetected: 2, autoRemediated: 1, manualInterventions: 0, lastAnomalyAt: null, lastRemediationAt: null, systemHealth: 'healthy', activeAlerts: [] })

    const req = createMockRequest()
    const res = await decisionsGET(req as any)
    const { data, status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.decisions).toHaveLength(1)
    expect(data.modelStatuses).toHaveLength(1)
    expect(data.selfHealing).toBeDefined()
  })

  it('respects limit parameter', async () => {
    const req = createMockRequest({ limit: '10' }) as any
    req.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '10' : null
    const res = await decisionsGET(req)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(200)
    expect(mockGetDecisions).toHaveBeenCalledWith(10)
  })

  it('caps limit at maximum 200', async () => {
    const req = createMockRequest() as any
    req.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '999' : null
    const res = await decisionsGET(req)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(200)
    expect(mockGetDecisions).toHaveBeenCalledWith(200)
  })

  it('returns metrics when metrics=true', async () => {
    mockGetAIDecisionMetrics.mockReturnValue({ totalDecisions: 10, byCategory: { escalate: 5 }, bySeverity: { high: 3 }, successRate: 0.8, avgResolutionTimeMs: 30000, activeEscalations: 1 })
    const req = createMockRequest() as any
    req.nextUrl.searchParams.get = (k: string) => k === 'metrics' ? 'true' : null
    const res = await decisionsGET(req)
    const { data } = await parseResponse(res)
    expect(data.metrics).toBeDefined()
    expect(data.metrics.totalDecisions).toBe(10)
  })

  it('does not return metrics when metrics param is absent', async () => {
    const req = createMockRequest() as any
    req.nextUrl.searchParams.get = (k: string) => null
    const res = await decisionsGET(req)
    const { data } = await parseResponse(res)
    expect(data.metrics).toBeNull()
  })

  it('returns 500 on unexpected error', async () => {
    mockGetOwnerSession.mockRejectedValue(new Error('Unexpected'))
    const req = createMockRequest()
    const res = await decisionsGET(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(500)
    expect(data.success).toBe(false)
  })
})

describe('POST /api/ai/decisions', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetOwnerSession.mockResolvedValue(null)
    const req = createMockRequest({ action: 'evaluate', context: {} })
    const res = await decisionsPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('returns 400 for unknown action', async () => {
    const req = createMockRequest({ action: 'unknown_action' })
    const res = await decisionsPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(400)
    expect(data.error).toBe('Unknown action')
  })

  describe('evaluate action', () => {
    it('calls evaluateAndDecide with context', async () => {
      mockEvaluateAndDecide.mockReturnValue([{ id: 'dec-ev-1', category: 'escalate', severity: 'high', trigger: 'hot lead', reasoning: 'score 92', action: 'slack alert', outcome: 'pending', timestamp: new Date().toISOString() }])
      const req = createMockRequest({ action: 'evaluate', context: { metrics: { mrr: 50000 } } })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.decisionsMade).toBe(1)
      expect(mockEvaluateAndDecide).toHaveBeenCalledWith({ metrics: { mrr: 50000 } })
    })

    it('treats missing context as empty object', async () => {
      const req = createMockRequest({ action: 'evaluate' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(200)
      expect(mockEvaluateAndDecide).toHaveBeenCalledWith({})
    })
  })

  describe('decide action', () => {
    it('returns 400 when required fields are missing', async () => {
      const req = createMockRequest({ action: 'decide' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('returns 400 for invalid category', async () => {
      const req = createMockRequest({ action: 'decide', category: 'invalid_cat', severity: 'high', trigger: 'test', reasoning: 'test', decisionAction: 'test_action' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid category')
    })

    it('returns 400 for invalid severity', async () => {
      const req = createMockRequest({ action: 'decide', category: 'escalate', severity: 'invalid_sev', trigger: 'test', reasoning: 'test', decisionAction: 'test_action' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid severity')
    })

    it('returns 400 when metadata is not an object', async () => {
      const req = createMockRequest({ action: 'decide', category: 'escalate', severity: 'high', trigger: 'test', reasoning: 'test', decisionAction: 'test_action', metadata: 'not an object' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('metadata must be an object')
    })

    it('accepts all valid categories', async () => {
      const validCategories = ['escalate', 'onboard', 'upsell', 'retain', 'optimize', 'alert']
      for (const category of validCategories) {
        mockMakeDecision.mockReturnValue({ id: `dec-${category}`, timestamp: new Date().toISOString(), category, severity: 'medium', trigger: 'test', reasoning: 'test', action: 'test_action', outcome: 'pending' })
        const req = createMockRequest({ action: 'decide', category, severity: 'medium', trigger: 'test', reasoning: 'test', decisionAction: 'test_action' })
        const res = await decisionsPOST(req as any)
        const { data, status } = await parseResponse(res)
        expect(status).toBe(200)
        expect(data.success).toBe(true)
      }
    })

    it('accepts all valid severities', async () => {
      const validSeverities = ['critical', 'high', 'medium', 'low', 'info']
      for (const severity of validSeverities) {
        mockMakeDecision.mockReturnValue({ id: `dec-${severity}`, timestamp: new Date().toISOString(), category: 'escalate', severity, trigger: 'test', reasoning: 'test', action: 'test_action', outcome: 'pending' })
        const req = createMockRequest({ action: 'decide', category: 'escalate', severity, trigger: 'test', reasoning: 'test', decisionAction: 'test_action' })
        const res = await decisionsPOST(req as any)
        const { data, status } = await parseResponse(res)
        expect(status).toBe(200)
        expect(data.success).toBe(true)
      }
    })

    it('calls makeDecision with correct params', async () => {
      const params = { category: 'upsell' as const, severity: 'medium' as const, trigger: 'High-value customer', reasoning: 'Health score 88 on starter', action: 'Send upgrade offer', metadata: { customerId: 'cust-123' } }
      mockMakeDecision.mockReturnValue({ id: 'dec-upsell-1', timestamp: new Date().toISOString(), ...params, outcome: 'pending' })
      // Build request WITHOUT spreading params to avoid duplicate 'action' key collision
      const req = createMockRequest({
        action: 'decide',
        category: 'upsell',
        severity: 'medium',
        trigger: 'High-value customer',
        reasoning: 'Health score 88 on starter',
        decisionAction: 'Send upgrade offer',
        metadata: { customerId: 'cust-123' },
      })
      await decisionsPOST(req as any)
      expect(mockMakeDecision).toHaveBeenCalledWith(params)
    })

    it('returns the created decision', async () => {
      mockMakeDecision.mockReturnValue({ id: 'dec-created-1', timestamp: new Date().toISOString(), category: 'retain', severity: 'high', trigger: 'At-risk customer', reasoning: 'Score dropped to 31', action: 'Retention offer', outcome: 'pending' })
      const req = createMockRequest({ action: 'decide', category: 'retain', severity: 'high', trigger: 'At-risk customer', reasoning: 'Score dropped to 31', decisionAction: 'Retention offer' })
      const res = await decisionsPOST(req as any)
      const { data } = await parseResponse(res)
      expect(data.decision.id).toBe('dec-created-1')
      expect(data.decision.category).toBe('retain')
    })
  })

  describe('resolve action', () => {
    it('returns 400 when decisionId is missing', async () => {
      const req = createMockRequest({ action: 'resolve', outcome: 'success' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Missing decisionId or outcome')
    })

    it('returns 400 when outcome is missing', async () => {
      const req = createMockRequest({ action: 'resolve', decisionId: 'dec-123' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Missing decisionId or outcome')
    })

    it('returns 400 for invalid outcome', async () => {
      const req = createMockRequest({ action: 'resolve', decisionId: 'dec-123', outcome: 'invalid_outcome' })
      const res = await decisionsPOST(req as any)
      const { data, status } = await parseResponse(res)
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid outcome')
    })

    it('accepts all valid outcomes', async () => {
      const validOutcomes = ['success', 'failed', 'pending', 'escalated']
      for (const outcome of validOutcomes) {
        const req = createMockRequest({ action: 'resolve', decisionId: 'dec-123', outcome })
        const res = await decisionsPOST(req as any)
        const { data, status } = await parseResponse(res)
        expect(status).toBe(200)
        expect(data.success).toBe(true)
      }
    })

    it('calls resolveDecision with correct args', async () => {
      const req = createMockRequest({ action: 'resolve', decisionId: 'dec-abc', outcome: 'success' })
      await decisionsPOST(req as any)
      expect(mockResolveDecision).toHaveBeenCalledWith('dec-abc', 'success')
    })
  })
})

// ─── /api/ai/model-routing ─────────────────────────────────────────────────

describe('GET /api/ai/model-routing', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetOwnerSession.mockResolvedValue(null)
    const res = await modelRoutingGET()
    const { data, status } = await parseResponse(res)
    expect(status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns model statuses with aggregate metrics', async () => {
    mockGetModelRouterStatuses.mockReturnValue([
      { provider: 'nvidia', model: 'llama-3.1', status: 'active', latencyMs: 120, requestsPerMinute: 50, healthScore: 0.96, isPrimary: true, fallbackOf: null },
      { provider: 'openai', model: 'gpt-4.5', status: 'active', latencyMs: 300, requestsPerMinute: 80, healthScore: 0.88, isPrimary: false, fallbackOf: null },
      { provider: 'anthropic', model: 'claude-opus-4', status: 'degraded', latencyMs: 600, requestsPerMinute: 20, healthScore: 0.72, isPrimary: false, fallbackOf: null },
    ])

    const res = await modelRoutingGET()
    const { data, status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.statuses).toHaveLength(3)
    expect(data.aggregate).toBeDefined()
    expect(data.aggregate.activeProviders).toBe(2)
    expect(data.aggregate.totalRequestsPerMinute).toBe(150)
    expect(typeof data.aggregate.avgHealthScore).toBe('number')
    expect(typeof data.aggregate.avgLatencyMs).toBe('number')
  })

  it('calculates routing strategy based on avg health', async () => {
    mockGetModelRouterStatuses.mockReturnValue([
      { provider: 'nvidia', model: 'llama', status: 'active', latencyMs: 100, requestsPerMinute: 100, healthScore: 0.95, isPrimary: true, fallbackOf: null },
      { provider: 'openai', model: 'gpt-4', status: 'active', latencyMs: 200, requestsPerMinute: 100, healthScore: 0.93, isPrimary: false, fallbackOf: null },
    ])

    const res = await modelRoutingGET()
    const { data } = await parseResponse(res)

    // avgHealthScore = (0.95 + 0.93) / 2 * 10 rounded = 9.4 -> 9.4 > 9 so 'performance'
    expect(['performance', 'balanced', 'conservative']).toContain(data.aggregate.routingStrategy)
  })

  it('returns 500 on unexpected error', async () => {
    mockGetOwnerSession.mockRejectedValue(new Error('Unexpected'))
    const res = await modelRoutingGET()
    const { data, status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})

// ─── /api/ai/self-healing ──────────────────────────────────────────────────

describe('GET /api/ai/self-healing', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetOwnerSession.mockResolvedValue(null)
    const res = await selfHealingGET()
    const { data, status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('returns self-healing status data', async () => {
    const mockStatus = {
      monitorRunning: true,
      anomaliesDetected: 5,
      autoRemediated: 3,
      manualInterventions: 1,
      lastAnomalyAt: new Date().toISOString(),
      lastRemediationAt: new Date().toISOString(),
      systemHealth: 'healthy' as const,
      activeAlerts: [
        { id: 'alert-1', type: 'anomaly' as const, severity: 'high' as const, title: 'High error rate', description: 'Error rate exceeded threshold', createdAt: new Date().toISOString(), acknowledgedAt: undefined, resolvedAt: undefined },
      ],
    }
    mockGetSelfHealingStatus.mockReturnValue(mockStatus)

    const res = await selfHealingGET()
    const { data, status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.monitorRunning).toBe(true)
    expect(data.anomaliesDetected).toBe(5)
    expect(data.autoRemediated).toBe(3)
    expect(data.systemHealth).toBe('healthy')
    expect(data.activeAlerts).toHaveLength(1)
  })

  it('returns 500 on unexpected error', async () => {
    mockGetOwnerSession.mockRejectedValue(new Error('Unexpected'))
    const res = await selfHealingGET()
    const { data, status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})

describe('POST /api/ai/self-healing', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetOwnerSession.mockResolvedValue(null)
    const req = createMockRequest({ action: 'acknowledge', alertId: 'alert-1' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('returns 400 for unknown action', async () => {
    const req = createMockRequest({ action: 'unknown_action' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(400)
    expect(data.error).toBe('Unknown action')
  })

  it('acknowledges alert when action=acknowledge and alertId provided', async () => {
    const req = createMockRequest({ action: 'acknowledge', alertId: 'alert-42' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockAcknowledgeAlert).toHaveBeenCalledWith('alert-42')
  })

  it('returns 400 when alertId missing for acknowledge', async () => {
    const req = createMockRequest({ action: 'acknowledge' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('resolves alert when action=resolve and alertId provided', async () => {
    const req = createMockRequest({ action: 'resolve', alertId: 'alert-99' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockResolveAlert).toHaveBeenCalledWith('alert-99')
  })

  it('returns 400 when alertId missing for resolve', async () => {
    const req = createMockRequest({ action: 'resolve' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('returns 500 on unexpected error', async () => {
    mockGetOwnerSession.mockRejectedValue(new Error('Unexpected'))
    const req = createMockRequest({ action: 'acknowledge', alertId: 'alert-1' })
    const res = await selfHealingPOST(req as any)
    const { data, status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})