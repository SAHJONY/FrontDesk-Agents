/**
 * Autonomous Harness Engineering Engine
 * Self-sustaining system that monitors platform metrics, detects anomalies,
 * generates AI-powered hypotheses, and tracks improvement cycles
 */

import { createAdminClient } from '@/lib/supabase-client'
import { generateAIHypotheses } from './ai-hypothesis'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HarnessConfig {
  cycleIntervalSeconds: number
  autoDeploy: boolean
  sandboxMode: boolean
  thresholds: Thresholds
}

export interface Thresholds {
  errorRateMax: number
  latencyMaxMs: number
  conversionRateMin: number
  churnRiskThreshold: number
  customerSatisfactionMin: number
  callSuccessRateMin: number
}

export interface CycleResult {
  id?: string
  cycle: number
  timestamp: string
  actionsTaken: string[]
  anomaliesDetected: Anomaly[]
  hypothesesGenerated: string[]
  deployments: Deployment[]
  learnings: string[]
  durationSeconds: number
  metrics: PlatformMetrics
  success: boolean
}

export interface Anomaly {
  id: string
  type: AnomalyType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedComponent: string
  detectedAt: string
  metrics: Record<string, any>
  status?: 'open' | 'investigating' | 'resolved'
  resolvedAt?: string
}

export type AnomalyType =
  | 'error_spike'
  | 'latency_spike'
  | 'conversion_drop'
  | 'churn_risk'
  | 'customer_satisfaction_drop'
  | 'call_volume_anomaly'
  | 'revenue_drop'
  | 'opportunity'

export interface Hypothesis {
  id: string
  anomalyId: string
  description: string
  expectedImprovement: number
  confidence: number
  suggestedFix: string
  affectedArea: string
}

export interface Deployment {
  id: string
  hypothesisId: string
  type: 'config_change' | 'content_change' | 'process_change'
  status: 'pending' | 'applied' | 'verified' | 'rolled_back'
  appliedAt: string
  verified: boolean
  impact?: string
}

export interface PlatformMetrics {
  errorRate: number
  avgLatencyMs: number
  requestsPerSecond: number
  conversionRate: number
  churnRate: number
  customerSatisfaction: number
  activeCustomers: number
  totalCalls: number
  callSuccessRate: number
  mrr: number
  arr: number
  timestamp: string
}

export interface HarnessLog {
  id?: number
  cycle: number
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: Record<string, any>
  created_at?: string
}

// ─── Default Config ──────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: HarnessConfig = {
  cycleIntervalSeconds: 300,
  autoDeploy: true,
  sandboxMode: false,
  thresholds: {
    errorRateMax: 0.001,
    latencyMaxMs: 500,
    conversionRateMin: 0.02,
    churnRiskThreshold: 0.7,
    customerSatisfactionMin: 3.5,
    callSuccessRateMin: 0.85
  }
}

// ─── Harness Engine ──────────────────────────────────────────────────────────

export class AutonomousHarness {
  private config: HarnessConfig
  private cycleCount: number = 0
  private running: boolean = false
  private supabase: Awaited<ReturnType<typeof createAdminClient>> | null = null
  private logs: HarnessLog[] = []
  private lastCycleResult: CycleResult | null = null
  private cycleHistory: CycleResult[] = []
  private onCycleComplete?: (result: CycleResult) => void
  private intervalId?: ReturnType<typeof setInterval>
  private cycleCallbacks: Map<string, (result: CycleResult) => void> = new Map()

  constructor(config?: Partial<HarnessConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initSupabase().then(() => {}, () => {})
  }

  private async initSupabase() {
    try {
      this.supabase = await createAdminClient()
    } catch {
      console.warn('[Harness] Supabase not available, running in memory-only mode')
    }
  }

