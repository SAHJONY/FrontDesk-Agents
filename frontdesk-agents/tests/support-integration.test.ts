import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// MOCK SETUP
// ============================================

// Mock @langchain/openai to control LLM responses (same pattern as billing-integration)
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

// Mock next/server for NextRequest and NextResponse
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: init?.status ? init.status < 400 : true,
    }))
  }
}))

// Mock ContextManager to avoid database calls
vi.mock('@/lib/memory/vector-store', () => ({
  ContextManager: vi.fn().mockImplementation(function () {
    return {
      buildContext: vi.fn().mockResolvedValue({}),
      updateCallerProfile: vi.fn().mockResolvedValue(undefined),
      addToHistory: vi.fn().mockResolvedValue(undefined),
    }
  })
}))

// ============================================
// IMPORTS (after mocks)
// ============================================

import { POST } from '../src/app/api/agent/chat/route'

// ============================================
// HELPER
// ============================================

function mockRequest(message: string, history?: { role: string; content: string }[]) {
  return {
    json: async () => ({
      message,
      conversation_history: history || [],
      phone: undefined,
      business_id: 'test',
    })
  } as any
}

// ============================================
// TESTS
// ============================================

describe('Support Integration - Multi-turn via API', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('handles a full support flow: polite request then frustrated escalation', async () => {
    // ---- TURN 1: Polite support inquiry ----
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'Support ticket created. [SENTIMENT:neutral]' })

    const res1 = await POST(mockRequest('Hi, I am having trouble integrating your AI receptionist with my dental practice software.'))
    const data1 = await res1.json()

    expect(data1.success).toBe(true)
    expect(data1.sentiment).toBe('neutral')
    expect(data1.stage).toBe('support')
    expect(data1.requires_human).toBe(false)
    expect(data1.tools_used).toContain('support')
    expect(typeof data1.response).toBe('string')
    expect(data1.response.length).toBeGreaterThan(0)

    // ---- TURN 2: Customer gets frustrated ----
    const history2 = [
      { role: 'user', content: 'Hi, I am having trouble integrating your AI receptionist with my dental practice software.' },
      { role: 'assistant', content: data1.response }
    ]

    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'I understand you are frustrated. [SENTIMENT:negative]' })
      .mockResolvedValueOnce({ content: 'Transferring you to a senior support agent. [SENTIMENT:negative]' })

    const res2 = await POST(mockRequest(
      'Your system is broken! I have been trying to set this up for three days and nothing works!',
      history2
    ))
    const data2 = await res2.json()

    expect(data2.success).toBe(true)
    expect(data2.sentiment).toBe('negative')
    expect(data2.stage).toBe('transfer')
    expect(data2.requires_human).toBe(true)
    expect(data2.tools_used).toContain('transfer')
    expect(data2.tools_used).toContain('support')
    expect(typeof data2.response).toBe('string')
    expect(data2.response.length).toBeGreaterThan(0)
  })

  it('handles de-escalation from frustrated to calm', async () => {
    // ---- TURN 1: Frustrated customer ----
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'I understand you are frustrated. [SENTIMENT:negative]' })
      .mockResolvedValueOnce({ content: 'Transferring you to a senior agent. [SENTIMENT:negative]' })

    const res1 = await POST(mockRequest(
      'This is completely unacceptable! I have been waiting for weeks!'
    ))
    const data1 = await res1.json()

    expect(data1.success).toBe(true)
    expect(data1.sentiment).toBe('negative')
    expect(data1.stage).toBe('transfer')
    expect(data1.requires_human).toBe(true)

    // ---- TURN 2: Customer calms down ----
    const history2 = [
      { role: 'user', content: 'This is completely unacceptable! I have been waiting for weeks!' },
      { role: 'assistant', content: data1.response }
    ]

    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'Glad I could help. [SENTIMENT:positive]' })

    const res2 = await POST(mockRequest(
      'Thank you, I appreciate your help. Sorry for getting upset earlier.',
      history2
    ))
    const data2 = await res2.json()

    expect(data2.success).toBe(true)
    expect(data2.sentiment).toBe('positive')
    expect(data2.requires_human).toBe(false)
    expect(typeof data2.response).toBe('string')
    expect(data2.response.length).toBeGreaterThan(0)
  })

  it('executes processSupportRequest tool via API and returns neutral', async () => {
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
      .mockResolvedValueOnce({ content: 'Support ticket created successfully. [SENTIMENT:neutral]' })

    const res = await POST(mockRequest('I am having a technical issue with the integration.'))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.sentiment).toBe('neutral')
    expect(data.requires_human).toBe(false)
    expect(data.tools_used).toContain('support')
    expect(typeof data.response).toBe('string')
    expect(data.response.length).toBeGreaterThan(0)
  })

  it('falls back to keyword sentiment when API response lacks marker', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'Processing your support request.' }) // No marker
      .mockResolvedValueOnce({ content: 'Transferring to a rep. [SENTIMENT:negative]' })

    const res = await POST(mockRequest(
      'I am extremely frustrated with your terrible technical support.'
    ))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.sentiment).toBe('negative')
    expect(data.requires_human).toBe(true)
    expect(data.tools_used).toContain('transfer')
    expect(data.tools_used).toContain('support')
  })

  it('returns error response when message is missing', async () => {
    const req = {
      json: async () => ({ phone: undefined, business_id: 'test', conversation_history: [] })
    } as any

    const res = await POST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('returns correct response shape on every turn', async () => {
    mockInvoke
      .mockResolvedValueOnce({ content: 'support' })
      .mockResolvedValueOnce({ content: 'Helping you. [SENTIMENT:neutral]' })

    const res = await POST(mockRequest('I need help with my account settings.'))
    const data = await res.json()

    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('response')
    expect(data).toHaveProperty('stage')
    expect(data).toHaveProperty('sentiment')
    expect(data).toHaveProperty('requires_human')
    expect(data).toHaveProperty('tools_used')
    expect(data.success).toBe(true)
    expect(typeof data.response).toBe('string')
    expect(['billing', 'transfer', 'receptionist', 'faq', 'scheduler', 'voicemail', 'support', 'close']).toContain(data.stage)
    expect(['neutral', 'positive', 'negative']).toContain(data.sentiment)
    expect(typeof data.requires_human).toBe('boolean')
    expect(Array.isArray(data.tools_used)).toBe(true)
  })
})
