/**
 * OpenAI Integration Module
 * Provides OpenAI GPT APIs as primary AI provider
 */

export interface OpenAIConfig {
  apiKey: string
  baseURL?: string
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
  stop?: string | string[]
}

export interface OpenAIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  stopReason?: string
}

let openaiApiKey: string = ''
let openaiBaseURL = 'https://api.openai.com/v1'
let defaultModel = 'gpt-4-turbo'
let maxTokensDefault = 2000

export function initializeOpenAI(config: OpenAIConfig): void {
  openaiApiKey = config.apiKey
  openaiBaseURL = config.baseURL || openaiBaseURL
  defaultModel = config.defaultModel || defaultModel
  maxTokensDefault = config.maxTokens || maxTokensDefault
  console.log('[OpenAI] Client initialized with base URL:', openaiBaseURL)
  console.log('[OpenAI] Default model:', defaultModel)
}

export function isConfigured(): boolean {
  return !!openaiApiKey && openaiApiKey.length > 0
}

export function getAPIKey(): string {
  return openaiApiKey
}

export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<OpenAIResponse> {
  if (!isConfigured()) {
    throw new Error('OpenAI not initialized')
  }

  const model = options.model || defaultModel
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens || maxTokensDefault

  const response = await fetch(`${openaiBaseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
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
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
    model: data.model || model,
    stopReason: data.choices?.[0]?.finish_reason || undefined,
  }
}

export async function complete(
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions
): Promise<OpenAIResponse> {
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
    response_format: { type: 'json_object' },
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

// Available OpenAI models
export const OPENAI_MODELS = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable, fast for complex tasks' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest GPT-4 model, excellent all-around' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, cost-effective small model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and inexpensive' },
]

export function getAvailableModels(): string[] {
  return OPENAI_MODELS.map(m => m.id)
}

export function getModelInfo(modelId: string): typeof OPENAI_MODELS[number] | undefined {
  return OPENAI_MODELS.find(m => m.id === modelId)
}

export default {
  initializeOpenAI,
  isConfigured,
  getAPIKey,
  chat,
  complete,
  chatJSON,
  getAvailableModels,
  getModelInfo,
  OPENAI_MODELS,
}