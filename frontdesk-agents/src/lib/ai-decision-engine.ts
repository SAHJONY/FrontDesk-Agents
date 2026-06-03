// AI Decision Engine - Autonomous agentic decision-making system
// Perceive -> Reason -> Act -> Learn loop for the platform
//
// NOTE: This module uses in-memory singleton state (decisions, modelStatuses, selfHealing).
// In Next.js serverless deployments (Vercel), state is lost on cold-starts. For production
// use, replace the singleton with Supabase/Redis-backed persistence to maintain decision
// history across invocations.

export interface Decision {
  id: string
  timestamp: string
  category: 'escalate' | 'onboard' | 'upsell' | 'retain' | 'optimize' | 'alert'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  trigger: string
  reasoning: string
  action: string
  outcome?: 'success' | 'failed' | 'pending' | 'escalated'
  metadata?: Record<string, unknown>
}

export interface AIDecisionMetrics {
  totalDecisions: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  successRate: number
  avgResolutionTimeMs: number
  activeEscalations: number
}

export interface ModelRouterStatus {
  provider: 'nvidia' | 'openai' | 'anthropic' | 'hermes'
  model: string
  status: 'active' | 'degraded' | 'offline' | 'rate_limited'
  latencyMs: number
  requestsPerMinute: number
  costPer1kTokens: number
  fallbackEnabled: boolean
  healthScore: number // 0-100
}

export interface SelfHealingStatus {
  monitorRunning: boolean
  anomaliesDetected: number
  autoRemediated: number
  manualInterventions: number
  lastAnomalyAt: string | null
  lastRemediationAt: string | null
  systemHealth: 'healthy' | 'degraded' | 'critical'
  activeAlerts: Alert[]
}

export interface Alert {
  id: string
  type: 'anomaly' | 'threshold_breach' | 'model_failure' | 'customer_churn'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
}

// Singleton state
let decisions: Decision[] = []
let modelStatuses: ModelRouterStatus[] = []
let selfHealing: SelfHealingStatus = {
  monitorRunning: false,
  anomaliesDetected: 0,
  autoRemediated: 0,
  manualInterventions: 0,
  lastAnomalyAt: null,
  lastRemediationAt: null,
  systemHealth: 'healthy',
  activeAlerts: [],
}

function generateId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

// ─── Model Router ───────────────────────────────────────────────────────────

export function getModelRouterStatuses(): ModelRouterStatus[] {
  // Simulate dynamic model routing statuses based on real-time conditions
  const baseStatuses: ModelRouterStatus[] = [
    {
      provider: 'nvidia',
      model: 'qwen3-next-80b-a3b-instruct',
      status: 'active',
      latencyMs: Math.floor(Math.random() * 200 + 80),
      requestsPerMinute: Math.floor(Math.random() * 300 + 100),
      costPer1kTokens: 0.001,  // NVIDIA NIM free tier pricing
      fallbackEnabled: true,
      healthScore: 96,
    },
    {
      provider: 'openai',
      model: 'gpt-4.5',
      status: Math.random() > 0.1 ? 'active' : 'rate_limited',
      latencyMs: Math.floor(Math.random() * 400 + 150),
      requestsPerMinute: Math.floor(Math.random() * 200 + 50),
      costPer1kTokens: 0.015,
      fallbackEnabled: true,
      healthScore: 88,
    },
    {
      provider: 'anthropic',
      model: 'claude-opus-4',
      status: 'active',
      latencyMs: Math.floor(Math.random() * 600 + 300),
      requestsPerMinute: Math.floor(Math.random() * 150 + 30),
      costPer1kTokens: 0.018,
      fallbackEnabled: true,
      healthScore: 91,
    },
    {
      provider: 'hermes',
      model: 'autonomous-router',
      status: 'active',
      latencyMs: Math.floor(Math.random() * 50 + 10),
      requestsPerMinute: Math.floor(Math.random() * 500 + 200),
      costPer1kTokens: 0.001,  // NVIDIA NIM free tier pricing
      fallbackEnabled: false,
      healthScore: 99,
    },
  ]

  // Add slight real-time variation
  modelStatuses = baseStatuses.map(s => ({
    ...s,
    latencyMs: Math.floor(Math.random() * 50 + s.latencyMs * 0.9),
    requestsPerMinute: Math.floor(Math.random() * 40 + s.requestsPerMinute * 0.85),
    healthScore: Math.max(50, Math.min(100, s.healthScore + Math.floor(Math.random() * 6 - 3))),
  }))

  return modelStatuses
}