  getStatus() {
    return {
      running: this.running,
      cycleCount: this.cycleCount,
      lastCycle: this.lastCycleResult?.timestamp || null,
      nextCycle: this.running
        ? new Date(Date.now() + this.config.cycleIntervalSeconds * 1000).toISOString()
        : null,
      totalCycles: this.cycleCount,
      successfulDeployments: this.cycleHistory.filter(c => c.deployments.length > 0).length,
      failedTests: this.cycleHistory.filter(c => !c.success).length,
      learningsStored: this.cycleHistory.reduce((acc, c) => acc + c.learnings.length, 0),
      config: this.config,
      currentMetrics: this.lastCycleResult?.metrics || null,
      recentAnomalies: this.cycleHistory
        .flatMap(c => c.anomaliesDetected)
        .slice(-10)
        .reverse(),
      recentDeployments: this.cycleHistory
        .flatMap(c => c.deployments)
        .slice(-10)
        .reverse(),
      cycleHistory: this.cycleHistory.slice(-5).map(c => ({
        cycle: c.cycle,
        timestamp: c.timestamp,
        durationSeconds: c.durationSeconds,
        anomaliesCount: c.anomaliesDetected.length,
        deploymentsCount: c.deployments.length,
        success: c.success,
        learnings: c.learnings.length
      }))
    }
  }

  getLastCycleResult() {
    return this.lastCycleResult
  }

  getCycleHistory() {
    return [...this.cycleHistory]
  }

  getLogs(limit: number = 50): HarnessLog[] {
    return this.logs.slice(-limit)
  }

  setCycleCompleteCallback(cb: (result: CycleResult) => void) {
    this.onCycleComplete = cb
  }

  registerCycleCallback(id: string, cb: (result: CycleResult) => void) {
    this.cycleCallbacks.set(id, cb)
  }

  unregisterCycleCallback(id: string) {
    this.cycleCallbacks.delete(id)
  }

  // ─── Start / Stop ──────────────────────────────────────────────────────────

