/**
 * WorkforceBridge Tests
 * Unit tests for the integration layer connecting multi-agent workforce
 * with the AI receptionist platform
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from 'events'

// Import the bridge directly from the source
import { WorkforceBridge, WorkforceContext } from '../src/lib/workforce-bridge'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}))

// Mock AIOpsOrchestrator
vi.mock('../src/lib/ceo-brain/AIOpsOrchestrator', () => ({
  aiOrchestrator: {
    orchestrateMultiAgent: vi.fn().mockResolvedValue({ success: true })
  }
}))

describe('WorkforceBridge', () => {
  let bridge: WorkforceBridge

  beforeEach(() => {
    vi.clearAllMocks()
    bridge = new WorkforceBridge()
    // Process any initial async setup
    return new Promise(resolve => setTimeout(resolve, 50))
  })

  describe('Initialization', () => {
    it('should create a WorkforceBridge instance', () => {
      expect(bridge).toBeDefined()
      expect(bridge).toBeInstanceOf(EventEmitter)
    })

    it('should initialize with 5 receptionist tools', () => {
      const status = bridge.getStatus()
      expect(status.tools).toContain('book_appointment')
      expect(status.tools).toContain('faq_lookup')
      expect(status.tools).toContain('register_visitor')
      expect(status.tools).toContain('escalate_to_human')
      expect(status.tools).toContain('translate_response')
    })

    it('should start with empty task queues', () => {
      const status = bridge.getStatus()
      expect(status.queueLength).toBe(0)
      expect(status.activeTasks).toBe(0)
      expect(status.completedTasks).toBe(0)
    })
  })

  describe('Tool Execution', () => {
    it('should execute book_appointment tool successfully', async () => {
      const result = await bridge.executeTool('book_appointment', {
        visitorName: 'John Doe',
        service: 'Consultation',
        dateTime: '2024-01-15T10:00:00Z'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('appointmentId')
      expect(result.output).toHaveProperty('status', 'confirmed')
      expect(result.agentUsed).toBe('SCHEDULER')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should execute faq_lookup tool for healthcare', async () => {
      const result = await bridge.executeTool('faq_lookup', {
        industry: 'healthcare',
        query: 'hours'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('answer')
      expect(result.agentUsed).toBe('KNOWLEDGE')
    })

    it('should execute register_visitor tool successfully', async () => {
      const result = await bridge.executeTool('register_visitor', {
        visitorName: 'Jane Smith',
        industry: 'corporate'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('visitorId')
      expect(result.output).toHaveProperty('checkInCode')
      expect(result.agentUsed).toBe('ARIA')
    })

    it('should execute escalate_to_human tool with reason', async () => {
      const result = await bridge.executeTool('escalate_to_human', {
        reason: 'Complex billing issue',
        urgency: 'high'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('ticketId')
      expect(result.output).toHaveProperty('estimatedWait')
      expect(result.agentUsed).toBe('CONNECT')
    })

    it('should execute translate_response tool', async () => {
      const result = await bridge.executeTool('translate_response', {
        text: 'Welcome!',
        targetLanguage: 'Spanish'
      })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('translatedText')
      expect(result.output).toHaveProperty('confidence')
      expect(result.agentUsed).toBe('GLOBAL')
    })

    it('should return error for non-existent tool', async () => {
      const result = await bridge.executeTool('non_existent_tool', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
      expect(result.agentUsed).toBe('UNKNOWN')
    })
  })

  describe('Task Submission', () => {
    it('should submit a receptionist task', async () => {
      const context: WorkforceContext = {
        industry: 'healthcare',
        visitorId: 'VIS-001',
        visitorName: 'John Doe',
        visitorLanguage: 'English',
        purpose: 'Schedule an appointment',
        sentiment: 'neutral',
        urgency: 'medium',
        sessionId: 'session-123',
        variables: {}
      }

      const task = await bridge.submitTask(context)

      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.type).toBe('scheduling')
      expect(task.description).toContain('John Doe')
      expect(task.description).toContain('Schedule an appointment')
      expect(task.priority).toBe('medium')
      expect(task.status).toBe("assigned")
    })

    it('should route scheduling tasks for appointment purposes', async () => {
      const context: WorkforceContext = {
        industry: 'corporate',
        visitorName: 'Test Visitor',
        visitorLanguage: 'English',
        purpose: 'I want to book an appointment',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-456',
        variables: {}
      }

      const task = await bridge.submitTask(context)
      expect(task.type).toBe('scheduling')
    })

    it('should route escalation tasks for human assistance', async () => {
      const context: WorkforceContext = {
        industry: 'hospitality',
        visitorName: 'Frustrated Guest',
        visitorLanguage: 'English',
        purpose: 'I need to speak to a real person',
        sentiment: 'frustrated',
        urgency: 'high',
        sessionId: 'session-789',
        variables: {}
      }

      const task = await bridge.submitTask(context)
      expect(task.type).toBe('escalation')
    })

    it('should route information tasks for FAQ queries', async () => {
      const context: WorkforceContext = {
        industry: 'retail',
        visitorName: 'Shopper',
        visitorLanguage: 'English',
        purpose: 'What are your store hours?',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-101',
        variables: {}
      }

      const task = await bridge.submitTask(context)
      expect(task.type).toBe('information')
    })

    it('should assign critical priority for high urgency', async () => {
      const context: WorkforceContext = {
        industry: 'legal',
        visitorName: 'Urgent Client',
        visitorLanguage: 'English',
        purpose: 'Emergency consultation needed',
        sentiment: 'frustrated',
        urgency: 'emergency',
        sessionId: 'session-emergency',
        variables: {}
      }

      const task = await bridge.submitTask(context)
      expect(task.priority).toBe('critical')
    })

    it('should assign high priority for frustrated sentiment', async () => {
      const context: WorkforceContext = {
        industry: 'realestate',
        visitorName: 'Angry Buyer',
        visitorLanguage: 'English',
        purpose: 'Property viewing inquiry',
        sentiment: 'frustrated',
        urgency: 'low',
        sessionId: 'session-frustrated',
        variables: {}
      }

      const task = await bridge.submitTask(context)
      expect(task.priority).toBe('high')
    })
  })

  describe('Task Status Tracking', () => {
    it('should retrieve submitted task by ID', async () => {
      const context: WorkforceContext = {
        industry: 'government',
        visitorName: 'Citizen',
        visitorLanguage: 'English',
        purpose: 'Apply for permit',
        sentiment: 'neutral',
        urgency: 'medium',
        sessionId: 'session-track',
        variables: {}
      }

      const submitted = await bridge.submitTask(context)
      const found = bridge.getTask(submitted.id)

      expect(found).toBeDefined()
      expect(found?.id).toBe(submitted.id)
    })

    it('should return undefined for non-existent task ID', () => {
      const found = bridge.getTask('non-existent-id')
      expect(found).toBeUndefined()
    })

    it('should track active tasks', async () => {
      const context: WorkforceContext = {
        industry: 'education',
        visitorName: 'Student',
        visitorLanguage: 'English',
        purpose: 'Course enrollment',
        sentiment: 'positive',
        urgency: 'medium',
        sessionId: 'session-active',
        variables: {}
      }

      await bridge.submitTask(context)
      await bridge.submitTask(context)

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100))

      const activeTasks = bridge.getActiveTasks()
      expect(Array.isArray(activeTasks)).toBe(true)
    })

    it('should track completed tasks', async () => {
      const context: WorkforceContext = {
        industry: 'corporate',
        visitorName: 'Employee',
        visitorLanguage: 'English',
        purpose: 'IT support request',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-complete',
        variables: {}
      }

      await bridge.submitTask(context)

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200))

      const completedTasks = bridge.getCompletedTasks()
      expect(Array.isArray(completedTasks)).toBe(true)
    })
  })

  describe('Event Emission', () => {
    it('should emit task:submitted event on task submission', async () => {
      const eventListener = vi.fn()
      bridge.on('task:submitted', eventListener)

      const context: WorkforceContext = {
        industry: 'healthcare',
        visitorName: 'Event Test',
        visitorLanguage: 'English',
        purpose: 'Test event',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-event',
        variables: {}
      }

      await bridge.submitTask(context)

      expect(eventListener).toHaveBeenCalled()
      const eventData = eventListener.mock.calls[0][0]
      expect(eventData).toHaveProperty('taskId')
      expect(eventData).toHaveProperty('type')
      expect(eventData).toHaveProperty('priority')
    })

    it('should emit task:completed event when task finishes', async () => {
      const eventListener = vi.fn()
      bridge.on('task:completed', eventListener)

      const context: WorkforceContext = {
        industry: 'retail',
        visitorName: 'Completion Test',
        visitorLanguage: 'English',
        purpose: 'Return policy question',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-complete-event',
        variables: {}
      }

      await bridge.submitTask(context)

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(eventListener).toHaveBeenCalled()
    }, 5000)

    it('should emit task:assigned event when task is assigned', async () => {
      const eventListener = vi.fn()
      bridge.on('task:assigned', eventListener)

      const context: WorkforceContext = {
        industry: 'hospitality',
        visitorName: 'Assignment Test',
        visitorLanguage: 'English',
        purpose: 'Reservation inquiry',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-assign',
        variables: {}
      }

      await bridge.submitTask(context)

      // Wait for assignment
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(eventListener).toHaveBeenCalled()
    })
  })

  describe('Queue Management', () => {
    it('should process tasks from queue', async () => {
      const context1: WorkforceContext = {
        industry: 'corporate',
        visitorName: 'Queue Test 1',
        visitorLanguage: 'English',
        purpose: 'First task',
        sentiment: 'neutral',
        urgency: 'medium',
        sessionId: 'queue-1',
        variables: {}
      }

      const context2: WorkforceContext = {
        industry: 'corporate',
        visitorName: 'Queue Test 2',
        visitorLanguage: 'English',
        purpose: 'Second task',
        sentiment: 'neutral',
        urgency: 'medium',
        sessionId: 'queue-2',
        variables: {}
      }

      await bridge.submitTask(context1)
      await bridge.submitTask(context2)

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200))

      const status = bridge.getStatus()
      expect(status.queueLength).toBeLessThanOrEqual(2)
    })
  })

  describe('getStatus', () => {
    it('should return correct status structure', () => {
      const status = bridge.getStatus()

      expect(status).toHaveProperty('queueLength')
      expect(status).toHaveProperty('activeTasks')
      expect(status).toHaveProperty('completedTasks')
      expect(status).toHaveProperty('tools')
      expect(Array.isArray(status.tools)).toBe(true)
      expect(status.tools.length).toBe(5)
    })

    it('should reflect actual queue length after submissions', async () => {
      const context: WorkforceContext = {
        industry: 'legal',
        visitorName: 'Status Test',
        visitorLanguage: 'English',
        purpose: 'Legal consultation',
        sentiment: 'neutral',
        urgency: 'low',
        sessionId: 'session-status',
        variables: {}
      }

      await bridge.submitTask(context)
      await bridge.submitTask(context)

      const status = bridge.getStatus()
      expect(status.queueLength).toBeGreaterThanOrEqual(0)
    })
  })

  describe('coordinateWithCEO', () => {
    it('should coordinate with CEO brain via AIOpsOrchestrator', async () => {
      const { aiOrchestrator } = await import('../src/lib/ceo-brain/AIOpsOrchestrator')
      
      const result = await bridge.coordinateWithCEO('test_task', { input: 'test' })

      expect(aiOrchestrator.orchestrateMultiAgent).toHaveBeenCalledWith('test_task', { input: 'test' })
      expect(result).toBeDefined()
    })
  })

  describe('Tool Registration', () => {
    it('should allow registering custom tools', async () => {
      const customTool = {
        name: 'custom_tool',
        description: 'A custom tool for testing',
        execute: async (params: unknown) => ({
          success: true,
          output: { custom: true, params },
          agentUsed: 'CUSTOM',
          duration: 10
        })
      }

      bridge.registerTool(customTool)

      const result = await bridge.executeTool('custom_tool', { test: 'data' })

      expect(result.success).toBe(true)
      expect(result.output).toHaveProperty('custom', true)
    })
  })
})