/**
 * Anthropic Integration Module
 * Provides Anthropic Claude APIs as alternative AI provider
 */

export interface AnthropicConfig {
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
  stop?: string | string[]
}

export interface AnthropicResponse {
  content: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
  model: string
  stopReason?: string
}

let anthropicApiKey: string = ''
let anthropicBaseURL = 'https://api.anthropic.com/v1'
let defaultModel = 'claude-sonnet-4-20250514'
let maxTokensDefault = 2000

export function initializeAnthropic(config: AnthropicConfig): void {
  anthropicApiKey = config.apiKey
  anthropicBaseURL = config.baseURL || anthropicBaseURL
  defaultModel = config.defaultModel || defaultModel
  maxTokensDefault = config.maxTokens || maxTokensDefault
  console.log('[Anthropic] Client initialized with base URL:', anthropicBaseURL)
  console.log('[Anthropic] Default model:', defaultModel)
}

export function isConfigured(): boolean {
  return !!anthropicApiKey && anthropicApiKey.length > 0
}

export function getAPIKey(): string {
  return anthropicApiKey
}

export async function chat(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<AnthropicResponse> {
  if (!isConfigured()) {
    throw new Error('Anthropic not initialized')
  }

  const model = options.model || defaultModel
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens || maxTokensDefault

  // Convert messages to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system')
  const userMessages = messages.filter(m => m.role !== 'system')

  const anthropicMessages = userMessages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }))

  const response = await fetch(`${anthropicBaseURL}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: anthropicMessages,
      system: systemMessage?.content,
      temperature,
      max_tokens: maxTokens,
      top_p: options.topP,
      stop_sequences: options.stop ? (Array.isArray(options.stop) ? options.stop : [options.stop]) : undefined,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  return {
    content: data.content?.[0]?.text || '',
    usage: data.usage ? {
      input_tokens: data.usage.input_tokens || 0,
      output_tokens: data.usage.output_tokens || 0,
    } : undefined,
    model: data.model || model,
    stopReason: data.stop_reason || undefined,
  }
}

export async function complete(
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions
): Promise<AnthropicResponse> {
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
  // Add JSON output instruction to system prompt
  const enhancedMessages = messages.map(m => {
    if (m.role === 'system') {
      return { ...m, content: m.content + '\n\nIMPORTANT: You must respond with valid JSON only, no additional text.' }
    }
    return m
  })
  
  const response = await chat(enhancedMessages, {
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

// Available Anthropic models
export const ANTHROPIC_MODELS = [
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable, complex reasoning' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Balanced capability and speed' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Great performance, fast' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast, cost-effective' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'High capability reasoning' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
]

export function getAvailableModels(): string[] {
  return ANTHROPIC_MODELS.map(m => m.id)
}

export function getModelInfo(modelId: string): typeof ANTHROPIC_MODELS[number] | undefined {
  return ANTHROPIC_MODELS.find(m => m.id === modelId)
}

export default {
  initializeAnthropic,
  isConfigured,
  getAPIKey,
  chat,
  complete,
  chatJSON,
  getAvailableModels,
  getModelInfo,
  ANTHROPIC_MODELS,
}
export function getClaudeModels() {
  return ANTHROPIC_MODELS.map(m => ({ ...m, provider: 'anthropic' as const }))
}
