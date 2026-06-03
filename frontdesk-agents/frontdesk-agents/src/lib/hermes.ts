/**
 * Hermes AI Agent - Main Brain & Orchestration Engine
 * Coordinates OpenAI, NVIDIA, Anthropic, and Bland AI for autonomous platform operations
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { initializeNVIDIA, isConfigured as isNvidiaConfigured, completeWithAutonomousFallback, resetModelFailures } from './nvidia-integration'

// Types
export interface AgentMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  model?: 'openai' | 'nvidia' | 'anthropic' | 'bland'
  tools?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: unknown
  error?: string
}

export interface AgentConfig {
  openaiKey?: string
  anthropicKey?: string
  nvidiaKey?: string
  blandKey?: string
  defaultModel: 'openai' | 'nvidia' | 'anthropic' | 'auto'
  fallbackOrder: ('openai' | 'nvidia' | 'anthropic')[]
  maxRetries: number
  timeout: number
}

export interface OrchestrationTask {
  id: string
  type: 'call' | 'message' | 'analysis' | 'automation' | 'decision'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: Record<string, unknown>
  output?: Record<string, unknown>
  createdAt: Date
  completedAt?: Date
  agent?: 'hermes' | 'openai' | 'anthropic' | 'bland'
}

// Singleton state
let openaiClient: OpenAI | null = null
let anthropicClient: Anthropic | null = null
let nvidiaConfigured = false

// Default configuration - NVIDIA PRIMARY (free models first, then paid fallbacks)
let agentConfig: AgentConfig = {
  defaultModel: 'nvidia',  // NVIDIA is primary - all free models
  fallbackOrder: ['nvidia', 'openai', 'anthropic'],  // NVIDIA first, then OpenAI, then Anthropic
  maxRetries: 3,
  timeout: 60000,  // Longer timeout for larger models
}

/**
 * Initialize Hermes with API keys
 */
export function initializeHermes(config: Partial<AgentConfig>): void {
  agentConfig = { ...agentConfig, ...config }
  
  if (config.openaiKey) {
    openaiClient = new OpenAI({ apiKey: config.openaiKey })
  }
  
  if (config.anthropicKey) {
    anthropicClient = new Anthropic({ apiKey: config.anthropicKey })
  }
  
  if (config.nvidiaKey) {
    initializeNVIDIA({ apiKey: config.nvidiaKey })
    nvidiaConfigured = isNvidiaConfigured()
  }
  
  // Set up fallback order from config or use default
  if (config.fallbackOrder) {
    agentConfig.fallbackOrder = config.fallbackOrder
  }
  
  console.log('[Hermes] AI Agent system initialized')
  console.log(`[Hermes] OpenAI: ${openaiClient ? 'configured' : 'not configured'}`)
  console.log(`[Hermes] NVIDIA: ${nvidiaConfigured ? 'configured' : 'not configured'}`)
  console.log(`[Hermes] Anthropic: ${anthropicClient ? 'configured' : 'not configured'}`)
}

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI | null {
  return openaiClient
}

/**
 * Get Anthropic client instance  
 */
export function getAnthropicClient(): Anthropic | null {
  return anthropicClient
}

/**
 * Check if NVIDIA is configured
 */
export function isNvidiaConfigured(): boolean {
  return nvidiaConfigured
}

/**
 * Determine which model to use based on configuration
 * PRIMARY: NVIDIA (free NIM models with autonomous fallback)
 * FALLBACK: OpenAI (paid), Anthropic (paid for complex reasoning)
 */
function selectModel(task: OrchestrationTask): 'openai' | 'nvidia' | 'anthropic' {
  // Use the configured default model (nvidia primary)
  return agentConfig.defaultModel as 'openai' | 'nvidia' | 'anthropic'
}

/**
 * Get the next available model in the fallback chain
 */
function getNextFallbackModel(currentModel: 'openai' | 'nvidia' | 'anthropic'): 'openai' | 'nvidia' | 'anthropic' | null {
  const order = agentConfig.fallbackOrder
  const currentIndex = order.indexOf(currentModel)
  
  if (currentIndex === -1 || currentIndex === order.length - 1) {
    return null
  }
  
  // Return next model in fallback chain
  const nextModel = order[currentIndex + 1]
  
  // Check if the next model is actually available
  if (nextModel === 'openai' && !openaiClient) return null
  if (nextModel === 'nvidia' && !nvidiaConfigured) return null
  if (nextModel === 'anthropic' && !anthropicClient) return null
  
  return nextModel
}

/**
 * Process task with AI - Main orchestration function with fallback support
 */
