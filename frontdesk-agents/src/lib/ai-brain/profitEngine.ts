/**
 * BUFFY & HERMES AUTONOMOUS DECISION ENGINE
 * Real-time decision making and optimization
 */

import { BusinessMetrics, AgentMessage, ConversationContext } from './types';

export type DecisionType = 
  | 'customer_engagement'
  | 'pricing_optimization'
  | 'resource_allocation'
  | 'upsell_recommendation'
  | 'escalation_decision'
  | 'resource_scaling'
  | 'content_optimization';

export interface DecisionCriteria {
  revenueImpact: number;
  customerSatisfactionImpact: number;
  efficiencyImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

export interface AutonomousDecision {
  id: string;
  type: DecisionType;
  description: string;
  criteria: DecisionCriteria;
  selectedOption: string;
  alternatives: string[];
  confidence: number;
  expectedOutcome: string;
  timestamp: Date;
  executed: boolean;
  outcome?: string;
}

export class AutonomousDecisionEngine {
  private decisions: AutonomousDecision[] = [];
  private decisionHistory: Map<DecisionType, DecisionPattern[]> = new Map();
  private activeDecisions: Map<string, DecisionStatus> = new Map();

  constructor() {
    this.initializeDecisionPatterns();
  }

  private initializeDecisionPatterns(): void {
    // Customer engagement patterns
    this.decisionHistory.set('customer_engagement', [
      { pattern: 'positive_sentiment', action: 'maintain_engagement', successRate: 0.95 },
      { pattern: 'negative_sentiment', action: 'empathetic_response', successRate: 0.88 },
      { pattern: 'neutral_sentiment', action: 'value_demonstration', successRate: 0.75 }
    ]);

    // Pricing optimization patterns
    this.decisionHistory.set('pricing_optimization', [
      { pattern: 'high_value_customer', action: 'premium_offer', successRate: 0.82 },
      { pattern: 'price_sensitive', action: 'discount_offer', successRate: 0.70 },
      { pattern: 'comparable_competitor', action: 'value_emphasis', successRate: 0.78 }
    ]);

    // Escalation patterns
    this.decisionHistory.set('escalation_decision', [
      { pattern: 'critical_issue', action: 'immediate_escalate', successRate: 0.99 },
      { pattern: 'complex_request', action: 'specialist_escalate', successRate: 0.92 },
      { pattern: 'repeat_customer', action: 'premium_support', successRate: 0.96 }
    ]);
  }

  /**
   * Make autonomous decision
   */
  async decide(
    type: DecisionType,
    context: DecisionContext
  ): Promise<AutonomousDecision> {
    const startTime = Date.now();
    
    // Step 1: Analyze context
    const analysis = this.analyzeContext(type, context);
    
    // Step 2: Generate options
    const options = this.generateOptions(type, analysis);
    
    // Step 3: Evaluate and select
    const selected = this.evaluateAndSelect(options, analysis);
    
    // Step 4: Create decision record
    const decision: AutonomousDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description: this.generateDescription(type, selected),
      criteria: analysis.criteria,
      selectedOption: selected.action,
      alternatives: options.filter(o => o.action !== selected.action).map(o => o.action),
      confidence: selected.confidence,
      expectedOutcome: selected.expectedOutcome,
      timestamp: new Date(),
      executed: false
    };
    
    // Step 5: Store decision
    this.decisions.push(decision);
    this.activeDecisions.set(decision.id, 'pending');
    
    // Step 6: Learn from patterns
    this.learnFromDecision(type, selected);
    
    // Keep only last 500 decisions
    if (this.decisions.length > 500) {
      this.decisions = this.decisions.slice(-500);
    }
    
    return decision;
  }

  private analyzeContext(
    type: DecisionType,
    context: DecisionContext
  ): DecisionAnalysis {
    const criteria = this.calculateCriteria(type, context);
    
    return {
      context,
      criteria,
      relevantPatterns: this.getRelevantPatterns(type, context),
      historicalSuccess: this.getHistoricalSuccess(type)
    };
  }

  private calculateCriteria(type: DecisionType, context: DecisionContext): DecisionCriteria {
    let revenueImpact = 0.5;
    let customerSatisfactionImpact = 0.5;
    let efficiencyImpact = 0.5;
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    
    switch (type) {
      case 'customer_engagement':
        if (context.customerTier === 'enterprise') {
          revenueImpact = 0.9;
          customerSatisfactionImpact = 0.8;
        }
        break;
        
      case 'pricing_optimization':
        revenueImpact = 0.85;
        efficiencyImpact = 0.6;
        break;
        
      case 'upsell_recommendation':
        if ((context.conversationCount ?? 0) > 3) {
          revenueImpact = 0.8;
          customerSatisfactionImpact = 0.7;
        }
        break;
        
      case 'escalation_decision':
        if (context.isNegativeSentiment) {
          customerSatisfactionImpact = 0.95;
          urgency = 'high';
          riskLevel = context.isCritical ? 'high' : 'medium';
        }
        break;
    }
    
    return { revenueImpact, customerSatisfactionImpact, efficiencyImpact, riskLevel, urgency };
  }

