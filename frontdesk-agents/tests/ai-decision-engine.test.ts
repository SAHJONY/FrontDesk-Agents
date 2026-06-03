import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import {
  resetDecisionsState,
  getDecisions,
  makeDecision,
  resolveDecision,
  evaluateAndDecide,
  getModelRouterStatuses,
  getSelfHealingStatus,
  acknowledgeAlert,
  resolveAlert,
  getAIDecisionMetrics,
} from '@/lib/ai-decision-engine'

// ─── Setup / Teardown ──────────────────────────────────────────────────────

beforeEach(() => {
  resetDecisionsState()
})

afterEach(() => {
  // Ensure isolated state per test
  resetDecisionsState()
})

// ─── makeDecision ──────────────────────────────────────────────────────────

describe('makeDecision', () => {
  it('creates a decision with all required fields', async () => {
    const decision = await makeDecision({
      category: 'escalate',
      severity: 'high',
      trigger: 'Hot lead',
      reasoning: 'Lead score 92/100',
      action: 'Send Slack alert',
    })

    expect(decision.id).toBeTruthy()
    expect(decision.timestamp).toBeTruthy()
    expect(decision.category).toBe('escalate')
    expect(decision.severity).toBe('high')
    expect(decision.trigger).toBe('Hot lead')
    expect(decision.reasoning).toBe('Lead score 92/100')
    expect(decision.action).toBe('Send Slack alert')
    expect(decision.outcome).toBe('pending')
  })

  it('accepts metadata object', async () => {
    const decision = await makeDecision({
      category: 'upsell',
      severity: 'medium',
      trigger: 'Upsell opportunity',
      reasoning: 'High engagement',
      action: 'Send offer',
      metadata: { customerId: 'cust-123', plan: 'starter' },
    })

    expect(decision.metadata).toEqual({ customerId: 'cust-123', plan: 'starter' })
  })

  it('generates a unique id for each call', async () => {
    const d1 = await makeDecision({ category: 'alert', severity: 'low', trigger: 't1', reasoning: 'r1', action: 'a1' })
    const d2 = await makeDecision({ category: 'alert', severity: 'low', trigger: 't2', reasoning: 'r2', action: 'a2' })
    expect(d1.id).not.toBe(d2.id)
  })

  it('assigns timestamp as ISO string', async () => {
    const before = new Date().toISOString()
    const decision = await makeDecision({ category: 'onboard', severity: 'medium', trigger: 't', reasoning: 'r', action: 'a' })
    const after = new Date().toISOString()
    expect(decision.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(decision.timestamp >= before).toBe(true)
    expect(decision.timestamp <= after).toBe(true)
  })

  it('creates an active alert for critical severity', async () => {
    const decision = await makeDecision({
      category: 'escalate',
      severity: 'critical',
      trigger: 'System down',
      reasoning: 'Service unavailable',
      action: 'Page on-call',
    })

    const status = await getSelfHealingStatus()
    // Alerts use a separate generateId() — correlate by title prefix (ESCALATE/RETAIN) and category
    const matchingAlert = status.activeAlerts.find(a => a.title.includes('ESCALATE') && a.severity === 'critical')
    expect(matchingAlert).toBeDefined()
    expect(matchingAlert!.type).toBe('threshold_breach')
  })

  it('creates an active alert for high severity', async () => {
    const decision = await makeDecision({
      category: 'retain',
      severity: 'high',
      trigger: 'Churn risk',
      reasoning: 'Score dropped to 30',
      action: 'Send retention offer',
    })

    const status = await getSelfHealingStatus()
    const matchingAlert = status.activeAlerts.find(a => a.title.includes('RETAIN') && a.severity === 'high')
    expect(matchingAlert).toBeDefined()
  })

  it('does NOT create an alert for medium severity', async () => {
    await makeDecision({ category: 'upsell', severity: 'medium', trigger: 't', reasoning: 'r', action: 'a' })
    const status = await getSelfHealingStatus()
    // Seed has some existing alerts; ensure no NEW untracked alert
    const seededCount = 2 // from seed (retain high + alert critical)
    expect(status.activeAlerts.length).toBeLessThanOrEqual(seededCount)
  })

  it('does NOT create an alert for low severity', async () => {
    await makeDecision({ category: 'optimize', severity: 'low', trigger: 't', reasoning: 'r', action: 'a' })
    const status = await getSelfHealingStatus()
    expect(status.activeAlerts.some(a => a.severity === 'low')).toBe(false)
  })

  it('does NOT create an alert for info severity', async () => {
    await makeDecision({ category: 'alert', severity: 'info', trigger: 't', reasoning: 'r', action: 'a' })
    const status = await getSelfHealingStatus()
    expect(status.activeAlerts.some(a => a.severity === 'info')).toBe(false)
  })

  it('limits activeAlerts to 20 entries', async () => {
    for (let i = 0; i < 25; i++) {
      await makeDecision({
        category: 'escalate',
        severity: i % 2 === 0 ? 'critical' : 'high',
        trigger: `trigger-${i}`,
        reasoning: `reasoning-${i}`,
        action: `action-${i}`,
      })
    }
    const status = await getSelfHealingStatus()
    expect(status.activeAlerts.length).toBeLessThanOrEqual(20)
  })

  it('limits decisions store to last 500 entries', async () => {
    for (let i = 0; i < 550; i++) {
      await makeDecision({ category: 'alert', severity: 'info', trigger: `${i}`, reasoning: 'r', action: 'a' })
    }
    const all = await getDecisions(1000)
    expect(all.length).toBeLessThanOrEqual(500)
  })

  it('accepts all valid categories', async () => {
    const categories = ['escalate', 'onboard', 'upsell', 'retain', 'optimize', 'alert'] as const
    for (const category of categories) {
      const d = await makeDecision({ category, severity: 'low', trigger: 't', reasoning: 'r', action: 'a' })
      expect(d.category).toBe(category)
    }
  })

  it('accepts all valid severities', async () => {
    const severities = ['critical', 'high', 'medium', 'low', 'info'] as const
    for (const severity of severities) {
      const d = await makeDecision({ category: 'alert', severity, trigger: 't', reasoning: 'r', action: 'a' })
      expect(d.severity).toBe(severity)
    }
  })
})

// ─── resolveDecision ───────────────────────────────────────────────────────

describe('resolveDecision', () => {
  it('updates outcome of an existing decision', async () => {
    const d = await makeDecision({ category: 'escalate', severity: 'high', trigger: 't', reasoning: 'r', action: 'a' })
    await resolveDecision(d.id, 'success')

    const decisions = await getDecisions(10)
    const resolved = decisions.find(dec => dec.id === d.id)
    expect(resolved!.outcome).toBe('success')
  })

  it('accepts all valid outcomes', async () => {
    const outcomes = ['success', 'failed', 'pending', 'escalated'] as const
    for (const outcome of outcomes) {
      const d = await makeDecision({ category: 'alert', severity: 'low', trigger: 't', reasoning: 'r', action: 'a' })
      await resolveDecision(d.id, outcome)
      const decisions = await getDecisions(10)
      expect(decisions.find(dec => dec.id === d.id)!.outcome).toBe(outcome)
    }
  })

  it('silently ignores unknown decision id', async () => {
    await expect(resolveDecision('non-existent-id', 'success')).resolves.toBeUndefined()
  })

  it('can change outcome multiple times', async () => {
    const d = await makeDecision({ category: 'escalate', severity: 'high', trigger: 't', reasoning: 'r', action: 'a' })
    await resolveDecision(d.id, 'success')
    await resolveDecision(d.id, 'failed')
    const decisions = await getDecisions(10)
    expect(decisions.find(dec => dec.id === d.id)!.outcome).toBe('failed')
  })
})

// ─── getDecisions ──────────────────────────────────────────────────────────

describe('getDecisions', () => {
  it('returns seeded decisions on first call', async () => {
    const decisions = await getDecisions(50)
    expect(decisions.length).toBeGreaterThan(0)
  })

  it('returns newest-first ordering', async () => {
    const d1 = await makeDecision({ category: 'alert', severity: 'low', trigger: 'first', reasoning: 'r', action: 'a' })
    const d2 = await makeDecision({ category: 'alert', severity: 'low', trigger: 'second', reasoning: 'r', action: 'a' })
    const decisions = await getDecisions(10)
    expect(decisions[0].trigger).toBe('second')
    expect(decisions[1].trigger).toBe('first')
  })

  it('respects limit parameter', async () => {
    const decisions = await getDecisions(3)
    expect(decisions.length).toBeLessThanOrEqual(3)
  })

  it('returns all decisions when limit exceeds count', async () => {
    const decisions = await getDecisions(1000)
    expect(decisions.length).toBeGreaterThanOrEqual(8) // at least the 8 seeded ones
  })

  it('does not include decision id in the array more than once', async () => {
    const d = await makeDecision({ category: 'alert', severity: 'low', trigger: 'unique', reasoning: 'r', action: 'a' })
    const decisions = await getDecisions(100)
    const matches = decisions.filter(dec => dec.id === d.id)
    expect(matches).toHaveLength(1)
  })
})

// ─── evaluateAndDecide ─────────────────────────────────────────────────────

describe('evaluateAndDecide', () => {
  describe('churn risk detection (customerHealth)', () => {
    it('creates retain decisions for customers with healthScore < 40', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-1', healthScore: 35, daysSinceLastCall: 15, plan: 'starter', mrr: 50 },
        ],
      })

      expect(actions.length).toBeGreaterThan(0)
      const retain = actions.find(a => a.category === 'retain')
      expect(retain).toBeDefined()
      expect(retain!.metadata?.customerId).toBe('cust-1')
    })

    it('creates retain decisions for customers with daysSinceLastCall > 21', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-2', healthScore: 60, daysSinceLastCall: 25, plan: 'professional', mrr: 100 },
        ],
      })

      const retain = actions.find(a => a.category === 'retain')
      expect(retain).toBeDefined()
    })

    it('assigns critical severity for healthScore < 25', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-critical', healthScore: 20, daysSinceLastCall: 30, plan: 'starter', mrr: 50 },
        ],
      })

      const retain = actions.find(a => a.category === 'retain')
      expect(retain!.severity).toBe('critical')
    })

    it('assigns high severity for healthScore between 25 and 40', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-high', healthScore: 30, daysSinceLastCall: 22, plan: 'starter', mrr: 50 },
        ],
      })

      const retain = actions.find(a => a.category === 'retain')
      expect(retain!.severity).toBe('high')
    })

    it('handles multiple at-risk customers', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-a', healthScore: 35, daysSinceLastCall: 15, plan: 'starter', mrr: 50 },
          { customerId: 'cust-b', healthScore: 30, daysSinceLastCall: 22, plan: 'professional', mrr: 100 },
          { customerId: 'cust-c', healthScore: 38, daysSinceLastCall: 10, plan: 'starter', mrr: 50 },
        ],
      })

      const retainActions = actions.filter(a => a.category === 'retain')
      expect(retainActions.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('upsell detection (customerHealth)', () => {
    it('creates upsell decisions for healthy starter customers (healthScore > 75)', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-upsell', healthScore: 88, daysSinceLastCall: 3, plan: 'starter', mrr: 50 },
        ],
      })

      const upsell = actions.find(a => a.category === 'upsell')
      expect(upsell).toBeDefined()
      expect(upsell!.metadata?.customerId).toBe('cust-upsell')
    })

    it('does not upsell non-starter plan customers', async () => {
      const actions = await evaluateAndDecide({
        customerHealth: [
          { customerId: 'cust-pro', healthScore: 88, daysSinceLastCall: 3, plan: 'professional', mrr: 100 },
        ],
      })

      expect(actions.some(a => a.category === 'upsell')).toBe(false)
    })

    it('limits upsell candidates to top 3', async () => {
      const customers = Array.from({ length: 10 }, (_, i) => ({
        customerId: `cust-${i}`,
        healthScore: 80 + i,
        daysSinceLastCall: 2,
        plan: 'starter',
        mrr: 50,
      }))

      const actions = await evaluateAndDecide({ customerHealth: customers })
      const upsellActions = actions.filter(a => a.category === 'upsell')
      expect(upsellActions.length).toBe(3) // exactly top 3 (sorted by health desc, slice 0-3)
    })
  })

  describe('hot lead detection (newLeads)', () => {
    it('creates escalate decisions for leads with score >= 80', async () => {
      const actions = await evaluateAndDecide({
        newLeads: [
          { businessName: 'Hot Corp', score: 92, urgency: 'normal' },
        ],
      })

      const escalate = actions.find(a => a.category === 'escalate')
      expect(escalate).toBeDefined()
      expect(escalate!.metadata?.businessName).toBe('Hot Corp')
    })

    it('assigns high severity for urgent leads', async () => {
      const actions = await evaluateAndDecide({
        newLeads: [
          { businessName: 'Urgent Corp', score: 85, urgency: 'urgent' },
        ],
      })

      const escalate = actions.find(a => a.category === 'escalate')
      expect(escalate!.severity).toBe('high')
    })

    it('assigns medium severity for non-urgent leads', async () => {
      const actions = await evaluateAndDecide({
        newLeads: [
          { businessName: 'Normal Corp', score: 82, urgency: 'normal' },
        ],
      })

      const escalate = actions.find(a => a.category === 'escalate')
      expect(escalate!.severity).toBe('medium')
    })

    it('does not trigger for leads below score 80', async () => {
      const actions = await evaluateAndDecide({
        newLeads: [
          { businessName: 'Warm Lead', score: 65, urgency: 'normal' },
        ],
      })

      expect(actions.some(a => a.category === 'escalate')).toBe(false)
    })
  })

  describe('system health monitoring (systemErrors)', () => {
    it('creates alert for systemErrors > 10', async () => {
      const actions = await evaluateAndDecide({ systemErrors: 15 })
      expect(actions.some(a => a.category === 'alert')).toBe(true)
    })

    it('assigns critical severity for systemErrors > 50', async () => {
      const actions = await evaluateAndDecide({ systemErrors: 75 })
      const alert = actions.find(a => a.category === 'alert')
      expect(alert!.severity).toBe('critical')
    })

    it('assigns high severity for systemErrors between 10 and 50', async () => {
      const actions = await evaluateAndDecide({ systemErrors: 30 })
      const alert = actions.find(a => a.category === 'alert')
      expect(alert!.severity).toBe('high')
    })

    it('does not trigger when systemErrors <= 10', async () => {
      const actions = await evaluateAndDecide({ systemErrors: 5 })
      expect(actions.some(a => a.category === 'alert')).toBe(false)
    })
  })

  describe('revenue optimization (metrics)', () => {
    it('creates optimize decision when churnRate > 0.08', async () => {
      const actions = await evaluateAndDecide({
        metrics: { mrr: 50000, churnRate: 0.12 },
      })

      const optimize = actions.find(a => a.category === 'optimize')
      expect(optimize).toBeDefined()
    })

    it('does not trigger when churnRate <= 0.08', async () => {
      const actions = await evaluateAndDecide({
        metrics: { mrr: 50000, churnRate: 0.05 },
      })

      expect(actions.some(a => a.category === 'optimize')).toBe(false)
    })

    it('creates optimize decision when LTV/CAC ratio < 2', async () => {
      const actions = await evaluateAndDecide({
        metrics: { ltv: 300, cac: 200 },
      })

      const optimize = actions.find(a => a.category === 'optimize')
      expect(optimize).toBeDefined()
      expect(optimize!.trigger).toContain('LTV/CAC')
    })

    it('does not trigger when LTV/CAC >= 2', async () => {
      const actions = await evaluateAndDecide({
        metrics: { ltv: 600, cac: 200 },
      })

      expect(actions.some(a => a.category === 'optimize')).toBe(false)
    })
  })

  it('handles empty context gracefully', async () => {
    const actions = await evaluateAndDecide({})
    expect(Array.isArray(actions)).toBe(true)
  })

  it('handles context with only metrics', async () => {
    const actions = await evaluateAndDecide({ metrics: { mrr: 50000, churnRate: 0.05 } })
    expect(Array.isArray(actions)).toBe(true)
  })

  it('combines triggers from multiple context sources', async () => {
    const actions = await evaluateAndDecide({
      customerHealth: [{ customerId: 'cust-1', healthScore: 35, daysSinceLastCall: 15, plan: 'starter', mrr: 50 }],
      newLeads: [{ businessName: 'Hot Lead', score: 90, urgency: 'urgent' }],
      metrics: { mrr: 50000, churnRate: 0.12 },
    })

    expect(actions.length).toBeGreaterThan(1)
  })
})

