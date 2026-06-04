import { NextRequest, NextResponse } from 'next/server'
import { chat as nvidiaChat, isConfigured as isNvidiaConfigured, initializeNVIDIA } from '@/lib/nvidia-integration'
import { chat as openaiChat, isConfigured as isOpenAIConfigured, initializeOpenAI } from '@/lib/openai-integration'
import { chat as anthropicChat, isConfigured as isAnthropicConfigured, initializeAnthropic } from '@/lib/anthropic-integration'
import { authRateLimit, getClientIp } from '@/lib/rate-limit'

// Initialize clients
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
    const { provider, prompt, systemPrompt, model } = body

    if (!provider || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: provider and prompt' },
        { status: 400 }
      )
    }

    const messages = []
    if (systemPrompt) {
      messages.push({ role: 'system' as const, content: systemPrompt })
    }
    messages.push({ role: 'user' as const, content: prompt })

    let response: any = null
    let tokens = 0

    switch (provider) {
      case 'openai':
        if (!isOpenAIConfigured()) {
          return NextResponse.json(
            { error: 'OpenAI not configured. Set OPENAI_API_KEY in environment variables.' },
            { status: 503 }
          )
        }
        response = await openaiChat(messages, { model: model || 'gpt-4-turbo' })
        tokens = response.usage?.completion_tokens || 0
        break

      case 'nvidia':
        if (!isNvidiaConfigured()) {
          return NextResponse.json(
            { error: 'NVIDIA not configured. Set NVIDIA_NIM_API_KEY in environment variables.' },
            { status: 503 }
          )
        }
        response = await nvidiaChat(messages, { model: model || 'google/gemma-2-2b-it' })
        tokens = response.usage?.output_tokens || 0
        break

      case 'anthropic':
        if (!isAnthropicConfigured()) {
          return NextResponse.json(
            { error: 'Anthropic not configured. Set ANTHROPIC_API_KEY in environment variables.' },
            { status: 503 }
          )
        }
        response = await anthropicChat(messages, { model: model || 'claude-sonnet-4-20250514' })
        tokens = response.usage?.output_tokens || 0
        break

      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}. Choose from: openai, nvidia, anthropic` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      response: response.content,
      model: response.model,
      tokens,
      provider,
    })
  } catch (error: any) {
    console.error(`[API/compare] Error:`, error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}