/**
 * ============================================================
 * RECEPTIONIST AGENTS
 * ============================================================
 * 
 * Specialized agents for the AI receptionist platform that
 * extend the agent-workforce BaseAgent class.
 */

import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'
import { IndustryType, AgentType, AIResponse, InteractionContext } from './types'
import { aiOrchestrator } from '../ceo-brain/AIOpsOrchestrator'
import { ceoBrain } from '../ceo-brain/CEOBrain'

// ─── Case Outcome Tracking Types ────────────────────────────────────────────

export type CallOutcomeType =
  | 'greeting_sent'
  | 'case_routed'
  | 'scheduling_initiated'
  | 'escalation_initiated'
  | 'transfer_completed'
  | 'voicemail_captured'
  | 'message_taken'
  | 'callback_scheduled'

export interface VerticalOutcomeEntry {
  vertical: IndustryType
  outcome: CallOutcomeType
  timestamp: string
  duration: number
  confidence: number
  routedTo?: string
  notes?: string
}

export interface VerticalCallOutcomes {
  family_law: VerticalOutcomeEntry[]
  immigration: VerticalOutcomeEntry[]
  bankruptcy: VerticalOutcomeEntry[]
  ip_law: VerticalOutcomeEntry[]
  totalCalls: number
  totalRouted: number
  totalEscalated: number
  totalScheduled: number
  avgDuration: number
  periodStart: string
  periodEnd: string
}

// ============================================================================
// BASE RECEPTIONIST AGENT
// ============================================================================

export interface Task {
  id: string
  type: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  assignedAgent?: string
  dependencies: Array<{ taskId: string; type: string }>
  context: TaskContext
  result?: TaskResult
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface TaskContext {
  userRequest: string
  sessionId: string
  variables: Record<string, unknown>
}

export interface TaskResult {
  success: boolean
  output?: unknown
  error?: string
}

interface AgentTool {
  name: string
  description: string
  execute: (params: unknown) => Promise<ToolResult>
}

interface ToolResult {
  success: boolean
  output?: unknown
  error?: string
  duration: number
}

interface AgentConfig {
  id: string
  name: string
  role: string
  capabilities: Array<{
    name: string
    description: string
    tools: string[]
    maxConcurrentTasks: number
  }>
}

interface AgentState {
  agentId: string
  status: 'idle' | 'working' | 'waiting' | 'completed' | 'failed'
  currentTaskId?: string
  completedTasks: string[]
  failedTasks: string[]
  lastActivity: Date
  metrics: {
    tasksCompleted: number
    tasksFailed: number
    averageExecutionTime: number
    totalTokensUsed: number
  }
}

// Base Receptionist Agent extending EventEmitter
export abstract class BaseReceptionistAgent extends EventEmitter {
  protected config: AgentConfig
  protected state: AgentState
  protected tools: Map<string, AgentTool> = new Map()

  constructor(config: AgentConfig) {
    super()
    this.config = config
    this.state = {
      agentId: config.id,
      status: 'idle',
      completedTasks: [],
      failedTasks: [],
      lastActivity: new Date(),
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageExecutionTime: 0,
        totalTokensUsed: 0
      }
    }
  }

  abstract executeTask(task: Task): Promise<TaskResult>
  abstract getCapabilities(): string[]

  get id(): string { return this.config.id }
  get role(): string { return this.config.role }
  get name(): string { return this.config.name }

  getStatus() { return this.state.status }

