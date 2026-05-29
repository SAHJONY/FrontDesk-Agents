/**
 * ============================================================
 * WORKFORCE BRIDGE - Integration Layer
 * ============================================================
 * 
 * Connects the agent-workforce multi-agent orchestration system
 * with the frontdesk-agents AI receptionist platform.
 */

import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'
import { IndustryType } from './agents/types'
import { aiOrchestrator } from './ceo-brain/AIOpsOrchestrator'

// ============================================================================
// TYPES
// ============================================================================

export interface WorkforceTask {
  id: string
  type: 'receptionist' | 'research' | 'scheduling' | 'information' | 'escalation'
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  context: WorkforceContext
  result?: WorkforceResult
  createdAt: Date
  assignedAgent?: string
}

export interface WorkforceContext {
  industry: IndustryType
  visitorId?: string
  visitorName?: string
  visitorLanguage: string
  purpose: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  sessionId: string
  variables: Record<string, unknown>
}

export interface WorkforceResult {
  success: boolean
  output?: unknown
  error?: string
  agentUsed: string
  duration: number
}

export interface ReceptionistTool {
  name: string
  description: string
  execute: (params: WorkforceToolParams) => Promise<WorkforceResult>
}

interface WorkforceToolParams {
  industry?: IndustryType
  visitorId?: string
  visitorName?: string
  visitorLanguage?: string
  purpose?: string
  query?: string
  dateTime?: string
  service?: string
  reason?: string
  urgency?: string
  text?: string
  targetLanguage?: string
  [key: string]: unknown
}

// ============================================================================
// WORKFORCE BRIDGE CLASS
// ============================================================================

export class WorkforceBridge extends EventEmitter {
  private tasks: Map<string, WorkforceTask> = new Map()
  private taskQueue: WorkforceTask[] = []
  private activeTasks: Map<string, WorkforceTask> = new Map()
  private completedTasks: Map<string, WorkforceTask> = new Map()
  private tools: Map<string, ReceptionistTool> = new Map()
  private isProcessing = false
  private maxConcurrentTasks = 5

  constructor() {
    super()
    this.initializeTools()
    console.log('🌐 Workforce Bridge initialized')
  }

  private initializeTools(): void {
    // Appointment booking tool
    this.registerTool({
      name: 'book_appointment',
      description: 'Book an appointment for a visitor',
      execute: async (params: WorkforceToolParams) => {
        const start = Date.now()
        try {
          const appointmentId = `APT-${Date.now()}`
          return {
            success: true,
            output: {
              appointmentId,
              dateTime: params.dateTime || new Date().toISOString(),
              service: params.service || '',
              visitorName: params.visitorName || '',
              status: 'confirmed'
            },
            agentUsed: 'SCHEDULER',
            duration: Date.now() - start
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            agentUsed: 'SCHEDULER',
            duration: Date.now() - start
          }
        }
      }
    })

    // FAQ lookup tool
    this.registerTool({
      name: 'faq_lookup',
      description: 'Look up FAQ information for visitor questions',
      execute: async (params: WorkforceToolParams) => {
        const start = Date.now()
        try {
          const industry = (params.industry || 'corporate') as IndustryType
          const faqs = this.getIndustryFAQs(industry)
          const query = params.query || ''
          const relevantFAQ = faqs.find(f => 
            f.keywords.some(k => query.toLowerCase().includes(k))
          )
          return {
            success: true,
            output: relevantFAQ || { answer: 'I can help you with that. Please wait while I connect you with a specialist.' },
            agentUsed: 'KNOWLEDGE',
            duration: Date.now() - start
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            agentUsed: 'KNOWLEDGE',
            duration: Date.now() - start
          }
        }
      }
    })

    // Visitor registration tool
    this.registerTool({
      name: 'register_visitor',
      description: 'Register a visitor in the system',
      execute: async (params: WorkforceToolParams) => {
        const start = Date.now()
        try {
          const visitorId = `VIS-${uuid()}`
          return {
            success: true,
            output: {
              visitorId,
              name: params.visitorName || '',
              registeredAt: new Date().toISOString(),
              checkInCode: Math.random().toString(36).substring(2, 8).toUpperCase()
            },
            agentUsed: 'ARIA',
            duration: Date.now() - start
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            agentUsed: 'ARIA',
            duration: Date.now() - start
          }
        }
      }
    })

    // Escalation tool
    this.registerTool({
      name: 'escalate_to_human',
      description: 'Escalate complex issue to human agent',
      execute: async (params: WorkforceToolParams) => {
        const start = Date.now()
        try {
          return {
            success: true,
            output: {
              ticketId: `ESC-${Date.now()}`,
              reason: params.reason || 'Complex issue requiring human assistance',
              estimatedWait: '2-5 minutes',
              priority: params.urgency || 'medium'
            },
            agentUsed: 'CONNECT',
            duration: Date.now() - start
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            agentUsed: 'CONNECT',
            duration: Date.now() - start
          }
        }
      }
    })

    // Language translation tool
    this.registerTool({
      name: 'translate_response',
      description: 'Translate response to visitor language',
      execute: async (params: WorkforceToolParams) => {
        const start = Date.now()
        try {
          return {
            success: true,
            output: {
              originalText: params.text || '',
              translatedText: `[Translated to ${params.targetLanguage || 'English'}]: ${params.text || ''}`,
              targetLanguage: params.targetLanguage || 'English',
              confidence: 0.95
            },
            agentUsed: 'GLOBAL',
            duration: Date.now() - start
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            agentUsed: 'GLOBAL',
            duration: Date.now() - start
          }
        }
      }
    })

    console.log(`🔧 Initialized ${this.tools.size} receptionist tools`)
  }

