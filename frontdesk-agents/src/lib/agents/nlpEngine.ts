// AI Response Generator - Natural Language Processing for Receptionist

import { InteractionContext, AIResponse, SentimentResult } from './types'

// Intent patterns for recognition
const intentPatterns = {
  greeting: /\b(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy|yo)\b/i,
  appointment: /\b(appointment|schedule|book|reserve|meeting|time|slot|available|calendar)\b/i,
  information: /\b(what|how|where|when|why|who|info|information|tell me|explain|know)\b/i,
  pricing: /\b(price|cost|fee|charge|pay|payment|quote|estimate|budget)\b/i,
  location: /\b(address|location|find|get there|directions|navigate)\b/i,
  hours: /\b(hours|open|close|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  complaint: /\b(complaint|angry|unhappy|frustrated|problem|issue|wrong|bad|terrible|awful)\b/i,
  escalation: /\b(speak|human|real person|manager|supervisor|someone|person|agent|representative)\b/i,
  thank: /\b(thank|thanks|appreciate|grateful|thx)\b/i,
  goodbye: /\b(bye|goodbye|see you|later|goodnight|take care)\b/i
}

// Entity extraction patterns - simplified to avoid TypeScript regex issues
const entityPatterns = {
  email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}/,
  phone: /\b(\\\/+)?\b/,
  date: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\b)/i,
  time: /\b(\b)/i,
  name: /(my name is|i am|this is)\b/i
}