  setStatus(status: AgentState['status']) {
    this.state.status = status
    this.state.lastActivity = new Date()
    this.emit('statusChange', { agentId: this.id, status })
  }

  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool)
  }

  async executeTool(toolName: string, params: unknown): Promise<ToolResult> {
    const tool = this.tools.get(toolName)
    if (!tool) {
      return { success: false, error: `Tool ${toolName} not found`, duration: 0 }
    }
    const startTime = Date.now()
    try {
      const result = await tool.execute(params)
      return { ...result, duration: Date.now() - startTime }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      }
    }
  }

  async runTask(task: Task): Promise<TaskResult> {
    this.setStatus('working')
    this.state.currentTaskId = task.id
    const startTime = Date.now()

    try {
      const result = await this.executeTask(task)
      const duration = Date.now() - startTime
      this.updateMetrics(true, duration)
      this.state.completedTasks.push(task.id)
      this.setStatus('completed')
      this.emit('taskCompleted', { taskId: task.id, result, duration })
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const errorResult: TaskResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
      this.updateMetrics(false, duration)
      this.state.failedTasks.push(task.id)
      this.setStatus('failed')
      this.emit('taskFailed', { taskId: task.id, error: errorResult.error })
      return errorResult
    } finally {
      this.state.currentTaskId = undefined
    }
  }

  private updateMetrics(success: boolean, duration: number): void {
    if (success) {
      this.state.metrics.tasksCompleted++
    } else {
      this.state.metrics.tasksFailed++
    }
    const totalTasks = this.state.metrics.tasksCompleted + this.state.metrics.tasksFailed
    if (totalTasks > 0) {
      this.state.metrics.averageExecutionTime =
        (this.state.metrics.averageExecutionTime * (totalTasks - 1) + duration) / totalTasks
    }
  }

  // ─── Case Outcome Tracking ─────────────────────────────────────────────────
  private verticalOutcomes: VerticalOutcomeEntry[] = []
  private readonly MAX_OUTCOMES_STORED = 500

  /** Record a call outcome for a specific legal vertical */
  protected recordVerticalOutcome(
    vertical: IndustryType,
    outcome: CallOutcomeType,
    duration: number,
    confidence: number,
    routedTo?: string,
    notes?: string
  ): void {
    if (!['family_law', 'immigration', 'bankruptcy', 'ip_law'].includes(vertical)) return
    const entry: VerticalOutcomeEntry = {
      vertical, outcome, timestamp: new Date().toISOString(),
      duration, confidence, routedTo, notes
    }
    this.verticalOutcomes.push(entry)
    if (this.verticalOutcomes.length > this.MAX_OUTCOMES_STORED) {
      this.verticalOutcomes = this.verticalOutcomes.slice(-this.MAX_OUTCOMES_STORED)
    }
    this.emit('verticalOutcome', entry)
  }

  /** Get aggregated call outcomes for all 4 legal verticals */
  public getVerticalCallOutcomes(): VerticalCallOutcomes {
    const verticals: IndustryType[] = ['family_law', 'immigration', 'bankruptcy', 'ip_law']
    const result: VerticalCallOutcomes = {
      family_law: [], immigration: [], bankruptcy: [], ip_law: [],
      totalCalls: 0, totalRouted: 0, totalEscalated: 0, totalScheduled: 0, avgDuration: 0,
      periodStart: '', periodEnd: ''
    }
    const byVertical: Record<string, VerticalOutcomeEntry[]> = {
      family_law: [], immigration: [], bankruptcy: [], ip_law: []
    }
    for (const entry of this.verticalOutcomes) {
      if (byVertical[entry.vertical]) byVertical[entry.vertical].push(entry)
    }
    for (const v of verticals) {
      const entry: VerticalOutcomeEntry[] = byVertical[v] || []
      ;(result as unknown as Record<string, VerticalOutcomeEntry[]>)[v] = entry
      result.totalCalls += entry.length
      result.totalRouted += entry.filter((e: VerticalOutcomeEntry) =>
        e.outcome === 'case_routed' || e.outcome === 'transfer_completed').length
      result.totalEscalated += entry.filter((e: VerticalOutcomeEntry) => e.outcome === 'escalation_initiated').length
      result.totalScheduled += entry.filter((e: VerticalOutcomeEntry) =>
        e.outcome === 'scheduling_initiated' || e.outcome === 'callback_scheduled').length
    }
    const allDurations = this.verticalOutcomes.map((e: VerticalOutcomeEntry) => e.duration).filter((d: number) => d > 0)
    result.avgDuration = allDurations.length > 0
      ? allDurations.reduce((a: number, b: number) => a + b, 0) / allDurations.length : 0
    if (this.verticalOutcomes.length > 0) {
      result.periodStart = this.verticalOutcomes[0].timestamp
      result.periodEnd = this.verticalOutcomes[this.verticalOutcomes.length - 1].timestamp
    }
    return result
  }

  /** Per-vertical performance summary for analytics dashboards */
  public getVerticalPerformance(): Record<IndustryType, {
    total: number; routed: number; escalated: number; scheduled: number
    avgDuration: number; resolutionRate: number
  }> {
    const verticals: IndustryType[] = ['family_law', 'immigration', 'bankruptcy', 'ip_law']
    const outcomes = this.getVerticalCallOutcomes()
    const perf: Record<string, any> = {}
    for (const v of verticals) {
      const entries: VerticalOutcomeEntry[] = (outcomes as unknown as Record<string, VerticalOutcomeEntry[]>)[v] ?? []
      const durations = entries.map((e: VerticalOutcomeEntry) => e.duration).filter((d: number) => d > 0)
      const resolved = entries.filter((e: VerticalOutcomeEntry) =>
        e.outcome !== 'escalation_initiated' && e.outcome !== 'voicemail_captured').length
      perf[v] = {
        total: entries.length,
        routed: entries.filter((e: VerticalOutcomeEntry) => e.outcome === 'case_routed' || e.outcome === 'transfer_completed').length,
        escalated: entries.filter((e: VerticalOutcomeEntry) => e.outcome === 'escalation_initiated').length,
        scheduled: entries.filter((e: VerticalOutcomeEntry) => e.outcome === 'scheduling_initiated' || e.outcome === 'callback_scheduled').length,
        avgDuration: durations.length > 0 ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length : 0,
        resolutionRate: entries.length > 0 ? Math.round((resolved / entries.length) * 100) : 0
      }
    }
    return perf as Record<IndustryType, {
      total: number; routed: number; escalated: number; scheduled: number
      avgDuration: number; resolutionRate: number
    }>
  }
}

// ============================================================================
// ARIA - VOICE AI RECEPTIONIST AGENT
// ============================================================================

// Case-type routing: maps keyword patterns to legal vertical departments
export interface CaseRoute {
  vertical: IndustryType
  department: string
  confidence: number
  matchedKeywords: string[]
}

const CASE_TYPE_PATTERNS: {
  vertical: IndustryType
  department: string
  keywords: string[]
  phrases: string[]
}[] = [
  {
    vertical: 'family_law',
    department: 'Family Law',
    keywords: ['divorce', 'custody', 'child', 'children', 'spousal', 'alimony', 'adoption', 'adopt', 'mediation', 'prenuptial', 'prenup', 'domestic', 'restraining', 'visitation', 'parenting', 'separation', 'marital'],
    phrases: ['child support', 'spousal support', 'child custody', 'parenting plan', 'dissolution of marriage', 'marital settlement', 'domestic violence', 'emergency protective', ' restraining order', 'family court']
  },
  {
    vertical: 'immigration',
    department: 'Immigration',
    keywords: ['visa', 'green card', 'citizen', 'citizenship', 'asylum', 'deportation', 'detention', 'immigrant', 'nonimmigrant', 'work permit', 'ead', 'uscis', 'h1b', 'l1', 'opt', 'naturalization', 'status', 'visa expired', 'renewal'],
    phrases: ['work authorization', 'adjustment of status', 'family petition', 'employment based', 'consular processing', 'border patrol', 'ice raid', 'removal proceedings', 'bond hearing', 'appeal denied']
  },
  {
    vertical: 'bankruptcy',
    department: 'Bankruptcy',
    keywords: ['debt', 'bankrupt', 'chapter 7', 'chapter 13', 'creditor', 'foreclosure', 'garnishment', 'levy', 'repossession', 'repossess', 'automatic stay', 'discharge', 'trustee', 'exemption', 'liquidation', 'reorganization'],
    phrases: ['wage garnishment', 'bank levy', 'foreclosure sale', 'judgment creditor', 'collection agency', 'debt collector', 'notice to creditor', '341 meeting', 'proof of claim', 'reaffirmation agreement']
  },
  {
    vertical: 'ip_law',
    department: 'IP Law',
    keywords: ['trademark', 'copyright', 'patent', 'intellectual property', 'infringement', 'pirated', 'pirate', 'counterfeit', 'licensing', 'trade secret', 'nda', 'confidential', ' cease and desist', 'cease desist', 'uspsto', 'trade dress'],
    phrases: ['cease and desist', 'infringement notice', 'DMCA takedown', 'copyright infringement', 'trademark registration', 'patent application', 'IP license', 'royalty agreement', 'work for hire', 'nondisclosure agreement']
  }
]

