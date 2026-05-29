// Multi-Agent AI Receptionist System
// Advanced orchestration with supervisor pattern, tool use, and memory
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { tool } from '@langchain/core/tools'
import type { ReceptionistState } from '../ai/types'

// Initialize the LLM
const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  streaming: true
})

// ============================================
// TOOLS: Function calling capabilities
// ============================================

const scheduleAppointmentTool = tool(async ({ datetime, service, caller_name }: {
  datetime: string; service: string; caller_name: string
}) => {
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

const lookupBusinessTool = tool(async ({ business_id }: { business_id: string }) => {
  return {
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

const transferCallTool = tool(async ({ department, caller_name }: {
  department: string; caller_name: string
}) => {
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

const takeVoicemailTool = tool(async ({ message, caller_name, callback_number }: {
  message: string; caller_name: string; callback_number: string
}) => {
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

const analyzeSentimentTool = tool(async ({ text }: { text: string }) => {
  const positiveWords = ['thank', 'great', 'excellent', 'happy', 'love', 'perfect', 'awesome']
  const negativeWords = ['frustrated', 'angry', 'problem', 'issue', 'bad', 'terrible', 'annoyed']
  const lower = text.toLowerCase()
  const hasPositive = positiveWords.some(w => lower.includes(w))
  const hasNegative = negativeWords.some(w => lower.includes(w))
  return {
    sentiment: hasNegative ? 'negative' : hasPositive ? 'positive' : 'neutral',
    confidence: 0.85
  }
}, {
  name: 'analyze_sentiment',
  description: 'Analyze the sentiment of the conversation.'
})

const checkAvailabilityTool = tool(async ({ date, service }: { date: string; service: string }) => {
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
  
  // Analyze sentiment
  const sentimentResult = await analyzeSentimentTool.invoke({ text: response.content as string })
  
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