// ─── getModelRouterStatuses ────────────────────────────────────────────────

describe('getModelRouterStatuses', () => {
  it('returns an array of model statuses', async () => {
    const statuses = getModelRouterStatuses()
    expect(Array.isArray(statuses)).toBe(true)
    expect(statuses.length).toBeGreaterThan(0)
  })

  it('each status has required provider, model, latencyMs, healthScore fields', async () => {
    const statuses = getModelRouterStatuses()
    for (const s of statuses) {
      expect(s.provider).toBeTruthy()
      expect(s.model).toBeTruthy()
      expect(s.status).toBeTruthy()
      expect(typeof s.latencyMs).toBe('number')
      expect(typeof s.healthScore).toBe('number')
      expect(s.healthScore).toBeGreaterThanOrEqual(0)
      expect(s.healthScore).toBeLessThanOrEqual(100)
    }
  })

  it('returns providers nvidia, openai, anthropic, hermes', async () => {
    const statuses = getModelRouterStatuses()
    const providers = statuses.map(s => s.provider)
    expect(providers).toContain('nvidia')
    expect(providers).toContain('openai')
    expect(providers).toContain('anthropic')
    expect(providers).toContain('hermes')
  })

  it('each status has valid status values', async () => {
    const statuses = getModelRouterStatuses()
    const validStatuses = ['active', 'degraded', 'offline', 'rate_limited']
    for (const s of statuses) {
      expect(validStatuses).toContain(s.status)
    }
  })

  it('returns consistent structure across calls', async () => {
    const first = getModelRouterStatuses()
    const second = getModelRouterStatuses()
    // Structure and provider set remain stable even with real-time variation
    expect(first.length).toBe(second.length)
    expect(first.map(s => s.provider).sort()).toEqual(second.map(s => s.provider).sort())
    // Each call returns fresh objects (not cached)
    expect(first).not.toBe(second)
  })
})

