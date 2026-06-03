/**
 * Anthropic Integration Module
 * Provides Claude models for enhanced platform capabilities
 */

import Anthropic from '@anthropic-ai/sdk'

// Types
export interface AnthropicConfig {
  apiKey: string
  defaultModel?: string
  maxTokens?: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface CompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  stopSequences?: string[]
}

// Singleton client
let anthropicClient: Anthropic | null = null
let defaultModel = 'claude-sonnet-4-20250514'
let maxTokensDefault = 2000

/**
 * Initialize Anthropic client
 */
export function initializeAnthropic(config: AnthropicConfig): void {
  anthropicClient = new Anthropic({
    apiKey: config.apiKey,
  })
  defaultModel = config.defaultModel || 'claude-sonnet-4-20250514'
  maxTokensDefault = config.maxTokens || 2000
  console.log('[Anthropic] Client initialized')
}

/**
 * Get Anthropic client instance
 */
export function getAnthropicClient(): Anthropic | null {
  return anthropicClient
}

/**
 * Check if Anthropic is configured
 */
export function isConfigured(): boolean {
  return !!anthropicClient
}

/**
 * Send message to Claude
 */
export async function message(
  prompt: string,
  systemPrompt?: string,
  options: CompletionOptions = {}
): Promise<{ content: string; usage?: any; model: string; stopReason?: string }> {
  if (!anthropicClient) {
    throw new Error('Anthropic not initialized')
  }

  const model = options.model || defaultModel
  const maxTokens = options.maxTokens || maxTokensDefault

  const response = await anthropicClient.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature,
    top_p: options.topP,
    stop_sequences: options.stopSequences,
  })

  const content = response.content[0]
  const textContent = content.type === 'text' ? content.text : ''

  return {
    content: textContent,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
    model: response.model,
    stopReason: response.stop_reason || undefined,
  }
}

/**
 * Multi-step conversation with Claude
 */
export async function converse(
  messages: Message[],
  systemPrompt?: string,
  options: CompletionOptions = {}
): Promise<{ content: string; usage?: any; model: string }> {
  if (!anthropicClient) {
    throw new Error('Anthropic not initialized')
  }

  const model = options.model || defaultModel
  const maxTokens = options.maxTokens || maxTokensDefault

  const response = await anthropicClient.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    temperature: options.temperature,
  })

  const content = response.content[0]
  const textContent = content.type === 'text' ? content.text : ''

  return {
    content: textContent,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
    model: response.model,
  }
}

/**
 * Extended thinking with Claude (for complex reasoning)
 */