// Sentiment keywords
const sentimentKeywords = {
  positive: ['excellent', 'amazing', 'great', 'wonderful', 'fantastic', 'love', 'perfect', 'awesome', 'thank', 'appreciate', 'helpful', 'best', 'happy', 'pleased', 'satisfied'],
  negative: ['angry', 'frustrated', 'upset', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disappointed', 'annoyed', 'irritated', 'unhappy', 'poor'],
  frustrated: ['stuck', 'cannot', 'wont', 'doesnt work', 'help', 'urgent', 'immediately', 'asap', 'now', 'waiting', 'long', 'hold']
}

export class NLPEngine {
  private responseTemplates: Map<string, string[]> = new Map()
  
  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    this.responseTemplates.set('greeting', [
      'Welcome! I am your AI receptionist. How may I assist you today?',
      'Hello! Welcome to our office. I am here to help with any questions or scheduling needs.',
      'Good day! How may I make your visit more pleasant today?',
      'Welcome! I can help you with appointments, information, and connecting you to the right person.'
    ])

    this.responseTemplates.set('appointment', [
      'I would be happy to help you schedule an appointment. What date and time would work best for you?',
      'Let me assist you with booking. Could you please provide your preferred date and the service you need?',
      'I can schedule an appointment for you right away. What type of service are you looking for?',
      'Appointment booking is my specialty! When would you like to come in?'
    ])

    this.responseTemplates.set('information', [
      'I will be happy to provide that information. Let me assist you.',
      'Great question! Here is what I found:',
      'Thank you for your inquiry. Here is the information you requested:',
      'I have the information you need. Let me share it with you:'
    ])

    this.responseTemplates.set('location', [
      'Our office is located at 1250 Innovation Drive, Suite 400. Would you like directions?',
      'You can find us at the West Tower, 4th floor. I can also provide parking information.',
      'We are at 1250 Innovation Drive. Public transit options are also available if you need them.'
    ])

    this.responseTemplates.set('hours', [
      'Our business hours are Monday through Friday, 8:00 AM to 6:00 PM. Emergency support is available 24/7.',
      'We are open Monday-Friday 8AM-6PM. For urgent matters outside these hours, please call our emergency line.',
      'Our regular hours are 8:00 AM to 6:00 PM, Monday through Friday.'
    ])

    this.responseTemplates.set('pricing', [
      'Our pricing varies based on the service required. Would you like to schedule a consultation for a detailed quote?',
      'I would be happy to discuss pricing with you. Can you tell me more about the service you are interested in?',
      'For accurate pricing, I recommend scheduling a consultation where we can discuss your specific needs.'
    ])

    this.responseTemplates.set('escalation', [
      'I understand you prefer to speak with someone. Let me connect you with a team member who can assist further.',
      'Absolutely, I will get a human representative for you right away. Please hold for just a moment.',
      'I am escalating your request to our team. A representative will be with you shortly.'
    ])

    this.responseTemplates.set('complaint', [
      'I sincerely apologize for any inconvenience. Let me see what I can do to resolve this for you.',
      'I understand your frustration and want to help. Please allow me to escalate this to ensure quick resolution.',
      'I am very sorry to hear about your experience. Let me connect you with someone who can immediately assist.'
    ])

    this.responseTemplates.set('thank', [
      'You are most welcome! Is there anything else I can help you with today?',
      'My pleasure! Feel free to reach out if you need any further assistance.',
      'Glad I could help! Have a wonderful day!'
    ])

    this.responseTemplates.set('goodbye', [
      'Thank you for visiting! Have a wonderful day and please come back anytime.',
      'Goodbye! We look forward to seeing you soon.',
      'Take care! Do not hesitate to contact us if you need anything else.'
    ])
  }

  public analyzeSentiment(message: string): SentimentResult {
    const lowerMessage = message.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0
    let frustratedCount = 0
    const emotions: string[] = []

    sentimentKeywords.positive.forEach(word => {
      if (lowerMessage.includes(word)) {
        positiveCount++
        emotions.push('positive')
      }
    })

    sentimentKeywords.negative.forEach(word => {
      if (lowerMessage.includes(word)) {
        negativeCount++
        emotions.push('negative')
      }
    })

    sentimentKeywords.frustrated.forEach(word => {
      if (lowerMessage.includes(word)) {
        frustratedCount++
        emotions.push('frustrated')
      }
    })

    const total = positiveCount + negativeCount + frustratedCount
    const score = total > 0 ? (positiveCount - negativeCount - frustratedCount) / total : 0

    let label: 'positive' | 'neutral' | 'negative' | 'frustrated' = 'neutral'
    if (frustratedCount > 0) label = 'frustrated'
    else if (negativeCount > positiveCount) label = 'negative'
    else if (positiveCount > negativeCount) label = 'positive'

    let actionRecommended: string | undefined
    if (frustratedCount >= 2) {
      actionRecommended = 'escalate_to_human'
    } else if (negativeCount >= 2) {
      actionRecommended = 'express_empathy_and_offer_help'
    }

    return {
      score: Math.max(-1, Math.min(1, score)),
      label,
      emotions: [...new Set(emotions)],
      actionRecommended
    }
  }

  public extractEntities(message: string): Record<string, string[]> {
    const entities: Record<string, string[]> = {
      email: [],
      phone: [],
      date: [],
      time: [],
      name: []
    }

    const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}/
    const emailMatches = message.match(emailRegex)
    if (emailMatches) entities.email = emailMatches

    return entities
  }

  public detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(lowerMessage)) {
        return intent
      }
    }

    return 'unknown'
  }

  public generateResponse(
    message: string, 
    context: InteractionContext,
    agentType: string
  ): AIResponse {
    const startTime = Date.now()
    
    const intent = this.detectIntent(message)
    const sentiment = this.analyzeSentiment(message)
    const entities = this.extractEntities(message)

    const templates = this.responseTemplates.get(intent) || this.responseTemplates.get('information')!
    const baseResponse = templates[Math.floor(Math.random() * templates.length)]

    let response = this.customizeResponse(baseResponse, intent, sentiment, context, entities)

    if (intent === 'greeting' && context.industry) {
      response = this.addIndustryGreeting(response, context.industry)
    }

    const requiresEscalation = sentiment.actionRecommended === 'escalate_to_human' || 
                               intentPatterns.escalation.test(message)

    const confidence = this.calculateConfidence(intent, sentiment, entities)
    const responseTime = Date.now() - startTime

    return {
      agentId: `${agentType}-agent-${Date.now()}`,
      content: response,
      confidence,
      suggestedActions: this.getSuggestedActions(intent, context),
      requiresHumanEscalation: requiresEscalation,
      sentimentAnalysis: sentiment,
      language: context.visitorLanguage,
      responseTime,
      suggestedAgentTransfer: requiresEscalation ? 'escalation' : undefined,
      metadata: {
        tokensUsed: response.split(' ').length * 1.3,
        modelVersion: 'frontdesk-agents-v1.0',
        cachedResponse: false,
        processingTimeMs: responseTime
      }
    }
  }

  private customizeResponse(
    baseResponse: string, 
    intent: string, 
    sentiment: SentimentResult,
    context: InteractionContext,
    entities: Record<string, string[]>
  ): string {
    let response = baseResponse

    if (sentiment.label === 'frustrated') {
      response = 'I completely understand your frustration, and I want to help resolve this as quickly as possible. ' + response
    } else if (sentiment.label === 'negative') {
      response = 'I am sorry you are having a difficult experience. ' + response
    }

    if (context.previousInteractions > 0 && entities.name.length > 0) {
      response = `Welcome back, ${entities.name[0]}! ` + response
    }

    if (context.urgency === 'high' || context.urgency === 'emergency') {
      response = 'I understand this is urgent. Let me prioritize this for you. ' + response
    }

    return response
  }

  private addIndustryGreeting(response: string, industry: string): string {
    const industryGreetings: Record<string, string> = {
      healthcare: 'Welcome to our medical facility. ',
      legal: 'Welcome to our law office. ',
      realestate: 'Welcome to our real estate office. ',
      hospitality: 'Welcome to our hotel. ',
      corporate: 'Welcome to our corporate office. ',
      retail: 'Welcome! ',
      education: 'Welcome to our academic institution. ',
      government: 'Welcome to our government office. '
    }
    return (industryGreetings[industry] || '') + response
  }

  private calculateConfidence(intent: string, sentiment: SentimentResult, entities: Record<string, string[]>): number {
    let confidence = 0.7
    if (intent !== 'unknown') confidence += 0.15
    const entityCount = Object.values(entities).flat().length
    if (entityCount > 0) confidence += 0.1
    if (Math.abs(sentiment.score) > 0.5) confidence += 0.05
    return Math.min(0.99, Math.max(0.3, confidence))
  }

  private getSuggestedActions(intent: string, context: InteractionContext): string[] {
    const actions: Record<string, string[]> = {
      greeting: ['Ask about services', 'Schedule appointment', 'Get directions'],
      appointment: ['Select date/time', 'Choose service type', 'Confirm booking'],
      information: ['View detailed info', 'Ask related question', 'Connect to specialist'],
      pricing: ['Request quote', 'Schedule consultation', 'View service packages'],
      location: ['Get directions', 'View map', 'Find parking'],
      hours: ['Check availability', 'Schedule visit', 'Contact after-hours'],
      escalation: ['Connect to agent', 'Schedule callback', 'Submit request form'],
      complaint: ['File complaint', 'Request callback', 'Speak to manager'],
      thank: ['Provide more help', 'End conversation', 'Take survey'],
      goodbye: ['End conversation', 'Provide contact info', 'Offer follow-up']
    }
    return actions[intent] || ['Provide more information', 'Connect to agent', 'Schedule appointment']
  }
}

export const nlpEngine = new NLPEngine()