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

// ============================================================================
// BASE RECEPTIONIST AGENT
// ============================================================================

interface Task {
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

interface TaskContext {
  userRequest: string
  sessionId: string
  variables: Record<string, unknown>
}

interface TaskResult {
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
}

// ============================================================================
// ARIA - VOICE AI RECEPTIONIST AGENT
// ============================================================================

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
        tools: ['greet_visitor', 'collect_info', 'transfer_call', 'take_message'],
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
  }

  getCapabilities(): string[] {
    return ['Phone Calls', 'Appointment Scheduling', 'Lead Capture', '24/7 Availability', 'Multi-language']
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const context = task.context.variables as { industry?: IndustryType; visitorName?: string; purpose?: string }

    // Route based on purpose
    const purpose = (context.purpose || '').toLowerCase()

    if (purpose.includes('appointment') || purpose.includes('schedule')) {
      const result = await this.executeTool('collect_info', {
        visitorName: context.visitorName,
        purpose: context.purpose
      })
      const out = result.output as { visitorId?: string; name?: string; purpose?: string } | undefined
      return { success: true, output: { agent: 'ARIA', action: 'scheduling_initiated', visitorId: out?.visitorId, name: out?.name, purpose: out?.purpose } }
    }

    if (purpose.includes('speak') || purpose.includes('human') || purpose.includes('real')) {
      const result = await this.executeTool('transfer_call', {
        department: 'escalation',
        reason: context.purpose
      })
      const out = result.output as { transferTo?: string; reason?: string; estimatedWait?: string } | undefined
      return { success: true, output: { agent: 'ARIA', action: 'escalation_initiated', transferTo: out?.transferTo, reason: out?.reason, estimatedWait: out?.estimatedWait } }
    }

    // Default greeting
    const result = await this.executeTool('greet_visitor', {
      visitorName: context.visitorName,
      industry: context.industry
    })
    const out = result.output as { greeting?: string; visitorName?: string } | undefined
    return { success: true, output: { agent: 'ARIA', action: 'greeting_sent', greeting: out?.greeting, visitorName: out?.visitorName } }
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

    // Default for other industries
    const defaultKB = [
      { question: 'How can I help you?', answer: 'I can assist with appointments, information, and general inquiries.', keywords: ['help', 'assist', 'info'], category: 'general' }
    ]
    this.knowledgeBase.set('realestate', defaultKB)
    this.knowledgeBase.set('legal', defaultKB)
    this.knowledgeBase.set('retail', defaultKB)
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
  private escalationQueue: Array<{ ticketId: string; reason: string; priority: string; createdAt: Date }> = []

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
        const p = params as { reason: string; visitorName?: string; priority?: string }
        const ticketId = `ESC-${uuid()}`
        const ticket = {
          ticketId,
          reason: p.reason || '',
          visitorName: p.visitorName || '',
          priority: p.priority || 'medium',
          createdAt: new Date(),
          status: 'open'
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
    const context = task.context.variables as { reason?: string; visitorName?: string; priority?: string }

    const result = await this.executeTool('create_ticket', {
      reason: context.reason,
      visitorName: context.visitorName,
      priority: context.priority
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
        estimatedWait: '2-5 minutes'
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