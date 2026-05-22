/**
 * BUFFY & HERMES SELF-LEARNING ENGINE
 * Continuous improvement through real-time learning and adaptation
 */

import { BusinessMetrics, ConversationContext, AgentMessage } from './types';

export interface LearningModel {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  trainedOn: number;
  lastUpdated: Date;
}

export interface AdaptationRule {
  id: string;
  trigger: string;
  condition: (context: LearningContext) => boolean;
  action: 'improve_response' | 'adjust_priority' | 'modify_behavior' | 'escalate_faster';
  confidence: number;
  successCount: number;
  failureCount: number;
}

interface LearningContext {
  customerSentiment: 'positive' | 'negative' | 'neutral';
  responseTime: number;
  resolutionSuccess: boolean;
  customerFeedback?: number;
  businessImpact: number;
}

export class SelfLearningEngine {
  private models: Map<string, LearningModel> = new Map();
  private adaptationRules: AdaptationRule[] = [];
  private learningHistory: LearningEvent[] = [];
  private performanceBenchmarks: Map<string, number> = new Map();
  private feedbackLoop: FeedbackLoop;

  constructor() {
    this.feedbackLoop = new FeedbackLoop();
    this.initializeDefaultRules();
    this.initializeBenchmarks();
  }

  private initializeDefaultRules(): void {
    // Rule 1: Improve response for repeated complaints
    this.adaptationRules.push({
      id: 'rule-1',
      trigger: 'repeated_complaint',
      condition: (ctx: LearningContext) => ctx.customerSentiment === 'negative' && ctx.businessImpact > 0.7,
      action: 'improve_response',
      confidence: 0.85,
      successCount: 0,
      failureCount: 0
    });

    // Rule 2: Faster escalation for critical issues
    this.adaptationRules.push({
      id: 'rule-2',
      trigger: 'critical_detection',
      condition: (ctx: LearningContext) => ctx.responseTime > 5000 && ctx.customerSentiment === 'negative',
      action: 'escalate_faster',
      confidence: 0.9,
      successCount: 0,
      failureCount: 0
    });

    // Rule 3: Modify behavior for low satisfaction
    this.adaptationRules.push({
      id: 'rule-3',
      trigger: 'low_satisfaction',
      condition: (ctx: LearningContext) => ctx.customerFeedback !== undefined && ctx.customerFeedback < 3,
      action: 'modify_behavior',
      confidence: 0.75,
      successCount: 0,
      failureCount: 0
    });
  }

  private initializeBenchmarks(): void {
    this.performanceBenchmarks.set('responseTime', 2000); // 2 seconds target
    this.performanceBenchmarks.set('resolutionRate', 0.95); // 95% resolution
    this.performanceBenchmarks.set('customerSatisfaction', 4.5); // 4.5/5 stars
    this.performanceBenchmarks.set('firstContactResolution', 0.8); // 80%
  }

  /**
   * Learn from each interaction
   */
  async learn(interaction: InteractionData): Promise<LearningResult> {
    const startTime = Date.now();
    
    // Step 1: Analyze the interaction
    const analysis = this.analyzeInteraction(interaction);
    
    // Step 2: Update models based on outcome
    await this.updateModels(analysis);
    
    // Step 3: Apply adaptation rules
    const adaptations = this.applyAdaptationRules(analysis);
    
    // Step 4: Generate insights
    const insights = this.generateInsights(analysis);
    
    // Step 5: Update learning history
    this.recordLearning(analysis, adaptations, insights);
    
    return {
      analysis,
      adaptations,
      insights,
      learningTime: Date.now() - startTime,
      modelUpdates: this.getModelUpdates()
    };
  }

  private analyzeInteraction(interaction: InteractionData): InteractionAnalysis {
    return {
      success: interaction.outcome === 'resolved',
      responseTimeMet: interaction.responseTime < (this.performanceBenchmarks.get('responseTime') || 2000),
      sentimentShift: this.calculateSentimentShift(interaction),
      businessValue: this.assessBusinessValue(interaction),
      patternMatch: this.identifyPatterns(interaction),
      improvementAreas: this.findImprovementAreas(interaction)
    };
  }

  private calculateSentimentShift(interaction: InteractionData): number {
    const start = this.sentimentToNumber(interaction.initialSentiment);
    const end = this.sentimentToNumber(interaction.finalSentiment);
    return end - start; // Positive means improvement
  }

  private sentimentToNumber(sentiment: string): number {
    switch (sentiment) {
      case 'positive': return 1;
      case 'negative': return -1;
      default: return 0;
    }
  }

  private assessBusinessValue(interaction: InteractionData): number {
    let value = 0.5;
    
    if (interaction.outcome === 'resolved') value += 0.2;
    if (interaction.purchaseGenerated) value += 0.3;
    if (interaction.customerRetained) value += 0.2;
    if (interaction.referralGenerated) value += 0.1;
    
    return Math.min(1, value);
  }

