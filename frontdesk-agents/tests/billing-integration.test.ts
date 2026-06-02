import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// MOCK SETUP
// ============================================

// Mock @langchain/openai to control LLM responses (same pattern as unit tests)
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

// Mock ContextManager to avoid database calls.
// NOTE: Must use regular function() not arrow fn so it works with 'new ContextManager(...)'
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

describe('Billing Integration - Multi-turn via API', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('handles a full billing flow: polite inquiry then frustrated escalation then calm de-escalation', async () => {
    // ---- TURN 1: Polite billing inquiry ----
    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'Billing inquiry logged. [SENTIMENT:neutral]' })

    const res1 = await POST(mockRequest('Hi, I was charged twice for my subscription. Can you help me understand why?'))
    const data1 = await res1.json()

    expect(data1.success).toBe(true)
    expect(data1.sentiment).toBe('neutral')
    expect(data1.stage).toBe('billing')
    expect(data1.requires_human).toBe(false)
    expect(data1.tools_used).toContain('billing')
    expect(typeof data1.response).toBe('string')
    expect(data1.response.length).toBeGreaterThan(0)

    // ---- TURN 2: Customer gets frustrated ----
    const history2 = [
      { role: 'user', content: 'Hi, I was charged twice for my subscription. Can you help me understand why?' },
      { role: 'assistant', content: data1.response }
    ]

    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'I understand. [SENTIMENT:negative]' })
      .mockResolvedValueOnce({ content: 'Transferring you. [SENTIMENT:negative]' })

    const res2 = await POST(mockRequest(
      'This is frustrating! You said I would get a refund in 5-7 days but I have been waiting two weeks! Why does it take so long?',
      history2
    ))
    const data2 = await res2.json()

    expect(data2.success).toBe(true)
    expect(data2.sentiment).toBe('negative')
    expect(data2.stage).toBe('transfer')
    expect(data2.requires_human).toBe(true)
    expect(data2.tools_used).toContain('transfer')
    expect(data2.tools_used).toContain('billing')
    expect(typeof data2.response).toBe('string')
    expect(data2.response.length).toBeGreaterThan(0)

    // ---- TURN 3: Customer calms down (de-escalation) ----
    const history3 = [
      ...history2,
      { role: 'user', content: 'This is frustrating! You said I would get a refund in 5-7 days but I have been waiting two weeks! Why does it take so long?' },
      { role: 'assistant', content: data2.response }
    ]

    mockInvoke
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'Glad to help. [SENTIMENT:neutral]' })

    const res3 = await POST(mockRequest(
      'Thank you, I appreciate your help. Sorry for getting upset earlier, I will wait for the transfer.',
      history3
    ))
    const data3 = await res3.json()

    expect(data3.success).toBe(true)
    expect(data3.sentiment).toBe('neutral')
    expect(data3.requires_human).toBe(false)
    expect(typeof data3.response).toBe('string')
    expect(data3.response.length).toBeGreaterThan(0)
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
      .mockResolvedValueOnce({ content: 'billing' })
      .mockResolvedValueOnce({ content: 'Working on it. [SENTIMENT:neutral]' })

    const res = await POST(mockRequest('I need a refund for a duplicate charge.'))
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