/**
 * Analyze caller purpose text and route to the appropriate legal vertical.
 * Returns the matched vertical, department, confidence score, and matched keywords.
 */
function routeCaseByPurpose(purposeText: string): CaseRoute | null {
  const normalized = (purposeText || '').toLowerCase()
  let bestMatch: CaseRoute | null = null
  let highestScore = 0

  for (const pattern of CASE_TYPE_PATTERNS) {
    const matchedKeywords: string[] = []

    // Check keyword matches
    for (const kw of pattern.keywords) {
      if (normalized.includes(kw)) {
        matchedKeywords.push(kw)
      }
    }

    // Check phrase matches (more specific, worth more)
    for (const phrase of pattern.phrases) {
      if (normalized.includes(phrase)) {
        matchedKeywords.push(phrase)
      }
    }

    if (matchedKeywords.length === 0) continue

    // Score: phrase matches count 2x keyword matches
    const score = matchedKeywords.filter(k => k.includes(' ')).length * 2 + matchedKeywords.filter(k => !k.includes(' ')).length

    if (score > highestScore) {
      highestScore = score
      bestMatch = {
        vertical: pattern.vertical,
        department: pattern.department,
        confidence: Math.min(score / 3, 1.0),
        matchedKeywords
      }
    }
  }

  return bestMatch
}

export class VoiceReceptionistAgent extends BaseReceptionistAgent {
  private conversationHistory: Map<string, Array<{ role: string; content: string; timestamp: Date }>> = new Map()

