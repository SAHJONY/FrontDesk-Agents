/**
 * BUFFY & HERMES AI BRAIN MODULE
 * Complete exports for the autonomous intelligence system
 */

// Core Engine - classes only, not internal types
export { BuffyBrain, HermesBrain, BuffyHermesEngine, buffyHermesEngine } from './buffyHermesCore';

// Self-Learning Engine
export { SelfLearningEngine, selfLearningEngine } from './learningEngine';

// Autonomous Decision Engine  
export { AutonomousDecisionEngine, autonomousDecisionEngine } from './profitEngine';

// Analytics Dashboard
export { MonitoringDashboard } from './analyticsEngine';

// Types from ./types - these are the main public types
export type {
  AIEntityType,
  CognitiveState,
  ProcessingMode,
  BuffyCore,
  HermesCore,
  DecisionRecord,
  DecisionContext,
  OptimizationTarget,
  PerformanceMetrics,
  ExecutionRecord,
  AutonomousAgent,
  Task,
  KnowledgeNode,
  KnowledgeEdge,
  Insight,
  RevenueMetrics,
  CostMetrics,
  SystemHealth,
  ComponentHealth,
  LearningRecord,
  AIBrainMessage,
  BrainSync,
  AgentMessage,
  ConversationContext,
  BusinessMetrics
} from './types';

// Re-export from profitEngine
export type { AutonomousDecision, DecisionType, DecisionCriteria } from './profitEngine';