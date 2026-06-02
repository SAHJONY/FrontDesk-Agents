import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// MOCK SETUP - Mock LLM to avoid API calls
// ============================================

const mockInvoke = vi.hoisted(() => vi.fn())

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(function () {
    return {
      invoke: mockInvoke,
      bindTools: vi.fn().mockReturnValue({
        invoke: mockInvoke
      })
    }
  })
}))

// ============================================
// IMPORTS (after mock setup)
// ============================================

import { handleReceptionistCall } from '../src/lib/agents/receptionist'

// ============================================
// TESTS
// ============================================

describe('Billing Agent Routing', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('routes a polite billing inquiry to the billing agent without escalation', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'Your billing inquiry has been logged. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'Hi, I was charged twice for my subscription. Can you help me understand why?'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    expect(result.tools_used).toContain('billing')
    expect(result.active_agent).toBe('billing')
    expect(result.conversation_stage).toBe('billing')
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it('escalates an angry billing customer to transfer', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'I understand you are upset. [SENTIMENT:negative]' })
      .mockResolvedValueOnce({ content: 'Transferring you to a manager now. [SENTIMENT:negative]' })

    const result = await handleReceptionistCall(
      'This is completely unacceptable! I want my money back right now!'
    )

    expect(result.sentiment).toBe('negative')
    expect(result.requires_human).toBe(true)
    expect(result.tools_used).toContain('transfer')
    expect(result.tools_used).toContain('billing')
    expect(result.conversation_stage).toBe('transfer')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('executes processBillingRequest tool when LLM calls it and returns neutral', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({
        content: '',
        tool_calls: [{
          name: 'process_billing_request',
          args: { action: 'cancel', reason: 'Not needed', caller_name: 'John' },
          id: 'call_abc123'
        }]
      })
      .mockResolvedValueOnce({ content: 'Cancellation submitted. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'I would like to cancel my subscription please.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    const lastMsg = result.messages[result.messages.length - 1]
    expect(lastMsg.content).toContain('Cancellation')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('routes non-billing messages to appropriate agents', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'scheduler' })
      .mockResolvedValueOnce({ content: 'Let me help you book. [SENTIMENT:positive]' })

    const result = await handleReceptionistCall(
      'I would like to schedule an appointment for next Tuesday.'
    )

    expect(result.active_agent).toBe('scheduler')
    expect(result.conversation_stage).toBe('schedule')
    expect(result.requires_human).toBe(false)
  })

  it('routes short billing messages to billing agent', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'I can help with your refund. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall('Refund please.')

    expect(result.active_agent).toBe('billing')
    expect(result.sentiment).toBe('neutral')
  })

  it('falls back to keyword sentiment when LLM response lacks marker', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'Processing your request.' })
      .mockResolvedValueOnce({ content: 'Transferring you to a rep. [SENTIMENT:negative]' })

    const result = await handleReceptionistCall(
      'I am very frustrated with your terrible service.'
    )

    expect(result.sentiment).toBe('negative')
    expect(result.requires_human).toBe(true)
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('processBillingRequest tool with refund action', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({
        content: '',
        tool_calls: [{
          name: 'process_billing_request',
          args: { action: 'refund', reason: 'Duplicate charge', caller_name: 'Jane' },
          id: 'call_refund_001'
        }]
      })
      .mockResolvedValueOnce({ content: 'Refund request submitted. Please allow 5-7 business days for processing. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'I was charged twice and need a refund.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    const lastMsg = result.messages[result.messages.length - 1]
    expect(lastMsg.content).toContain('Refund request submitted')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('processBillingRequest tool with unknown action falls back to default inquiry', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({
        content: '',
        tool_calls: [{
          name: 'process_billing_request',
          args: { reason: 'General billing question', caller_name: 'Bob' },
          id: 'call_inquiry_002'
        }]
      })
      .mockResolvedValueOnce({ content: 'Your billing inquiry has been logged. A specialist will follow up shortly. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'I have a question about my bill.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    const lastMsg = result.messages[result.messages.length - 1]
    expect(lastMsg.content).toContain('Your billing inquiry has been logged')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })
})
