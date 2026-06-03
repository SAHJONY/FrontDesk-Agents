/**
 * NVIDIA AI Integration Module
 * Provides NVIDIA NIM APIs (Llama, Mistral, etc.) as fallback AI provider
 * Base URL: https://integrate.api.nvidia.com/v1
 */

import type { ChatMessage, CompletionOptions } from './openai-integration'

// Types
export interface NVIDIAConfig {
  apiKey: string
  baseURL?: string
  defaultModel?: string
  maxTokens?: number
  temperature?: number
}

export interface NVIDIAResponse {
  content: string
  usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
  model: string
  stopReason?: string
}

// Singleton client state
let nvidiaApiKey: string = ''
let nvidiaBaseURL = 'https://integrate.api.nvidia.com/v1'
let defaultModel = 'google/gemma-2-2b-it'
let maxTokensDefault = 2000

// Autonomous model fallback state
let modelFailures: string[] = []
let currentModelIndex = 0

export function resetModelFailures(): void {
  modelFailures = []
  currentModelIndex = 0
}

export function recordModelFailure(modelId: string): void {
  if (!modelFailures.includes(modelId)) {
    modelFailures.push(modelId)
  }
}

export function getNextAvailableModel(preferredCategory?: keyof typeof MODEL_CATEGORIES): string | null {
  const tryModels = preferredCategory 
    ? [...getModelsByCategory(preferredCategory), ...getVerifiedModels()]
    : getVerifiedModels()
  
  const availableModels = tryModels.filter(
    (m, index, self) => 
      self.findIndex(x => x.id === m.id) === index && 
      !modelFailures.includes(m.id)
  )
  
  if (availableModels.length === 0) {
    return null
  }
  
  for (let i = 0; i < availableModels.length; i++) {
    const model = availableModels[i]
    if (!modelFailures.includes(model.id)) {
      return model.id
    }
  }
  
  return null
}

export function getModelFallbackChain(modelId: string): string[] {
  const modelIndex = NVIDIA_MODELS.findIndex(m => m.id === modelId)
  if (modelIndex === -1) return []
  
  return NVIDIA_MODELS.slice(modelIndex + 1)
    .filter(m => m.verified)
    .map(m => m.id)
}

export async function completeWithAutonomousFallback(
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions,
  maxRetries: number = 5
): Promise<{ content: string; model: string; modelsTried: string[]; success: boolean }> {
  resetModelFailures()
  
  const modelsTried: string[] = []
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const model = getNextAvailableModel()
    
    if (!model) {
      break
    }
    
    modelsTried.push(model)
    console.log(`[NVIDIA] Attempt ${attempt + 1}: Trying model ${model}`)
    
    try {
      const result = await complete(prompt, systemPrompt, { 
        ...options, 
        model 
      })
      
      console.log(`[NVIDIA] Success with model ${model}`)
      return { 
        content: result.content, 
        model, 
        modelsTried, 
        success: true 
      }
    } catch (error) {
      console.error(`[NVIDIA] Model ${model} failed:`, error)
      recordModelFailure(model)
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }
  
  return { 
    content: '', 
    model: modelsTried[modelsTried.length - 1] || 'none',
    modelsTried, 
    success: false,
  }
}