  private identifyPatterns(interaction: InteractionData): PatternMatch[] {
    const patterns: PatternMatch[] = [];
    
    // Check for escalation patterns
    if (interaction.escalated) {
      patterns.push({
        pattern: 'escalation_required',
        confidence: 0.8,
        description: 'Issue required human intervention'
      });
    }
    
    // Check for upsell opportunities
    if (interaction.initialSentiment === 'neutral' && interaction.outcome === 'resolved') {
      patterns.push({
        pattern: 'neutral_to_sale',
        confidence: 0.6,
        description: 'Neutral customer successfully converted'
      });
    }
    
    // Check for complaint resolution
    if (interaction.initialSentiment === 'negative' && interaction.finalSentiment === 'positive') {
      patterns.push({
        pattern: 'complaint_to_satisfaction',
        confidence: 0.9,
        description: 'Negative sentiment successfully turned positive'
      });
    }
    
    return patterns;
  }

  private findImprovementAreas(interaction: InteractionData): string[] {
    const areas: string[] = [];
    
    if (interaction.responseTime > 3000) {
      areas.push('response_speed');
    }
    
    if (interaction.outcome !== 'resolved') {
      areas.push('resolution_capability');
    }
    
    const sentimentShift = this.calculateSentimentShift(interaction);
    if (sentimentShift < 0) {
      areas.push('sentiment_handling');
    }
    
    return areas;
  }

  private async updateModels(analysis: InteractionAnalysis): Promise<void> {
    // Update response quality model
    const currentModel = this.models.get('responseQuality');
    if (currentModel) {
      const newAccuracy = analysis.success 
        ? Math.min(1, currentModel.accuracy + 0.01)
        : Math.max(0.1, currentModel.accuracy - 0.01);
      
      this.models.set('responseQuality', {
        ...currentModel,
        accuracy: newAccuracy,
        lastUpdated: new Date()
      });
    } else {
      this.models.set('responseQuality', {
        id: 'responseQuality',
        name: 'Response Quality Model',
        version: '1.0',
        accuracy: analysis.success ? 0.8 : 0.5,
        trainedOn: 1,
        lastUpdated: new Date()
      });
    }
  }

  private applyAdaptationRules(analysis: InteractionAnalysis): AdaptationResult[] {
    const results: AdaptationResult[] = [];
    
    for (const rule of this.adaptationRules) {
      if (rule.condition({
        customerSentiment: analysis.patternMatch.some(p => p.pattern === 'complaint_to_satisfaction') 
          ? 'negative' : 'neutral',
        responseTime: 0,
        resolutionSuccess: analysis.success,
        businessImpact: analysis.businessValue
      })) {
        const result = this.executeRule(rule, analysis);
        results.push(result);
        this.updateRuleStats(rule.id, result.success);
      }
    }
    
    return results;
  }

  private executeRule(rule: AdaptationRule, analysis: InteractionAnalysis): AdaptationResult {
    const success = Math.random() > 0.3; // Simulated success
    
    return {
      ruleId: rule.id,
      action: rule.action,
      success,
      applied: success,
      description: `Executed ${rule.action} for ${rule.trigger}`
    };
  }

  private updateRuleStats(ruleId: string, success: boolean): void {
    const rule = this.adaptationRules.find(r => r.id === ruleId);
    if (rule) {
      if (success) {
        rule.successCount++;
        rule.confidence = Math.min(1, rule.confidence + 0.05);
      } else {
        rule.failureCount++;
        rule.confidence = Math.max(0.1, rule.confidence - 0.05);
      }
    }
  }

  private generateInsights(analysis: InteractionAnalysis): string[] {
    const insights: string[] = [];
    
    if (analysis.businessValue > 0.8) {
      insights.push('High-value interaction pattern detected - consider replicating this approach');
    }
    
    if (analysis.sentimentShift > 0) {
      insights.push('Positive sentiment trajectory - current strategy effective');
    }
    
    if (analysis.improvementAreas.length > 0) {
      insights.push(`Improvement opportunities: ${analysis.improvementAreas.join(', ')}`);
    }
    
    if (analysis.patternMatch.length > 0) {
      insights.push(`Patterns identified: ${analysis.patternMatch.map(p => p.pattern).join(', ')}`);
    }
    
    return insights;
  }

