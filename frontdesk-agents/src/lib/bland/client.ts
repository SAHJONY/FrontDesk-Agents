/**
 * AI Voice Integration - Voice AI Service
 * FRONTDESK AGENTS Platform
 */

const BLAND_API_KEY = process.env.BLANDAI_API_KEY || ''
const BLAND_BASE_URL = 'https://api.bland.ai/v1'

interface BlandCallParams {
  phone_number: string
  message: string
  voice?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
  }
  model?: string
  language?: string
  accent?: string
  custom_params?: {
    [key: string]: any
  }
}

interface BlandCallResponse {
  call_id: string
  status: string
  message?: string
}

/**
 * Initiate an AI voice call via Bland.ai
 */
export async function initiateCall(params: BlandCallParams): Promise<BlandCallResponse> {
  if (!BLAND_API_KEY) {
    throw new Error('BLAND_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BLAND_BASE_URL}/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLAND_API_KEY}`,
      },
      body: JSON.stringify({
        phone_number: params.phone_number,
        message: params.message,
        voice: params.voice || 'Rachel',
        model: params.model || 'enhanced',
        language: params.language || 'en',
        accent: params.accent,
        voice_settings: params.voice_settings,
        custom_params: params.custom_params,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to initiate call')
    }

    const data = await response.json()
    return {
      call_id: data.call_id,
      status: 'initiated',
      message: `Call initiated to ${params.phone_number}`,
    }
  } catch (error: any) {
    console.error('Voice AI call error:', error)
    throw error
  }
}

/**
 * Get call status and transcript
 */
export async function getCallStatus(callId: string) {
  if (!BLAND_API_KEY) {
    throw new Error('BLAND_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BLAND_BASE_URL}/calls/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get call status')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Voice AI status error:', error)
    throw error
  }
}

/**
 * Hang up an active call
 */
export async function hangupCall(callId: string) {
  if (!BLAND_API_KEY) {
    throw new Error('BLAND_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BLAND_BASE_URL}/calls/${callId}/hangup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to hangup call')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Voice AI hangup error:', error)
    throw error
  }
}

/**
 * Send an AI message during a call
 */
export async function sendCallMessage(callId: string, message: string) {
  if (!BLAND_API_KEY) {
    throw new Error('BLAND_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BLAND_BASE_URL}/calls/${callId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLAND_API_KEY}`,
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send message')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Voice AI message error:', error)
    throw error
  }
}

/**
 * Get available voices
 */
export async function getVoices() {
  if (!BLAND_API_KEY) {
    throw new Error('BLAND_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${BLAND_BASE_URL}/voices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get voices')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Voice AI voices error:', error)
    throw error
  }
}

// Default AI receptionist prompts for different industries
export const industryPrompts = {
  'real-estate': `You are a professional AI receptionist for a real estate agency. Your role is to:
1. Greet callers warmly and professionally
2. Ask how you can help them today
3. Qualify buyers: budget, location preferences, timeline
4. Schedule property viewings
5. Answer basic questions about listings
6. Collect contact information for follow-up
7. Transfer urgent calls to human agents

Be friendly, professional, and helpful. Keep responses concise.`,

  'legal': `You are a professional AI receptionist for a law firm. Your role is to:
1. Greet callers with professionalism and empathy
2. Identify the nature of their legal issue (without giving legal advice)
3. Collect basic case information
4. Schedule consultations with attorneys
5. Explain the firm's practice areas
6. Collect contact information
7. Handle urgent matters appropriately

Be compassionate, professional, and maintain client confidentiality.`,

  'medical': `You are a professional AI receptionist for a medical practice. Your role is to:
1. Greet callers warmly and professionally
2. Handle appointment scheduling and rescheduling
3. Answer questions about office hours and location
4. Collect patient information for new patient intake
5. Direct urgent medical concerns to appropriate resources
6. Handle prescription refill requests
7. Process billing inquiries

Be empathetic, professional, and HIPAA-compliant. Never provide medical advice.`,

  'default': `You are a professional AI receptionist for a business. Your role is to:
1. Greet callers warmly and professionally
2. Answer questions about the business
3. Schedule appointments
4. Take messages
5. Collect contact information
6. Transfer calls when necessary

Be friendly, professional, and helpful.`
}

// Voice options
export const voices = [
  'Rachel', 'Joanna', 'Matthew', 'Ivy', 'Joey', 'Kendra', 'Kimberly', 'Salli'
] as const