// ─── getSelfHealingStatus ──────────────────────────────────────────────────

describe('getSelfHealingStatus', () => {
  it('returns a self-healing status object', async () => {
    const status = await getSelfHealingStatus()
    expect(status).toBeDefined()
    expect(typeof status.monitorRunning).toBe('boolean')
    expect(typeof status.anomaliesDetected).toBe('number')
    expect(typeof status.autoRemediated).toBe('number')
    expect(typeof status.systemHealth).toBe('string')
    expect(Array.isArray(status.activeAlerts)).toBe(true)
  })

  it('monitorRunning is always true after call', async () => {
    const status = await getSelfHealingStatus()
    expect(status.monitorRunning).toBe(true)
  })

  it('systemHealth is one of healthy, degraded, critical', async () => {
    const status = await getSelfHealingStatus()
    expect(['healthy', 'degraded', 'critical']).toContain(status.systemHealth)
  })

  it('anomaliesDetected and autoRemediated are non-negative numbers', async () => {
    const status = await getSelfHealingStatus()
    expect(status.anomaliesDetected).toBeGreaterThanOrEqual(0)
    expect(status.autoRemediated).toBeGreaterThanOrEqual(0)
  })
})

// ─── acknowledgeAlert ──────────────────────────────────────────────────────

describe('acknowledgeAlert', () => {
  it('sets acknowledgedAt on a matching alert', async () => {
    const decision = await makeDecision({
      category: 'escalate',
      severity: 'critical',
      trigger: 'Test alert for acknowledge',
      reasoning: 'Testing',
      action: 'Test action',
    })

    // Single getSelfHealingStatus call after decision to see the new alert
    const statusAfter = await getSelfHealingStatus()
    const alert = statusAfter.activeAlerts.find(a => a.title.includes('ESCALATE') && a.severity === 'critical')
    expect(alert).toBeDefined()
    expect(alert!.acknowledgedAt).toBeUndefined()

    await acknowledgeAlert(alert!.id)

    const statusFinal = await getSelfHealingStatus()
    const acknowledged = statusFinal.activeAlerts.find(a => a.title.includes('ESCALATE') && a.severity === 'critical')
    expect(acknowledged!.acknowledgedAt).toBeTruthy()
  })

  it('silently ignores unknown alert id', async () => {
    await expect(acknowledgeAlert('nonexistent-alert-id')).resolves.toBeUndefined()
  })

  it('can acknowledge multiple alerts', async () => {
    const d1 = await makeDecision({ category: 'escalate', severity: 'critical', trigger: 'first alert to ack', reasoning: 'r', action: 'a1' })
    const d2 = await makeDecision({ category: 'escalate', severity: 'high', trigger: 'second alert to ack', reasoning: 'r', action: 'a2' })

    const status = await getSelfHealingStatus()
    const alert1 = status.activeAlerts.find(a => a.title.includes('first alert'))
    const alert2 = status.activeAlerts.find(a => a.title.includes('second alert'))
    expect(alert1).toBeDefined()
    expect(alert2).toBeDefined()

    await acknowledgeAlert(alert1!.id)
    await acknowledgeAlert(alert2!.id)

    const statusFinal = await getSelfHealingStatus()
    const a1 = statusFinal.activeAlerts.find(a => a.title.includes('first alert'))
    const a2 = statusFinal.activeAlerts.find(a => a.title.includes('second alert'))
    expect(a1!.acknowledgedAt).toBeTruthy()
    expect(a2!.acknowledgedAt).toBeTruthy()
  })
})