export async function think(
  prompt: string,
  systemPrompt?: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<{ content: string; thinking: string; usage?: any }> {
  if (!anthropicClient) {
    throw new Error('Anthropic not initialized')
  }

  const response = await anthropicClient.messages.create({
    model: 'claude-opus-4-20250514', // Opus for complex reasoning
    max_tokens: options.maxTokens || 4000,
    system: systemPrompt || `You are a deep reasoning AI. Show your thinking process, then provide a structured response.`,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.7,
  })

  // Claude doesn't have built-in thinking trace in the same way
  // but we can use the response to simulate it
  const content = response.content[0]
  const textContent = content.type === 'text' ? content.text : ''

  return {
    content: textContent,
    thinking: '', // Could be enhanced with custom thinking logs
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
  }
}

// ============================================================================
// Platform-specific AI functions
// ============================================================================

/**
 * Complex reasoning for call handling decisions
 */
export async function analyzeCallScenario(
  scenario: {
    callerProfile?: string
    intent?: string
    sentiment?: string
    history?: string[]
    timeContext?: string
  }
): Promise<{
  analysis: string
  recommendation: string
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
  nextSteps: string[]
}> {
  const result = await message(
    `Analyze this call scenario and provide a detailed recommendation:
    
    Scenario: ${JSON.stringify(scenario, null, 2)}
    
    Provide a structured analysis with:
    - analysis: detailed reasoning about the scenario
    - recommendation: specific action to take
    - riskLevel: low/medium/high
    - confidence: 0-1 score
    - nextSteps: array of recommended actions`,
    `You are an expert call center AI analyst with deep knowledge of customer service, risk assessment, and operational efficiency. Provide thorough, nuanced analysis.`,
    { temperature: 0.5, maxTokens: 1000 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      analysis: result.content,
      recommendation: 'transfer_to_agent',
      riskLevel: 'medium',
      confidence: 0.5,
      nextSteps: ['review', 'transfer']
    }
  }
}

/**
 * Generate intelligent responses for voice AI
 */
export async function generateVoiceResponse(
  context: {
    intent: string
    entities: Record<string, string>
    sentiment: string
    conversationHistory?: string[]
  }
): Promise<{
  response: string
  confidence: number
  suggestedPhrases: string[]
  followUpQuestions: string[]
}> {
  const result = await message(
    `Generate an intelligent voice response for this scenario:
    
    Context: ${JSON.stringify(context, null, 2)}
    
    Return JSON with:
    - response: the primary response to speak
    - confidence: how confident you are (0-1)
    - suggestedPhrases: alternative phrasings
    - followUpQuestions: questions to ask next`,
    `You are an expert voice AI response generator. Create natural, empathetic, and effective responses for phone conversations. Keep responses concise (under 30 words for main response).`,
    { temperature: 0.7, maxTokens: 600 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      response: "Let me connect you with an agent who can help.",
      confidence: 0.5,
      suggestedPhrases: [],
      followUpQuestions: []
    }
  }
}

/**
 * Autonomous decision making - more advanced than OpenAI version
 */
export async function autonomousDecision(
  context: Record<string, unknown>,
  possibleActions: string[],
  constraints: string[]
): Promise<{
  decision: string
  reasoning: string
  confidence: number
  alternativeOptions: string[]
  shouldEscalate: boolean
}> {
  const result = await message(
    `Make an autonomous decision given these constraints:
    
    Context: ${JSON.stringify(context, null, 2)}
    Possible Actions: ${possibleActions.join(', ')}
    Constraints: ${constraints.join(', ')}
    
    Return JSON with:
    - decision: the chosen action
    - reasoning: detailed explanation
    - confidence: 0-1 score
    - alternativeOptions: backup plans if primary fails
    - shouldEscalate: whether to involve human`,
    `You are an autonomous decision-making AI. Balance customer satisfaction, operational efficiency, and risk management. Be decisive but acknowledge uncertainty. Always return valid JSON.`,
    { temperature: 0.4, maxTokens: 800 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      decision: possibleActions[0],
      reasoning: 'Fallback to default action',
      confidence: 0,
      alternativeOptions: possibleActions.slice(1),
      shouldEscalate: true
    }
  }
}

/**
 * Document intelligence - extract and summarize information
 */
export async function extractDocumentInfo(
  documentText: string,
  documentType: 'invoice' | 'claim' | 'contract' | 'medical' | 'other'
): Promise<{
  summary: string
  keyData: Record<string, string>
  flags: string[]
  recommendedActions: string[]
}> {
  const result = await message(
    `Extract key information from this ${documentType} document:
    
    Document:
    ${documentText}
    
    Return JSON with:
    - summary: brief overview
    - keyData: extracted fields and values
    - flags: any concerning items or anomalies
    - recommendedActions: follow-up actions`,
    `You are a document analysis AI. Extract relevant information accurately and flag any potential issues. Be thorough but concise. Always return valid JSON.`,
    { temperature: 0.3, maxTokens: 1000 }
  )

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      summary: documentText.substring(0, 200),
      keyData: {},
      flags: [],
      recommendedActions: ['review_manually']
    }
  }
}

/**
 * Get available Claude models
 */
export function getAvailableModels(): { id: string; name: string; description: string }[] {
  return [
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable, for complex reasoning' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Balanced for most tasks' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Fast and capable' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Complex reasoning legacy' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced legacy model' },
  ]
}

export default {
  initializeAnthropic,
  getAnthropicClient,
  isConfigured,
  message,
  converse,
  think,
  analyzeCallScenario,
  generateVoiceResponse,
  autonomousDecision,
  extractDocumentInfo,
  getAvailableModels,
}