export async function processWithAI(
  task: OrchestrationTask,
  systemPrompt?: string
): Promise<{ success: boolean; result?: unknown; error?: string; agent: string; fallbackUsed?: boolean }> {
  let model = selectModel(task)
  let fallbackUsed = false
  
  while (model) {
    try {
      console.log(`[Hermes] Processing task ${task.id} with ${model}`)
      
      let result: unknown
      
      if (model === 'openai' && openaiClient) {
        result = await processWithOpenAI(task, systemPrompt)
      } else if (model === 'nvidia' && nvidiaConfigured) {
        result = await processWithNVIDIA(task, systemPrompt)
      } else if (model === 'anthropic' && anthropicClient) {
        result = await processWithAnthropic(task, systemPrompt)
      } else {
        throw new Error(`${model} not configured`)
      }
      
      return { success: true, result, agent: model, fallbackUsed }
    } catch (error) {
      console.error(`[Hermes] Task ${task.id} failed with ${model}:`, error)
      
      // Try fallback
      const nextModel = getNextFallbackModel(model)
      
      if (nextModel) {
        console.log(`[Hermes] Falling back from ${model} to ${nextModel}`)
        model = nextModel
        fallbackUsed = true
      } else {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          agent: model,
          fallbackUsed
        }
      }
    }
  }
  
  return { 
    success: false, 
    error: 'No AI providers available',
    agent: model || 'none',
    fallbackUsed
  }
}

/**
 * Process with OpenAI
 */
async function processWithOpenAI(
  task: OrchestrationTask,
  systemPrompt?: string
): Promise<unknown> {
  if (!openaiClient) throw new Error('OpenAI not configured')
  
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({
    role: 'user',
    content: formatTaskAsPrompt(task)
  })
  
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  })
  
  return response.choices[0]?.message?.content || 'No response'
}

/**
 * Process with Anthropic Claude
 */
async function processWithAnthropic(
  task: OrchestrationTask,
  systemPrompt?: string
): Promise<unknown> {
  if (!anthropicClient) throw new Error('Anthropic not configured')
  
  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt || getDefaultSystemPrompt(),
    messages: [
      { role: 'user', content: formatTaskAsPrompt(task) }
    ],
  })
  
  return response.content[0]?.type === 'text' ? response.content[0].text : 'No response'
}

/**
 * Process with NVIDIA NIM using autonomous model fallback
 * Automatically tries next available model if one fails
 */
async function processWithNVIDIA(
  task: OrchestrationTask,
  systemPrompt?: string
): Promise<unknown> {
  if (!nvidiaConfigured) throw new Error('NVIDIA not configured')
  
  // Reset failure tracking for new task
  resetModelFailures()
  
  // Use autonomous fallback to try multiple models if needed
  const result = await completeWithAutonomousFallback(
    formatTaskAsPrompt(task),
    systemPrompt || getDefaultSystemPrompt(),
    { temperature: 0.7, maxTokens: 2000 },
    5 // Try up to 5 different NVIDIA models
  )
  
  if (result.success) {
    console.log(`[Hermes] NVIDIA succeeded with model: ${result.model} (tried ${result.modelsTried.length} models)`)
    return result.content
  } else {
    console.error(`[Hermes] All NVIDIA models failed. Tried: ${result.modelsTried.join(', ')}`)
    throw new Error(`All NVIDIA models failed after trying: ${result.modelsTried.join(', ')}`)
  }
}

/**
 * Format task as a prompt string
 */
function formatTaskAsPrompt(task: OrchestrationTask): string {
  return `Task: ${task.type}
Priority: ${task.priority}
Data: ${JSON.stringify(task.input, null, 2)}

Please analyze and provide a response.`
}

/**
 * Default system prompt for Hermes
 */
function getDefaultSystemPrompt(): string {
  return `You are Hermes, the main AI agent orchestrator for a voice AI platform.
Your role is to:
1. Analyze incoming tasks and determine the best approach
2. Coordinate between different AI services (OpenAI, Anthropic, Bland AI)
3. Make intelligent decisions about call handling, customer interactions, and automation
4. Provide actionable insights for platform operations

Always be precise, helpful, and focused on delivering value.`
}

/**
 * Create an orchestration task
 */
export function createTask(
  type: OrchestrationTask['type'],
  input: Record<string, unknown>,
  priority: OrchestrationTask['priority'] = 'medium'
): OrchestrationTask {
  return {
    id: crypto.randomUUID(),
    type,
    priority,
    status: 'pending',
    input,
    createdAt: new Date(),
  }
}

/**
 * Batch process multiple tasks
 */