// ─── resolveAlert ──────────────────────────────────────────────────────────

describe('resolveAlert', () => {
  it('sets resolvedAt and removes alert from activeAlerts', async () => {
    const decision = await makeDecision({
      category: 'escalate',
      severity: 'high',
      trigger: 'Alert to be resolved',
      reasoning: 'Testing resolve',
      action: 'Test action',
    })

    const statusBefore = await getSelfHealingStatus()
    const alertToResolve = statusBefore.activeAlerts.find(a => a.title.includes('Alert to be resolved'))
    expect(alertToResolve).toBeDefined()

    await resolveAlert(alertToResolve!.id)

    const statusAfter = await getSelfHealingStatus()
    const found = statusAfter.activeAlerts.find(a => a.title.includes('Alert to be resolved'))
    expect(found).toBeUndefined()
  })

  it('silently ignores unknown alert id', async () => {
    await expect(resolveAlert('nonexistent-alert-id')).resolves.toBeUndefined()
  })

  it('does not affect unrelated alerts', async () => {
    const d1 = await makeDecision({ category: 'escalate', severity: 'critical', trigger: 'keep this alert', reasoning: 'r', action: 'a' })
    const d2 = await makeDecision({ category: 'escalate', severity: 'high', trigger: 'remove this alert', reasoning: 'r', action: 'a' })

    const statusBefore = await getSelfHealingStatus()
    const alertToResolve = statusBefore.activeAlerts.find(a => a.title.includes('remove this alert'))
    const keepAlert = statusBefore.activeAlerts.find(a => a.title.includes('keep this alert'))
    expect(keepAlert).toBeDefined()
    expect(alertToResolve).toBeDefined()

    await resolveAlert(alertToResolve!.id)

    const statusAfter = await getSelfHealingStatus()
    const keep = statusAfter.activeAlerts.find(a => a.title.includes('keep this alert'))
    const removed = statusAfter.activeAlerts.find(a => a.title.includes('remove this alert'))
    expect(keep).toBeDefined()
    expect(removed).toBeUndefined()
  })
})

