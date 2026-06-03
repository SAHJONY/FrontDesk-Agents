/**
 * Enhanced Bland AI Integration with Autonomous Features
 * Full API coverage for voice AI platform
 */

// ============================================================================
// Types
// ============================================================================

export interface BlandCallConfig {
  phone_number: string
  task: string
  model?: string
  voice?: string
  language?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
    speed?: number
    twang?: number
  }
  reduce_noise?: boolean
  record?: boolean
  webhook_url?: string
  started_node_id?: string
  metadata?: Record<string, string>
  wait_for_greeting?: boolean
  interruption_threshold?: number
  max_duration?: number
  transfer_primary_color?: string
  transfer_button_text?: string
}

export interface CallResponse {
  id: string
  status: string
  duration?: number
  recording_url?: string
  transcript?: string
  summary?: string
  error?: string
}

export interface CallLogsFilters {
  limit?: number
  offset?: number
  status?: 'completed' | 'failed' | 'in-progress' | 'busy' | 'no-answer'
  from?: string
  to?: string
}

export interface AnalyzeResult {
  summary: string
  summary_score: number
  action_items: string[]
  questions: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  keywords: string[]
}

export interface BatchCallConfig {
  phone_numbers: string[]
  task: string
  model?: string
  voice?: string
  webhook_url?: string
}

// ============================================================================
// API Client
// ============================================================================

const BLAND_API_BASE = 'https://api.bland.ai/v1'