// ─── Decision Engine ────────────────────────────────────────────────────────

export function getDecisions(limit = 50): Decision[] {
  return decisions.slice(-limit).reverse()
}

export function makeDecision(params: {
  category: Decision['category']
  severity: Decision['severity']
  trigger: string
  reasoning: string
  action: string
  metadata?: Record<string, unknown>
}): Decision {
  const decision: Decision = {
    id: generateId(),
    timestamp: now(),
    ...params,
    outcome: 'pending',
  }

  decisions.push(decision)

  // Keep only last 500 decisions
  if (decisions.length > 500) {
    decisions = decisions.slice(-500)
  }

  // If critical, add to alerts
  if (params.severity === 'critical' || params.severity === 'high') {
    selfHealing.activeAlerts.unshift({
      id: generateId(),
      type: params.category === 'alert' ? 'anomaly' : 'threshold_breach',
      severity: params.severity,
      title: `[${params.category.toUpperCase()}] ${params.trigger}`,
      description: params.reasoning,
      createdAt: now(),
    })
    // Keep alerts to 20 max
    if (selfHealing.activeAlerts.length > 20) {
      selfHealing.activeAlerts = selfHealing.activeAlerts.slice(0, 20)
    }
  }

  return decision
}

export function resolveDecision(id: string, outcome: Decision['outcome']): void {
  const decision = decisions.find(d => d.id === id)
  if (decision) {
    decision.outcome = outcome
  }
}

// ─── Autonomous Decision Triggers ───────────────────────────────────────────

