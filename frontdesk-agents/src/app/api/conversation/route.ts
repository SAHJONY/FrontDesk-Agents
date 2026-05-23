import { NextRequest, NextResponse } from 'next/server';
import { brain } from '../../../lib/ai-brain/coreBrain';

// ============================================
// CONVERSATION API
// Handles all AI agent conversations
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, userId, industry = 'general' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let context;
    
    // Start new conversation or continue existing
    if (sessionId) {
      context = brain.getActiveConversations().find(c => c.sessionId === sessionId);
    }
    
    if (!context) {
      context = await brain.startConversation(userId || 'anonymous', industry);
    }

    // Process message through AI brain
    const response = await brain.processMessage(context.sessionId, message);

    return NextResponse.json({
      success: true,
      sessionId: context.sessionId,
      response: response.response,
      action: response.action,
      confidence: response.confidence,
      nextAgent: response.nextAgent,
      metadata: {
        industry: context.metadata.industry,
        intent: context.metadata.intent,
        sentiment: context.metadata.sentiment,
      },
    });
  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Retrieve conversation history
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const conversations = brain.getActiveConversations();
      const conversation = conversations.find(c => c.sessionId === sessionId);
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        conversation,
      });
    }

    // Return all active conversations (admin)
    return NextResponse.json({
      success: true,
      conversations: brain.getActiveConversations(),
      metrics: brain.getMetrics(),
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversation' },
      { status: 500 }
    );
  }
}