  private getRelevantPatterns(type: DecisionType, context: DecisionContext): DecisionPattern[] {
    const patterns = this.decisionHistory.get(type) || [];
    return patterns.filter(p => {
      // Match patterns to context
      if (p.pattern.includes('negative') && context.isNegativeSentiment) return true;
      if (p.pattern.includes('positive') && !context.isNegativeSentiment) return true;
      if (p.pattern.includes('customer') && context.customerTier) return true;
      return Math.random() > 0.5; // Fallback to random
    });
  }

  private getHistoricalSuccess(type: DecisionType): number {
    const typeDecisions = this.decisions.filter(d => d.type === type && d.outcome);
    if (typeDecisions.length === 0) return 0.75; // Default
    
    const successful = typeDecisions.filter(d => d.outcome === 'success').length;
    return successful / typeDecisions.length;
  }

  private generateOptions(type: DecisionType, analysis: DecisionAnalysis): DecisionOption[] {
    const options: DecisionOption[] = [];
    
    switch (type) {
      case 'customer_engagement':
        options.push(
          { action: 'maintain_engagement', confidence: 0.9, expectedOutcome: 'high_satisfaction' },
          { action: 'intensive_support', confidence: 0.7, expectedOutcome: 'problem_resolution' },
          { action: 'value_demonstration', confidence: 0.75, expectedOutcome: 'purchase_intent' }
        );
        break;
        
      case 'pricing_optimization':
        options.push(
          { action: 'premium_offer', confidence: 0.8, expectedOutcome: 'revenue_increase' },
          { action: 'discount_offer', confidence: 0.65, expectedOutcome: 'conversion' },
          { action: 'value_bundle', confidence: 0.75, expectedOutcome: 'avg_order_increase' }
        );
        break;
        
      case 'escalation_decision':
        options.push(
          { action: 'immediate_escalate', confidence: 0.95, expectedOutcome: 'issue_resolved' },
          { action: 'delayed_escalate', confidence: 0.7, expectedOutcome: 'self_resolution' },
          { action: 'specialist_routing', confidence: 0.85, expectedOutcome: 'efficient_resolution' }
        );
        break;
        
      case 'upsell_recommendation':
        options.push(
          { action: 'premium_upgrade', confidence: 0.75, expectedOutcome: 'revenue_increase' },
          { action: 'cross_sell', confidence: 0.7, expectedOutcome: 'basket_increase' },
          { action: 'no_upsell', confidence: 0.8, expectedOutcome: 'maintain_trust' }
        );
        break;
        
      default:
        options.push(
          { action: 'optimal_action', confidence: 0.85, expectedOutcome: 'success' },
          { action: 'conservative_action', confidence: 0.9, expectedOutcome: 'safe_progress' }
        );
    }
    
    // Adjust confidence based on historical patterns
    return options.map(opt => ({
      ...opt,
      confidence: opt.confidence * (0.9 + Math.random() * 0.2) // Add some variation
    }));
  }

  private evaluateAndSelect(options: DecisionOption[], analysis: DecisionAnalysis): DecisionOption {
    // Weighted evaluation
    let bestOption = options[0];
    let bestScore = 0;
    
    for (const option of options) {
      let score = option.confidence * 0.5;
      
      // Boost options matching historical patterns
      if (analysis.relevantPatterns.some(p => p.action === option.action)) {
        score += 0.2;
      }
      
      // Consider criteria
      score += analysis.criteria.revenueImpact * 0.2;
      score += analysis.criteria.customerSatisfactionImpact * 0.2;
      score += analysis.criteria.efficiencyImpact * 0.1;
      
      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    }
    
    return bestOption;
  }

  private generateDescription(type: DecisionType, option: DecisionOption): string {
    const descriptions: Record<string, Record<string, string>> = {
      customer_engagement: {
        maintain_engagement: 'Maintain current engagement level for customer satisfaction',
        intensive_support: 'Provide intensive support to resolve concerns',
        value_demonstration: 'Demonstrate value to encourage purchase decision'
      },
      pricing_optimization: {
        premium_offer: 'Offer premium pricing with enhanced features',
        discount_offer: 'Provide strategic discount to boost conversion',
        value_bundle: 'Create value bundle for increased order value'
      },
      escalation_decision: {
        immediate_escalate: 'Immediately escalate to human agent',
        delayed_escalate: 'Allow time for self-resolution before escalating',
        specialist_routing: 'Route to specialist for efficient resolution'
      },
      upsell_recommendation: {
        premium_upgrade: 'Recommend premium tier upgrade',
        cross_sell: 'Suggest complementary products/services',
        no_upsell: 'Skip upsell to maintain customer trust'
      }
    };
    
    return descriptions[type]?.[option.action] || `Choose ${option.action} for ${type}`;
  }

