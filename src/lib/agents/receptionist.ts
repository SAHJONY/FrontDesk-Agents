// Multi-Agent AI Receptionist System
// Advanced orchestration with supervisor pattern, tool use, and memory
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { tool } from '@langchain/core/tools'
import type { ReceptionistState } from '../ai/types'

// Initialize the LLM with NVIDIA NIM (OpenAI-compatible endpoint)
const llm = new ChatOpenAI({
  model: 'z-ai/glm-5.1',
  temperature: 0.7,
  streaming: true,
  apiKey: process.env.NVIDIA_NIM_API_KEY || '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',
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
    business_name: 'FrontDesk Agents',
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

const analyzeSentimentTool = tool(async (args: { text?: string; context?: string } | undefined) => {
  const text = args?.text || ''
  const context = args?.context || ''

  if (!text && !context) return { sentiment: 'neutral', confidence: 0.5 }

  const response = await llm.invoke([
    new SystemMessage(`You are a sentiment analysis expert. Analyze the customer's message for sentiment.

Return ONLY valid JSON with exactly two fields:
- "sentiment": one of "positive", "neutral", or "negative"
- "confidence": a number between 0 and 1

Guidelines:
- positive: satisfied, grateful, polite, happy, complimentary, calm
- neutral: factual, asking questions, informational, indifferent
- negative: frustrated, angry, complaining, threatening, rude, urgent, demanding

Be conservative — only mark negative if there is clear frustration, anger, or complaint.`),
    new HumanMessage(`Customer message: ${text}

Conversation context: ${context}`)
  ])

  try {
    // Strip markdown code blocks that GLM-5.1 may wrap JSON in
    const cleaned = (response.content as string)
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    return {
      sentiment: parsed.sentiment || 'neutral',
      confidence: parsed.confidence || 0.85
    }
  } catch {
    return { sentiment: 'neutral', confidence: 0.5 }
  }
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

const tools = [
  scheduleAppointmentTool,
  lookupBusinessTool,
  transferCallTool,
  takeVoicemailTool,
  analyzeSentimentTool,
  checkAvailabilityTool
]

const llmWithTools = llm.bindTools(tools)

// ============================================
// AGENT ORCHESTRATION
// ============================================

type AgentType = 'receptionist' | 'scheduler' | 'faq' | 'transfer' | 'voicemail'

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
- transfer: Requests to speak with human, specific departments
- voicemail: Caller wants to leave a message

Return ONLY the agent name.`)
  ])
  
  const agentName = (response.content as string).toLowerCase().trim()
  if (['receptionist', 'scheduler', 'faq', 'transfer', 'voicemail'].includes(agentName)) {
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
      systemPrompt = `You are a FAQ specialist with access to business information.
      
Business Info: ${JSON.stringify(business)}
Caller Question: ${messages[messages.length - 1]?.content || ''}

Answer from business info. If unknown, offer to transfer to human.`
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
  }
  
  // Invoke LLM with relevant tools
  const llmToUse = additionalTools.length > 0 ? llm.bindTools(additionalTools) : llmWithTools
  
  const response = await llmToUse.invoke([
    new SystemMessage(systemPrompt),
    ...messages
  ])
  
  // Analyze sentiment based on the customer's actual message
  const customerMessage = [...messages].reverse().find(m => m._getType() === 'human')
  const customerText = customerMessage?.content?.toString() || ''
  const sentimentResult = await analyzeSentimentTool.invoke({
    text: customerText,
    context: `Agent response: ${(response.content as string).slice(0, 300)}
Stage: ${agentType}
Intent: ${context.caller_intent || 'unknown'}`
  })
  
  // Determine next stage
  let nextStage = state.conversation_stage
  if (agentType === 'scheduler') nextStage = 'schedule'
  if (agentType === 'transfer') nextStage = 'transfer'
  if (agentType === 'voicemail') nextStage = 'close'
  
  return {
    messages: [...messages, new AIMessage(response.content as string)],
    active_agent: agentType,
    conversation_stage: nextStage,
    sentiment: sentimentResult.sentiment as 'positive' | 'neutral' | 'negative',
    tools_used: [...state.tools_used, agentType]
  }
}

// ============================================
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
    return { ...initialState, ...result, ...transferResult }
  }
  
  return { ...initialState, ...result }
}

// Export tools for external use
export { tools }