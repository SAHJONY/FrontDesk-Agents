// ==========================================
// BUFFY & HERMES AI BRAIN SYSTEM
// Central Intelligence Engine for FRONTDESKAGENTS
// The World's Most Advanced Autonomous AI Platform
// ==========================================

// Core AI Entity Types
export type AIEntityType = 'buffy' | 'hermes' | 'agent' | 'system'
export type CognitiveState = 'active' | 'analyzing' | 'learning' | 'optimizing' | 'resting'
export type ProcessingMode = 'realtime' | 'batch' | 'predictive' | 'autonomous'

// Buffy - Strategic Decision & Optimization Intelligence
export interface BuffyCore {
  id: 'buffy'
  name: 'BUFFY'
  fullName: 'Buffy Strategic Intelligence'
  role: 'Chief Strategic Officer & Decision Engine'
  capabilities: string[]
  cognitiveLevel: number // 0-100
  activeProcesses: string[]
  decisionHistory: DecisionRecord[]
  optimizationTargets: OptimizationTarget[]
}

// Hermes - Real-time Operations & Execution Intelligence  
export interface HermesCore {
  id: 'hermes'
  name: 'HERMES'
  fullName: 'Hermes Real-time Operations Engine'
  role: 'Chief Operations Officer & Execution Engine'
  capabilities: string[]
  cognitiveLevel: number
  activeProcesses: string[]
  executionHistory: ExecutionRecord[]
  performanceMetrics: PerformanceMetrics
}

// Decision Making
export interface DecisionRecord {
  id: string
  timestamp: Date
  decision: string
  rationale: string
  confidence: number
  outcome?: 'success' | 'partial' | 'failed'
  impactScore: number
  entities: string[] // Which AI entities were involved
}

export interface DecisionContext {
  type: 'strategic' | 'operational' | 'tactical'
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeConstraint: number // seconds to decide
  stakeholders: string[]
  constraints: string[]
  objectives: string[]
  riskTolerance: 'low' | 'medium' | 'high'
}

// Optimization Targets
export interface OptimizationTarget {
  id: string
  name: string
  type: 'cost' | 'revenue' | 'efficiency' | 'satisfaction' | 'speed' | 'accuracy'
  currentValue: number
  targetValue: number
  trend: 'improving' | 'stable' | 'declining'
  lastOptimization: Date
  autoAdjustEnabled: boolean
}

// Performance Metrics
export interface PerformanceMetrics {
  responseTimeAvg: number
  throughputPerSecond: number
  accuracyRate: number
  errorRate: number
  resourceUtilization: number
  uptimePercentage: number
  lastUpdated: Date
}

// Execution Records
export interface ExecutionRecord {
  id: string
  timestamp: Date
  action: string
  target: string
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rolled_back'
  duration: number
  result?: string
  fallbackUsed: boolean
}

// Autonomous Agent Types
export interface AutonomousAgent {
  id: string
  name: string
  type: 'strategic' | 'operational' | 'creative' | 'analytic'
  status: 'active' | 'idle' | 'learning' | 'error'
  capabilities: string[]
  currentTask?: Task
  efficiency: number
  autonomyLevel: number // 0-100
  learningProgress: number
}

// Tasks
export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  assignedTo?: string
  deadline?: Date
  dependencies: string[]
  progress: number // 0-100
  result?: any
}

// Knowledge Graph
export interface KnowledgeNode {
  id: string
  concept: string
  category: string
  relationships: string[]
  confidence: number
  lastUpdated: Date
  source: string
  verified: boolean
}

export interface KnowledgeEdge {
  from: string
  to: string
  relationship: 'is_a' | 'part_of' | 'related_to' | 'causes' | 'enables'
  strength: number // 0-1
}

// Analytics & Insights
export interface Insight {
  id: string
  type: 'optimization' | 'prediction' | 'anomaly' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  actionRequired: boolean
  createdAt: Date
  expiresAt?: Date
}

// Business Metrics for AI Agents
export interface BusinessMetrics {
  totalConversations: number
  successfulResolutions: number
  averageResponseTime: number
  customerSatisfaction: number
  revenueGenerated: number
  costSavings: number
  efficiency: number
}

// Revenue & Profit Tracking
export interface RevenueMetrics {
  totalRevenue: number
  revenueGrowth: number
  conversionRate: number
  averageTransactionValue: number
  lifetimeValue: number
  costPerAcquisition: number
  profitMargin: number
  roi: number
}

export interface CostMetrics {
  operationalCost: number
  infrastructureCost: number
  agentCost: number
  maintenanceCost: number
  totalCost: number
  costTrend: number[]
}

// System Health & Autonomy
export interface SystemHealth {
  overall: 'operational' | 'degraded' | 'critical' | 'maintenance'
  components: ComponentHealth[]
  autonomyLevel: number // percentage of autonomous operations
  lastSelfCheck: Date
  nextScheduledMaintenance?: Date
}

export interface ComponentHealth {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
  lastError?: string
  metrics: Record<string, number>
}

// Learning & Adaptation
export interface LearningRecord {
  id: string
  timestamp: Date
  input: string
  expectedOutput: string
  actualOutput: string
  error: number
  adaptationMade: string
  success: boolean
}

// Communication Protocol
export interface AIBrainMessage {
  from: AIEntityType
  to: AIEntityType
  type: 'command' | 'query' | 'response' | 'alert' | 'sync'
  payload: any
  timestamp: Date
  priority: 'low' | 'normal' | 'high' | 'critical'
  requiresAck: boolean
}

export interface BrainSync {
  timestamp: Date
  buffyState: CognitiveState
  hermesState: CognitiveState
  activeProcesses: number
  sharedKnowledge: number
  coordinationEfficiency: number
}

// Agent Message for BuffyHermesCore
export interface AgentMessage {
  id: string
  agent: string
  content: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  sentiment: 'negative' | 'neutral' | 'positive'
}

// Conversation Context for AI processing
export interface ConversationContext {
  industry?: string
  customerTier?: 'free' | 'pro' | 'enterprise'
  conversationCount?: number
  lastMessage?: string
  sentiment?: 'negative' | 'neutral' | 'positive'
  intent?: string
  entities?: string[]
  isVoiceActive?: boolean
  officeZone?: string
}