  private learnFromDecision(type: DecisionType, option: DecisionOption): void {
    // Update pattern success rates
    const patterns = this.decisionHistory.get(type);
    if (patterns) {
      const pattern = patterns.find(p => p.action === option.action);
      if (pattern) {
        pattern.successRate = pattern.successRate * 0.95 + option.confidence * 0.05;
      }
    }
  }

  /**
   * Execute a decision
   */
  async executeDecision(decisionId: string): Promise<ExecutionResult> {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) {
      return { success: false, decisionId, executionTime: 0, error: 'Decision not found' };
    }
    
    this.activeDecisions.set(decisionId, 'executing');
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const success = Math.random() > 0.1; // 90% success rate
    decision.executed = true;
    decision.outcome = success ? 'success' : 'failed';
    
    this.activeDecisions.set(decisionId, success ? 'completed' : 'failed');
    
    return {
      success,
      decisionId,
      executionTime: Math.random() * 1000,
      outcome: decision.outcome
    };
  }

  /**
   * Get decision status
   */
  getDecisionStatus(decisionId: string): DecisionStatus {
    return this.activeDecisions.get(decisionId) || 'unknown';
  }

  /**
   * Get all decisions with filtering
   */
  getDecisions(filter?: {
    type?: DecisionType;
    status?: DecisionStatus;
    since?: Date;
  }): AutonomousDecision[] {
    let result = this.decisions;
    
    if (filter?.type) {
      result = result.filter(d => d.type === filter.type);
    }
    
    if (filter?.since) {
      result = result.filter(d => d.timestamp >= filter.since!);
    }
    
    return result;
  }

  /**
   * Get decision statistics
   */
  getDecisionStats(): DecisionStats {
    const totalDecisions = this.decisions.length;
    const executedDecisions = this.decisions.filter(d => d.executed);
    const successfulDecisions = executedDecisions.filter(d => d.outcome === 'success');
    
    const byType: Record<string, { total: number; successful: number; avgConfidence: number }> = {};
    
    for (const type of Object.keys(this.decisionHistory.keys())) {
      const typeDecisions = this.decisions.filter(d => d.type === type);
      byType[type] = {
        total: typeDecisions.length,
        successful: typeDecisions.filter(d => d.outcome === 'success').length,
        avgConfidence: typeDecisions.reduce((sum, d) => sum + d.confidence, 0) / typeDecisions.length || 0
      };
    }
    
    return {
      totalDecisions,
      executedDecisions: executedDecisions.length,
      successRate: executedDecisions.length > 0 ? successfulDecisions.length / executedDecisions.length : 0,
      averageConfidence: this.decisions.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions || 0,
      byType,
      pendingDecisions: this.decisions.filter(d => !d.executed).length
    };
  }

  /**
   * Optimize decisions based on outcomes
   */
  async optimizeDecisions(): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Analyze failure patterns
    const failures = this.decisions.filter(d => d.outcome === 'failed');
    if (failures.length > 0) {
      const failureRate = failures.length / this.decisions.length;
      if (failureRate > 0.1) {
        suggestions.push({
          type: 'adjust_confidence_threshold',
          reason: `Failure rate (${(failureRate * 100).toFixed(1)}%) exceeds acceptable threshold`,
          expectedImprovement: 'reduce_failure_rate'
        });
      }
    }
    
    // Analyze low confidence decisions
    const lowConfidence = this.decisions.filter(d => d.confidence < 0.7);
    if (lowConfidence.length > 10) {
      suggestions.push({
        type: 'review_low_confidence_patterns',
        reason: `${lowConfidence.length} low-confidence decisions detected`,
        expectedImprovement: 'improve_decision_accuracy'
      });
    }
    
    return suggestions;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DecisionContext {
  customerTier?: 'free' | 'pro' | 'enterprise';
  conversationCount?: number;
  isNegativeSentiment?: boolean;
  isCritical?: boolean;
  businessValue?: number;
  timeOfDay?: Date;
  previousInteractions?: number;
}

interface DecisionAnalysis {
  context: DecisionContext;
  criteria: DecisionCriteria;
  relevantPatterns: DecisionPattern[];
  historicalSuccess: number;
}

interface DecisionOption {
  action: string;
  confidence: number;
  expectedOutcome: string;
}

interface DecisionPattern {
  pattern: string;
  action: string;
  successRate: number;
}

type DecisionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'unknown';

interface ExecutionResult {
  success: boolean;
  decisionId: string;
  executionTime: number;
  outcome?: string;
  error?: string;
}

interface DecisionStats {
  totalDecisions: number;
  executedDecisions: number;
  successRate: number;
  averageConfidence: number;
  byType: Record<string, { total: number; successful: number; avgConfidence: number }>;
  pendingDecisions: number;
}

interface OptimizationSuggestion {
  type: string;
  reason: string;
  expectedImprovement: string;
}

// Export singleton
export const autonomousDecisionEngine = new AutonomousDecisionEngine();
export default AutonomousDecisionEngine;