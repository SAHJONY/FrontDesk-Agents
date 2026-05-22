// AI Agentic Receptionist - Core Types

export type AgentType = 'greeting' | 'scheduling' | 'information' | 'escalation' | 'multilingual'
export type AgentStatus = 'online' | 'busy' | 'offline' | 'learning'
export type IndustryType = 'healthcare' | 'legal' | 'realestate' | 'hospitality' | 'corporate' | 'retail' | 'education' | 'government'
export type InteractionMode = 'voice' | 'chat' | 'video' | 'kiosk'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Agent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  avatar: string
  capabilities: string[]
  languages: string[]
  confidenceThreshold: number
  maxConcurrentInteractions: number
  currentLoad: number
  specialties: string[]
  createdAt: Date
  lastActiveAt: Date
}

export interface InteractionContext {
  industry: IndustryType
  mode: InteractionMode
  visitorId?: string
  visitorName?: string
  visitorLanguage: string
  purpose: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated'
  previousInteractions: number
  scheduledCallback?: Date
}

export interface AIResponse {
  agentId: string
  content: string
  confidence: number
  suggestedActions: string[]
  requiresHumanEscalation: boolean
  sentimentAnalysis: SentimentResult
  language: string
  responseTime: number
  suggestedAgentTransfer?: AgentType
  metadata: ResponseMetadata
}

export interface SentimentResult {
  score: number // -1 to 1
  label: 'positive' | 'neutral' | 'negative' | 'frustrated'
  emotions: string[]
  actionRecommended?: string
}

export interface ResponseMetadata {
  tokensUsed: number
  modelVersion: string
  cachedResponse: boolean
  processingTimeMs: number
}

export interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  industry: IndustryType
  dateTime: Date
  duration: number // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminderSent: boolean
  agentId?: string
  createdAt: Date
}

export interface KnowledgeBaseEntry {
  id: string
  question: string
  answer: string
  industry: IndustryType
  category: string
  keywords: string[]
  confidence: number
  lastUpdated: Date
  usageCount: number
}

export interface EscalationPolicy {
  id: string
  triggerConditions: EscalationTrigger[]
  targetDepartment: string
  targetAgent?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeout: number // seconds
  fallbackAction: string
}

export interface EscalationTrigger {
  type: 'sentiment' | 'keyword' | 'repetition' | 'time' | 'confidence'
  condition: string
  threshold: number
}

export interface Visitor {
  id: string
  name: string
  email?: string
  phone?: string
  preferredLanguage: string
  visits: number
  lastVisit: Date
  sentimentHistory: SentimentResult[]
  preferences: VisitorPreferences
}

export interface VisitorPreferences {
  interactionMode: InteractionMode
  preferredAgentType?: AgentType
  notificationPreferences: string[]
  accessibilityNeeds: string[]
}

export interface SystemHealth {
  status: 'operational' | 'degraded' | 'outage'
  activeAgents: number
  totalInteractions: number
  averageResponseTime: number
  uptimePercentage: number
  lastUpdated: Date
}

// Agent System Configuration
export interface AgentSystemConfig {
  maxConcurrentAgents: number
  defaultConfidenceThreshold: number
  escalationTimeoutSeconds: number
  maxRetryAttempts: number
  cacheEnabled: boolean
  cacheTTLSeconds: number
  multiLanguageEnabled: boolean
  sentimentAnalysisEnabled: boolean
  voiceEnabled: boolean
  videoEnabled: boolean
}

// Industry-specific configurations
export interface IndustryConfig {
  type: IndustryType
  name: string
  icon: string
  greetingMessage: string
  commonServices: string[]
  faqTopics: string[]
  escalationPolicy: EscalationPolicy
  workingHours: { [key: string]: { start: string; end: string } }
  holidays: string[]
  timezone: string
  requiredDocuments?: string[]
  complianceRequirements?: string[]
}

// Scheduling types
export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  agentId?: string
}

export interface SchedulingRequest {
  industry: IndustryType
  service: string
  preferredDate: Date
  preferredTime?: string
  visitorName: string
  visitorContact: string
  notes?: string
}

// Notification types
export interface Notification {
  id: string
  type: 'appointment_reminder' | 'confirmation' | 'cancellation' | 'update' | 'escalation'
  recipientId: string
  channel: 'email' | 'sms' | 'voice' | 'push'
  subject: string
  content: string
  sentAt: Date
  deliveredAt?: Date
  status: 'pending' | 'sent' | 'delivered' | 'failed'
}