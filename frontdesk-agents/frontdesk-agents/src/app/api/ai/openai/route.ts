/**
 * OpenAI API Route
 * Provides OpenAI GPT-4 processing for the platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeOpenAI,
  complete,
  analyzeCustomerSentiment,
  generateCallSummary,
  classifyCallIntent,
  decideCallAction,
  getAvailableModels,
  isConfigured
} from '@/lib/openai-integration'

// Initialize with environment key
if (process.env.OPENAI_API_KEY) {
  initializeOpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

/**
 * GET /api/ai/openai - Get OpenAI status and models
 */
export async function GET() {
  return NextResponse.json({
    configured: isConfigured(),
    models: getAvailableModels(),
    status: isConfigured() ? 'active' : 'not_configured'
  })
}

/**
 * POST /api/ai/openai - Process with OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompt, systemPrompt, options } = body

    if (!isConfigured()) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 400 })
    }

    switch (action) {
      case 'complete': {
        const result = await complete(prompt, systemPrompt, options)
        return NextResponse.json(result)
      }

      case 'sentiment': {
        const result = await analyzeCustomerSentiment(prompt)
        return NextResponse.json(result)
      }

      case 'summarize': {
        const result = await generateCallSummary(prompt)
        return NextResponse.json(result)
      }

      case 'classify': {
        const result = await classifyCallIntent(prompt)
        return NextResponse.json(result)
      }

      case 'decide': {
        const result = await decideCallAction(options?.context || {})
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[OpenAI API] Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}