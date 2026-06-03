/**
 * OpenAI Integration Module
 * Provides GPT-4 and other OpenAI models for platform enhancement
 */

import OpenAI from 'openai'

// Types
export interface OpenAIConfig {
  apiKey: string
  organization?: string
  defaultModel?: string
  maxTokens?: number
  temperature?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string[]
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, { type: string; description?: string }>
    required?: string[]
  }
}

// Singleton client
let openaiClient: OpenAI | null = null

/**
 * Initialize OpenAI client
 */
export function initializeOpenAI(config: OpenAIConfig): void {
  openaiClient = new OpenAI({
    apiKey: config.apiKey,
    organization: config.organization,
  })
  console.log('[OpenAI] Client initialized')
}

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI | null {
  return openaiClient
}

/**
 * Check if OpenAI is configured
 */
export function isConfigured(): boolean {
  return !!openaiClient
}

/**
 * Send chat completion request
 */
export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<{ content: string; usage?: any; model: string }> {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized')
  }

  const model = options.model || 'gpt-4-turbo'
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens || 2000

  const response = await openaiClient.chat.completions.create({
    model,
    messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
    temperature,
    max_tokens: maxTokens,
    top_p: options.topP,
    frequency_penalty: options.frequencyPenalty,
    presence_penalty: options.presencePenalty,
    stop: options.stop,
  })

  return {
    content: response.choices[0]?.message?.content || '',
    usage: response.usage,
    model: response.model,
  }
}

/**
 * Create completion with system prompt
 */
export async function complete(
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions
): Promise<{ content: string; usage?: any; model: string }> {
  const messages: ChatMessage[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })
  
  return chat(messages, options)
}

/**
 * Use GPT-4 Vision for image analysis
 */
export async function vision(
  imageUrl: string,
  prompt: string,
  options?: CompletionOptions
): Promise<{ content: string; usage?: any }> {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized')
  }

  const response = await openaiClient.chat.completions.create({
    model: options?.model || 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ],
      },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens || 2000,
  })

  return {
    content: response.choices[0]?.message?.content || '',
    usage: response.usage,
  }
}

/**
 * Create embedding for text
 */
export async function createEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<{ embedding: number[]; usage?: any }> {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized')
  }

  const response = await openaiClient.embeddings.create({
    model,
    input: text,
  })

  return {
    embedding: response.data[0]?.embedding || [],
    usage: response.usage,
  }
}

/**
 * Use function calling / tool use
 */
export async function chatWithTools(
  messages: ChatMessage[],
  tools: ToolDefinition[],
  options?: CompletionOptions
): Promise<{ content: string; toolCalls?: any[]; finishReason: string }> {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized')
  }

  const response = await openaiClient.chat.completions.create({
    model: options?.model || 'gpt-4-turbo',
    messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
    tools: tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    })),
    temperature: options?.temperature ?? 0,
  })

  const message = response.choices[0]?.message
  
  return {
    content: message?.content || '',
    toolCalls: message?.tool_calls,
    finishReason: response.choices[0]?.finish_reason || 'stop',
  }
}

/**
 * Fine-tuned task-specific prompts
 */

// Customer sentiment analysis
export async function analyzeCustomerSentiment(customerMessage: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  summary: string
  recommendations?: string[]
}> {
  const result = await complete(
    `Analyze this customer message and provide a structured analysis:
    
    Message: "${customerMessage}"
    
    Return JSON with:
    - sentiment: "positive" | "negative" | "neutral"
    - score: number from 0 to 1
    - summary: brief summary of the sentiment
    - recommendations: array of suggested actions (if negative)`,
    `You are a customer sentiment analyzer. Always return valid JSON.`,
    { temperature: 0.3, maxTokens: 500 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return { sentiment: 'neutral', score: 0.5, summary: result.content }
  }
}

// Call summary generation
export async function generateCallSummary(callTranscript: string): Promise<{
  summary: string
  keyPoints: string[]
  actionItems: string[]
  sentiment: string
  followUpRecommended: boolean
}> {
  const result = await complete(
    `Generate a structured call summary from this transcript:
    
    Transcript:
    ${callTranscript}
    
    Return JSON with:
    - summary: brief overview
    - keyPoints: array of important points
    - actionItems: array of required actions
    - sentiment: overall call sentiment
    - followUpRecommended: boolean`,
    `You are a call analysis AI. Create concise, actionable summaries. Always return valid JSON.`,
    { temperature: 0.5, maxTokens: 800 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      summary: result.content,
      keyPoints: [],
      actionItems: [],
      sentiment: 'neutral',
      followUpRecommended: false
    }
  }
}

// Intent classification for calls
export async function classifyCallIntent(userMessage: string): Promise<{
  intent: string
  confidence: number
  entities: Record<string, string>
  suggestedResponse: string
}> {
  const result = await complete(
    `Classify the intent of this user message and extract entities:
    
    Message: "${userMessage}"
    
    Return JSON with:
    - intent: the primary intent category
    - confidence: number 0-1
    - entities: extracted information (names, dates, numbers, etc.)
    - suggestedResponse: recommended response text`,
    `You are an intent classification AI for a voice platform. Classify into categories like: schedule_appointment, ask_pricing, file_claim, get_support, general_inquiry, etc. Always return valid JSON.`,
    { temperature: 0.3, maxTokens: 400 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      intent: 'unknown',
      confidence: 0,
      entities: {},
      suggestedResponse: userMessage
    }
  }
}

// Autonomous decision making for call flow
export async function decideCallAction(
  context: {
    callerIntent?: string
    callerHistory?: string[]
    timeOfDay?: string
    dayOfWeek?: string
  }
): Promise<{
  action: string
  confidence: number
  reasoning: string
  nextSteps: string[]
}> {
  const result = await complete(
    `Decide the best autonomous action for this call scenario:
    
    Context:
    ${JSON.stringify(context, null, 2)}
    
    Available actions:
    - transfer_to_agent: Connect to human agent
    - leave_voicemail: Take a message
    - schedule_callback: Book a callback appointment
    - provide_information: Answer with available data
    - escalate_urgent: Flag for urgent handling
    
    Return JSON with action, confidence (0-1), reasoning, and nextSteps array`,
    `You are an autonomous call handling AI. Make intelligent decisions that prioritize customer satisfaction and operational efficiency. Always return valid JSON.`,
    { temperature: 0.4, maxTokens: 500 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      action: 'transfer_to_agent',
      confidence: 0,
      reasoning: 'Fallback to human agent',
      nextSteps: ['transfer']
    }
  }
}

/**
 * Get available models
 */
export function getAvailableModels(): string[] {
  return [
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-4-vision-preview',
    'gpt-4-32k',
  ]
}

export default {
  initializeOpenAI,
  getOpenAIClient,
  isConfigured,
  chat,
  complete,
  vision,
  createEmbedding,
  chatWithTools,
  analyzeCustomerSentiment,
  generateCallSummary,
  classifyCallIntent,
  decideCallAction,
  getAvailableModels,
}