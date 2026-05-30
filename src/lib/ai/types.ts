// AI Receptionist Types and State Management
import { BaseMessage, AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

// Core state for the AI receptionist
export interface ReceptionistState {
  messages: BaseMessage[]
  caller_info: CallerInfo | null
  conversation_stage: ConversationStage
  active_agent: AgentType
  context: CallContext
  pending_action: PendingAction | null
  memory_retrieved: boolean
  tools_used: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  requires_human: boolean
  summary: string
}

export interface CallerInfo {
  phone: string
  name: string | null
  business: string | null
  previous_calls: number
  last_contact: string | null
  preferences: Record<string, unknown>
}

export interface CallContext {
  business_id: string
  industry: IndustryType
  caller_intent: IntentType | null
  scheduled_callback: boolean
  message_taken: string | null
  transfer_to: string | null
  appointments: Appointment[]
  frequently_asked: FAQ[]
}

export interface Appointment {
  id: string
  datetime: string
  service: string
  confirmed: boolean
}

export interface FAQ {
  question: string
  answer: string
  category: string
}

export type ConversationStage = 
  | 'greeting'
  | 'identify'
  | 'understand_intent'
  | 'gather_info'
  | 'provide_solution'
  | 'schedule'
  | 'transfer'
  | 'billing'
  | 'close'

export type AgentType = 
  | 'receptionist'
  | 'scheduler'
  | 'faq'
  | 'transfer'
  | 'voicemail'
  | 'billing'
  | 'supervisor'

export type IntentType = 
  | 'schedule_appointment'
  | 'get_information'
  | 'speak_to_representative'
  | 'leave_voicemail'
  | 'report_issue'
  | 'billing_question'
  | 'general_inquiry'

export interface PendingAction {
  action: string
  params: Record<string, unknown>
  timestamp: string
}

export type IndustryType = 
  | 'healthcare'
  | 'legal'
  | 'realestate'
  | 'hospitality'
  | 'financial'
  | 'corporate'

// Tool schemas for function calling
export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

// Voice and vision analysis types
export interface TranscriptionResult {
  text: string
  confidence: number
  language: string
  timestamp: number
}

export interface VisionAnalysisResult {
  description: string
  extracted_text: string[]
  document_type: 'id' | 'document' | 'image' | 'unknown'
  key_data: Record<string, string>
  confidence: number
}

// API response types
export interface AgentResponse {
  message: string
  audio_url?: string
  action?: string
  transfer_to?: string
  end_call: boolean
  sentiment?: 'positive' | 'neutral' | 'negative'
}