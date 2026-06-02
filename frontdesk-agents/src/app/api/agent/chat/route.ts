// API Route: AI Agent Chat Endpoint
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { handleReceptionistCall } from '@/lib/agents/receptionist'
import { ContextManager } from '@/lib/memory/vector-store'
import { NextRequest, NextResponse } from 'next/server'

interface ContextData {
  caller?: unknown
  relevantFAQs?: unknown[]
  [key: string]: unknown
}

export async function POST(req: NextRequest) {
  try {
    const { message, phone, business_id, conversation_history } = await req.json()
    
    // Initialize context manager
    const contextManager = new ContextManager(business_id || 'default')
    
    // Build context if phone is provided
    let context: ContextData = {}
    if (phone) {
      context = await contextManager.buildContext(phone, message) as ContextData
    }
    
    // Process through the AI agent
    const result = await handleReceptionistCall(message, {
      caller_info: (context.caller as any) || null,
      context: {
        business_id: business_id || 'default',
        industry: 'corporate',
        caller_intent: null,
        scheduled_callback: false,
        message_taken: null,
        transfer_to: null,
        appointments: [],
        frequently_asked: (context.relevantFAQs as any) || []
      },
      messages: (conversation_history || []).map((m: { role: string; content: string }) =>
        m.role === 'user' ? new HumanMessage({ content: m.content }) : new AIMessage({ content: m.content })
      )
    })
    
    // Update caller profile if phone provided
    if (phone && result.caller_info) {
      await contextManager.updateCallerProfile(result.caller_info)
    }
    
    // Add to conversation history
    await contextManager.addToHistory('user', message)
    const lastResponse = result.messages[result.messages.length - 1]?.content
    const responseText = typeof lastResponse === 'string' ? lastResponse : JSON.stringify(lastResponse || '')
    await contextManager.addToHistory('assistant', responseText)
    
    return NextResponse.json({
      success: true,
      response: result.messages[result.messages.length - 1]?.content,
      stage: result.conversation_stage,
      sentiment: result.sentiment,
      requires_human: result.requires_human,
      tools_used: result.tools_used
    })
  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    )
  }
}