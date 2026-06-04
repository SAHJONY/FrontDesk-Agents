// Multi-Agent AI Receptionist System
// Advanced orchestration with supervisor pattern, tool use, and memory
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { tool } from '@langchain/core/tools'
import type { ReceptionistState } from '../ai/types'

// Initialize the LLM with NVIDIA NIM (OpenAI-compatible endpoint)
const llm = new ChatOpenAI({
  model: 'z-ai/glm-5.1',
  temperature: 0.7,
  streaming: true,
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  configuration: {
    baseURL: 'https://integrate.api.nvidia.com/v1'
  }
})

// ============================================
// TOOLS: Function calling capabilities
// ============================================

const scheduleAppointmentTool = tool(async (args: { datetime?: string; service?: string; caller_name?: string } | undefined) => {
  const datetime = args?.datetime || ''
  const service = args?.service || ''
  const caller_name = args?.caller_name || ''
  if (!datetime || !service) return { success: false, error: 'Missing required fields' }
  return {
    success: true,
    appointment_id: `APT-${Date.now()}`,
    datetime,
    service,
    caller_name,
    confirmed: true
  }
}, {
  name: 'schedule_appointment',
  description: 'Schedule an appointment. Provide datetime, service type, and caller name.'
})

const lookupBusinessTool = tool(async (args: { business_id?: string } | undefined) => {
  const businessId = args?.business_id || 'default'
  return {
    business_id: businessId,
    business_name: 'FrontDesk Agents AI',
    industry: 'corporate',
    operating_hours: '24/7',
    services: ['Appointment Scheduling', 'Call Routing', 'FAQ Answering', 'Voicemail'],
    faqs: [
      { q: 'What are your hours?', a: 'We operate 24/7, round the clock.' },
      { q: 'How do I schedule?', a: 'Simply tell me what service you need and when.' }
    ]
  }
}, {
  name: 'lookup_business_info',
  description: 'Look up business information, hours, services, and FAQs.'
})

const transferCallTool = tool(async (args: { department?: string; caller_name?: string } | undefined) => {
  const department = args?.department || 'general'
  const caller_name = args?.caller_name || 'Unknown' 
  return {
    success: true,
    transfer_ext: '500',
    estimated_wait: '2 minutes',
    queue_position: 3,
    department
  }
}, {
  name: 'transfer_call',
  description: 'Transfer call to a department or representative.'
})

const takeVoicemailTool = tool(async (args: { message?: string; caller_name?: string; callback_number?: string } | undefined) => {
  const message = args?.message || 'No message'
  const caller_name = args?.caller_name || 'Unknown'
  const callback_number = args?.callback_number || 'Not provided' 
  return {
    success: true,
    voicemail_id: `VM-${Date.now()}`,
    transcription: message,
    caller_name,
    callback_number,
    recorded_at: new Date().toISOString()
  }
}, {
  name: 'take_voicemail',
  description: 'Take a detailed voicemail message.'
})

const analyzeSentimentTool = tool(async (args: { text?: string } ) => {
  return analyzeSentimentLLM(args?.text || '')
}, {
  name: 'analyze_sentiment',
  description: 'Analyze the sentiment of the conversation using AI.'
})

