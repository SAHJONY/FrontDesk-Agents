import { NextRequest, NextResponse } from 'next/server'
import { completeWithAutonomousFallback, initializeNVIDIA, isConfigured as isNvidiaConfigured, resetModelFailures } from '@/lib/nvidia-integration'
import { initializeOpenAI, isConfigured as isOpenAIConfigured } from '@/lib/openai-integration'
import { initializeAnthropic, isConfigured as isAnthropicConfigured } from '@/lib/anthropic-integration'
import { authRateLimit, getClientIp } from '@/lib/rate-limit'

// Initialize AI providers
const nvidiaApiKey = process.env.NVIDIA_NIM_API_KEY || ''
const openaiApiKey = process.env.OPENAI_API_KEY || ''
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || ''

if (nvidiaApiKey && !isNvidiaConfigured()) {
  initializeNVIDIA({ apiKey: nvidiaApiKey })
}
if (openaiApiKey && !isOpenAIConfigured()) {
  initializeOpenAI({ apiKey: openaiApiKey })
}
if (anthropicApiKey && !isAnthropicConfigured()) {
  initializeAnthropic({ apiKey: anthropicApiKey })
}

export async function POST(request: NextRequest) {
  // Rate limiting — outside try so throws propagate as 500, not misleading
  const clientIp = getClientIp(request)
  const rateLimitResult = authRateLimit(clientIp)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter ?? 60) } }
    )
  }

  try {
    const body = await request.json()
    const { messages, systemPrompt, task, context } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // Build prompt from messages
    const lastMessage = messages[messages.length - 1]
    const prompt = typeof lastMessage === 'string' ? lastMessage : lastMessage?.content || ''
    
    // Use Hermes system prompt if not provided
    const system = systemPrompt || `You are a professional AI receptionist for a business phone system. You handle incoming calls, make scheduling decisions, and provide information to callers. Be concise, helpful, and professional. Always respond with valid JSON when making decisions.`

    // Reset model failures for fresh task
    resetModelFailures()

    // Try NVIDIA first with autonomous fallback
    const result = await completeWithAutonomousFallback(
      prompt,
      system,
      { temperature: 0.7, maxTokens: 500 }
    )

    if (result.success) {
      return NextResponse.json({
        content: result.content,
        model: result.model,
        provider: 'nvidia',
        modelsTried: result.modelsTried,
      })
    }

    // If NVIDIA fails, try OpenAI as fallback
    if (isOpenAIConfigured()) {
      try {
        const { chat } = await import('@/lib/openai-integration')
        const response = await chat(
          messages.map((m: any) => ({ role: m.role || 'user', content: typeof m === 'string' ? m : m.content })),
          { temperature: 0.7, maxTokens: 500 }
        )
        return NextResponse.json({
          content: response.content,
          model: response.model,
          provider: 'openai',
        })
      } catch (error: any) {
        console.error('OpenAI fallback failed:', error)
      }
    }

    // If both fail, return error
    return NextResponse.json(
      { error: 'All AI providers failed. Please try again later.' },
      { status: 503 }
    )
  } catch (error: any) {
    console.error('[API/hermes] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting — outside try so throws propagate as 500
  const clientIp = getClientIp(request)
  const rateLimitResult = authRateLimit(clientIp)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter ?? 60) } }
    )
  }

  return NextResponse.json({
    status: 'ok',
    provider: 'hermes',
    description: 'AI Receptionist endpoint with autonomous fallback',
    providers: {
      nvidia: isNvidiaConfigured(),
      openai: isOpenAIConfigured(),
      anthropic: isAnthropicConfigured(),
    },
  })
}