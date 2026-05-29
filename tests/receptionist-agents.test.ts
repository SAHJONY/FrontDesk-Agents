/**
 * Receptionist Agents Tests
 * Unit tests for specialized AI receptionist agents (ARIA, CHRONOS, WIKI, CONNECT)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from 'events'

// Import the agents directly from the source
import {
  BaseReceptionistAgent,
  VoiceReceptionistAgent,
  SchedulerAgent,
  KnowledgeAgent,
  EscalationAgent,
  voiceReceptionist,
  schedulerAgent,
  knowledgeAgent,
  escalationAgent,
  createReceptionistAgent
} from '../src/lib/agents/receptionist-agents'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}))

// Mock CEO Brain
vi.mock('../src/lib/ceo-brain/CEOBrain', () => ({
  ceoBrain: {
    think: vi.fn().mockResolvedValue({
      confidence: 0.9,
      execution: { actions: ['Greet visitor', 'Collect information'] },
      analysis: { intent: 'customer', sentiment: 'neutral', urgency: 'low' }
    })
  }
}))

// Mock AIOpsOrchestrator
vi.mock('../src/lib/ceo-brain/AIOpsOrchestrator', () => ({
  aiOrchestrator: {
    orchestrateMultiAgent: vi.fn().mockResolvedValue({ success: true })
  }
}))

describe('BaseReceptionistAgent', () => {
  let mockAgent: BaseReceptionistAgent

  class TestReceptionistAgent extends BaseReceptionistAgent {
    constructor() {
      super({
        id: 'test-agent',
        name: 'TestAgent',
        role: 'test_role',
        capabilities: [{
          name: 'test',
          description: 'Test capability',
          tools: ['test_tool'],
          maxConcurrentTasks: 5
        }]
      })
    }

    async executeTask(task: any): Promise<any> {
      return { success: true, output: { processed: true } }
    }

    getCapabilities(): string[] {
      return ['Test Capability']
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAgent = new TestReceptionistAgent()
  })

  describe('Initialization', () => {
    it('should create agent with config', () => {
      expect(mockAgent.id).toBe('test-agent')
      expect(mockAgent.name).toBe('TestAgent')
      expect(mockAgent.role).toBe('test_role')
    })

    it('should start with idle status', () => {
      expect(mockAgent.getStatus()).toBe('idle')
    })
  })

  describe('Status Management', () => {
    it('should update status when setStatus is called', () => {
      mockAgent.setStatus('working')
      expect(mockAgent.getStatus()).toBe('working')
    })

    it('should emit statusChange event on status update', () => {
      const eventListener = vi.fn()
      mockAgent.on('statusChange', eventListener)
      
      mockAgent.setStatus('working')
      
      expect(eventListener).toHaveBeenCalled()
      const eventData = eventListener.mock.calls[0][0]
      expect(eventData.agentId).toBe('test-agent')
      expect(eventData.status).toBe('working')
    })
  })

  describe('Tool Execution', () => {
    it('should register tools', () => {
      mockAgent.registerTool({
        name: 'test_tool',
        description: 'A test tool',
        execute: async (params: unknown) => ({
          success: true,
          output: params,
          duration: 0
        })
      })

      expect(() => {
        mockAgent.executeTool('test_tool', { test: true })
      }).not.toThrow()
    })

    it('should return error for non-existent tool', async () => {
      const result = await mockAgent.executeTool('non_existent', {})
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('Task Execution', () => {
    it('should run task and return result', async () => {
      const task = {
        id: 'task-1',
        type: 'test',
        description: 'Test task',
        priority: 'medium' as const,
        status: 'pending' as const,
        context: { userRequest: 'test', sessionId: 's1', variables: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await mockAgent.runTask(task)
      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('processed', true)
    })

    it('should emit taskCompleted event on success', async () => {
      const eventListener = vi.fn()
      mockAgent.on('taskCompleted', eventListener)

      const task = {
        id: 'task-1',
        type: 'test',
        description: 'Test task',
        priority: 'medium' as const,
        status: 'pending' as const,
        context: { userRequest: 'test', sessionId: 's1', variables: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      await mockAgent.runTask(task)

      expect(eventListener).toHaveBeenCalled()
      const eventData = eventListener.mock.calls[0][0]
      expect(eventData.taskId).toBe('task-1')
      expect(eventData.result.success).toBe(true)
    })

    it('should handle task failure', async () => {
      class FailingAgent extends TestReceptionistAgent {
        async executeTask(task: any): Promise<any> {
          throw new Error('Task failed')
        }
      }

      const failingAgent = new FailingAgent()
      const task = {
        id: 'fail-task',
        type: 'test',
        description: 'Failing task',
        priority: 'medium' as const,
        status: 'pending' as const,
        context: { userRequest: 'test', sessionId: 's1', variables: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await failingAgent.runTask(task)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Task failed')
    })
  })

  describe('Capabilities', () => {
    it('should return capabilities', () => {
      const capabilities = mockAgent.getCapabilities()
      expect(Array.isArray(capabilities)).toBe(true)
      expect(capabilities).toContain('Test Capability')
    })
  })
})

describe('VoiceReceptionistAgent (ARIA)', () => {
  let aria: VoiceReceptionistAgent

  beforeEach(() => {
    vi.clearAllMocks()
    aria = new VoiceReceptionistAgent()
  })

  describe('Initialization', () => {
    it('should have correct ID and name', () => {
      expect(aria.id).toBe('aria-voice-1')
      expect(aria.name).toBe('ARIA')
      expect(aria.role).toBe('voice_receptionist')
    })

    it('should have voice capabilities', () => {
      const capabilities = aria.getCapabilities()
      expect(capabilities).toContain('Phone Calls')
      expect(capabilities).toContain('Appointment Scheduling')
    })
  })

  describe('Tool Execution', () => {
    it('should execute greet_visitor tool', async () => {
      const result = await aria.executeTool('greet_visitor', {
        visitorName: 'John',
        industry: 'healthcare'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('greeting')
      expect(result.output).toHaveProperty('visitorName', 'John')
    })

    it('should execute greet_visitor with different industries', async () => {
      const industries = ['healthcare', 'legal', 'hospitality', 'corporate']

      for (const industry of industries) {
        const result = await aria.executeTool('greet_visitor', {
          visitorName: 'Test',
          industry
        })
        expect(result.success).toBe(true)
        expect(result.output).toHaveProperty('greeting')
      }
    })

    it('should execute collect_info tool', async () => {
      const result = await aria.executeTool('collect_info', {
        visitorName: 'Jane Doe',
        purpose: 'Consultation',
        contact: '555-1234'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('visitorId')
      expect(result.output).toHaveProperty('name', 'Jane Doe')
      expect(result.output).toHaveProperty('purpose', 'Consultation')
    })

    it('should execute transfer_call tool', async () => {
      const result = await aria.executeTool('transfer_call', {
        department: 'sales',
        reason: 'Product inquiry'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('transferTo', 'sales')
      expect(result.output).toHaveProperty('estimatedWait')
    })

    it('should execute take_message tool', async () => {
      const result = await aria.executeTool('take_message', {
        from: 'Customer',
        message: 'Please call me back',
        callbackNumber: '555-5678'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('messageId')
      expect(result.output).toHaveProperty('from', 'Customer')
    })
  })

  describe('Task Execution', () => {
    it('should route scheduling tasks', async () => {
      const task = {
        id: 'scheduling-task',
        type: 'receptionist',
        description: 'Schedule appointment',
        priority: 'medium' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'I want to book',
          sessionId: 's1',
          variables: {
            visitorName: 'John',
            purpose: 'appointment',
            industry: 'healthcare'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await aria.executeTask(task)
      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('action', 'scheduling_initiated')
    })

    it('should route escalation tasks', async () => {
      const task = {
        id: 'escalation-task',
        type: 'receptionist',
        description: 'Speak to human',
        priority: 'high' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'Need human help',
          sessionId: 's2',
          variables: {
            visitorName: 'Jane',
            purpose: 'speak to real person',
            industry: 'corporate'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await aria.executeTask(task)
      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('action', 'escalation_initiated')
    })

    it('should default to greeting for general requests', async () => {
      const task = {
        id: 'greeting-task',
        type: 'receptionist',
        description: 'General inquiry',
        priority: 'low' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'Hello',
          sessionId: 's3',
          variables: {
            visitorName: 'Visitor',
            purpose: 'information',
            industry: 'retail'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await aria.executeTask(task)
      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('action', 'greeting_sent')
    })
  })
})

describe('SchedulerAgent (CHRONOS)', () => {
  let chronos: SchedulerAgent

  beforeEach(() => {
    vi.clearAllMocks()
    chronos = new SchedulerAgent()
  })

  describe('Initialization', () => {
    it('should have correct ID and name', () => {
      expect(chronos.id).toBe('scheduler-1')
      expect(chronos.name).toBe('CHRONOS')
      expect(chronos.role).toBe('scheduling')
    })

    it('should have scheduling capabilities', () => {
      const capabilities = chronos.getCapabilities()
      expect(capabilities).toContain('Calendar Management')
      expect(capabilities).toContain('Appointment Booking')
    })
  })

  describe('Tool Execution', () => {
    it('should execute book_appointment tool', async () => {
      const result = await chronos.executeTool('book_appointment', {
        visitorName: 'John Doe',
        service: 'Consultation',
        preferredDate: '2024-01-15',
        industry: 'healthcare'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('id')
      expect(result.output).toHaveProperty('clientName', 'John Doe')
      expect(result.output).toHaveProperty('service', 'Consultation')
      expect(result.output).toHaveProperty('status', 'scheduled')
    })

    it('should execute check_availability tool', async () => {
      const result = await chronos.executeTool('check_availability', {
        date: '2024-01-15',
        service: 'Consultation'
      })

      expect(result.success).toBe(true)
      const availOutput = result.output as { availableSlots?: unknown }
      expect(availOutput).toHaveProperty('availableSlots')
      expect(Array.isArray(availOutput.availableSlots)).toBe(true)
    })

    it('should execute reschedule tool', async () => {
      const bookResult = await chronos.executeTool('book_appointment', {
        visitorName: 'Test',
        service: 'Test'
      })
      const appointmentId = (bookResult.output as any)?.id

      const result = await chronos.executeTool('reschedule', {
        appointmentId,
        newDate: '2024-01-20'
      })

      expect(result.success).toBe(true)
    })

    it('should execute cancel_appointment tool', async () => {
      const bookResult = await chronos.executeTool('book_appointment', {
        visitorName: 'Cancel Test',
        service: 'Test'
      })
      const appointmentId = (bookResult.output as any)?.id

      const result = await chronos.executeTool('cancel_appointment', {
        appointmentId,
        reason: 'Schedule conflict'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('status', 'cancelled')
    })

    it('should execute send_reminder tool', async () => {
      const result = await chronos.executeTool('send_reminder', {
        appointmentId: 'APT-123',
        method: 'email'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('reminderId')
      expect(result.output).toHaveProperty('status', 'sent')
    })
  })

  describe('Task Execution', () => {
    it('should handle book action', async () => {
      const task = {
        id: 'book-task',
        type: 'scheduling',
        description: 'Book appointment',
        priority: 'medium' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'Book',
          sessionId: 's1',
          variables: {
            action: 'book',
            visitorName: 'John',
            service: 'Consultation'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await chronos.executeTask(task)
      expect(result.success).toBe(true)
      // When action is 'book', it returns the raw tool result (appointment object)
      // The appointment has id, clientName, service properties
      const output = result.output as { id?: string; clientName?: string; service?: string }
      expect(output).toHaveProperty('id')
      expect(output).toHaveProperty('clientName', 'John')
      expect(output).toHaveProperty('service', 'Consultation')
    })

    it('should handle check_availability action', async () => {
      const task = {
        id: 'check-task',
        type: 'scheduling',
        description: 'Check availability',
        priority: 'low' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'Check',
          sessionId: 's2',
          variables: {
            action: 'check_availability',
            date: '2024-01-15'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await chronos.executeTask(task)
      expect(result.success).toBe(true)
    })
  })
})

describe('KnowledgeAgent (WIKI)', () => {
  let wiki: KnowledgeAgent

  beforeEach(() => {
    vi.clearAllMocks()
    wiki = new KnowledgeAgent()
  })

  describe('Initialization', () => {
    it('should have correct ID and name', () => {
      expect(wiki.id).toBe('knowledge-1')
      expect(wiki.name).toBe('WIKI')
      expect(wiki.role).toBe('information')
    })

    it('should have information capabilities', () => {
      const capabilities = wiki.getCapabilities()
      expect(capabilities).toContain('FAQ Answers')
      expect(capabilities).toContain('Product Info')
    })
  })

  describe('Tool Execution', () => {
    it('should execute faq_lookup for healthcare', async () => {
      const result = await wiki.executeTool('faq_lookup', {
        query: 'hours',
        industry: 'healthcare'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('answer')
      expect(result.output).toHaveProperty('question')
    })

    it('should execute faq_lookup for corporate', async () => {
      const result = await wiki.executeTool('faq_lookup', {
        query: 'wifi',
        industry: 'corporate'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('answer')
    })

    it('should execute faq_lookup with fallback for unknown query', async () => {
      const result = await wiki.executeTool('faq_lookup', {
        query: 'completely_unknown_topic_xyz',
        industry: 'healthcare'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('answer')
    })

    it('should execute search_knowledge tool', async () => {
      const result = await wiki.executeTool('search_knowledge', {
        query: 'meeting',
        industry: 'corporate'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('results')
      expect(result.output).toHaveProperty('count')
    })

    it('should execute provide_directions tool', async () => {
      const result = await wiki.executeTool('provide_directions', {})

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('directions')
      expect(result.output).toHaveProperty('floor', 3)
    })

    it('should execute explain_policy tool for privacy', async () => {
      const result = await wiki.executeTool('explain_policy', {
        policyType: 'privacy'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('explanation')
    })

    it('should handle unknown policy type with default message', async () => {
      const result = await wiki.executeTool('explain_policy', {
        policyType: 'unknown_policy'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('explanation')
    })
  })

  describe('Task Execution', () => {
    it('should handle search action', async () => {
      const task = {
        id: 'search-task',
        type: 'information',
        description: 'Search knowledge',
        priority: 'low' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'Search',
          sessionId: 's1',
          variables: {
            action: 'search',
            query: 'wifi',
            industry: 'corporate'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await wiki.executeTask(task)
      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('action', 'knowledge_search')
    })

    it('should handle default faq lookup', async () => {
      const task = {
        id: 'faq-task',
        type: 'information',
        description: 'FAQ lookup',
        priority: 'medium' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'FAQ',
          sessionId: 's2',
          variables: {
            query: 'hours',
            industry: 'hospitality'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await wiki.executeTask(task)
      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('action', 'faq_provided')
    })
  })
})

describe('EscalationAgent (CONNECT)', () => {
  let connect: EscalationAgent

  beforeEach(() => {
    vi.clearAllMocks()
    connect = new EscalationAgent()
  })

  describe('Initialization', () => {
    it('should have correct ID and name', () => {
      expect(connect.id).toBe('escalation-1')
      expect(connect.name).toBe('CONNECT')
      expect(connect.role).toBe('escalation')
    })

    it('should have escalation capabilities', () => {
      const capabilities = connect.getCapabilities()
      expect(capabilities).toContain('Complex Issue Resolution')
      expect(capabilities).toContain('Manager Connection')
    })
  })

  describe('Tool Execution', () => {
    it('should execute create_ticket tool', async () => {
      const result = await connect.executeTool('create_ticket', {
        reason: 'Billing dispute',
        visitorName: 'John Doe',
        priority: 'high'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('ticketId')
      expect(result.output).toHaveProperty('reason', 'Billing dispute')
      expect(result.output).toHaveProperty('priority', 'high')
      expect(result.output).toHaveProperty('status', 'open')
    })

    it('should execute notify_agent tool', async () => {
      const result = await connect.executeTool('notify_agent', {
        ticketId: 'ESC-123',
        agentType: 'manager'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('notificationId')
      expect(result.output).toHaveProperty('estimatedResponse')
    })

    it('should execute track_issue tool', async () => {
      const createResult = await connect.executeTool('create_ticket', {
        reason: 'Track test',
        priority: 'medium'
      })
      const ticketId = (createResult.output as any)?.ticketId

      const result = await connect.executeTool('track_issue', { ticketId })

      expect(result.success).toBe(true)
    })

    it('should execute resolve_ticket tool', async () => {
      const createResult = await connect.executeTool('create_ticket', {
        reason: 'Resolve test',
        priority: 'low'
      })
      const ticketId = (createResult.output as any)?.ticketId

      const result = await connect.executeTool('resolve_ticket', {
        ticketId,
        resolution: 'Issue resolved via callback'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('status', 'resolved')
    })

    it('should return not_found status for non-existent ticket in track_issue', async () => {
      const result = await connect.executeTool('track_issue', {
        ticketId: 'non-existent-id'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('status', 'not_found')
    })
  })

  describe('Task Execution', () => {
    it('should execute escalation task and create ticket', async () => {
      const task = {
        id: 'escalate-task',
        type: 'escalation',
        description: 'Escalate to human',
        priority: 'high' as const,
        status: 'pending' as const,
        context: {
          userRequest: 'Escalate',
          sessionId: 's1',
          variables: {
            reason: 'Complex billing issue',
            visitorName: 'Jane',
            priority: 'high'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: []
      }

      const result = await connect.executeTask(task)
      expect(result.success).toBe(true)
      const output = result.output as { action?: string; ticketId?: string }
      expect(output).toHaveProperty('action', 'ticket_created')
      expect(output).toHaveProperty('ticketId')
    })
  })
})

describe('Agent Factory', () => {
  it('should create voiceReceptionist for greeting type', () => {
    const agent = createReceptionistAgent('greeting')
    expect(agent).toBeInstanceOf(VoiceReceptionistAgent)
  })

  it('should create schedulerAgent for scheduling type', () => {
    const agent = createReceptionistAgent('scheduling')
    expect(agent).toBeInstanceOf(SchedulerAgent)
  })

  it('should create knowledgeAgent for information type', () => {
    const agent = createReceptionistAgent('information')
    expect(agent).toBeInstanceOf(KnowledgeAgent)
  })

  it('should create escalationAgent for escalation type', () => {
    const agent = createReceptionistAgent('escalation')
    expect(agent).toBeInstanceOf(EscalationAgent)
  })

  it('should return voiceReceptionist as default for unknown type', () => {
    const agent = createReceptionistAgent('unknown' as any)
    expect(agent).toBeInstanceOf(VoiceReceptionistAgent)
  })
})

describe('Singleton Exports', () => {
  it('should export voiceReceptionist singleton', () => {
    expect(voiceReceptionist).toBeInstanceOf(VoiceReceptionistAgent)
  })

  it('should export schedulerAgent singleton', () => {
    expect(schedulerAgent).toBeInstanceOf(SchedulerAgent)
  })

  it('should export knowledgeAgent singleton', () => {
    expect(knowledgeAgent).toBeInstanceOf(KnowledgeAgent)
  })

  it('should export escalationAgent singleton', () => {
    expect(escalationAgent).toBeInstanceOf(EscalationAgent)
  })
})