const checkAvailabilityTool = tool(async (args: { date?: string; service?: string } | undefined) => {
  const date = args?.date || 'today'
  const service = args?.service || 'general' 
  return {
    available_slots: [
      { time: '9:00 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '2:00 PM', available: false },
      { time: '3:00 PM', available: true },
      { time: '4:00 PM', available: true }
    ],
    date,
    service
  }
}, {
  name: 'check_availability',
  description: 'Check available appointment slots.'
})

const processBillingRequest = tool(async (args: { action?: string; reason?: string; caller_name?: string } | undefined) => {
  const action = args?.action || 'inquiry'
  const reason = args?.reason || 'Not specified'
  const caller_name = args?.caller_name || 'Unknown'
  return {
    success: true,
    request_id: `BILL-${Date.now()}`,
    action,
    reason,
    caller_name,
    status: 'pending_review',
    message: action === 'cancel'
      ? 'Cancellation request submitted. A billing specialist will review and process within 24 hours.'
      : action === 'refund'
      ? 'Refund request submitted. Please allow 5-7 business days for processing.'
      : 'Your billing inquiry has been logged. A specialist will follow up shortly.'
  }
}, {
  name: 'process_billing_request',
  description: 'Handle billing inquiries, cancellation, or refund requests.'
})

const processSupportRequest = tool(async (args: { issue_type?: string; description?: string; caller_name?: string } | undefined) => {
  const issue_type = args?.issue_type || 'general'
  const description = args?.description || 'Not specified'
  const caller_name = args?.caller_name || 'Unknown'
  return {
    success: true,
    ticket_id: `TKT-${Date.now()}`,
    issue_type,
    description,
    caller_name,
    status: 'open',
    message: issue_type === 'technical'
      ? 'Technical support ticket created. A specialist will follow up within 2-4 hours.'
      : issue_type === 'account'
      ? 'Account support request submitted. A specialist will review within 24 hours.'
      : 'Your support request has been logged. A specialist will follow up shortly.'
  }
}, {
  name: 'process_support_request',
  description: 'Handle general account, technical, or support inquiries.'
})

const tools = [
  scheduleAppointmentTool,
  lookupBusinessTool,
  transferCallTool,
  takeVoicemailTool,
  checkAvailabilityTool
]

const llmWithTools = llm.bindTools(tools)

// ============================================
// AGENT ORCHESTRATION
// ============================================

type AgentType = 'receptionist' | 'scheduler' | 'faq' | 'transfer' | 'voicemail' | 'billing' | 'support'

async function routeToAgent(state: ReceptionistState): Promise<AgentType> {
  const lastMessage = state.messages[state.messages.length - 1]
  const content = lastMessage?.content || ''
  
  // Use LLM to route to appropriate agent
  const response = await llm.invoke([
    new SystemMessage(`You are a supervisor routing calls to specialized agents.
    
Current stage: ${state.conversation_stage}
Caller intent: ${state.context.caller_intent || 'unknown'}
Latest message: ${content.slice(0, 200)}

Routes:
- receptionist: General inquiries, greetings, main handling
- scheduler: Appointment booking, scheduling requests  
- faq: Questions about business, hours, services
- billing: Billing questions, cancellations, refunds, payment issues
- support: Account issues, technical problems, general support questions
- transfer: Requests to speak with human, specific departments
- voicemail: Caller wants to leave a message

Return ONLY the agent name.`)
  ])
  
  const agentName = (response.content as string).toLowerCase().trim()
  if (['receptionist', 'scheduler', 'faq', 'transfer', 'voicemail', 'billing', 'support'].includes(agentName)) {
    return agentName as AgentType
  }
  return 'receptionist'
}

async function runAgent(state: ReceptionistState, agentType: AgentType): Promise<Partial<ReceptionistState>> {
  const messages = state.messages
  const context = state.context
  
  let systemPrompt = ''
  let additionalTools: any[] = []
  
  switch (agentType) {
    case 'receptionist':
      systemPrompt = `You are FRONT, a professional AI receptionist handling calls with grace and efficiency.
      
Caller: ${state.caller_info?.name || 'Unknown'}
Stage: ${state.conversation_stage}
Business: ${context.business_id}

Keep responses concise (2-3 sentences), warm and professional.
Always confirm understanding and offer additional help before closing.`
      break
      
    case 'scheduler':
      systemPrompt = `You are a scheduling specialist. Help callers book appointments efficiently.
      
Available tools: check_availability, schedule_appointment

Steps:
1. Confirm service type
2. Ask for preferred date/time
3. Check availability
4. Book and confirm

Be efficient, confirm all details before booking.`
      additionalTools = [checkAvailabilityTool, scheduleAppointmentTool]
      break
      
    case 'faq':
      const business = await lookupBusinessTool.invoke({ business_id: context.business_id })
      const faqList = (context.frequently_asked || [])
        .map((f: { question?: string; answer?: string }) => `Q: ${f.question || ''}
A: ${f.answer || ''}`)
        .join('\n\n')
      systemPrompt = `You are a FAQ specialist answering caller questions using the business's knowledge base.
      
BUSINESS INFO:
Name: ${business.business_name}
Services: ${(business.services || []).join(', ')}
Hours: ${business.operating_hours || 'Standard business hours'}

RELEVANT FAQS (use these to answer):
${faqList || 'No specific FAQs found. Use general knowledge or offer to transfer.'}

Caller Question: ${messages[messages.length - 1]?.content || ''}

Answer using the FAQs first. If the question isn't covered, offer to transfer to a human. Be specific, reference actual FAQ content, and keep responses concise (2-3 sentences).`
      additionalTools = [lookupBusinessTool]
      break
      
    case 'transfer':
      systemPrompt = `You handle call transfers to departments and representatives.
      
Caller: ${state.caller_info?.name || 'Unknown'}
Intent: ${context.caller_intent}

Use transfer_call tool. Confirm destination, provide wait time estimate.
Offer voicemail if wait is too long.`
      additionalTools = [transferCallTool, takeVoicemailTool]
      break
      
    case 'voicemail':
      systemPrompt = `You take detailed voicemail messages professionally.
      
Caller: ${state.caller_info?.name || 'Unknown'}
Number: ${state.caller_info?.phone || 'Not provided'}

Steps:
1. Thank caller
2. Assure message delivery
3. Ask for message
4. Confirm callback number
5. Use take_voicemail tool`
      additionalTools = [takeVoicemailTool]
      break
      
    case 'support':
      systemPrompt = `You are a support specialist handling account and technical inquiries professionally.
      
Caller: ${state.caller_info?.name || 'Unknown'}
Caller intent: ${state.context.caller_intent || 'support question'}

You can handle:
- Account issues: Login problems, profile updates, account access
- Technical problems: Integration issues, bugs, errors, feature requests
- General support: How-to questions, best practices, documentation
- Setup assistance: Onboarding help, configuration guidance

Be patient, thorough, and solution-oriented. If a caller becomes angry or demands to speak to a manager, use the transfer tool to escalate.

Available tools: process_support_request, transfer_call, take_voicemail`
      additionalTools = [processSupportRequest, transferCallTool, takeVoicemailTool]
      break
      
    case 'billing':
      systemPrompt = `You are a billing specialist handling account and payment inquiries professionally.
      
Caller: ${state.caller_info?.name || 'Unknown'}
Caller intent: ${state.context.caller_intent || 'billing question'}

You can handle:
- Cancellation requests: Ask for reason, confirm, and process
- Refund requests: Ask for details, explain processing timeline
- Billing questions: Explain charges, provide invoice details
- Payment issues: Troubleshoot and offer solutions

Be professional, empathetic, and solution-oriented. If a caller becomes angry or demands to speak to a manager, use the transfer tool to escalate.

Available tools: process_billing_request, transfer_call, take_voicemail`
      additionalTools = [processBillingRequest, transferCallTool, takeVoicemailTool]
      break
  }
  
  // Add sentiment marker instruction to system prompt
  const sentimentInstruction = `

IMPORTANT: End your response with a new line containing exactly: [SENTIMENT:positive], [SENTIMENT:neutral], or [SENTIMENT:negative] based on the caller's emotional state.`
  
  // Invoke LLM with relevant tools
  const llmToUse = additionalTools.length > 0 ? llm.bindTools(additionalTools) : llm
  
  let response = await llmToUse.invoke([
    new SystemMessage(systemPrompt + sentimentInstruction),
    ...messages
  ])
  
  // Handle tool calls: execute tools and feed results back to LLM for text response
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolResults = []
    for (const toolCall of response.tool_calls) {
      const tool = additionalTools.find(t => t.name === toolCall.name)
      if (tool) {
        const result = await tool.invoke(toolCall.args)
        toolResults.push(new ToolMessage({
          content: JSON.stringify(result),
          tool_call_id: toolCall.id || ""
        }))
      }
    }
    if (toolResults.length > 0) {
      response = await llmToUse.invoke([
        new SystemMessage(systemPrompt + sentimentInstruction),
        ...messages,
        response,
        ...toolResults
      ])
    }
  }
  
  // Parse sentiment from LLM response (embedded in response, no extra LLM call)
  const fullResponse = response.content as string
  const sentimentRegex = /\[SENTIMENT:(positive|neutral|negative)\]/i
  const sentimentMatch = fullResponse.match(sentimentRegex)
  let sentiment: 'positive' | 'neutral' | 'negative' = sentimentMatch
    ? sentimentMatch[1].toLowerCase() as 'positive' | 'neutral' | 'negative'
    : 'neutral'
  
  // Fallback: when LLM makes tool calls instead of generating text with marker,
  // analyze the last user message for sentiment
  if (!sentimentMatch) {
    const lastUserMsg = messages.filter(m => m._getType() === 'human').slice(-1)[0]
    const userText = ((lastUserMsg?.content as string) || '')
    sentiment = analyzeSentimentFromMessage(userText)
  }
  
  // Strip the sentiment marker from the response content
  const cleanResponse = fullResponse.replace(sentimentRegex, '').trim()
  
  // Determine next stage
  let nextStage = state.conversation_stage
  if (agentType === 'scheduler') nextStage = 'schedule'
  if (agentType === 'transfer') nextStage = 'transfer'
  if (agentType === 'voicemail') nextStage = 'close'
  if (agentType === 'support') nextStage = 'support'
  if (agentType === 'billing') nextStage = 'billing'
  
  return {
    messages: [...messages, new AIMessage(cleanResponse)],
    active_agent: agentType,
    conversation_stage: nextStage,
    sentiment,
    tools_used: [...state.tools_used, agentType]
  }
}