// ─── getAIDecisionMetrics ──────────────────────────────────────────────────

describe('getAIDecisionMetrics', () => {
  it('returns an object with totalDecisions', async () => {
    const metrics = await getAIDecisionMetrics()
    expect(typeof metrics.totalDecisions).toBe('number')
    expect(metrics.totalDecisions).toBeGreaterThan(0)
  })

  it('totalDecisions increases when new decisions are made', async () => {
    const before = (await getAIDecisionMetrics()).totalDecisions
    await makeDecision({ category: 'alert', severity: 'low', trigger: 't', reasoning: 'r', action: 'a' })
    const after = (await getAIDecisionMetrics()).totalDecisions
    expect(after).toBeGreaterThan(before)
  })

  it('byCategory sums to totalDecisions', async () => {
    const metrics = await getAIDecisionMetrics()
    const sum = Object.values(metrics.byCategory).reduce((acc, n) => acc + n, 0)
    expect(sum).toBe(metrics.totalDecisions)
  })

  it('bySeverity sums to totalDecisions', async () => {
    const metrics = await getAIDecisionMetrics()
    const sum = Object.values(metrics.bySeverity).reduce((acc, n) => acc + n, 0)
    expect(sum).toBe(metrics.totalDecisions)
  })

  it('successRate is between 0 and 1', async () => {
    const metrics = await getAIDecisionMetrics()
    expect(metrics.successRate).toBeGreaterThanOrEqual(0)
    expect(metrics.successRate).toBeLessThanOrEqual(1)
  })

  it('activeEscalations counts only pending escalate decisions', async () => {
    const before = (await getAIDecisionMetrics()).activeEscalations
    const d = await makeDecision({ category: 'escalate', severity: 'high', trigger: 't', reasoning: 'r', action: 'a' })
    // Decision starts as pending
    const after = (await getAIDecisionMetrics()).activeEscalations
    expect(after).toBeGreaterThanOrEqual(before)
    // Resolve it
    await resolveDecision(d.id, 'success')
    const resolved = (await getAIDecisionMetrics()).activeEscalations
    expect(resolved).toBeLessThan(after)
  })

  it('avgResolutionTimeMs is a number (seeded value)', async () => {
    const metrics = await getAIDecisionMetrics()
    expect(typeof metrics.avgResolutionTimeMs).toBe('number')
  })
})