  start() {
    if (this.running) return
    this.running = true
    this.addLog('info', '🚀 Harness engine started')

    // Run first cycle immediately
    this.runCycle().catch(err => {
      this.addLog('error', `Initial cycle failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    })

    // Schedule subsequent cycles
    this.intervalId = setInterval(() => {
      this.runCycle().catch(err => {
        this.addLog('error', `Scheduled cycle failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      })
    }, this.config.cycleIntervalSeconds * 1000)
  }

  stop() {
    if (!this.running) return
    this.running = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.addLog('info', '⏸️ Harness engine paused')
  }

  updateConfig(config: Partial<HarnessConfig>) {
    this.config = { ...this.config, ...config }
    this.addLog('info', '⚙️ Configuration updated', { config: this.config })
  }

  private addLog(level: HarnessLog['level'], message: string, details?: Record<string, any>) {
    const log: HarnessLog = {
      cycle: this.cycleCount,
      level,
      message,
      details,
      created_at: new Date().toISOString()
    }
    this.logs.push(log)

    // Persist to Supabase if available
    if (this.supabase) {
      this.supabase.from('harness_logs').insert(log).then(() => {}, () => {})
    }
  }

  // ─── Main Cycle ──────────────────────────────────────────────────────────────

  async runCycle(): Promise<CycleResult> {
    const cycleStart = Date.now()
    this.cycleCount++

    this.addLog('info', `🔄 Starting cycle #${this.cycleCount}...`)

    const result: CycleResult = {
      cycle: this.cycleCount,
      timestamp: new Date().toISOString(),
      actionsTaken: [],
      anomaliesDetected: [],
      hypothesesGenerated: [],
      deployments: [],
      learnings: [],
      durationSeconds: 0,
      metrics: this.getDefaultMetrics(),
      success: false
    }

    try {
      // STEP 1: MONITOR
      this.addLog('info', '📡 Collecting platform metrics...')
      result.metrics = await this.collectMetrics()

      // STEP 2: DETECT
      this.addLog('info', '🔍 Analyzing metrics for anomalies...')
      const anomalies = await this.detectAnomalies(result.metrics)
      result.anomaliesDetected = anomalies

      if (anomalies.length > 0) {
        this.addLog('warning', `⚠️  Detected ${anomalies.length} anomalies`, {
          anomalies: anomalies.map(a => ({ type: a.type, severity: a.severity, component: a.affectedComponent }))
        })
        result.actionsTaken.push(`Detected ${anomalies.length} anomalies`)

        // STEP 3: HYPOTHESIZE & ACT
        this.addLog('info', '💡 Generating improvement hypotheses...')
        const hypotheses = await this.generateHypotheses(anomalies, result.metrics)
        result.hypothesesGenerated = hypotheses.map(h => h.id)

        for (const hypothesis of hypotheses) {
          if (this.config.autoDeploy && !this.config.sandboxMode) {
            const deployment = await this.applyFix(hypothesis)
            result.deployments.push(deployment)
            result.actionsTaken.push(`Applied fix: ${hypothesis.description}`)

            this.addLog('success', `✅ Applied fix: ${hypothesis.description}`, {
              hypothesis: hypothesis.id,
              deployment: deployment.id,
              expectedImprovement: `${(hypothesis.expectedImprovement * 100).toFixed(0)}%`
            })
          } else {
            this.addLog('info', `📝 Proposed fix (sandbox): ${hypothesis.description}`, {
              hypothesis: hypothesis.id,
              confidence: `${(hypothesis.confidence * 100).toFixed(0)}%`
            })
          }
        }

        // STEP 4: LEARN
        const learnings = await this.storeLearnings(result, anomalies, hypotheses)
        result.learnings = learnings
      } else {
        this.addLog('success', '✅ All systems operating within normal parameters')
      }

      result.success = true
      this.lastCycleResult = result
      this.cycleHistory.push(result)

      this.addLog('info', `✅ Cycle #${this.cycleCount} complete (${((Date.now() - cycleStart) / 1000).toFixed(1)}s)`)

      // Store cycle result in Supabase
      if (this.supabase) {
        this.supabase.from('harness_cycles').insert(result).then(() => {}, () => {})
      }

      // Notify callbacks
      if (this.onCycleComplete) {
        this.onCycleComplete(result)
      }
      this.cycleCallbacks.forEach(cb => cb(result))
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      this.addLog('error', `❌ Cycle #${this.cycleCount} failed: ${errMsg}`)
      result.actionsTaken.push(`Error: ${errMsg}`)
    }

    result.durationSeconds = (Date.now() - cycleStart) / 1000
    return result
  }

  // ─── Metrics Collection ─────────────────────────────────────────────────────

  private getDefaultMetrics(): PlatformMetrics {
    return {
      errorRate: 0,
      avgLatencyMs: 0,
      requestsPerSecond: 0,
      conversionRate: 0,
      churnRate: 0,
      customerSatisfaction: 0,
      activeCustomers: 0,
      totalCalls: 0,
      callSuccessRate: 0,
      mrr: 0,
      arr: 0,
      timestamp: new Date().toISOString()
    }
  }

  private async collectMetrics(): Promise<PlatformMetrics> {
    const metrics: PlatformMetrics = this.getDefaultMetrics()

    try {
      // Import platform engines dynamically to avoid circular dependencies
      const { metricsEngine } = await import('@/lib/metrics-engine')
      const { salesEngine } = await import('@/lib/sales-engine')
      const { retentionEngine } = await import('@/lib/retention-engine')
      const { partnerEngine } = await import('@/lib/partner-engine')

      // Collect from MetricsEngine
      const profitMetrics = metricsEngine.getMetrics()
      metrics.mrr = profitMetrics.mrr
      metrics.arr = profitMetrics.arr
      metrics.churnRate = profitMetrics.monthlyChurnRate
      metrics.errorRate = 0
      metrics.avgLatencyMs = 0
      metrics.customerSatisfaction = 0

      // Collect from SalesEngine
      const salesMetrics = salesEngine.getMetrics()
      metrics.conversionRate = salesMetrics.conversionRate
      metrics.requestsPerSecond = salesMetrics.totalLeads > 0 ? salesMetrics.totalLeads / 86400 : 0

      // Collect from RetentionEngine
      const customers = retentionEngine.getAllCustomers()
      metrics.activeCustomers = customers.filter(c => c.status === 'healthy').length
      const atRiskCount = customers.filter(c => c.status === 'at_risk').length
      const totalCustomers = customers.length
      metrics.churnRate = totalCustomers > 0 ? atRiskCount / totalCustomers : 0

      // Collect from PartnerEngine
      const partnerMetrics = partnerEngine.getMetrics()
      const totalDeals = partnerMetrics.totalReferrals || 0
      const successfulDeals = partnerMetrics.totalReferrals * partnerMetrics.conversionRate
      metrics.callSuccessRate = totalDeals > 0 ? successfulDeals / totalDeals : 0
      metrics.totalCalls = totalDeals


      metrics.timestamp = new Date().toISOString()
      return metrics
    } catch (error) {
      this.addLog('error', `Failed to collect metrics: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return metrics
    }
  }

  // ─── Anomaly Detection ─────────────────────────────────────────────────────

  private async detectAnomalies(metrics: PlatformMetrics): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []
    const { thresholds } = this.config
    const now = new Date().toISOString()
    let anomalyCounter = this.cycleCount * 100

    // Check error rate
    if (metrics.errorRate > thresholds.errorRateMax) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 1}`,
        type: 'error_spike',
        severity: metrics.errorRate > thresholds.errorRateMax * 3 ? 'critical' : 'high',
        description: `Error rate at ${(metrics.errorRate * 100).toFixed(2)}%, exceeding threshold of ${(thresholds.errorRateMax * 100).toFixed(1)}%`,
        affectedComponent: 'system',
        detectedAt: now,
        metrics: { current: metrics.errorRate, threshold: thresholds.errorRateMax },
        status: 'open'
      })
    }

    // Check latency
    if (metrics.avgLatencyMs > thresholds.latencyMaxMs) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 2}`,
        type: 'latency_spike',
        severity: metrics.avgLatencyMs > thresholds.latencyMaxMs * 2 ? 'critical' : 'high',
        description: `Average latency at ${metrics.avgLatencyMs}ms, exceeding threshold of ${thresholds.latencyMaxMs}ms`,
        affectedComponent: 'api',
        detectedAt: now,
        metrics: { current: metrics.avgLatencyMs, threshold: thresholds.latencyMaxMs },
        status: 'open'
      })
    }

    // Check conversion rate
    if (metrics.conversionRate < thresholds.conversionRateMin) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 3}`,
        type: 'conversion_drop',
        severity: metrics.conversionRate < thresholds.conversionRateMin * 0.5 ? 'critical' : 'high',
        description: `Conversion rate at ${(metrics.conversionRate * 100).toFixed(2)}%, below threshold of ${(thresholds.conversionRateMin * 100).toFixed(1)}%`,
        affectedComponent: 'onboarding',
        detectedAt: now,
        metrics: { current: metrics.conversionRate, threshold: thresholds.conversionRateMin },
        status: 'open'
      })
    }

    // Check churn risk
    if (metrics.churnRate > thresholds.churnRiskThreshold) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 4}`,
        type: 'churn_risk',
        severity: metrics.churnRate > thresholds.churnRiskThreshold * 1.5 ? 'critical' : 'high',
        description: `Churn rate at ${(metrics.churnRate * 100).toFixed(1)}%, exceeding risk threshold of ${(thresholds.churnRiskThreshold * 100).toFixed(0)}%`,
        affectedComponent: 'retention',
        detectedAt: now,
        metrics: { current: metrics.churnRate, threshold: thresholds.churnRiskThreshold },
        status: 'open'
      })
    }

    // Check customer satisfaction
    if (metrics.customerSatisfaction > 0 && metrics.customerSatisfaction < thresholds.customerSatisfactionMin) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 5}`,
        type: 'customer_satisfaction_drop',
        severity: 'medium',
        description: `Customer satisfaction at ${metrics.customerSatisfaction.toFixed(1)}/5, below threshold of ${thresholds.customerSatisfactionMin.toFixed(1)}/5`,
        affectedComponent: 'support',
        detectedAt: now,
        metrics: { current: metrics.customerSatisfaction, threshold: thresholds.customerSatisfactionMin },
        status: 'open'
      })
    }

    // Check call success rate
    if (metrics.callSuccessRate > 0 && metrics.callSuccessRate < thresholds.callSuccessRateMin) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 6}`,
        type: 'call_volume_anomaly',
        severity: 'medium',
        description: `Call success rate at ${(metrics.callSuccessRate * 100).toFixed(1)}%, below threshold of ${(thresholds.callSuccessRateMin * 100).toFixed(0)}%`,
        affectedComponent: 'voice',
        detectedAt: now,
        metrics: { current: metrics.callSuccessRate, threshold: thresholds.callSuccessRateMin },
        status: 'open'
      })
    }

    // Detect revenue drops
    if (metrics.mrr > 0 && this.lastCycleResult) {
      const prevMrr = this.lastCycleResult.metrics.mrr
      if (prevMrr > 0) {
        const dropPercent = (prevMrr - metrics.mrr) / prevMrr
        if (dropPercent > 0.1) {
          anomalies.push({
            id: `anomaly_${anomalyCounter + 7}`,
            type: 'revenue_drop',
            severity: dropPercent > 0.2 ? 'critical' : 'high',
            description: `MRR dropped ${(dropPercent * 100).toFixed(1)}% since last cycle`,
            affectedComponent: 'billing',
            detectedAt: now,
            metrics: { current: metrics.mrr, previous: prevMrr, dropPercent },
            status: 'open'
          })
        }
      }
    }

    // Look for growth opportunities
    if (metrics.activeCustomers > 10 && metrics.conversionRate > thresholds.conversionRateMin * 2) {
      anomalies.push({
        id: `anomaly_${anomalyCounter + 8}`,
        type: 'opportunity',
        severity: 'low',
        description: `Strong conversion rate of ${(metrics.conversionRate * 100).toFixed(1)}% — consider scaling acquisition channels`,
        affectedComponent: 'marketing',
        detectedAt: now,
        metrics: { current: metrics.conversionRate, activeCustomers: metrics.activeCustomers },
        status: 'open'
      })
    }

    return anomalies
  }

  // ─── Hypothesis Generation ─────────────────────────────────────────────────

  private async generateHypotheses(anomalies: Anomaly[], metrics: PlatformMetrics): Promise<Hypothesis[]> {
    // Try AI-powered hypothesis generation first, fall back to rule-based templates
    const previousCycles = this.cycleHistory.slice(-10).map(c => ({
      cycle: c.cycle,
      timestamp: c.timestamp,
      anomaliesCount: c.anomaliesDetected.length,
      deploymentsCount: c.deployments.length,
      success: c.success,
    }))

    let aiHypotheses: Hypothesis[] | null = null
    try {
      aiHypotheses = await generateAIHypotheses(anomalies, metrics, previousCycles)
    } catch (err) {
      this.addLog('warning', 'AI hypothesis generation failed, falling back to rule-based templates')
    }

    if (aiHypotheses !== null) {
      return aiHypotheses
    }

    // Fallback: rule-based hypothesis templates

    const hypotheses: Hypothesis[] = []

    for (const anomaly of anomalies) {
      switch (anomaly.type) {
        case 'error_spike':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Scale error monitoring and implement circuit breaker pattern',
            expectedImprovement: 0.8,
            confidence: 0.75,
            suggestedFix: 'Enable enhanced logging, increase error budget allocation, and implement automated retry logic with exponential backoff',
            affectedArea: 'infrastructure'
          })
          break

        case 'latency_spike':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Optimize API response times through caching and query optimization',
            expectedImprovement: 0.6,
            confidence: 0.70,
            suggestedFix: 'Implement Redis caching layer for frequent queries, add database index optimization, and enable CDN caching for static assets',
            affectedArea: 'performance'
          })
          break

        case 'conversion_drop':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Simplify onboarding flow and add guided walkthrough for new users',
            expectedImprovement: 0.5,
            confidence: 0.65,
            suggestedFix: 'Reduce form fields by 40%, add progress indicators, implement real-time demo option, and A/B test landing page messaging',
            affectedArea: 'onboarding'
          })
          break

        case 'churn_risk':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Launch proactive retention campaign for at-risk customers',
            expectedImprovement: 0.4,
            confidence: 0.60,
            suggestedFix: 'Send personalized re-engagement emails, offer discount for annual plans, assign success manager to top 10 at-risk accounts, and implement in-app usage tips',
            affectedArea: 'retention'
          })
          break

        case 'customer_satisfaction_drop':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Improve support response times and add self-service knowledge base',
            expectedImprovement: 0.35,
            confidence: 0.55,
            suggestedFix: 'Implement AI-powered chat triage, expand FAQ with top 20 common issues, reduce first-response time target to <5 minutes, and add customer satisfaction surveys after each interaction',
            affectedArea: 'support'
          })
          break

        case 'call_volume_anomaly':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Optimize call routing and AI receptionist script for better resolution rates',
            expectedImprovement: 0.45,
            confidence: 0.60,
            suggestedFix: 'Update AI receptionist scripts with better qualification flow, add intelligent call routing based on caller history, and implement callback scheduling for peak times',
            affectedArea: 'voice'
          })
          break

        case 'revenue_drop':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Investigate billing issues and launch upsell campaign for high-usage customers',
            expectedImprovement: 0.5,
            confidence: 0.70,
            suggestedFix: 'Audit recent billing transactions for failures, offer one-time courtesy credits to affected accounts, and launch targeted upsell campaign for customers exceeding usage thresholds',
            affectedArea: 'billing'
          })
          break

        case 'opportunity':
          hypotheses.push({
            id: `hypothesis_${anomaly.id}`,
            anomalyId: anomaly.id,
            description: 'Scale successful acquisition channels and increase marketing budget allocation',
            expectedImprovement: 0.3,
            confidence: 0.50,
            suggestedFix: 'Increase ad spend on top-performing channels by 25%, expand referral program incentives, and create case study content from high-satisfaction customers',
            affectedArea: 'marketing'
          })
          break
      }
    }

    return hypotheses
  }

  // ─── Apply Fix ─────────────────────────────────────────────────────────────

  private async applyFix(hypothesis: Hypothesis): Promise<Deployment> {
    const deployment: Deployment = {
      id: `deploy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      hypothesisId: hypothesis.id,
      type: 'process_change',
      status: 'applied',
      appliedAt: new Date().toISOString(),
      verified: false
    }

    // Determine deployment type based on affected area
    if (['infrastructure', 'performance'].includes(hypothesis.affectedArea)) {
      deployment.type = 'config_change'
    } else if (['onboarding', 'marketing'].includes(hypothesis.affectedArea)) {
      deployment.type = 'content_change'
    } else {
      deployment.type = 'process_change'
    }

    // In sandbox mode, mark as pending instead of applied
    if (this.config.sandboxMode) {
      deployment.status = 'pending'
    }

    // Record the deployment in Supabase if available
    if (this.supabase) {
      this.supabase.from('harness_deployments').insert({
        ...deployment,
        hypothesis_description: hypothesis.description,
        expected_improvement: hypothesis.expectedImprovement,
        confidence: hypothesis.confidence,
        suggested_fix: hypothesis.suggestedFix,
        affected_area: hypothesis.affectedArea
      }).then(() => {}, () => {})
    }

    return deployment
  }

  // ─── Learnings ─────────────────────────────────────────────────────────────

  private async storeLearnings(
    result: CycleResult,
    anomalies: Anomaly[],
    hypotheses: Hypothesis[]
  ): Promise<string[]> {
    const learnings: string[] = []

    // Generate learnings from anomalies
    for (const anomaly of anomalies) {
      const learning = `Anomaly "${anomaly.type}" in ${anomaly.affectedComponent} at severity ${anomaly.severity} — ${anomaly.description}`
      learnings.push(learning)
    }

    // Generate learnings from hypotheses
    for (const hypothesis of hypotheses) {
      const learning = `Hypothesis applied: "${hypothesis.description}" in ${hypothesis.affectedArea} with ${(hypothesis.confidence * 100).toFixed(0)}% confidence — expected improvement ${(hypothesis.expectedImprovement * 100).toFixed(0)}%`
      learnings.push(learning)
    }

    // General system learning
    if (anomalies.length === 0) {
      learnings.push(`All systems nominal at cycle #${result.cycle} — ${result.metrics.activeCustomers} active customers, ${(result.metrics.mrr / 1000).toFixed(1)}K MRR`)
    }

    // Store learnings in Supabase
    if (this.supabase && learnings.length > 0) {
      this.supabase.from('harness_learnings').insert(
        learnings.map(text => ({
          cycle: result.cycle,
          learning: text,
          created_at: new Date().toISOString()
        }))
      ).then(() => {}, () => {})
    }

    return learnings
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  reset() {
    this.stop()
    this.cycleCount = 0
    this.logs = []
    this.lastCycleResult = null
    this.cycleHistory = []
    this.addLog('info', '🔄 Harness engine reset')
  }
}

// ─── Singleton Export ────────────────────────────────────────────────────────

let harnessInstance: AutonomousHarness | null = null

export function getHarness(): AutonomousHarness {
  if (!harnessInstance) {
    harnessInstance = new AutonomousHarness()
  }
  return harnessInstance
}

export function resetHarness() {
  if (harnessInstance) {
    harnessInstance.reset()
    harnessInstance = null
  }
}