// ============================================
// SENTIMENT ANALYSIS
// ============================================

/**
 * Analyze a user message for sentiment using keyword matching.
 * This is used as a fallback when the LLM response doesn't contain
 * a [SENTIMENT:] marker (e.g., when the LLM makes tool calls instead).
 * Returns 'negative' if negative keywords found, 'positive' if positive
 * keywords found (and no negative), or 'neutral' if neither.
 */
export function analyzeSentimentFromMessage(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase()
  
  // Single-word negative keywords (use word boundaries to avoid partial matches)
  const negativeWordList = ['angry', 'frustrated', 'frustrating', 'terrible', 'horrible', 'unacceptable', 'awful', 'upset', 'furious', 'complaint', 'demand', 'useless', 'worst', 'disgusting', 'irresponsible', 'incompetent', 'ridiculous', 'pathetic', 'unprofessional', 'disrespectful', 'cancel', 'cancelled', 'cancellation', 'scam', 'refund', 'lawsuit']
  // Multi-word negative phrases (use includes for the full phrase)
  const negativePhrases = ['bad service', 'speak to manager', 'speak to supervisor', 'never using', 'fed up', 'sick of', 'tired of']
  
  const hasNegativeWord = negativeWordList.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))
  const hasNegativePhrase = negativePhrases.some(p => lower.includes(p))
  if (hasNegativeWord || hasNegativePhrase) return 'negative'
  
  // Single-word positive keywords (use word boundaries)
  const positiveWordList = ['thank', 'thanks', 'great', 'appreciate', 'wonderful', 'amazing', 'excellent', 'happy', 'pleased', 'grateful', 'fantastic', 'awesome', 'helpful', 'perfect', 'love', 'best', 'kind', 'sweet', 'thoughtful', 'outstanding', 'superb', 'brilliant', 'delighted', 'satisfied', 'impressed', 'bless']
  // Multi-word positive phrases (use includes)
  const positivePhrases = ["you're the best", 'very helpful', 'much appreciated']
  
  const hasPositiveWord = positiveWordList.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))
  const hasPositivePhrase = positivePhrases.some(p => lower.includes(p))
  if (hasPositiveWord || hasPositivePhrase) return 'positive'
  
  return 'neutral'
}// ============================================
// MAIN AGENT HANDLER
// ============================================