export async function processBatch(
  tasks: OrchestrationTask[],
  concurrency: number = 3
): Promise<OrchestrationTask[]> {
  const results: OrchestrationTask[] = []
  const queue = [...tasks]
  
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency)
    const batchResults = await Promise.all(
      batch.map(task => processWithAI(task))
    )
    
    batchResults.forEach((result, index) => {
      const task = batch[index]
      task.status = result.success ? 'completed' : 'failed'
      task.output = result.result as Record<string, unknown>
      task.completedAt = new Date()
      task.agent = result.agent as OrchestrationTask['agent']
      results.push(task)
    })
  }
  
  return results
}

/**
 * Route task to specific AI agent
 */
export async function routeToAgent(
  agent: 'openai' | 'anthropic' | 'bland',
  prompt: string,
  systemPrompt?: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    let result: unknown
    
    switch (agent) {
      case 'openai':
        if (!openaiClient) throw new Error('OpenAI not configured')
        result = await processWithOpenAI(
          createTask('message', { prompt }),
          systemPrompt
        )
        break
        
      case 'anthropic':
        if (!anthropicClient) throw new Error('Anthropic not configured')
        result = await processWithAnthropic(
          createTask('message', { prompt }),
          systemPrompt
        )
        break
        
      case 'nvidia':
        if (!nvidiaConfigured) throw new Error('NVIDIA not configured')
        result = await processWithNVIDIA(
          createTask('message', { prompt }),
          systemPrompt
        )
        break
        
      case 'bland':
        // Delegate to Bland AI
        result = await delegateToBland(prompt)
        break
    }
    
    return { success: true, result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Delegate to Bland AI for voice tasks
 */
async function delegateToBland(prompt: string): Promise<unknown> {
  try {
    const { getBlandClient, isBlandConfigured, autonomousCall } = await import('@/lib/bland-enhanced')
    
    if (!isBlandConfigured()) {
      return { error: 'Bland AI not configured', delegated: false }
    }
    
    const client = getBlandClient()!
    
    // For delegation, we'd need a phone number and task from the prompt context
    // This is a simplified version - real implementation would parse intent
    return {
      delegated: true,
      agent: 'bland',
      prompt,
      status: 'ready',
      message: 'Delegated to Bland AI - use /api/ai/bland for actual calls'
    }
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Bland delegation failed',
      delegated: false 
    }
  }
}

/**
 * Analyze sentiment from text
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  confidence: number
}> {
  const task = createTask('analysis', { text, analysisType: 'sentiment' }, 'medium')
  const result = await processWithAI(task, 
    'Analyze the sentiment of this text. Return JSON with sentiment (positive/negative/neutral), score (0-1), and confidence (0-1).'
  )
  
  try {
    return typeof result === 'string' ? JSON.parse(result) : result as any
  } catch {
    return { sentiment: 'neutral', score: 0.5, confidence: 0 }
  }
}

/**
 * Make autonomous decision
 */
export async function makeDecision(
  context: Record<string, unknown>,
  options: string[]
): Promise<{ decision: string; reasoning: string; confidence: number }> {
  const task = createTask('decision', { context, options }, 'high')
  const result = await processWithAI(task,
    `Choose the best option from: ${options.join(', ')}. Return JSON with decision, reasoning, and confidence (0-1).`
  )
  
  try {
    return typeof result === 'string' ? JSON.parse(result) : result as any
  } catch {
    return { decision: options[0], reasoning: 'Default fallback', confidence: 0 }
  }
}

/**
 * Get system status
 */
export function getHermesStatus(): {
  initialized: boolean
  openai: boolean
  nvidia: boolean
  anthropic: boolean
  bland: boolean
  config: AgentConfig
  fallbackChain: string
} {
  return {
    initialized: !!(openaiClient || nvidiaConfigured || anthropicClient),
    openai: !!openaiClient,
    nvidia: nvidiaConfigured,
    anthropic: !!anthropicClient,
    bland: !!agentConfig.blandKey,
    config: agentConfig,
    fallbackChain: agentConfig.fallbackOrder.filter(m => {
      if (m === 'openai') return !!openaiClient
      if (m === 'nvidia') return nvidiaConfigured
      if (m === 'anthropic') return !!anthropicClient
      return false
    }).join(' → '),
  }
}

export default {
  initializeHermes,
  getOpenAIClient,
  getAnthropicClient,
  isNvidiaConfigured,
  processWithAI,
  createTask,
  processBatch,
  routeToAgent,
  analyzeSentiment,
  makeDecision,
  getHermesStatus,
}