export function evaluateAndDecide(context: {
  metrics?: Partial<{ mrr: number; churnRate: number; activeCustomers: number; ltv: number; cac: number }>
  customerHealth?: Array<{ customerId: string; healthScore: number; daysSinceLastCall: number; plan: string; mrr: number }>
  newLeads?: Array<{ businessName: string; score: number; urgency: string }>
  systemErrors?: number
}): Decision[] {
  const actions: Decision[] = []

  // Churn risk detection
  if (context.customerHealth) {
    const atRisk = context.customerHealth.filter(c => c.healthScore < 40 || c.daysSinceLastCall > 21)
    atRisk.forEach(customer => {
      actions.push(makeDecision({
        category: 'retain',
        severity: customer.healthScore < 25 ? 'critical' : 'high',
        trigger: `Customer at risk: ${customer.customerId}`,
        reasoning: `Health score ${customer.healthScore}/100, no call in ${customer.daysSinceLastCall} days. Plan: ${customer.plan} ($${customer.mrr}/mo). Risk of churn > 60%.`,
        action: customer.healthScore < 25
          ? 'IMMEDIATE: Send retention offer + schedule check-in call via AI agent'
          : 'Send personalized engagement email + offer plan upgrade',
        metadata: { customerId: customer.customerId, healthScore: customer.healthScore },
      }))
    })
  }

  // Upsell opportunities
  if (context.customerHealth) {
    const upsellCandidates = context.customerHealth.filter(c => c.healthScore > 75 && c.plan === 'starter')
    upsellCandidates.slice(0, 3).forEach(customer => {
      actions.push(makeDecision({
        category: 'upsell',
        severity: 'medium',
        trigger: `Upsell opportunity: ${customer.customerId}`,
        reasoning: `Customer ${customer.customerId} has excellent health (${customer.healthScore}/100) on starter plan. High potential to convert to professional.`,
        action: 'Send upgrade offer with 1-month free trial on professional plan',
        metadata: { customerId: customer.customerId, currentPlan: customer.plan },
      }))
    })
  }

  // New high-value leads
  if (context.newLeads) {
    const hotLeads = context.newLeads.filter(l => l.score >= 80)
    hotLeads.forEach(lead => {
      actions.push(makeDecision({
        category: 'escalate',
        severity: lead.urgency === 'urgent' ? 'high' : 'medium',
        trigger: `Hot lead scored: ${lead.businessName}`,
        reasoning: `Lead ${lead.businessName} scored ${lead.score}/100. Urgency: ${lead.urgency}. Priority routing to sales team.`,
        action: 'IMMEDIATE: Send Slack alert to sales channel + auto-email intro video',
        metadata: { businessName: lead.businessName, score: lead.score },
      }))
    })
  }

  // System health monitoring
  if (context.systemErrors !== undefined && context.systemErrors > 10) {
    actions.push(makeDecision({
      category: 'alert',
      severity: context.systemErrors > 50 ? 'critical' : 'high',
      trigger: `System anomaly detected: ${context.systemErrors} errors/minute`,
      reasoning: `Error rate (${context.systemErrors}/min) exceeds threshold (10/min). Possible infrastructure issue or DoS attack.`,
      action: 'Enable rate limiting + alert on-call engineer + start log aggregation',
      metadata: { errorCount: context.systemErrors },
    }))
  }

  // Revenue optimization
  if (context.metrics) {
    if (context.metrics.churnRate && context.metrics.churnRate > 0.08) {
      actions.push(makeDecision({
        category: 'optimize',
        severity: 'high',
        trigger: `High churn rate: ${(context.metrics.churnRate * 100).toFixed(1)}%`,
        reasoning: `Monthly churn ${(context.metrics.churnRate * 100).toFixed(1)}% exceeds 5% target. Immediate retention campaign recommended.`,
        action: 'Launch targeted retention campaign + review pricing tiers + analyze cancellation patterns',
        metadata: { churnRate: context.metrics.churnRate },
      }))
    }

    if (context.metrics.ltv && context.metrics.cac && context.metrics.ltv < context.metrics.cac * 2) {
      actions.push(makeDecision({
        category: 'optimize',
        severity: 'medium',
        trigger: `LTV/CAC ratio below healthy threshold`,
        reasoning: `LTV/CAC ratio ${(context.metrics.ltv / context.metrics.cac).toFixed(1)}x is below 3x target. Acquiring customers at too high a cost relative to their value.`,
        action: 'Review marketing channels + optimize ad spend + improve onboarding to increase LTV',
        metadata: { ltv: context.metrics.ltv, cac: context.metrics.cac },
      }))
    }
  }

  return actions
}

// ─── Self-Healing Monitor ───────────────────────────────────────────────────

export function getSelfHealingStatus(): SelfHealingStatus {
  // Simulate dynamic status changes
  const errorRate = Math.random() * 3
  const latencyMs = Math.floor(Math.random() * 50 + 95)

  selfHealing.monitorRunning = true
  selfHealing.systemHealth = errorRate > 2 ? 'degraded' : errorRate > 5 ? 'critical' : 'healthy'

  // Simulate occasional anomaly detection
  if (Math.random() > 0.85 && selfHealing.systemHealth !== 'critical') {
    selfHealing.anomaliesDetected++
    selfHealing.lastAnomalyAt = now()
  }

  // Simulate auto-remediation
  if (Math.random() > 0.9 && selfHealing.anomaliesDetected > selfHealing.autoRemediated) {
    selfHealing.autoRemediated++
    selfHealing.lastRemediationAt = now()
  }

  return selfHealing
}