  constructor() {
    super({
      id: 'aria-voice-1',
      name: 'ARIA',
      role: 'voice_receptionist',
      capabilities: [{
        name: 'voice_receptionist',
        description: '24/7 Voice AI receptionist for phone calls and visitor interactions',
        tools: ['greet_visitor', 'collect_info', 'route_case', 'transfer_call', 'take_message', 'vertical_analytics'],
        maxConcurrentTasks: 10
      }]
    })

    this.registerTool({
      name: 'greet_visitor',
      description: 'Greet visitor with warm welcome',
      execute: async (params: unknown) => {
        const p = params as { visitorName?: string; industry?: IndustryType; language?: string }
        const greetings: Record<IndustryType, string> = {
          healthcare: 'Welcome to our medical facility. How may I assist you today?',
          legal: 'Welcome to our law office. How may I assist you with your legal matters?',
          family_law: 'Welcome to our family law practice. How may I help you today?',
          immigration: 'Welcome to our immigration law practice. We are here to help with your immigration matters.',
          bankruptcy: 'Welcome to our bankruptcy law practice. How may I assist you with your financial relief options?',
          ip_law: 'Welcome to our intellectual property law practice. How may I help protect your innovations?',
          realestate: 'Welcome to our real estate office. How may I help you find your dream property?',
          hospitality: 'Welcome to our hotel. How may I enhance your stay today?',
          corporate: 'Welcome to our corporate office. How may I assist you today?',
          retail: 'Welcome! How may I assist you with your shopping experience today?',
          education: 'Welcome to our academic institution. How may I assist you today?',
          government: 'Welcome to our government office. How may I serve you today?'
        }
        return {
          success: true,
          output: {
            greeting: greetings[p.industry || 'corporate'],
            visitorName: p.visitorName,
            timestamp: new Date()
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'collect_info',
      description: 'Collect visitor information',
      execute: async (params: unknown) => {
        const p = params as { visitorName: string; purpose: string; contact?: string }
        return {
          success: true,
          output: {
            visitorId: `VIS-${uuid()}`,
            name: p.visitorName,
            purpose: p.purpose,
            contact: p.contact,
            collectedAt: new Date()
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'route_case',
      description: 'Analyze caller purpose and route to the correct legal vertical department',
      execute: async (params: unknown) => {
        const p = params as { purpose: string; industry?: IndustryType }
        // If industry is already set to a specific vertical, use it directly
        if (p.industry && p.industry !== 'legal' && p.industry !== 'corporate' && p.industry !== 'healthcare' && p.industry !== 'realestate' && p.industry !== 'hospitality' && p.industry !== 'retail' && p.industry !== 'education' && p.industry !== 'government') {
          const deptMap: Record<string, string> = {
            family_law: 'Family Law', immigration: 'Immigration',
            bankruptcy: 'Bankruptcy', ip_law: 'IP Law',
            healthcare: 'Healthcare', realestate: 'Real Estate',
            hospitality: 'Hospitality', retail: 'Retail',
            education: 'Education', government: 'Government'
          }
          return {
            success: true,
            output: { vertical: p.industry, department: deptMap[p.industry] || 'General', confidence: 1.0, matchedKeywords: [] },
            duration: 0
          }
        }
        // Route by purpose keywords
        const route = routeCaseByPurpose(p.purpose)
        if (route) {
          return { success: true, output: route, duration: 0 }
        }
        return { success: true, output: { vertical: 'legal', department: 'General', confidence: 0.5, matchedKeywords: [] }, duration: 0 }
      }
    })

    this.registerTool({
      name: 'transfer_call',
      description: 'Transfer call to appropriate department',
      execute: async (params: unknown) => {
        const p = params as { department: string; reason: string }
        return {
          success: true,
          output: {
            transferTo: p.department,
            reason: p.reason,
            estimatedWait: '2-3 minutes',
            positionInQueue: Math.floor(Math.random() * 5) + 1
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'take_message',
      description: 'Take a message for callback',
      execute: async (params: unknown) => {
        const p = params as { from: string; message: string; callbackNumber?: string }
        return {
          success: true,
          output: {
            messageId: `MSG-${uuid()}`,
            from: p.from,
            message: p.message,
            callbackNumber: p.callbackNumber,
            takenAt: new Date(),
            status: 'pending'
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'vertical_analytics',
      description: 'Get call handling performance analytics per legal vertical',
      execute: async () => {
        const outcomes = this.getVerticalCallOutcomes()
        const perf = this.getVerticalPerformance()
        return {
          success: true,
          output: { outcomes, performance: perf },
          duration: 0
        }
      }
    })
  }

  getCapabilities(): string[] {
    return ['Phone Calls', 'Appointment Scheduling', 'Lead Capture', 'Case Routing', '24/7 Availability', 'Multi-language']
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const context = task.context.variables as { industry?: IndustryType; visitorName?: string; purpose?: string }

    // Route based on purpose using case-type routing
    const purpose = (context.purpose || '').toLowerCase()

    // Step 1: Attempt case-type routing to a specific legal vertical
    const routeResult = await this.executeTool('route_case', {
      purpose: context.purpose,
      industry: context.industry
    })
    const route = routeResult.output as CaseRoute | undefined

    // High-confidence vertical match — route directly to that department
    if (route && route.confidence >= 0.6 && route.vertical !== 'legal') {
      const result = await this.executeTool('transfer_call', {
        department: route.department,
        reason: context.purpose || ''
      })
      const out = result.output as { transferTo?: string; reason?: string; estimatedWait?: string } | undefined
      // Track case routing outcome for analytics
      const v1: IndustryType = route.vertical as IndustryType
      if (v1 === 'family_law' || v1 === 'immigration' || v1 === 'bankruptcy' || v1 === 'ip_law') {
        this.recordVerticalOutcome(v1, 'case_routed', 0, route.confidence, route.department)
      }
      return {
        success: true,
        output: {
          agent: 'ARIA',
          action: 'case_routed',
          routedTo: route.department,
          vertical: route.vertical,
          matchedKeywords: route.matchedKeywords,
          confidence: route.confidence,
          transferTo: out?.transferTo,
          reason: out?.reason,
          estimatedWait: out?.estimatedWait
        }
      }
    }

    // Step 2: Check for scheduling intent
    if (purpose.includes('appointment') || purpose.includes('schedule') || purpose.includes('consultation')) {
      // Route scheduling to the detected vertical, or to legal general
      const dept = route?.department || 'Legal Intake'
      const result = await this.executeTool('collect_info', {
        visitorName: context.visitorName,
        purpose: context.purpose
      })
      const out = result.output as { visitorId?: string; name?: string; purpose?: string } | undefined
      const v2: IndustryType = (route?.vertical || 'legal') as IndustryType
      if (v2 === 'family_law' || v2 === 'immigration' || v2 === 'bankruptcy' || v2 === 'ip_law') {
        this.recordVerticalOutcome(v2, 'scheduling_initiated', 0, route?.confidence || 0, dept)
      }
      return {
        success: true,
        output: {
          agent: 'ARIA',
          action: 'scheduling_initiated',
          routedTo: dept,
          vertical: v2,
          visitorId: out?.visitorId,
          name: out?.name,
          purpose: out?.purpose
        }
      }
    }

    // Step 3: Check for human/escalation intent
    if (purpose.includes('speak') || purpose.includes('human') || purpose.includes('real') || purpose.includes('attorney') || purpose.includes('lawyer')) {
      const dept = route?.department || 'Legal Intake'
      const result = await this.executeTool('transfer_call', {
        department: dept,
        reason: context.purpose || ''
      })
      const out = result.output as { transferTo?: string; reason?: string; estimatedWait?: string } | undefined
      const v3: IndustryType = (route?.vertical || 'legal') as IndustryType
      if (v3 === 'family_law' || v3 === 'immigration' || v3 === 'bankruptcy' || v3 === 'ip_law') {
        this.recordVerticalOutcome(v3, 'escalation_initiated', 0, route?.confidence || 0, dept)
      }
      return {
        success: true,
        output: {
          agent: 'ARIA',
          action: 'escalation_initiated',
          routedTo: dept,
          vertical: v3,
          transferTo: out?.transferTo,
          reason: out?.reason,
          estimatedWait: out?.estimatedWait
        }
      }
    }

    // Step 4: Default greeting with detected industry context
    const result = await this.executeTool('greet_visitor', {
      visitorName: context.visitorName,
      industry: route?.vertical || context.industry
    })
    const out = result.output as { greeting?: string; visitorName?: string } | undefined
    return {
      success: true,
      output: {
        agent: 'ARIA',
        action: 'greeting_sent',
        routedTo: route?.department || context.industry || 'general',
        vertical: route?.vertical,
        confidence: route?.confidence || 0,
        greeting: out?.greeting,
        visitorName: out?.visitorName
      }
    }
  }

  // Voice-specific method
  async handleVoiceInteraction(visitorInput: string, ctx: InteractionContext): Promise<AIResponse> {
    const startTime = Date.now()

    // Add to conversation history
    const sessionHistory = this.conversationHistory.get(ctx.visitorId || 'unknown') || []
    sessionHistory.push({ role: 'visitor', content: visitorInput, timestamp: new Date() })

    // Process with CEO brain for intelligent routing
    const ceoResult = await ceoBrain.think(visitorInput, { context: ctx, agent: 'ARIA' })

    const response: AIResponse = {
      agentId: this.id,
      content: `ARIA: ${ceoResult.execution.actions.join('. ')}`,
      confidence: ceoResult.confidence,
      suggestedActions: ['Schedule Appointment', 'Get Directions', 'Speak to Agent'],
      requiresHumanEscalation: ceoResult.analysis.intent === 'revenue' || ceoResult.analysis.intent === 'customer',
      sentimentAnalysis: {
        score: 0.5,
        label: ctx.sentiment,
        emotions: []
      },
      language: ctx.visitorLanguage,
      responseTime: Date.now() - startTime,
      metadata: {
        tokensUsed: 150,
        modelVersion: 'ARIA-3.0',
        cachedResponse: false,
        processingTimeMs: Date.now() - startTime
      }
    }

    sessionHistory.push({ role: 'agent', content: response.content, timestamp: new Date() })
    this.conversationHistory.set(ctx.visitorId || 'unknown', sessionHistory)

    return response
  }
}

// ============================================================================
// SCHEDULER AGENT
// ============================================================================

export class SchedulerAgent extends BaseReceptionistAgent {
  private appointments: Map<string, {
    id: string
    clientName: string
    service: string
    dateTime: Date
    status: string
    industry: IndustryType
  }> = new Map()

  constructor() {
    super({
      id: 'scheduler-1',
      name: 'CHRONOS',
      role: 'scheduling',
      capabilities: [{
        name: 'scheduling',
        description: 'AI Scheduling Agent for appointment booking and calendar management',
        tools: ['book_appointment', 'check_availability', 'reschedule', 'cancel_appointment', 'send_reminder'],
        maxConcurrentTasks: 5
      }]
    })

    this.registerTool({
      name: 'book_appointment',
      description: 'Book a new appointment',
      execute: async (params: unknown) => {
        const p = params as { visitorName: string; service: string; preferredDate?: string; industry?: IndustryType }
        const appointmentId = `APT-${uuid()}`
        const appointment = {
          id: appointmentId,
          clientName: p.visitorName,
          service: p.service,
          dateTime: p.preferredDate ? new Date(p.preferredDate) : new Date(),
          status: 'scheduled',
          industry: p.industry || 'corporate'
        }
        this.appointments.set(appointmentId, appointment)
        return { success: true, output: appointment, duration: 0 }
      }
    })

    this.registerTool({
      name: 'check_availability',
      description: 'Check available time slots',
      execute: async (params: unknown) => {
        const p = params as { date: string; service: string }
        // Generate mock availability
        const slots = ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:00 PM']
        return {
          success: true,
          output: {
            date: p.date,
            availableSlots: slots.slice(0, Math.floor(Math.random() * 4) + 1)
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'reschedule',
      description: 'Reschedule an existing appointment',
      execute: async (params: unknown) => {
        const p = params as { appointmentId: string; newDate: string }
        const appointment = this.appointments.get(p.appointmentId)
        if (appointment) {
          appointment.dateTime = new Date(p.newDate)
          appointment.status = 'rescheduled'
          return { success: true, output: appointment, duration: 0 }
        }
        return { success: false, error: 'Appointment not found', duration: 0 }
      }
    })

    this.registerTool({
      name: 'cancel_appointment',
      description: 'Cancel an appointment',
      execute: async (params: unknown) => {
        const p = params as { appointmentId: string; reason?: string }
        const appointment = this.appointments.get(p.appointmentId)
        if (appointment) {
          appointment.status = 'cancelled'
          return { success: true, output: { appointmentId: p.appointmentId, status: 'cancelled' }, duration: 0 }
        }
        return { success: false, error: 'Appointment not found', duration: 0 }
      }
    })

    this.registerTool({
      name: 'send_reminder',
      description: 'Send appointment reminder',
      execute: async (params: unknown) => {
        const p = params as { appointmentId: string; method: 'email' | 'sms' }
        return {
          success: true,
          output: {
            reminderId: `REM-${uuid()}`,
            appointmentId: p.appointmentId,
            method: p.method,
            sentAt: new Date(),
            status: 'sent'
          },
          duration: 0
        }
      }
    })
  }

  getCapabilities(): string[] {
    return ['Calendar Management', 'Appointment Booking', 'Reminders', 'Rescheduling', 'Conflict Detection']
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const context = task.context.variables as { action?: string; [key: string]: unknown }

    switch (context.action) {
      case 'book':
        return this.executeTool('book_appointment', context)
      case 'check_availability':
        return this.executeTool('check_availability', context)
      case 'reschedule':
        return this.executeTool('reschedule', context)
      case 'cancel':
        return this.executeTool('cancel_appointment', context)
      default: {
        const result = await this.executeTool('book_appointment', context)
        const out = result.output as { id?: string; clientName?: string; service?: string } | undefined
        return { success: true, output: { agent: 'SCHEDULER', action: 'appointment_processed', id: out?.id, clientName: out?.clientName, service: out?.service } }
      }
    }
  }
}

// ============================================================================
// KNOWLEDGE AGENT (Information Agent)
// ============================================================================

export class KnowledgeAgent extends BaseReceptionistAgent {
  private knowledgeBase: Map<IndustryType, Array<{ question: string; answer: string; keywords: string[]; category: string }>> = new Map()

  constructor() {
    super({
      id: 'knowledge-1',
      name: 'WIKI',
      role: 'information',
      capabilities: [{
        name: 'information',
        description: 'AI Information Agent for FAQ answers and knowledge retrieval',
        tools: ['faq_lookup', 'search_knowledge', 'provide_directions', 'explain_policy'],
        maxConcurrentTasks: 20
      }]
    })

    this.initializeKnowledgeBase()

    this.registerTool({
      name: 'faq_lookup',
      description: 'Look up FAQ for visitor question',
      execute: async (params: unknown) => {
        const p = params as { query: string; industry?: IndustryType }
        const industry = p.industry || 'corporate'
        const kb = this.knowledgeBase.get(industry) || []
        const result = kb.find(entry =>
          entry.keywords.some(k => p.query.toLowerCase().includes(k)) ||
          entry.question.toLowerCase().includes(p.query.toLowerCase())
        )
        return {
          success: true,
          output: result || {
            answer: 'I can help you with that. Could you provide more details?',
            category: 'general'
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'search_knowledge',
      description: 'Search knowledge base for information',
      execute: async (params: unknown) => {
        const p = params as { query: string; industry?: IndustryType }
        const industry = p.industry || 'corporate'
        const kb = this.knowledgeBase.get(industry) || []
        const results = kb.filter(entry =>
          entry.keywords.some(k => p.query.toLowerCase().includes(k)) ||
          entry.question.toLowerCase().includes(p.query.toLowerCase())
        )
        return {
          success: true,
          output: {
            results,
            count: results.length
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'provide_directions',
      description: 'Provide directions to location',
      execute: async (params: unknown) => {
        return {
          success: true,
          output: {
            directions: 'Take the main elevator to the 3rd floor. Our office is on the left after the reception desk.',
            building: 'Main Building',
            floor: 3,
            room: 'Suite 301'
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'explain_policy',
      description: 'Explain company policy',
      execute: async (params: unknown) => {
        const p = params as { policyType: string }
        const policies: Record<string, string> = {
          'privacy': 'We take your privacy seriously. Your data is encrypted and never shared with third parties.',
          'cancellation': 'Free cancellation up to 24 hours before your appointment.',
          'payment': 'We accept all major credit cards and insurance plans.',
          'security': 'All visitor data is secured with industry-standard encryption.'
        }
        return {
          success: true,
          output: {
            policy: p.policyType,
            explanation: policies[p.policyType] || 'Please contact our team for policy details.'
          },
          duration: 0
        }
      }
    })
  }

  private initializeKnowledgeBase(): void {
    // Healthcare
    this.knowledgeBase.set('healthcare', [
      { question: 'What are your hours?', answer: 'We are open Monday-Friday 8am-6pm, Saturday 9am-1pm', keywords: ['hours', 'open', 'time', 'when'], category: 'general' },
      { question: 'How do I schedule?', answer: 'Call (555) 123-4567 or book online', keywords: ['schedule', 'appointment', 'book'], category: 'scheduling' },
      { question: 'Do you accept insurance?', answer: 'Yes, we accept most major insurance plans', keywords: ['insurance', 'payment', 'cost'], category: 'billing' }
    ])

    // Corporate
    this.knowledgeBase.set('corporate', [
      { question: 'Where is meeting room?', answer: 'Meeting rooms are on floors 3-5', keywords: ['meeting', 'room', 'location'], category: 'directions' },
      { question: 'WiFi password?', answer: 'GuestNetwork / Welcome2024', keywords: ['wifi', 'internet', 'password'], category: 'facilities' },
      { question: 'How do I contact IT?', answer: 'Email it-support@company.com or call ext. 5000', keywords: ['it', 'support', 'help'], category: 'support' }
    ])

    // Hospitality
    this.knowledgeBase.set('hospitality', [
      { question: 'Check-in time?', answer: 'Check-in is at 3:00 PM', keywords: ['checkin', 'check-in', 'time'], category: 'rooms' },
      { question: 'WiFi available?', answer: 'Free WiFi throughout the hotel. Connect to GuestWiFi', keywords: ['wifi', 'internet', 'wireless'], category: 'amenities' },
      { question: 'Pool hours?', answer: 'Pool is open 6am-10pm daily', keywords: ['pool', 'hours', 'time'], category: 'amenities' }
    ])

    // Family Law
    this.knowledgeBase.set('family_law', [
      { question: 'How do I file for divorce?', answer: 'To file for divorce, you need to submit a petition to your local family court. Our attorneys can guide you through the process including serving papers and financial disclosures.', keywords: ['divorce', 'filing', 'petition', 'court'], category: 'divorce' },
      { question: 'How is child custody determined?', answer: 'Courts determine custody based on the best interests of the child, considering each parent\'s relationship, stability, ability to provide, and the child\'s preferences where appropriate.', keywords: ['custody', 'children', 'parenting', 'visitiation'], category: 'custody' },
      { question: 'What is spousal support?', answer: 'Spousal support (alimony) is financial assistance ordered by a court from one spouse to another during or after divorce proceedings, based on need, duration of marriage, and earning capacity.', keywords: ['alimony', 'support', 'spousal', 'maintenance'], category: 'support' },
      { question: 'How do I modify a custody order?', answer: 'To modify a custody order, you must demonstrate a material change in circumstances affecting the child\'s welfare. File a motion with the original court and attend a hearing.', keywords: ['modify', 'change', 'custody order', 'modification'], category: 'custody' },
      { question: 'What is the process for adoption?', answer: 'Adoption involves background checks, home studies, placement matching, and finalization hearings. Our team handles domestic, international, and stepparent adoptions.', keywords: ['adoption', 'child', 'parent', 'foster'], category: 'adoption' },
      { question: 'How does mediation work?', answer: 'Mediation is a confidential process where a neutral mediator helps both parties reach agreement on custody, support, and property division without going to trial.', keywords: ['mediation', 'mediate', 'agreement', 'negotiate'], category: 'process' }
    ])

    // Immigration Law
    this.knowledgeBase.set('immigration', [
      { question: 'How long does visa processing take?', answer: 'Processing times vary by visa type and service center. Generally, work visas take 2-6 months and family petitions may take 12-24 months. You can check current times at USCIS.gov.', keywords: ['visa', 'processing time', 'wait', 'duration'], category: 'visas' },
      { question: 'What documents do I need for a green card?', answer: 'Typical documents include passport photos, birth certificate, marriage certificate (if applicable), proof of lawful entry, and supporting documentation for your eligibility category.', keywords: ['green card', 'documents', 'evidence', 'documents required'], category: 'greencard' },
      { question: 'How do I check my case status?', answer: 'You can check your case status online at USCIS.gov using your receipt number, or call our office and we can provide updates on your case progress.', keywords: ['status', 'check', 'case', 'track'], category: 'general' },
      { question: 'What is the difference between asylum and refugee status?', answer: 'Refugee status is granted before entering the US based on past persecution. Asylum is applied for within one year of arrival in the US, based on fear of future persecution.', keywords: ['asylum', 'refugee', 'protection', 'fear'], category: 'asylum' },
      { question: 'Can I work while waiting for a work permit?', answer: 'If you have a pending adjustment application that includes an EAD request, you may be eligible for a pending EAD. Contact our office to verify your specific situation.', keywords: ['work permit', 'ead', 'employment', 'authorization'], category: 'work' },
      { question: 'What happens at an immigration interview?', answer: 'At your interview, an officer will review your case, ask questions about your application and background, and may request additional documentation. Our attorney can accompany you.', keywords: ['interview', 'appointment', 'uscis', 'hearing'], category: 'process' }
    ])

    // Bankruptcy Law
    this.knowledgeBase.set('bankruptcy', [
      { question: 'What is the difference between Chapter 7 and Chapter 13?', answer: 'Chapter 7 is liquidation — assets may be sold to pay creditors and remaining debts discharged. Chapter 13 is reorganization — you keep property and repay debts through a court-approved plan over 3-5 years.', keywords: ['chapter 7', 'chapter 13', 'liquidate', 'reorganize'], category: 'bankruptcy_types' },
      { question: 'Will bankruptcy stop my wage garnishment?', answer: 'Yes, filing for bankruptcy triggers an automatic stay that immediately stops all collection actions including wage garnishment, bank levies, and creditor calls.', keywords: ['garnishment', 'wage', 'stop', 'automatic stay'], category: 'protection' },
      { question: 'What property can I keep in bankruptcy?', answer: 'Exemptions allow you to keep essential property like a primary residence, vehicle, household goods, and tools of your trade. Federal and state exemptions vary.', keywords: ['exemptions', 'property', 'keep', 'assets'], category: 'exemptions' },
      { question: 'How long does bankruptcy take?', answer: 'Chapter 7 typically concludes in 4-6 months after filing. Chapter 13 lasts 3-5 years as you complete your repayment plan before receiving a discharge.', keywords: ['duration', 'timeline', 'how long', 'complete'], category: 'process' },
      { question: 'Can I file bankruptcy if I have a pending lawsuit?', answer: 'Yes. Filing stops all litigation and creditor actions through the automatic stay. Notify our office immediately if you are facing a lawsuit or judgment.', keywords: ['lawsuit', 'judgment', 'litigation', 'sued'], category: 'protection' },
      { question: 'What is a 341 meeting?', answer: 'The 341 meeting (trustee meeting) is a short hearing where you testify under oath about your bankruptcy documents. Your attorney will prepare you for this proceeding.', keywords: ['341', 'trustee', 'meeting', 'hearing'], category: 'process' }
    ])

    // IP Law
    this.knowledgeBase.set('ip_law', [
      { question: 'How do I register a trademark?', answer: 'To register a trademark, we conduct a search for conflicts, prepare the application, file with the USPTO, and respond to any office actions. Registration takes 8-12 months.', keywords: ['trademark', 'register', 'USPTO', 'brand'], category: 'trademark' },
      { question: 'What is the difference between a trademark and copyright?', answer: 'Trademarks protect brand identifiers (names, logos, slogans) used in commerce. Copyrights protect original creative works (writing, music, software, art) from unauthorized reproduction.', keywords: ['trademark', 'copyright', 'difference', 'protect'], category: 'general' },
      { question: 'How do I protect my invention?', answer: 'For inventions, we recommend filing a provisional patent application to establish priority, then pursuing a full utility patent through the USPTO. Trade secrets may also be appropriate.', keywords: ['patent', 'invention', 'protect', 'utility'], category: 'patent' },
      { question: 'What is a cease and desist letter?', answer: 'A cease and desist letter demands that another party stop alleged infringing activity. It can be effective for trademark infringement, copyright piracy, or trade secret misappropriation.', keywords: ['cease', 'desist', 'infringe', 'stop'], category: 'enforcement' },
      { question: 'How long does copyright protection last?', answer: 'For works created after 1978, copyright lasts the author\'s life plus 70 years. Corporate works last 95 years from publication or 120 years from creation, whichever is shorter.', keywords: ['copyright', 'duration', 'term', 'life plus 70'], category: 'copyright' },
      { question: 'Can I license my IP to others?', answer: 'Yes. We draft licensing agreements that define scope, territory, royalties, quality controls, and termination rights to protect your IP while generating revenue.', keywords: ['license', 'licensing', 'royalty', 'agreement'], category: 'licensing' }
    ])

    // Default for other industries
    const defaultKB = [
      { question: 'How can I help you?', answer: 'I can assist with appointments, information, and general inquiries.', keywords: ['help', 'assist', 'info'], category: 'general' }
    ]
    this.knowledgeBase.set('retail', defaultKB)
    this.knowledgeBase.set('realestate', defaultKB)
    this.knowledgeBase.set('education', defaultKB)
    this.knowledgeBase.set('government', defaultKB)
  }

  getCapabilities(): string[] {
    return ['FAQ Answers', 'Product Info', 'Service Details', 'Direction Guidance', 'Policy Explanation']
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const context = task.context.variables as { query?: string; industry?: IndustryType; action?: string }

    if (context.action === 'search') {
      const result = await this.executeTool('search_knowledge', { query: context.query, industry: context.industry })
      const out = result.output as { results?: unknown[]; count?: number } | undefined
      return { success: true, output: { agent: 'KNOWLEDGE', action: 'knowledge_search', results: out?.results, count: out?.count } }
    }

    const result = await this.executeTool('faq_lookup', { query: context.query, industry: context.industry })
    const out = result.output as { question?: string; answer?: string; category?: string } | undefined
    return { success: true, output: { agent: 'KNOWLEDGE', action: 'faq_provided', question: out?.question, answer: out?.answer, category: out?.category } }
  }
}

// ============================================================================
// ESCALATION AGENT
// ============================================================================

export class EscalationAgent extends BaseReceptionistAgent {
  private escalationQueue: Array<{
    ticketId: string
    reason: string
    visitorName?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    createdAt: Date
    status: 'open' | 'resolved'
    industry?: IndustryType
    department?: string
  }> = []

  // Industry-specific escalation policies
  private escalationPolicies: Record<string, {
    department: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    timeout: number
    urgentKeywords: string[]
    criticalKeywords: string[]
  }> = {
    family_law: {
      department: 'Family Law',
      priority: 'high',
      timeout: 30,
      urgentKeywords: ['children', 'custody', 'abuse', 'emergency', 'safety', 'harm', 'restraining'],
      criticalKeywords: ['abuse', 'danger', 'suicide', 'harm', 'emergency protective order', 'immediate']
    },
    immigration: {
      department: 'Immigration',
      priority: 'high',
      timeout: 30,
      urgentKeywords: ['deportation', 'detention', 'visa expired', 'deadline', 'court date', 'hearing'],
      criticalKeywords: ['detained', 'deportation', 'removal', 'arrested', 'ice', 'urgent']
    },
    bankruptcy: {
      department: 'Bankruptcy',
      priority: 'medium',
      timeout: 60,
      urgentKeywords: ['garnishment', 'foreclosure', 'lawsuit', 'judgment', 'sheriff', 'levy'],
      criticalKeywords: ['foreclosure sale', 'bank levy', 'wage garnishment', 'receiver', 'emergency']
    },
    ip_law: {
      department: 'IP Law',
      priority: 'medium',
      timeout: 60,
      urgentKeywords: ['infringement', 'stolen', 'pirated', 'unauthorized', 'cease', 'damages'],
      criticalKeywords: ['counterfeit', 'piracy', 'trade secret theft', 'urgent injunction', 'emergency']
    }
  }

  private getEscalationPolicy(industry: IndustryType) {
    return this.escalationPolicies[industry] || {
      department: 'General',
      priority: 'medium' as const,
      timeout: 60,
      urgentKeywords: [],
      criticalKeywords: []
    }
  }

  constructor() {
    super({
      id: 'escalation-1',
      name: 'CONNECT',
      role: 'escalation',
      capabilities: [{
        name: 'escalation',
        description: 'AI Escalation Agent for complex issues and human handoffs',
        tools: ['create_ticket', 'notify_agent', 'track_issue', 'resolve_ticket'],
        maxConcurrentTasks: 5
      }]
    })

    this.registerTool({
      name: 'create_ticket',
      description: 'Create escalation ticket',
      execute: async (params: unknown) => {
        const p = params as { reason: string; visitorName?: string; priority?: string; industry?: IndustryType; department?: string }
        const ticketId = `ESC-${uuid()}`
        const ticket = {
          ticketId,
          reason: p.reason || '',
          visitorName: p.visitorName || '',
          priority: (p.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
          createdAt: new Date(),
          status: 'open' as const,
          industry: p.industry,
          department: p.department
        }
        this.escalationQueue.push(ticket)
        return { success: true, output: ticket, duration: 0 }
      }
    })

    this.registerTool({
      name: 'notify_agent',
      description: 'Notify available agent',
      execute: async (params: unknown) => {
        const p = params as { ticketId: string; agentType: string }
        return {
          success: true,
          output: {
            notificationId: `NOTIF-${uuid()}`,
            ticketId: p.ticketId,
            agentType: p.agentType,
            notifiedAt: new Date(),
            estimatedResponse: '2-5 minutes'
          },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'track_issue',
      description: 'Track escalation status',
      execute: async (params: unknown) => {
        const p = params as { ticketId: string }
        const ticket = this.escalationQueue.find(t => t.ticketId === p.ticketId)
        return {
          success: true,
          output: ticket || { status: 'not_found', message: 'Ticket not found' },
          duration: 0
        }
      }
    })

    this.registerTool({
      name: 'resolve_ticket',
      description: 'Mark ticket as resolved',
      execute: async (params: unknown) => {
        const p = params as { ticketId: string; resolution?: string }
        const ticket = this.escalationQueue.find(t => t.ticketId === p.ticketId)
        if (ticket) {
          // Mark as resolved (in real implementation, would remove from queue)
          return { success: true, output: { ticketId: p.ticketId, status: 'resolved', resolution: p.resolution }, duration: 0 }
        }
        return { success: false, error: 'Ticket not found', duration: 0 }
      }
    })
  }

  getCapabilities(): string[] {
    return ['Complex Issue Resolution', 'Complaint Handling', 'Special Request Routing', 'Manager Connection']
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const context = task.context.variables as { reason?: string; visitorName?: string; priority?: string; industry?: IndustryType }

    // Get industry-specific escalation policy
    const industry = context.industry || 'corporate'
    const policy = this.getEscalationPolicy(industry)

    // Determine priority from policy if not explicitly set
    const reason = context.reason || ''
    const isUrgent = policy.urgentKeywords.some(k => reason.toLowerCase().includes(k))
    const isCritical = policy.criticalKeywords.some(k => reason.toLowerCase().includes(k))
    const resolvedPriority = context.priority || (isCritical ? 'critical' : isUrgent ? 'high' : policy.priority)

    const result = await this.executeTool('create_ticket', {
      reason: context.reason,
      visitorName: context.visitorName,
      priority: resolvedPriority,
      industry,
      department: policy.department
    })

    // Notify appropriate agent
    await this.executeTool('notify_agent', {
      ticketId: (result.output as any)?.ticketId,
      agentType: 'human_agent'
    })

    return {
      success: true,
      output: {
        agent: 'ESCALATION',
        action: 'ticket_created',
        ticketId: (result.output as any)?.ticketId,
        department: policy.department,
        priority: resolvedPriority,
        estimatedWait: isCritical ? 'immediate' : isUrgent ? '2-5 minutes' : `${policy.timeout} minutes`
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const voiceReceptionist = new VoiceReceptionistAgent()
export const schedulerAgent = new SchedulerAgent()
export const knowledgeAgent = new KnowledgeAgent()
export const escalationAgent = new EscalationAgent()

// Factory function for creating agents by type
export function createReceptionistAgent(type: AgentType): BaseReceptionistAgent {
  switch (type) {
    case 'greeting':
      return voiceReceptionist
    case 'scheduling':
      return schedulerAgent
    case 'information':
      return knowledgeAgent
    case 'escalation':
      return escalationAgent
    case 'multilingual':
      return new VoiceReceptionistAgent() // Can be specialized for multilingual
    default:
      return voiceReceptionist
  }
}