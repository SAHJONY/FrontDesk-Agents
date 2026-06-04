import { describe, it, expect, beforeEach, vi } from 'vitest'

// ─── Mock owner-session ───────────────────────────────────────────────────────
// We mock auth so we don't need real session cookies in tests.
// Only getOwnerSession is mocked — ai-decision-engine is real (no mocking).

const { mockGetOwnerSession } = vi.hoisted(() => ({ mockGetOwnerSession: vi.fn() }))

vi.mock('@/lib/owner-session', () => ({
  getOwnerSession: mockGetOwnerSession,
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import { GET as decisionsGET, POST as decisionsPOST } from '@/app/api/ai/decisions/route'
import { resetDecisionsState } from '@/lib/ai-decision-engine'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockRequest(body: Record<string, unknown> = {}): any {
  return {
    json: async () => body,
    nextUrl: {
      searchParams: {
        get: (key: string) => (body[key] as string) ?? null,
      },
    },
  }
}

// ─── Authed owner session used in all tests ───────────────────────────────────

const AUTHED_OWNER = {
  id: 'owner-1',
  email: 'admin@test.com',
  name: 'Admin',
  role: 'owner',
  authenticated: true,
  loginTime: new Date().toISOString(),
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks()
  mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
  await resetDecisionsState()
})

// ─── Full Decision Flow ───────────────────────────────────────────────────────

describe('AI Decision Flow E2E', () => {
  describe('POST decide → GET decision', () => {
    it('creates a decision via POST and retrieves it via GET', async () => {
      // ── Step 1: POST a new decision ──────────────────────────────────────
      const decideReq = createMockRequest({
        action: 'decide',
        category: 'upsell',
        severity: 'medium',
        trigger: 'E2E upsell trigger',
        reasoning: 'Customer has health score 82 on starter plan after 3 months',
        decisionAction: 'Send upgrade offer with 1-month free trial on professional plan',
        metadata: { customerId: 'cust-e2e-upsell', currentPlan: 'starter' },
      })

      const postRes = await decisionsPOST(decideReq as any)
      const post = await postRes.json()

      expect(postRes.status).toBe(200)
      expect(post.success).toBe(true)
      expect(post.decision).toBeDefined()
      expect(post.decision.id).toBeTruthy()
      expect(post.decision.category).toBe('upsell')
      expect(post.decision.severity).toBe('medium')
      expect(post.decision.trigger).toBe('E2E upsell trigger')
      expect(post.decision.reasoning).toContain('health score 82')
      expect(post.decision.action).toBe('Send upgrade offer with 1-month free trial on professional plan')
      expect(post.decision.outcome).toBe('pending')
      expect(post.decision.metadata?.customerId).toBe('cust-e2e-upsell')
      expect(post.timestamp).toBeTruthy()

      const decisionId = post.decision.id

      // ── Step 2: GET all decisions and find the one we just created ────────
      const getReq = createMockRequest({ limit: '50' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '50' : null

      const getRes = await decisionsGET(getReq)
      const get = await getRes.json()

      expect(getRes.status).toBe(200)
      expect(get.success).toBe(true)
      expect(get.decisions).toBeDefined()

      const found = get.decisions.find((d: { id: string }) => d.id === decisionId)
      expect(found).toBeDefined()
      expect(found.result).toBe('Send upgrade offer with 1-month free trial on professional plan')
      expect(found.agent).toBe('E2E upsell trigger')
      expect(found.severity).toBe('medium')
      expect(found.outcome).toBe('pending')
    })

    it('decision appears as the most recent in GET (newest-first)', async () => {
      const decideReq = createMockRequest({
        action: 'decide',
        category: 'escalate',
        severity: 'high',
        trigger: 'Hot lead: Acme Corp',
        reasoning: 'Lead scored 95/100 with urgent urgency',
        decisionAction: 'IMMEDIATE: Slack alert + auto-demo booking',
      })

      const postRes = await decisionsPOST(decideReq as any)
      const post = await postRes.json()
      expect(postRes.status).toBe(200)

      const getReq = createMockRequest({ limit: '5' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '5' : null

      const getRes = await decisionsGET(getReq)
      const get = await getRes.json()

      // Most recent decision should be first (newest-first ordering)
      expect(get.decisions[0].agent).toBe('Hot lead: Acme Corp')
      expect(get.decisions[0].severity).toBe('high')
    })

    it('GET with limit=1 returns only the newest decision', async () => {
      // Create a new decision
      const decideReq = createMockRequest({
        action: 'decide',
        category: 'alert',
        severity: 'low',
        trigger: 'System nominal check',
        reasoning: 'Routine monitoring check',
        decisionAction: 'Log and continue',
      })

      const postRes = await decisionsPOST(decideReq as any)
      const post = await postRes.json()
      expect(postRes.status).toBe(200)

      // GET with limit=1 should return exactly 1 (the newest)
      const getReq = createMockRequest({ limit: '1' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '1' : null

      const getRes = await decisionsGET(getReq)
      const get = await getRes.json()

      expect(get.decisions).toHaveLength(1)
      expect(get.decisions[0].id).toBe(post.decision.id)
    })

    it('multiple POST decisions are all retrievable via GET', async () => {
      const triggers = ['First decision', 'Second decision', 'Third decision']

      for (const trigger of triggers) {
        const res = await decisionsPOST(
          createMockRequest({
            action: 'decide',
            category: 'onboard',
            severity: 'medium',
            trigger,
            reasoning: `Testing multiple decisions: ${trigger}`,
            decisionAction: 'Send onboarding email',
          }) as any
        )
        const post = await res.json()
        expect(res.status).toBe(200)
      }

      const getReq = createMockRequest({ limit: '10' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '10' : null

      const getRes = await decisionsGET(getReq)
      const get = await getRes.json()

      for (const trigger of triggers) {
        const found = get.decisions.find((d: { agent: string }) => d.agent === trigger)
        expect(found).toBeDefined()
      }
    })
  })

  describe('POST resolve → GET shows updated outcome', () => {
    it('resolves a decision and confirms updated outcome via GET', async () => {
      // ── Step 1: Create a decision ─────────────────────────────────────────
      const decideReq = createMockRequest({
        action: 'decide',
        category: 'retain',
        severity: 'high',
        trigger: 'At-risk customer: BadBuster Inc',
        reasoning: 'Health score dropped to 28 after 24 days without a call',
        decisionAction: 'IMMEDIATE: Retention offer + schedule check-in call via AI agent',
        metadata: { customerId: 'cust-retain-123' },
      })

      const postRes = await decisionsPOST(decideReq as any)
      const post = await postRes.json()
      expect(postRes.status).toBe(200)

      const decisionId = post.decision.id
      expect(post.decision.outcome).toBe('pending')

      // ── Step 2: Verify it's pending in GET ────────────────────────────────
      const getReq = createMockRequest({ limit: '50' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => null

      const getBefore = await (await decisionsGET(getReq)).json()
      const before = getBefore.decisions.find((d: { id: string }) => d.id === decisionId)
      expect(before.result).toBe('IMMEDIATE: Retention offer + schedule check-in call via AI agent')
      expect(before.agent).toBe('At-risk customer: BadBuster Inc')
      expect(before.outcome).toBe('pending')

      // ── Step 3: Resolve it to 'success' ───────────────────────────────────
      const resolveReq = createMockRequest({
        action: 'resolve',
        decisionId,
        outcome: 'success',
      })

      const resolveRes = await decisionsPOST(resolveReq as any)
      const resolvePost = await resolveRes.json()
      expect(resolveRes.status).toBe(200)
      expect(resolvePost.success).toBe(true)

      // ── Step 4: GET again and confirm outcome changed ─────────────────────
      const getAfter = await (await decisionsGET(getReq)).json()
      const after = getAfter.decisions.find((d: { id: string }) => d.id === decisionId)
      expect(after.outcome).toBe('success')
    })

    it('can change outcome multiple times', async () => {
      const decideReq = createMockRequest({
        action: 'decide',
        category: 'escalate',
        severity: 'medium',
        trigger: 'Multi-outcome test decision',
        reasoning: 'Testing outcome changes',
        decisionAction: 'Send intro email',
      })

      const postRes = await decisionsPOST(decideReq as any)
      const post = await postRes.json()
      const id = post.decision.id

      const getReq = createMockRequest({ limit: '10' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => null

      // pending → escalated
      await decisionsPOST(createMockRequest({ action: 'resolve', decisionId: id, outcome: 'escalated' }) as any)
      let get = await (await decisionsGET(getReq)).json()
      expect(get.decisions.find((d: { id: string }) => d.id === id)?.outcome).toBe('escalated')

      // escalated → failed
      await decisionsPOST(createMockRequest({ action: 'resolve', decisionId: id, outcome: 'failed' }) as any)
      get = await (await decisionsGET(getReq)).json()
      expect(get.decisions.find((d: { id: string }) => d.id === id)?.outcome).toBe('failed')

      // failed → success
      await decisionsPOST(createMockRequest({ action: 'resolve', decisionId: id, outcome: 'success' }) as any)
      get = await (await decisionsGET(getReq)).json()
      expect(get.decisions.find((d: { id: string }) => d.id === id)?.outcome).toBe('success')
    })

    it('resolve returns 200 for unknown decisionId (silent no-op)', async () => {
      const resolveReq = createMockRequest({
        action: 'resolve',
        decisionId: '00000000-0000-0000-0000-000000000000',
        outcome: 'success',
      })

      const res = await decisionsPOST(resolveReq as any)
      const post = await res.json()

      expect(res.status).toBe(200) // resolveDecision is a no-op for unknown IDs
      expect(post.success).toBe(true)
    })
  })

  describe('Auth guard', () => {
    it('returns 401 for unauthenticated GET', async () => {
      mockGetOwnerSession.mockResolvedValue(null)

      const req = createMockRequest({ limit: '10' }) as any
      req.nextUrl.searchParams.get = (k: string) => null

      const res = await decisionsGET(req)
      const get = await res.json()

      expect(res.status).toBe(401)
      expect(get.success).toBe(false)
      expect(get.error).toBe('Not authenticated')
    })

    it('returns 401 for unauthenticated POST', async () => {
      mockGetOwnerSession.mockResolvedValue(null)

      const req = createMockRequest({ action: 'decide', category: 'alert', severity: 'low', trigger: 't', reasoning: 'r', decisionAction: 'a' })
      const res = await decisionsPOST(req as any)
      const post = await res.json()

      expect(res.status).toBe(401)
      expect(post.success).toBe(false)
    })
  })

  describe('Decision metadata preservation', () => {
    it('preserves complex metadata through POST → GET cycle', async () => {
      const complexMetadata = {
        customerId: 'cust-complex',
        plan: 'starter',
        healthScore: 87,
        recentCalls: 12,
        tags: ['high-value', 'startup'],
        nested: { revenue: 50000, employees: 45 },
      }

      const postRes = await decisionsPOST(
        createMockRequest({
          action: 'decide',
          category: 'upsell',
          severity: 'medium',
          trigger: 'Complex metadata test',
          reasoning: 'Testing metadata preservation',
          decisionAction: 'Send offer',
          metadata: complexMetadata,
        }) as any
      )
      const post = await postRes.json()

      expect(postRes.status).toBe(200)
      expect(post.decision.metadata).toEqual(complexMetadata)

      const getReq = createMockRequest({ limit: '10' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => null

      const get = await (await decisionsGET(getReq)).json()
      const found = get.decisions.find((d: { id: string }) => d.id === post.decision.id)
      expect(JSON.parse(found.context)).toEqual(complexMetadata)
    })
  })

  describe('GET includes modelStatuses and selfHealing alongside decisions', () => {
    it('GET response includes modelStatuses and selfHealing data', async () => {
      const getReq = createMockRequest({ limit: '10' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => k === 'limit' ? '10' : null

      const res = await decisionsGET(getReq)
      const get = await res.json()

      expect(res.status).toBe(200)
      expect(get.success).toBe(true)
      expect(get.modelStatuses).toBeDefined()
      expect(Array.isArray(get.modelStatuses)).toBe(true)
      expect(get.modelStatuses.length).toBeGreaterThan(0)
      expect(get.selfHealing).toBeDefined()
      expect(typeof get.selfHealing.monitorRunning).toBe('boolean')
      expect(typeof get.selfHealing.overall).toBe('string')
      expect(get.selfHealing.uptimePercent).toBeGreaterThan(0)
    })

    it('GET with metrics=true includes AI decision metrics', async () => {
      // Create a decision first so metrics aren't zero
      await decisionsPOST(
        createMockRequest({
          action: 'decide',
          category: 'alert',
          severity: 'low',
          trigger: 'Metrics test',
          reasoning: 'Test',
          decisionAction: 'Test',
        }) as any
      )

      const getReq = createMockRequest({ limit: '10' }) as any
      getReq.nextUrl.searchParams.get = (k: string) => k === 'metrics' ? 'true' : null

      const res = await decisionsGET(getReq)
      const get = await res.json()

      expect(res.status).toBe(200)
      expect(get.metrics).toBeDefined()
      expect(get.metrics.totalDecisions).toBeGreaterThan(0)
      expect(typeof get.metrics.successRate).toBe('number')
    })
  })
})