export async function testModel(modelId: string, timeoutMs: number = 10000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    
    const response = await fetch(`${nvidiaBaseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      }),
      signal: controller.signal,
    })
    
    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
}

export function initializeNVIDIA(config: NVIDIAConfig): void {
  nvidiaApiKey = config.apiKey
  nvidiaBaseURL = config.baseURL || nvidiaBaseURL
  defaultModel = config.defaultModel || defaultModel
  maxTokensDefault = config.maxTokens || maxTokensDefault
  console.log('[NVIDIA AI] Client initialized with base URL:', nvidiaBaseURL)
  console.log('[NVIDIA AI] Default model:', defaultModel)
}

export function isConfigured(): boolean {
  return !!nvidiaApiKey && nvidiaApiKey.length > 0
}

export function getAPIKey(): string {
  return nvidiaApiKey
}

export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<NVIDIAResponse> {
  if (!isConfigured()) {
    throw new Error('NVIDIA AI not initialized')
  }

  const model = options.model || defaultModel
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens || maxTokensDefault

  const response = await fetch(`${nvidiaBaseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${nvidiaApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage ? {
      input_tokens: data.usage.prompt_tokens || 0,
      output_tokens: data.usage.completion_tokens || 0,
      total_tokens: data.usage.total_tokens || 0,
    } : undefined,
    model: data.model || model,
    stopReason: data.choices?.[0]?.finish_reason || undefined,
  }
}

export async function complete(
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions
): Promise<NVIDIAResponse> {
  const messages: ChatMessage[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })
  
  return chat(messages, options)
}

export async function chatJSON(
  messages: ChatMessage[],
  schema: Record<string, any>,
  options: CompletionOptions = {}
): Promise<{ content: any; raw: string }> {
  const response = await chat(messages, {
    ...options,
  })
  
  try {
    return {
      content: JSON.parse(response.content),
      raw: response.content,
    }
  } catch {
    return {
      content: null,
      raw: response.content,
    }
  }
}

export async function analyzeCustomerSentiment(customerMessage: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  summary: string
  recommendations?: string[]
}> {
  const result = await complete(
    `Analyze this customer message and provide a structured analysis:\n    \n    Message: "${customerMessage}"\n    \n    Return JSON with:\n    - sentiment: "positive" | "negative" | "neutral"\n    - score: number from 0 to 1\n    - summary: brief summary of the sentiment\n    - recommendations: array of suggested actions (if negative)`,
    `You are a customer sentiment analyzer. Always return valid JSON.`,
    { temperature: 0.3, maxTokens: 500 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return { sentiment: 'neutral', score: 0.5, summary: result.content }
  }
}

export async function generateCallSummary(callTranscript: string): Promise<{
  summary: string
  keyPoints: string[]
  actionItems: string[]
  sentiment: string
  followUpRecommended: boolean
}> {
  const result = await complete(
    `Generate a structured call summary from this transcript:\n    \n    Transcript:\n    ${callTranscript}\n    \n    Return JSON with:\n    - summary: brief overview\n    - keyPoints: array of important points\n    - actionItems: array of required actions\n    - sentiment: overall call sentiment\n    - followUpRecommended: boolean`,
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

export async function classifyCallIntent(userMessage: string): Promise<{
  intent: string
  confidence: number
  entities: Record<string, string>
  suggestedResponse: string
}> {
  const result = await complete(
    `Classify the intent of this user message and extract entities:\n    \n    Message: "${userMessage}"\n    \n    Return JSON with:\n    - intent: the primary intent category\n    - confidence: number 0-1\n    - entities: extracted information (names, dates, numbers, etc.)\n    - suggestedResponse: recommended response text`,
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
    `Decide the best autonomous action for this call scenario:\n    \n    Context:\n    ${JSON.stringify(context, null, 2)}\n    \n    Available actions:\n    - transfer_to_agent: Connect to human agent\n    - leave_voicemail: Take a message\n    - schedule_callback: Book a callback appointment\n    - provide_information: Answer with available data\n    - escalate_urgent: Flag for urgent handling\n    \n    Return JSON with action, confidence (0-1), reasoning, and nextSteps array`,
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

// ============================================================================
// Available Models
// ============================================================================

export const MODEL_CATEGORIES = {
  QUICK_TEST: 'Quick Test (Fast)',
  BALANCED: 'Balanced (Medium)',
  ADVANCED: 'Advanced (Larger)',
} as const

export interface NVIDIAModelConfig {
  id: string
  name: string
  description: string
  category: 'QUICK_TEST' | 'BALANCED' | 'ADVANCED'
  verified: boolean
  reasoning?: boolean
}

export const NVIDIA_MODELS: NVIDIAModelConfig[] = [
  { id: 'google/gemma-2-2b-it', name: 'Gemma 2 2B ⚡', description: 'Ultra-fast, great for simple tasks', category: 'QUICK_TEST', verified: true },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B ⚡', description: 'Smallest Llama, blazing fast', category: 'QUICK_TEST', verified: true },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B ⚡', description: 'Compact Llama with good quality', category: 'QUICK_TEST', verified: true },
  { id: 'nvidia/nemotron-mini-4b-instruct', name: 'Nemotron Mini 4B ⚡', description: 'On-device SLM, roleplay, RAG, function calling', category: 'QUICK_TEST', verified: true },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Fast, efficient, great all-rounder', category: 'BALANCED', verified: true },
  { id: 'mistralai/mistral-7b-instruct-v0.3', name: 'Mistral 7B', description: 'Classic Mistral, reliable performance', category: 'BALANCED', verified: true },
  { id: 'google/gemma-3-4b-it', name: 'Gemma 3 4B', description: 'Google efficient model', category: 'BALANCED', verified: false },
  { id: 'mistralai/mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B 🌟', description: 'MoE architecture, excellent value', category: 'BALANCED', verified: true },
  { id: 'mistralai/ministral-14b-instruct-2512', name: 'Ministral 14B', description: 'Mistral compact model', category: 'BALANCED', verified: true },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B 💪', description: 'High capability, complex reasoning', category: 'ADVANCED', verified: true },
  { id: 'google/gemma-2-27b-instruct', name: 'Gemma 2 27B', description: 'Balanced large model', category: 'ADVANCED', verified: false },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B', description: 'Google latest, strong reasoning', category: 'ADVANCED', verified: true },
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash 🌟', description: '284B MoE, 1M context, coding/agents', category: 'ADVANCED', verified: false },
  { id: 'minimaxai/minimax-m2.7', name: 'MiniMax M2.7', description: '230B text-to-text, coding/reasoning', category: 'ADVANCED', verified: false },
  { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen3.5 122B', description: '122B MoE (10B active), agent-ready', category: 'ADVANCED', verified: false },
  { id: 'mistralai/mistral-medium-3.5-128b', name: 'Mistral Medium 3.5 128B', description: 'High performing for coding and agentic use', category: 'ADVANCED', verified: false },
  { id: 'mistralai/mistral-small-4-119b-2603', name: 'Mistral Small 4 119B', description: 'Hybrid MoE, 256k context, multimodal', category: 'ADVANCED', verified: false },
  { id: 'stepfun-ai/step-3.7-flash', name: 'Step 3.7 Flash', description: 'Enterprise MoE, agentic and coding tasks', category: 'ADVANCED', verified: false },
  { id: 'stepfun-ai/step-3.5-flash', name: 'Step 3.5 Flash', description: '200B open-source reasoning engine', category: 'ADVANCED', verified: false },
  { id: 'z-ai/glm-5.1', name: 'GLM-5.1', description: 'Agentic workflows, coding, long-horizon reasoning', category: 'ADVANCED', verified: false },
  { id: 'mistralai/mistral-large-3-675b-instruct-2512', name: 'Mistral Large 3 675B 🏆', description: 'State-of-the-art MoE VLM for chat and agentic', category: 'ADVANCED', verified: false },
  { id: 'qwen/qwen3-next-80b-a3b-instruct', name: 'Qwen3 Next 80B', description: 'Hybrid attention + sparse MoE, ultra-long context', category: 'ADVANCED', verified: false },
  { id: 'qwen/qwen3-coder-480b-a35b-instruct', name: 'Qwen3 Coder 480B 💻', description: '480B MoE (35B active), agentic coding, 256K context', category: 'ADVANCED', verified: false },
  { id: 'bytedance/seed-oss-36b-instruct', name: 'Seed OSS 36B', description: 'Long-context reasoning and agentic intelligence', category: 'ADVANCED', verified: false },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron Nano 30B ⚠️', description: 'Efficient MoE, 1M context, reasoning model', category: 'ADVANCED', verified: true, reasoning: true },
  { id: 'mistralai/mistral-nemotron', name: 'Mistral Nemotron', description: 'Agentic workflows, coding, function calling', category: 'ADVANCED', verified: false },
  { id: 'deepseek-ai/deepseek-coder-6.7b-instruct', name: 'DeepSeek Coder 6.7B', description: 'Code-specialized model', category: 'ADVANCED', verified: false },
]

export function getModelsByCategory(category: keyof typeof MODEL_CATEGORIES) {
  return NVIDIA_MODELS.filter(m => m.category === category)
}

export function getVerifiedModels() {
  return NVIDIA_MODELS.filter(m => m.verified)
}

export function getAvailableModels(): string[] {
  return NVIDIA_MODELS.map(m => m.id)
}

export function getModelInfo(modelId: string): typeof NVIDIA_MODELS[number] | undefined {
  return NVIDIA_MODELS.find(m => m.id === modelId)
}


export default {
  initializeNVIDIA,
  isConfigured,
  getAPIKey,
  chat,
  complete,
  chatJSON,
  analyzeCustomerSentiment,
  generateCallSummary,
  classifyCallIntent,
  decideCallAction,
  getAvailableModels,
  getModelInfo,
  getModelsByCategory,
  getVerifiedModels,
  getNextAvailableModel,
  getModelFallbackChain,
  completeWithAutonomousFallback,
  testModel,
  resetModelFailures,
  recordModelFailure,
  NVIDIA_MODELS,
  MODEL_CATEGORIES,
}
export function getNvidiaModels() {
  return NVIDIA_MODELS.map(m => ({ ...m, provider: 'nvidia' as const }))
}