class BlandAIClient {
  private apiKey: string
  private accountId: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.accountId = '' // Will be fetched on first call
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BLAND_API_BASE}${endpoint}`
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `Bland API error: ${response.status}`)
    }

    return response.json()
  }

  private async fetchText(endpoint: string, options: RequestInit = {}): Promise<string> {
    const url = `${BLAND_API_BASE}${endpoint}`
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Bland API error: ${response.status}`)
    }

    return response.text()
  }

  // ============================================================================
  // Account
  // ============================================================================

  async getAccount(): Promise<{ id: string; name: string; email: string }> {
    const account = await this.fetch('/account')
    this.accountId = account.id
    return account
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    return this.fetch('/balance')
  }

  // ============================================================================
  // Calls
  // ============================================================================

  /**
   * Initiate a call
   */
  async call(config: BlandCallConfig): Promise<{ call_id: string; status: string }> {
    return this.fetch('/calls', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  /**
   * Get call details
   */
  async getCall(callId: string): Promise<CallResponse> {
    return this.fetch(`/calls/${callId}`)
  }

  /**
   * Stop a call
   */
  async stopCall(callId: string): Promise<{ status: string }> {
    return this.fetch(`/calls/${callId}/stop`, { method: 'POST' })
  }

  /**
   * Get call transcript
   */
  async getTranscript(callId: string): Promise<{ events: any[]; transcript: string }> {
    return this.fetch(`/calls/${callId}/transcript`)
  }

  /**
   * Get call recordings
   */
  async getRecording(callId: string): Promise<{ recording_url: string }> {
    return this.fetch(`/calls/${callId}/recording`)
  }

  /**
   * Download recording
   */
  async downloadRecording(callId: string): Promise<Blob> {
    const blob = await this.fetchText(`/calls/${callId}/recording`, {
      headers: { 'Accept': 'audio/mp3' },
    } as any)
    return blob as any
  }

  /**
   * Analyze call (post-call AI analysis)
   */
  async analyzeCall(callId: string): Promise<AnalyzeResult> {
    return this.fetch(`/calls/${callId}/analyze`)
  }

  /**
   * Get call costs
   */
  async getCallCost(callId: string): Promise<{ cost: number; duration: number }> {
    return this.fetch(`/calls/${callId}/cost`)
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * Batch call - initiate multiple calls
   */
  async batchCall(config: BatchCallConfig): Promise<{ batch_id: string; status: string }> {
    return this.fetch('/batch/calls', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  /**
   * Get batch status
   */
  async getBatch(batchId: string): Promise<{ 
    id: string
    status: string
    total: number
    completed: number
    failed: number
    progress: number
  }> {
    return this.fetch(`/batch/${batchId}`)
  }

  /**
   * Stop batch
   */
  async stopBatch(batchId: string): Promise<{ status: string }> {
    return this.fetch(`/batch/${batchId}/stop`, { method: 'POST' })
  }

  // ============================================================================
  // Contacts
  // ============================================================================

  async createContact(data: {
    phone_number: string
    first_name?: string
    last_name?: string
    email?: string
    metadata?: Record<string, string>
  }): Promise<{ contact_id: string }> {
    return this.fetch('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getContacts(limit: number = 100): Promise<{ contacts: any[] }> {
    return this.fetch(`/contacts?limit=${limit}`)
  }

  async getContact(contactId: string): Promise<any> {
    return this.fetch(`/contacts/${contactId}`)
  }

  // ============================================================================
  // Automation / Workflows
  // ============================================================================

  async createWorkflow(data: {
    name: string
    phone_number_id: string
    transcript_hook?: string
    recording_hook?: string
    started_hook?: string
    ended_hook?: string
    metadata?: Record<string, string>
  }): Promise<{ workflow_id: string }> {
    return this.fetch('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getWorkflows(): Promise<{ workflows: any[] }> {
    return this.fetch('/workflows')
  }

  async getWorkflow(workflowId: string): Promise<any> {
    return this.fetch(`/workflows/${workflowId}`)
  }

  async deleteWorkflow(workflowId: string): Promise<{ status: string }> {
    return this.fetch(`/workflows/${workflowId}`, { method: 'DELETE' })
  }

  // ============================================================================
  // Phone Numbers
  // ============================================================================

  async getPhoneNumbers(): Promise<{ phone_numbers: any[] }> {
    return this.fetch('/phone-numbers')
  }

  async getPhoneNumber(numberId: string): Promise<any> {
    return this.fetch(`/phone-numbers/${numberId}`)
  }

  async updatePhoneNumber(numberId: string, data: Record<string, any>): Promise<any> {
    return this.fetch(`/phone-numbers/${numberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // ============================================================================
  // Voicemail Detection
  // ============================================================================

  async detectVoicemail(phoneNumber: string): Promise<{
    result: 'voicemail' | 'live' | 'fax' | 'unknown'
    confidence: number
  }> {
    return this.fetch('/voicemail-detection', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    })
  }
}

// Singleton instance
let blandClient: BlandAIClient | null = null

/**
 * Initialize Bland AI client
 */
export function initializeBland(apiKey: string): BlandAIClient {
  blandClient = new BlandAIClient(apiKey)
  console.log('[Bland AI] Client initialized')
  return blandClient
}

/**
 * Get Bland AI client instance
 */
export function getBlandClient(): BlandAIClient | null {
  return blandClient
}

/**
 * Check if Bland AI is configured
 */
export function isBlandConfigured(): boolean {
  return !!blandClient
}

// ============================================================================
// Autonomous Functions
// ============================================================================

export interface AutonomousCallConfig extends BlandCallConfig {
  autoRetry?: boolean
  maxRetries?: number
  fallbackAction?: 'voicemail' | 'callback' | 'transfer'
  analyticsEnabled?: boolean
}

export interface CallResult {
  success: boolean
  callId?: string
  duration?: number
  transcript?: string
  summary?: string
  sentiment?: string
  actionItems?: string[]
  error?: string
}

/**
 * Make an autonomous outbound call with AI analysis
 */
export async function autonomousCall(config: AutonomousCallConfig): Promise<CallResult> {
  if (!blandClient) {
    throw new Error('Bland AI not configured')
  }

  try {
    console.log('[Bland AI] Initiating autonomous call to:', config.phone_number)
    
    // Make the call
    const { call_id } = await blandClient.call({
      phone_number: config.phone_number,
      task: config.task,
      model: config.model || 'enhanced',
      voice: config.voice,
      language: config.language,
      voice_settings: config.voice_settings,
      record: true,
      webhook_url: config.webhook_url,
      wait_for_greeting: true,
      max_duration: config.max_duration || 600, // 10 min default
    })

    console.log('[Bland AI] Call initiated:', call_id)

    // Wait for call to complete
    let callData = await blandClient.getCall(call_id)
    
    // Poll for completion (max 10 minutes)
    const maxWait = 600000 // 10 minutes
    const startTime = Date.now()
    
    while (['queued', 'ringing', 'in-progress'].includes(callData.status) && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      callData = await blandClient.getCall(call_id)
    }

    if (callData.status === 'completed') {
      // Get analysis
      let analysis: AnalyzeResult | undefined
      try {
        analysis = await blandClient.analyzeCall(call_id)
      } catch (e) {
        console.log('[Bland AI] Analysis not available:', e)
      }

      return {
        success: true,
        callId: call_id,
        duration: callData.duration,
        transcript: callData.transcript,
        summary: analysis?.summary || callData.summary,
        sentiment: analysis?.sentiment,
        actionItems: analysis?.action_items,
      }
    } else {
      return {
        success: false,
        callId: call_id,
        error: `Call ended with status: ${callData.status}`,
      }
    }
  } catch (error) {
    console.error('[Bland AI] Autonomous call failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Make bulk autonomous calls
 */
export async function bulkAutonomousCall(
  phoneNumbers: string[],
  task: string,
  options: {
    voice?: string
    model?: string
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<{ successful: number; failed: number; results: CallResult[] }> {
  const results: CallResult[] = []
  let successful = 0
  let failed = 0

  for (let i = 0; i < phoneNumbers.length; i++) {
    const result = await autonomousCall({
      phone_number: phoneNumbers[i],
      task,
      voice: options.voice,
      model: options.model,
    })
    
    results.push(result)
    
    if (result.success) {
      successful++
    } else {
      failed++
    }

    // Report progress
    if (options.onProgress) {
      options.onProgress(i + 1, phoneNumbers.length)
    }

    // Small delay between calls to avoid rate limiting
    if (i < phoneNumbers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return { successful, failed, results }
}

/**
 * Schedule autonomous callback
 */
export async function scheduleCallback(
  phoneNumber: string,
  scheduledTime: Date,
  task: string,
  voice?: string
): Promise<{ scheduled: boolean; callId?: string; error?: string }> {
  // In production, this would use a job scheduler
  // For now, we'll calculate delay and schedule
  const delay = scheduledTime.getTime() - Date.now()
  
  if (delay < 0) {
    return { scheduled: false, error: 'Scheduled time is in the past' }
  }

  // Schedule the call
  setTimeout(async () => {
    try {
      await autonomousCall({
        phone_number: phoneNumber,
        task,
        voice,
      })
    } catch (error) {
      console.error('[Bland AI] Scheduled callback failed:', error)
    }
  }, delay)

  return { scheduled: true }
}

/**
 * AI-powered call routing decision
 */
export async function routeCallIntelligently(
  callerHistory: string[],
  timeOfDay: Date
): Promise<{
  action: 'accept' | 'voicemail' | 'transfer' | 'callback'
  priority: 'high' | 'medium' | 'low'
  reason: string
}> {
  // Simple rule-based routing (in production, this would use Hermes AI)
  const hour = timeOfDay.getHours()
  
  // During business hours, accept calls
  if (hour >= 9 && hour <= 17) {
    // Check caller history for patterns
    if (callerHistory.length > 3) {
      return {
        action: 'accept',
        priority: 'high',
        reason: 'Repeat caller with history'
      }
    }
    return {
      action: 'accept',
      priority: 'medium',
      reason: 'Business hours - available'
    }
  }
  
  // After hours - offer callback
  return {
    action: 'callback',
    priority: 'low',
    reason: 'After hours - scheduled callback recommended'
  }
}

// ============================================================================
// Voice Models
// ============================================================================

export const BLAND_VOICES = [
  { id: 'male-primary', name: 'David (Primary Male)', description: 'Clear, professional male voice' },
  { id: 'female-primary', name: 'Sarah (Primary Female)', description: 'Warm, professional female voice' },
  { id: 'male-2', name: 'James', description: 'Deep, authoritative male voice' },
  { id: 'female-2', name: 'Emma', description: 'Friendly female voice' },
  { id: 'male-3', name: 'Michael', description: 'Young professional male voice' },
  { id: 'female-3', name: 'Sophia', description: 'Elegant female voice' },
] as const

export const BLAND_MODELS = [
  { id: 'enhanced', name: 'Enhanced', description: 'Best for complex tasks, better understanding' },
  { id: 'base', name: 'Base', description: 'Fast, efficient for simple tasks' },
  { id: 'ultra', name: 'Ultra', description: 'Most capable, longest responses' },
] as const

export default {
  initializeBland,
  getBlandClient,
  isBlandConfigured,
  autonomousCall,
  bulkAutonomousCall,
  scheduleCallback,
  routeCallIntelligently,
  BLAND_VOICES,
  BLAND_MODELS,
}