/**
 * AI-Powered Hypothesis Generation for Harness Engineering Engine
 * Uses LangChain to generate contextual, data-driven improvement hypotheses
 * Supports Anthropic Claude and OpenAI GPT with auto-detection from env vars
 */

import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

// Types (re-declared to avoid circular dependency with engine.ts)

export interface Anomaly {
  id: string
  type: string
  severity: string
  description: string
  affectedComponent: string
  detectedAt: string
  metrics: Record<string, any>
}

export interface Hypothesis {
  id: string
  anomalyId: string
  description: string
  expectedImprovement: number
  confidence: number
  suggestedFix: string
  affectedArea: string
}

export interface PlatformMetrics {
  errorRate: number
  avgLatencyMs: number
  requestsPerSecond: number
  conversionRate: number
  churnRate: number
  customerSatisfaction: number
  activeCustomers: number
  totalCalls: number
  callSuccessRate: number
  mrr: number
  arr: number
  timestamp: string
}

export interface CycleSummary {
  cycle: number
  timestamp: string
  anomaliesCount: number
  deploymentsCount: number
  success: boolean
}

// Provider Detection

type AIProvider = 'anthropic' | 'openai' | null

function detectProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 0) {
    return 'anthropic'
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0) {
    return 'openai'
  }
  return null
}

function createModel() {
  const provider = detectProvider()
  
  if (provider === 'anthropic') {
    return new ChatAnthropic({
      model: 'claude-sonnet-4-20250514',
      temperature: 0.3,
      maxTokens: 4096,
    })
  }
  
  if (provider === 'openai') {
    return new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 4096,
    })
  }
  
  return null
}

// Build System Prompt

function buildSystemPrompt(metrics: PlatformMetrics, previousCycles: CycleSummary[]): string {
  const cycleContext = previousCycles.length > 0
    ? 'Recent cycle history (most recent first):\n' + previousCycles.slice(0, 5).map(c =>
        '  - Cycle #' + c.cycle + ': ' + c.anomaliesCount + ' anomalies, ' + c.deploymentsCount + ' deployments, success=' + c.success
      ).join('\n')
    : '  - No previous cycles recorded.'

  return 'You are an expert AI infrastructure engineer for an AI receptionist platform called FrontDesk Agents AI. Your role is to analyze system anomalies and generate precise, actionable improvement hypotheses.\n\n' +
    'CURRENT PLATFORM STATE:\n' +
    '- Active Customers: ' + metrics.activeCustomers + '\n' +
    '- MRR: $' + metrics.mrr.toLocaleString() + '\n' +
    '- ARR: $' + metrics.arr.toLocaleString() + '\n' +
    '- Error Rate: ' + (metrics.errorRate * 100).toFixed(2) + '%\n' +
    '- Avg Latency: ' + metrics.avgLatencyMs + 'ms\n' +
    '- Conversion Rate: ' + (metrics.conversionRate * 100).toFixed(2) + '%\n' +
    '- Churn Rate: ' + (metrics.churnRate * 100).toFixed(1) + '%\n' +
    '- Call Success Rate: ' + (metrics.callSuccessRate * 100).toFixed(1) + '%\n' +
    '- Customer Satisfaction: ' + metrics.customerSatisfaction.toFixed(1) + '/5\n\n' +
    cycleContext + '\n\n' +
    'For each anomaly detected, generate ONE hypothesis with:\n' +
    '1. A clear description of the proposed improvement\n' +
    '2. Expected improvement (0.0-1.0, where 1.0 = 100% improvement)\n' +
    '3. Confidence level (0.0-1.0, how sure you are this will work)\n' +
    '4. Specific, actionable suggested fix with concrete implementation steps\n' +
    '5. Affected area (one of: infrastructure, performance, onboarding, retention, support, voice, billing, marketing)\n\n' +
    'Respond with a JSON array of hypotheses. Each hypothesis must have this exact format:\n' +
    '{\n' +
    '  "description": "...",\n' +
    '  "expectedImprovement": 0.0-1.0,\n' +
    '  "confidence": 0.0-1.0,\n' +
    '  "suggestedFix": "...",\n' +
    '  "affectedArea": "..."\n' +
    '}\n\n' +
    'Return ONLY the JSON array, no markdown formatting, no explanation text.'
}

// Build Anomaly Context

function buildAnomalyContext(anomalies: Anomaly[]): string {
  return anomalies.map(a =>
    '[' + a.severity.toUpperCase() + '] ' + a.type + ' in ' + a.affectedComponent + ': ' + a.description
  ).join('\n')
}

// Generate AI Hypotheses

export async function generateAIHypotheses(
  anomalies: Anomaly[],
  metrics: PlatformMetrics,
  previousCycles: CycleSummary[]
): Promise<Hypothesis[] | null> {
  const model = createModel()
  
  if (!model) {
    console.warn('[Harness AI] No AI provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)')
    return null
  }
  
  if (anomalies.length === 0) {
    return []
  }

  const provider = detectProvider()
  console.log('[Harness AI] Generating hypotheses using', provider === 'anthropic' ? 'Claude' : 'GPT-4o')

  try {
    const systemPrompt = buildSystemPrompt(metrics, previousCycles)
    const anomalyContext = buildAnomalyContext(anomalies)
    
    const userMessage = 'Analyze the following anomalies and generate improvement hypotheses:\n\n' +
      anomalyContext + '\n\n' +
      'Generate exactly ' + anomalies.length + ' hypothesis/hypotheses (one per anomaly). Return ONLY a valid JSON array.'

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userMessage),
    ])

    const text = typeof response.content === 'string'
      ? response.content
      : Array.isArray(response.content)
        ? response.content.map(c => typeof c === 'object' && 'text' in c ? c.text : '').join('')
        : ''

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonStr = extractJSON(text)
    if (!jsonStr) {
      console.warn('[Harness AI] Failed to extract JSON from response, falling back to rule-based')
      return null
    }

    const parsed = JSON.parse(jsonStr)
    const hypothesesArray = Array.isArray(parsed) ? parsed : [parsed]

    // Map to Hypothesis interface with generated IDs
    const hypotheses: Hypothesis[] = hypothesesArray.map((h: any, i: number) => ({
      id: 'ai_hypothesis_' + (anomalies[i]?.id || Date.now()) + '_' + i,
      anomalyId: anomalies[i]?.id || 'unknown',
      description: h.description || 'No description provided',
      expectedImprovement: clamp(h.expectedImprovement || 0, 0, 1),
      confidence: clamp(h.confidence || 0, 0, 1),
      suggestedFix: h.suggestedFix || 'No fix provided',
      affectedArea: h.affectedArea || 'system',
    }))

    console.log('[Harness AI] Generated', hypotheses.length, 'hypotheses')
    return hypotheses
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[Harness AI] AI hypothesis generation failed:', errMsg)
    return null
  }
}

// Utilities

function extractJSON(text: string): string | null {
  // Try to find JSON array or object
  const jsonRegex = /\[\s\S]*?\]|\{[\s\S]*?\}/g
  const matches = text.match(jsonRegex)
  
  if (!matches) return null
  
  for (const match of matches) {
    try {
      JSON.parse(match)
      return match
    } catch {
      continue
    }
  }
  
  return null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