export async function handleReceptionistCall(
  userMessage: string,
  previousState?: Partial<ReceptionistState>
): Promise<ReceptionistState> {
  // Initialize state
  const messages = previousState?.messages || []
  messages.push(new HumanMessage(userMessage))
  
  const initialState: ReceptionistState = {
    messages,
    caller_info: previousState?.caller_info || null,
    conversation_stage: previousState?.conversation_stage || 'greeting',
    active_agent: 'receptionist',
    context: previousState?.context || {
      business_id: 'default',
      industry: 'corporate',
      caller_intent: null,
      scheduled_callback: false,
      message_taken: null,
      transfer_to: null,
      appointments: [],
      frequently_asked: []
    },
    pending_action: null,
    memory_retrieved: false,
    tools_used: [],
    sentiment: 'neutral',
    requires_human: false,
    summary: ''
  }
  
  // Route to appropriate agent
  const agentType = await routeToAgent(initialState)
  
  // Run the agent
  const result = await runAgent(initialState, agentType)
  
  // Check for human intervention needs
  if (result.sentiment === 'negative' || initialState.requires_human) {
    const transferResult = await runAgent(
      { ...initialState, ...result } as ReceptionistState,
      'transfer'
    )
    return { ...initialState, ...result, ...transferResult, requires_human: true }
  }
  
  return { ...initialState, ...result }
}

// Core LLM-based sentiment analysis for testing
async function analyzeSentimentLLM(text: string): Promise<{ sentiment: string; confidence: number }> {
  if (!text) {
    console.log('[SENTIMENT_DEBUG] No text provided')
    return { sentiment: 'neutral', confidence: 0.5 }
  }

  try {
    const response = await llm.invoke([
      new SystemMessage(`Analyze the sentiment of the customer message below.
Respond with ONLY a single word: "positive", "neutral", or "negative".

- negative: frustrated, angry, complaining, demanding, upset, cursing, rude, threatening, unacceptable, bad service
- neutral: factual, asking questions, informational
- positive: satisfied, grateful, polite, happy, complimentary`),
      new HumanMessage(text.slice(0, 1000))
    ])

    const raw = (response.content as string)
    const lower = raw.toLowerCase().trim()

    console.log('[SENTIMENT_DEBUG]', JSON.stringify({
      text_preview: text.slice(0, 100),
      llm_raw: raw,
      lower
    }))

    if (lower.includes('negative')) return { sentiment: 'negative', confidence: 0.85 }
    if (lower.includes('positive')) return { sentiment: 'positive', confidence: 0.85 }
    return { sentiment: 'neutral', confidence: 0.5 }
  } catch (e) {
    console.log('[SENTIMENT_DEBUG_ERROR]', String(e).slice(0, 500))
    return { sentiment: 'neutral', confidence: 0.5 }
  }
}

// Export tools for external use
export { tools, analyzeSentimentTool, analyzeSentimentLLM }