  private recordLearning(
    analysis: InteractionAnalysis,
    adaptations: AdaptationResult[],
    insights: string[]
  ): void {
    this.learningHistory.push({
      timestamp: new Date(),
      analysis,
      adaptations,
      insights,
      impact: analysis.businessValue
    });
    
    // Keep last 1000 learning events
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory.slice(-1000);
    }
  }

  private getModelUpdates(): ModelUpdate[] {
    return Array.from(this.models.entries()).map(([key, model]) => ({
      modelId: key,
      newAccuracy: model.accuracy,
      updated: true
    }));
  }

  /**
   * Get system learning status
   */
  getLearningStatus(): LearningStatus {
    return {
      activeModels: this.models.size,
      totalRules: this.adaptationRules.length,
      learningEvents: this.learningHistory.length,
      averageAccuracy: this.calculateAverageAccuracy(),
      topPatterns: this.identifyTopPatterns(),
      recommendations: this.generateSystemRecommendations()
    };
  }

  private calculateAverageAccuracy(): number {
    if (this.models.size === 0) return 0;
    
    let total = 0;
    this.models.forEach(model => total += model.accuracy);
    return total / this.models.size;
  }

  private identifyTopPatterns(): PatternMatch[] {
    // Analyze learning history for most common successful patterns
    const patternCounts: Map<string, number> = new Map();
    
    this.learningHistory.forEach(event => {
      event.analysis.patternMatch.forEach(pattern => {
        const count = patternCounts.get(pattern.pattern) || 0;
        patternCounts.set(pattern.pattern, count + 1);
      });
    });
    
    const topPatterns: PatternMatch[] = [];
    patternCounts.forEach((count, pattern) => {
      if (count > 5) {
        topPatterns.push({
          pattern,
          confidence: Math.min(1, count / 100),
          description: `Detected ${count} times`
        });
      }
    });
    
    return topPatterns.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  private generateSystemRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const avgAccuracy = this.calculateAverageAccuracy();
    if (avgAccuracy < 0.7) {
      recommendations.push('Model accuracy below threshold - consider retraining with more data');
    }
    
    const successfulRules = this.adaptationRules.filter(r => r.successCount > r.failureCount);
    if (successfulRules.length > 0) {
      recommendations.push(`${successfulRules.length} adaptation rules showing positive results`);
    }
    
    return recommendations;
  }

  /**
   * Retrain models with new data
   */
  async retrainModels(): Promise<void> {
    console.log('🔄 Initiating model retraining...');
    
    // Gather training data from learning history
    const trainingData = this.learningHistory.slice(-500);
    
    // Simulate retraining process
    for (const [key, model] of this.models.entries()) {
      const improvedAccuracy = Math.min(1, model.accuracy + 0.1);
      this.models.set(key, {
        ...model,
        accuracy: improvedAccuracy,
        version: this.incrementVersion(model.version),
        trainedOn: model.trainedOn + trainingData.length,
        lastUpdated: new Date()
      });
    }
    
    console.log('✅ Model retraining complete');
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0]) || 1;
    const minor = parseInt(parts[1]) || 0;
    return `${major}.${minor + 1}`;
  }
}

// ============================================================================
// FEEDBACK LOOP - Closes the learning cycle
// ============================================================================

class FeedbackLoop {
  private feedbackQueue: FeedbackItem[] = [];
  private processedFeedback: number = 0;

  async processFeedback(feedback: CustomerFeedback): Promise<FeedbackResult> {
    const relevantRules = this.findRelevantRules(feedback);
    
    return {
      feedbackId: feedback.id,
      processed: true,
      relevantRules,
      suggestedActions: this.generateActions(feedback, relevantRules)
    };
  }

  private findRelevantRules(feedback: CustomerFeedback): string[] {
    // Find adaptation rules that should respond to this feedback
    return []; // Simplified for demo
  }

  private generateActions(feedback: CustomerFeedback, rules: string[]): string[] {
    if (feedback.rating >= 4) {
      return ['log_success', 'share_positive_pattern'];
    } else {
      return ['analyze_issue', 'adjust_strategy', 'monitor_closely'];
    }
  }

  getStats(): { queued: number; processed: number } {
    return {
      queued: this.feedbackQueue.length,
      processed: this.processedFeedback
    };
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface LearningResult {
  analysis: InteractionAnalysis;
  adaptations: AdaptationResult[];
  insights: string[];
  learningTime: number;
  modelUpdates: ModelUpdate[];
}

interface InteractionData {
  id: string;
  initialSentiment: 'positive' | 'negative' | 'neutral';
  finalSentiment: 'positive' | 'negative' | 'neutral';
  responseTime: number;
  outcome: 'resolved' | 'escalated' | 'pending';
  purchaseGenerated?: boolean;
  customerRetained?: boolean;
  referralGenerated?: boolean;
  escalated?: boolean;
}

interface InteractionAnalysis {
  success: boolean;
  responseTimeMet: boolean;
  sentimentShift: number;
  businessValue: number;
  patternMatch: PatternMatch[];
  improvementAreas: string[];
}

interface PatternMatch {
  pattern: string;
  confidence: number;
  description: string;
}

interface AdaptationResult {
  ruleId: string;
  action: string;
  success: boolean;
  applied: boolean;
  description: string;
}

interface LearningEvent {
  timestamp: Date;
  analysis: InteractionAnalysis;
  adaptations: AdaptationResult[];
  insights: string[];
  impact: number;
}

interface ModelUpdate {
  modelId: string;
  newAccuracy: number;
  updated: boolean;
}

interface LearningStatus {
  activeModels: number;
  totalRules: number;
  learningEvents: number;
  averageAccuracy: number;
  topPatterns: PatternMatch[];
  recommendations: string[];
}

interface CustomerFeedback {
  id: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

interface FeedbackItem {
  feedback: CustomerFeedback;
  processedAt: Date;
  actionTaken?: string;
}

interface FeedbackResult {
  feedbackId: string;
  processed: boolean;
  relevantRules: string[];
  suggestedActions: string[];
}

// Export singleton
export const selfLearningEngine = new SelfLearningEngine();
export default SelfLearningEngine;