  private getIndustryFAQs(industry: IndustryType): Array<{ question: string; answer: string; keywords: string[] }> {
    const faqs: Record<string, Array<{ question: string; answer: string; keywords: string[] }>> = {
      healthcare: [
        { question: 'What are your hours?', answer: 'We are open Monday-Friday 8am-6pm', keywords: ['hours', 'open', 'time', 'when'] },
        { question: 'How do I schedule an appointment?', answer: 'You can book online or call us at (555) 123-4567', keywords: ['appointment', 'schedule', 'book', 'visit'] },
        { question: 'Do you accept insurance?', answer: 'Yes, we accept most major insurance plans', keywords: ['insurance', 'payment', 'cost'] }
      ],
      legal: [
        { question: 'How much is a consultation?', answer: 'Initial consultations are $250 for 30 minutes', keywords: ['cost', 'price', 'fee', 'consultation'] },
        { question: 'What areas do you practice?', answer: 'We specialize in family law, criminal defense, and civil litigation', keywords: ['practice', 'areas', 'specialize'] }
      ],
      realestate: [
        { question: 'What properties do you have available?', answer: 'We have various properties based on your criteria', keywords: ['property', 'listing', 'home', 'house'] },
        { question: 'How do I schedule a showing?', answer: 'Contact our agents to schedule a property viewing', keywords: ['showing', 'viewing', 'visit', 'tour'] }
      ],
      hospitality: [
        { question: 'What amenities are included?', answer: 'Our amenities include WiFi, pool, gym, and room service', keywords: ['amenities', 'services', 'features'] },
        { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in', keywords: ['cancel', 'refund', 'policy'] }
      ],
      corporate: [
        { question: 'Where is the meeting room?', answer: 'Meeting rooms are on floors 3-5', keywords: ['meeting', 'room', 'location', 'floor'] },
        { question: 'How do I connect to WiFi?', answer: 'WiFi: GuestNetwork, Password: Welcome2024', keywords: ['wifi', 'internet', 'password', 'network'] }
      ],
      retail: [
        { question: 'Do you have this in another size?', answer: 'Let me check our inventory for you', keywords: ['size', 'available', 'stock'] },
        { question: 'What is your return policy?', answer: 'Returns accepted within 30 days with receipt', keywords: ['return', 'exchange', 'refund'] }
      ],
      education: [
        { question: 'How do I apply?', answer: 'Applications are available on our website', keywords: ['apply', 'admission', 'enroll'] },
        { question: 'What programs do you offer?', answer: 'We offer undergraduate and graduate programs', keywords: ['program', 'degree', 'course'] }
      ],
      government: [
        { question: 'What documents do I need?', answer: 'Please bring a valid ID and any relevant documents', keywords: ['document', 'required', 'need', 'bring'] },
        { question: 'How long is the wait time?', answer: 'Current wait time is approximately 15-20 minutes', keywords: ['wait', 'time', 'long', 'queue'] }
      ]
    }
    return faqs[industry] || faqs.corporate || []
  }

  registerTool(tool: ReceptionistTool): void {
    this.tools.set(tool.name, tool)
  }

  async executeTool(toolName: string, params: WorkforceToolParams): Promise<WorkforceResult> {
    const tool = this.tools.get(toolName)
    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolName} not found`,
        agentUsed: 'UNKNOWN',
        duration: 0
      }
    }
    return tool.execute(params)
  }

  async submitTask(context: WorkforceContext): Promise<WorkforceTask> {
    const taskType = this.determineTaskType(context)
    const description = this.generateTaskDescription(context)

    const task: WorkforceTask = {
      id: `wf-task-${uuid()}`,
      type: taskType,
      description,
      priority: this.determinePriority(context),
      status: 'pending',
      context,
      createdAt: new Date()
    }

    this.tasks.set(task.id, task)
    this.taskQueue.push(task)

    this.emit('task:submitted', { taskId: task.id, type: taskType, priority: task.priority })
    this.processQueue()

    return task
  }

  private determineTaskType(context: WorkforceContext): WorkforceTask['type'] {
    const purpose = context.purpose.toLowerCase()

    if (purpose.includes('appointment') || purpose.includes('schedule') || purpose.includes('book')) {
      return 'scheduling'
    }
    if (purpose.includes('speak') || purpose.includes('human') || purpose.includes('real') || context.sentiment === 'frustrated') {
      return 'escalation'
    }
    if (purpose.includes('info') || purpose.includes('know') || purpose.includes('what') || purpose.includes('how')) {
      return 'information'
    }
    return 'receptionist'
  }

  private generateTaskDescription(context: WorkforceContext): string {
    return `[${context.industry}] ${context.visitorName || 'Visitor'} needs: ${context.purpose} (${context.visitorLanguage})`
  }

  private determinePriority(context: WorkforceContext): WorkforceTask['priority'] {
    if (context.urgency === 'emergency' || context.urgency === 'high') return 'critical'
    if (context.sentiment === 'frustrated') return 'high'
    return 'medium'
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    if (this.taskQueue.length === 0) return

    if (this.activeTasks.size >= this.maxConcurrentTasks) return

    const task = this.taskQueue.shift()
    if (!task) return

    this.executeTask(task)
  }

  private async executeTask(task: WorkforceTask): Promise<void> {
    task.status = 'assigned'
    this.activeTasks.set(task.id, task)

    this.emit('task:assigned', { taskId: task.id, type: task.type })

    try {
      const result = await this.routeTaskToTool(task)

      task.result = result
      task.status = result.success ? 'completed' : 'failed'
      this.completedTasks.set(task.id, task)
      this.activeTasks.delete(task.id)

      this.emit('task:completed', { taskId: task.id, result })

    } catch (error) {
      task.result = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        agentUsed: 'ERROR',
        duration: 0
      }
      task.status = 'failed'
      this.completedTasks.set(task.id, task)
      this.activeTasks.delete(task.id)

      this.emit('task:failed', { taskId: task.id, error: task.result.error })
    }

    this.processQueue()
  }

  private async routeTaskToTool(task: WorkforceTask): Promise<WorkforceResult> {
    const { context } = task

    switch (task.type) {
      case 'scheduling':
        return this.executeTool('book_appointment', {
          visitorName: context.visitorName,
          service: context.purpose,
          industry: context.industry
        })

      case 'information':
        return this.executeTool('faq_lookup', {
          query: context.purpose,
          industry: context.industry
        })

      case 'escalation':
        return this.executeTool('escalate_to_human', {
          reason: context.purpose,
          urgency: context.urgency
        })

      case 'receptionist': {
        const registerResult = await this.executeTool('register_visitor', {
          visitorName: context.visitorName,
          industry: context.industry
        })

        if (context.visitorLanguage !== 'English') {
          await this.executeTool('translate_response', {
            text: 'Welcome! How may I assist you today?',
            targetLanguage: context.visitorLanguage
          })
        }

        return registerResult
      }

      default:
        return {
          success: true,
          output: { message: 'Task processed successfully' },
          agentUsed: 'ARIA',
          duration: 0
        }
    }
  }

  getTask(taskId: string): WorkforceTask | undefined {
    return this.tasks.get(taskId)
  }

  getActiveTasks(): WorkforceTask[] {
    return Array.from(this.activeTasks.values())
  }

  getCompletedTasks(): WorkforceTask[] {
    return Array.from(this.completedTasks.values())
  }

  getStatus(): { queueLength: number; activeTasks: number; completedTasks: number; tools: string[] } {
    return {
      queueLength: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks.size,
      tools: Array.from(this.tools.keys())
    }
  }

  async coordinateWithCEO(taskType: string, input: unknown): Promise<unknown> {
    return aiOrchestrator.orchestrateMultiAgent(taskType, input)
  }
}

// Singleton instance
export const workforceBridge = new WorkforceBridge()
export default WorkforceBridge