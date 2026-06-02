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

describe('Support Agent Routing', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('routes a polite support inquiry to the support agent without escalation', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'I can help you with the integration. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'Hi, I am having trouble integrating your AI receptionist with my dental practice software.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    expect(result.tools_used).toContain('support')
    expect(result.active_agent).toBe('support')
    expect(result.conversation_stage).toBe('support')
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it('escalates an angry support customer to transfer', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'I understand you are frustrated. [SENTIMENT:negative]' })
      .mockResolvedValueOnce({ content: 'Transferring you to a senior support agent. [SENTIMENT:negative]' })

    const result = await handleReceptionistCall(
      'Your system is broken! I have been trying to set this up for three days and nothing works!'
    )

    expect(result.sentiment).toBe('negative')
    expect(result.requires_human).toBe(true)
    expect(result.tools_used).toContain('transfer')
    expect(result.tools_used).toContain('support')
    expect(result.conversation_stage).toBe('transfer')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('executes processSupportRequest tool when LLM calls it and returns neutral', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({
        content: '',
        tool_calls: [{
          name: 'process_support_request',
          args: { issue_type: 'technical', description: 'Integration not working', caller_name: 'Sarah' },
          id: 'call_xyz789'
        }]
      })
      .mockResolvedValueOnce({ content: 'Support ticket created. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'I am having a technical issue with the integration.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    const lastMsg = result.messages[result.messages.length - 1]
    expect(lastMsg.content).toContain('Support')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('routes non-support messages to appropriate agents', async () => {
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

  it('routes short support messages to support agent', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'I can help with your account. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall('My account is not working.')

    expect(result.active_agent).toBe('support')
    expect(result.sentiment).toBe('neutral')
  })

  it('falls back to keyword sentiment when LLM response lacks marker', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'Processing your support request.' })
      .mockResolvedValueOnce({ content: 'Transferring you to a rep. [SENTIMENT:negative]' })

    const result = await handleReceptionistCall(
      'I am extremely frustrated with your terrible technical support.'
    )

    expect(result.sentiment).toBe('negative')
    expect(result.requires_human).toBe(true)
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('processSupportRequest tool with account issue_type', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({
        content: '',
        tool_calls: [{
          name: 'process_support_request',
          args: { issue_type: 'account', description: 'Need password reset', caller_name: 'Mike' },
          id: 'call_account_001'
        }]
      })
      .mockResolvedValueOnce({ content: 'Account support request submitted. A specialist will review within 24 hours. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'I need help with my account password.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    const lastMsg = result.messages[result.messages.length - 1]
    expect(lastMsg.content).toContain('Account support request submitted')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it('processSupportRequest tool with unknown issue_type falls back to default', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({
        content: '',
        tool_calls: [{
          name: 'process_support_request',
          args: { description: 'General question', caller_name: 'Alex' },
          id: 'call_general_002'
        }]
      })
      .mockResolvedValueOnce({ content: 'Your support request has been logged. A specialist will follow up shortly. [SENTIMENT:neutral]' })

    const result = await handleReceptionistCall(
      'I have a general question about your service.'
    )

    expect(result.sentiment).toBe('neutral')
    expect(result.requires_human).toBe(false)
    const lastMsg = result.messages[result.messages.length - 1]
    expect(lastMsg.content).toContain('Your support request has been logged')
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })
})
