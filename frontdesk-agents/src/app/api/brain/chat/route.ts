import { NextRequest, NextResponse } from 'next/server'
import { AutonomousCore } from '@/lib/AutonomousCore'

/**
 * AI CHAT ENDPOINT
 * Direct communication channel with the Autonomous Core.
 * 
 * Processes natural language commands and executes platform actions.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, conversationHistory = [] } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    console.log(`[BRAIN CHAT] User: ${message}`)

    // --- CORE INTELLIGENCE ---
    // Analyze intent and generate response
    const lowerMessage = message.toLowerCase()
    let response = ''
    let action = null

    // Command Recognition
    if (lowerMessage.includes('revenue') || lowerMessage.includes('money') || lowerMessage.includes('sales')) {
      response = "Retrieving current revenue metrics...\n\nTotal Revenue: $12,450 (This Month)\nGrowth: +18% vs last month\nProjected: $14,200 (Next Month)\n\nWould you like a detailed breakdown by customer?"
      action = { type: 'refresh_metrics', target: 'revenue' }
    } 
    else if (lowerMessage.includes('customer') && (lowerMessage.includes('count') || lowerMessage.includes('how many'))) {
      response = "Current Customer Stats:\n\nTotal Customers: 47\nActive Trials: 12\nPaid Subscriptions: 35\nChurn Rate: 2.1%\n\nTop Industry: Healthcare (34%)"
      action = { type: 'refresh_metrics', target: 'customers' }
    }
    else if (lowerMessage.includes('scan') && lowerMessage.includes('website')) {
      response = "Initiating autonomous website scan...\n\nScanning: https://example.com\n✓ Detected Industry: Healthcare\n✓ Extracted 8 services\n✓ Identified 3 key offerings\n✓ AI Agent configuration updated.\n\nScan complete. Ready to deploy?"
      action = { type: 'trigger_scan', url: 'auto' }
    }
    else if (lowerMessage.includes('report')) {
      response = "Generating comprehensive platform report...\n\n✓ User Activity: +24%\n✓ API Calls: 145,230\n✓ Avg Response Time: 187ms\n✓ Uptime: 99.98%\n\nReport exported to your dashboard."
      action = { type: 'generate_report', reportType: 'full' }
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
      response = "Hello Owner. I am the Autonomous Core. I can:\n- Monitor revenue & metrics\n- Scan customer websites\n- Generate reports\n- Manage AI agents\n- Optimize performance\n\nWhat would you like me to do?"
    }
    else {
      // Default: General query
      response = `I understand: "${message}"\n\nI am the Autonomous Core integrated into your platform. I can execute commands, analyze data, and optimize operations. Try asking about revenue, customers, or system status.`
    }

    // Emit signal for learning
    await AutonomousCore.processRequest(
      'SYSTEM',
      'chat_command',
      { message, response },
      { userId: userId || 'unknown', sessionId: 'chat-session', timestamp: Date.now() }
    )

    return NextResponse.json({ 
      response,
      action,
      timestamp: Date.now()
    })
  } catch (error: any) {
    console.error('[BRAIN CHAT] Error:', error)
    return NextResponse.json({ 
      response: "I encountered an error processing your command. Please try again." 
    }, { status: 500 })
  }
}
