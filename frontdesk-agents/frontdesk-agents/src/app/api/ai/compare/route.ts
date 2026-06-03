import { NextRequest, NextResponse } from 'next/server'
import { initializeOpenAI, isConfigured as isOpenAIConfigured, chat } from '@/lib/openai-integration'
import { initializeAnthropic, isConfigured as isAnthropicConfigured, message } from '@/lib/anthropic-integration'
import { initializeNVIDIA, isConfigured as isNvidiaConfigured, complete } from '@/lib/nvidia-integration'
import type { ChatMessage } from '@/lib/openai-integration'

// Initialize clients
const initClients = () => {
  if (process.env.OPENAI_API_KEY && !isOpenAIConfigured()) {
    initializeOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  if (process.env.ANTHROPIC_API_KEY && !isAnthropicConfigured()) {
    initializeAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  if (process.env.NVIDIA_API_KEY && !isNvidiaConfigured()) {
    initializeNVIDIA({ apiKey: process.env.NVIDIA_API_KEY })
  }
}

export async function POST(request: NextRequest) {
  try {
    initClients()

    const body = await request.json()
    const { provider, prompt, systemPrompt, model } = body

    if (!provider || !prompt) {
      return NextResponse.json(
        { error: 'Provider and prompt are required' },
        { status: 400 }
      )
    }

    let response: string
    let tokens: number | undefined

    switch (provider) {
      case 'openai':
        if (!isOpenAIConfigured()) {
          return NextResponse.json(
            { error: 'OpenAI not configured. Set OPENAI_API_KEY in environment.' },
            { status: 503 }
          )
        }

        const openaiResult = await chat(
          [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: prompt }
          ],
          { model: model || 'gpt-4-turbo', temperature: 0.7, maxTokens: 1000 }
        )
        response = openaiResult.content
        tokens = openaiResult.usage?.total_tokens
        break

      case 'nvidia':
        if (!isNvidiaConfigured()) {
          return NextResponse.json(
            { error: 'NVIDIA not configured. Set NVIDIA_API_KEY in environment.' },
            { status: 503 }
          )
        }

        const nvidiaResult = await complete(prompt, systemPrompt, {
          model: model || 'google/gemma-2-2b-it',
          temperature: 0.7,
          maxTokens: 1000
        })
        response = nvidiaResult.content
        tokens = nvidiaResult.usage?.total_tokens
        break

      case 'anthropic':
        if (!isAnthropicConfigured()) {
          return NextResponse.json(
            { error: 'Anthropic not configured. Set ANTHROPIC_API_KEY in environment.' },
            { status: 503 }
          )
        }

        const claudeResult = await message(prompt, systemPrompt, {
          model: model || 'claude-sonnet-4-20250514',
          temperature: 0.7,
          maxTokens: 1000
        })
        response = claudeResult.content
        tokens = claudeResult.usage?.output_tokens
        break

      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}. Use 'openai', 'nvidia', or 'anthropic'` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      response,
      tokens,
      model: model || 'default',
      provider
    })

  } catch (error) {
    console.error('[Model Compare API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    providers: {
      openai: isOpenAIConfigured(),
      nvidia: isNvidiaConfigured(),
      anthropic: isAnthropicConfigured(),
    },
    endpoint: 'POST /api/ai/compare',
    body: {
      provider: 'openai | nvidia | anthropic',
      prompt: 'string (required)',
      systemPrompt: 'string (optional)',
      model: 'string (optional, provider-specific model id)'
    }
  })
}