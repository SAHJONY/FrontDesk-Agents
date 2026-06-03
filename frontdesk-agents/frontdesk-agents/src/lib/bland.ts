// Bland AI API Service Client
// Documentation: https://docs.bland.ai/

const BLAND_API_BASE = 'https://api.bland.ai/v1'

export interface BlandCallOptions {
  phone_number: string
  prompt: string
  voice?: string
  language?: string
  webhook?: string
  max_duration?: number
  background?: boolean
  variables?: Record<string, string>
  from_number?: string
  caller_id?: string
}

export interface BlandCallResponse {
  id: string
  status: string
  duration?: number
  sid?: string
  [key: string]: unknown
}

export interface BlandAccountInfo {
  id: string
  name: string
  email: string
  balance: number
  [key: string]: unknown
}

export class BlandAIClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private get headers() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Make an outbound voice call
   * POST /v1/calls
   */
  async createCall(options: BlandCallOptions): Promise<BlandCallResponse> {
    const response = await fetch(`${BLAND_API_BASE}/calls`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        phone_number: options.phone_number,
        prompt: options.prompt,
        voice: options.voice || process.env.BLAND_DEFAULT_VOICE || DEFAULT_VOICE_ID,
        language: options.language || 'en',
        webhook: options.webhook,
        max_duration: options.max_duration || 600,
        background: options.background ?? true,
        from_number: options.from_number || process.env.BLAND_DEFAULT_FROM_NUMBER,
        caller_id: options.caller_id || process.env.BLAND_DEFAULT_CALLER_ID,
        variables: options.variables || {},
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Bland AI API Error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  /**
   * Get call details
   * GET /v1/calls/{call_id}
   */
  async getCall(callId: string): Promise<BlandCallResponse> {
    const response = await fetch(`${BLAND_API_BASE}/calls/${callId}`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Bland AI API Error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  /**
   * Stop an ongoing call
   * POST /v1/calls/{call_id}/stop
   */
  async stopCall(callId: string): Promise<BlandCallResponse> {
    const response = await fetch(`${BLAND_API_BASE}/calls/${callId}/stop`, {
      method: 'POST',
      headers: this.headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Bland AI API Error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  /**
   * Get account information
   * GET /v1/me
   */
  async getAccountInfo(): Promise<BlandAccountInfo> {
    const response = await fetch(`${BLAND_API_BASE}/me`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Bland AI API Error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  /**
   * Get call transcripts (if available)
   * GET /v1/calls/{call_id}/transcript
   */
  async getTranscript(callId: string): Promise<{ transcript: string }> {
    const response = await fetch(`${BLAND_API_BASE}/calls/${callId}/transcript`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Bland AI API Error: ${response.status} - ${JSON.stringify(error)}`)
    }

    return response.json()
  }
}

// Environment variable helper
export function getBlandAPIClient(): BlandAIClient {
  const apiKey = process.env.BLAND_AI_API_KEY
  
  if (!apiKey) {
    throw new Error('BLAND_AI_API_KEY is not configured. Please add it to your environment variables.')
  }
  
  return new BlandAIClient(apiKey)
}

// Default voice ID - user's custom voice from Bland AI dashboard
// Voice ID: 30972a71-c4b5-4aa3-9ce7-e065d6409a8f
export const DEFAULT_VOICE_ID = '30972a71-c4b5-4aa3-9ce7-e065d6409a8f'

// Default prompt templates for common use cases
export const PROMPT_TEMPLATES = {
  receptionist: `You are a professional AI receptionist for {{business_name}}. 
You handle incoming calls with the following guidelines:
- Always be polite and helpful
- Collect the caller's name and phone number
- Take detailed messages including reason for calling
- If they want to book an appointment, collect preferred date/time
- Confirm details before ending the call
- Never provide medical, legal, or financial advice
- Escalate to a human if the caller insists on speaking with someone

Business Information:
- Name: {{business_name}}
- Hours: {{business_hours}}
- Services: {{services}}

Current context: {{context}}`,

  appointmentReminder: `You are calling from {{business_name}} to remind {{customer_name}} about their upcoming appointment.
- Appointment date: {{appointment_date}}
- Appointment time: {{appointment_time}}
- Service: {{service_type}}
- Ask if they confirm or need to reschedule
- If they want to reschedule, apologize and take their preferred new time
- Thank them and end the call politely`,

  leadFollowUp: `You are calling from {{business_name}} regarding an inquiry from {{lead_name}}.
- They expressed interest in: {{interest}}
- Contact phone: {{lead_phone}}
- Introduce yourself and ask if they have any questions
- Be helpful and informative about the services offered
- If they're ready to schedule, take their preferred time
- Thank them for their interest`,
}

// Available voices in Bland AI
export const BLAND_VOICES = [
  { id: 'nat', name: 'Natural', description: 'Most natural sounding voice' },
  { id: 'sage', name: 'Sage', description: 'Calm and professional' },
  { id: 'forest', name: 'Forest', description: 'Soft and friendly' },
  { id: 'river', name: 'River', description: 'Clear and articulate' },
  { id: 'max', name: 'Max', description: 'Energetic and upbeat' },
  { id: '30972a71-c4b5-4aa3-9ce7-e065d6409a8f', name: 'Custom (Your Voice)', description: 'Your custom voice from Bland AI dashboard' },
] as const

export type BlandVoice = typeof BLAND_VOICES[number]['id']