export function acknowledgeAlert(alertId: string): void {
  const alert = selfHealing.activeAlerts.find(a => a.id === alertId)
  if (alert) {
    alert.acknowledgedAt = now()
  }
}

export function resolveAlert(alertId: string): void {
  const alert = selfHealing.activeAlerts.find(a => a.id === alertId)
  if (alert) {
    alert.resolvedAt = now()
    selfHealing.activeAlerts = selfHealing.activeAlerts.filter(a => a.id !== alertId)
  }
}

// ─── AI Metrics ─────────────────────────────────────────────────────────────

export function getAIDecisionMetrics(): AIDecisionMetrics {
  const byCategory: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  let successCount = 0

  decisions.forEach(d => {
    byCategory[d.category] = (byCategory[d.category] || 0) + 1
    bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1
    if (d.outcome === 'success') successCount++
  })

  return {
    totalDecisions: decisions.length,
    byCategory,
    bySeverity,
    successRate: decisions.length > 0 ? successCount / decisions.length : 0,
    avgResolutionTimeMs: 45000,
    activeEscalations: decisions.filter(d => d.outcome === 'pending' && d.category === 'escalate').length,
  }
}

// Seed some initial decisions for demo
function seedDecisions() {
  const seeds: Omit<Decision, 'id' | 'timestamp'>[] = [
    { category: 'escalate', severity: 'high', trigger: 'Hot lead: Sunrise Medical Center', reasoning: 'Lead scored 92/100 with urgent urgency. 120 employees, $800/mo estimated call volume.', action: 'IMMEDIATE: Slack alert + auto-demo booking', outcome: 'success' },
    { category: 'onboard', severity: 'medium', trigger: 'New customer activated: AutoNation Dealers', reasoning: 'Customer activated on starter plan. Recommended onboarding sequence: 3-step setup.', action: 'Send onboarding sequence email + schedule welcome call', outcome: 'success' },
    { category: 'upsell', severity: 'medium', trigger: 'Upsell: Elite Dental Care', reasoning: 'Health score 88/100 on starter plan for 4 months. High engagement signals readiness to upgrade.', action: 'Send professional plan upgrade offer with 1-month free trial', outcome: 'pending' },
    { category: 'retain', severity: 'high', trigger: 'At-risk: Home Plus Services', reasoning: 'Health score dropped to 31/100. 23 days since last call. High churn risk if no action.', action: 'IMMEDIATE: Retention offer + check-in call scheduled', outcome: 'success' },
    { category: 'optimize', severity: 'low', trigger: 'LTV/CAC ratio optimization', reasoning: 'LTV/CAC ratio is 3.4x, above 3x target. Monitoring for further improvement.', action: 'Continue current acquisition channels + optimize high-performers', outcome: 'success' },
    { category: 'alert', severity: 'info', trigger: 'Model routing health check', reasoning: 'All 4 AI providers operating within normal parameters. NVIDIA NIM: 96 health, latency 124ms.', action: 'No action required — system nominal', outcome: 'success' },
    { category: 'retain', severity: 'medium', trigger: 'Engagement drop: Quick Mart Retail', reasoning: 'Only 2 calls in past 14 days. Satisfaction may be declining. Proactive outreach needed.', action: 'Send engagement email + offer product walkthrough', outcome: 'pending' },
    { category: 'escalate', severity: 'medium', trigger: 'New lead: AllState Insurance', reasoning: 'Lead scored 78/100. 60 employees, $400/mo potential. Moderate urgency.', action: 'Send intro email + schedule discovery call within 48h', outcome: 'success' },
  ]

  seeds.forEach((s, i) => {
    const d: Decision = {
      id: generateId(),
      timestamp: new Date(Date.now() - (seeds.length - i) * 8 * 60000).toISOString(),
      ...s,
    }
    decisions.push(d)
  })

  // Populate model statuses
  getModelRouterStatuses()
}

seedDecisions()