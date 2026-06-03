/**
 * Hermes AI Agent API Routes
 * Main orchestration endpoints for AI processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeHermes, 
  processWithAI, 
  createTask, 
  routeToAgent,
  getHermesStatus,
  analyzeSentiment,
  makeDecision
} from '@/lib/hermes'

// Initialize Hermes with environment keys - NVIDIA PRIMARY
initializeHermes({
  openaiKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  nvidiaKey: process.env.NVIDIA_API_KEY,
  blandKey: process.env.BLAND_AI_API_KEY,
  defaultModel: 'nvidia',  // PRIMARY: Use free NVIDIA NIM models first
  fallbackOrder: ['nvidia', 'openai', 'anthropic'],  // NVIDIA → OpenAI → Anthropic
  maxRetries: 3,
  timeout: 60000,  // Longer timeout for NVIDIA model fallback chain
})

/**
 * GET /api/ai/hermes - Get AI agent status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'status') {
      return NextResponse.json(getHermesStatus())
    }
    
    if (action === 'models') {
      // Return available models
      return NextResponse.json({
        openai: !!process.env.OPENAI_API_KEY,
        nvidia: !!process.env.NVIDIA_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        bland: !!process.env.BLAND_AI_API_KEY,
        models: {
          openai: ['gpt-4-turbo', 'gpt-3.5-turbo'],
          nvidia: ['meta/llama-3.1-70b-instruct', 'meta/llama-3.1-8b-instruct', 'mistralai/mixtral-8x7b-instruct-v0.1', 'google/gemma-2-27b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'deepseek-ai/deepseek-r1'],
          anthropic: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514'],
          bland: ['bland-turbo', 'bland-basic']
        }
      })
    }
    
    return NextResponse.json({
      message: 'Hermes AI Agent API',
      version: '1.0.0',
      status: getHermesStatus()
    })
  } catch (error) {
    console.error('[Hermes API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/ai/hermes - Process AI task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, task, prompt, agent, systemPrompt, context, options } = body
    
    // Route to specific agent
    if (agent) {
      const result = await routeToAgent(agent, prompt, systemPrompt)
      return NextResponse.json(result)
    }
    
    // Handle specific actions
    switch (action) {
      case 'process': {
        if (!task) {
          return NextResponse.json({ error: 'Task required' }, { status: 400 })
        }
        const orchestrationTask = createTask(
          task.type || 'message',
          task.input || {},
          task.priority || 'medium'
        )
        const result = await processWithAI(orchestrationTask, systemPrompt)
        return NextResponse.json(result)
      }
      
      case 'analyze': {
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
        }
        const result = await analyzeSentiment(prompt)
        return NextResponse.json(result)
      }
      
      case 'decide': {
        if (!context || !options) {
          return NextResponse.json({ error: 'Context and options required' }, { status: 400 })
        }
        const result = await makeDecision(context, options)
        return NextResponse.json(result)
      }
      
      case 'route': {
        if (!agent || !prompt) {
          return NextResponse.json({ error: 'Agent and prompt required' }, { status: 400 })
        }
        const result = await routeToAgent(agent, prompt, systemPrompt)
        return NextResponse.json(result)
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Hermes API] POST error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}