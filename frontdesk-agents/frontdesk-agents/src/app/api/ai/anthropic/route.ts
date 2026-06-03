/**
 * Anthropic API Route
 * Provides Claude AI processing for the platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeAnthropic,
  message,
  analyzeCallScenario,
  generateVoiceResponse,
  autonomousDecision,
  extractDocumentInfo,
  getAvailableModels,
  isConfigured
} from '@/lib/anthropic-integration'

// Initialize with environment key
if (process.env.ANTHROPIC_API_KEY) {
  initializeAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

/**
 * GET /api/ai/anthropic - Get Anthropic status and models
 */
export async function GET() {
  return NextResponse.json({
    configured: isConfigured(),
    models: getAvailableModels(),
    status: isConfigured() ? 'active' : 'not_configured'
  })
}

/**
 * POST /api/ai/anthropic - Process with Anthropic Claude
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompt, systemPrompt, options } = body

    if (!isConfigured()) {
      return NextResponse.json({ error: 'Anthropic not configured' }, { status: 400 })
    }

    switch (action) {
      case 'message': {
        const result = await message(prompt, systemPrompt, options)
        return NextResponse.json(result)
      }

      case 'analyze': {
        const result = await analyzeCallScenario(options?.context || {})
        return NextResponse.json(result)
      }

      case 'voice': {
        const result = await generateVoiceResponse(options?.context || {})
        return NextResponse.json(result)
      }

      case 'decide': {
        const result = await autonomousDecision(
          options?.context || {},
          options?.actions || [],
          options?.constraints || []
        )
        return NextResponse.json(result)
      }

      case 'extract': {
        const result = await extractDocumentInfo(
          prompt,
          options?.documentType || 'other'
        )
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Anthropic API] Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}