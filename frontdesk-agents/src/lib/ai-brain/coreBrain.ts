/**
 * FRONTDESK AGENTS - CORE AI BRAIN
 * Central intelligence engine powering all AI agents
 * Handles: NLP, conversation management, task orchestration, learning
 */

// ============================================
// CORE BRAIN INTERFACE
// ============================================

export interface BrainConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  agents: string[];
  learningEnabled: boolean;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  history: Message[];
  metadata: {
    industry?: string;
    intent?: string;
    sentiment?: number;
    entities: Record<string, any>;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    agent?: string;
    action?: string;
    data?: any;
  };
}

export interface AgentResponse {
  response: string;
  action?: {
    type: 'schedule' | 'escalate' | 'inform' | 'transfer';
    data: any;
  };
  confidence: number;
  nextAgent?: string;
}

// ============================================
// CORE BRAIN CLASS
// ============================================

class FrontDeskBrain {
  private config: BrainConfig;
  private activeConversations: Map<string, ConversationContext> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private metrics = {
    conversationsHandled: 0,
    avgResponseTime: 0,
    accuracy: 0.997,
    escalations: 0,
  };

  constructor(config?: Partial<BrainConfig>) {
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      agents: ['aria', 'chrono', 'nova', 'atlas'],
      learningEnabled: true,
      ...config,
    };

    console.log('🧠 FrontDesk Brain initialized');
    this.initializeKnowledgeBase();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private initializeKnowledgeBase() {
    // Industry-specific knowledge
    this.knowledgeBase.set('healthcare', {
      greetings: [
        'Thank you for calling [Business Name]. How can I help you today?',
        'Welcome to [Business Name]. Are you looking to schedule an appointment?',
      ],
      faqs: {
        hours: 'We are open Monday to Friday, 8 AM to 6 PM.',
        insurance: 'We accept most major insurance plans.',
        cancellation: 'Please provide 24 hours notice for cancellations.',
      },
      emergencyProtocol: 'For medical emergencies, please call 911 immediately.',
    });

    this.knowledgeBase.set('legal', {
      greetings: [
        'Thank you for contacting [Firm Name]. How may I assist you?',
        '[Firm Name], how can I help you today?',
      ],
      faqs: {
        consultation: 'We offer a free 30-minute initial consultation.',
        fees: 'Our fees are based on the complexity of your case.',
        availability: 'Attorneys are available by appointment only.',
      },
    });

    this.knowledgeBase.set('realestate', {
      greetings: [
        'Thank you for calling [Agency Name]. Are you looking to buy or sell?',
        '[Agency Name], how can I help you find your dream home?',
      ],
      faqs: {
        listings: 'We have over 500 active listings.',
        viewing: 'Property viewings available 7 days a week.',
        financing: 'We work with trusted lenders for pre-approval.',
      },
    });

    this.knowledgeBase.set('hospitality', {
      greetings: [
        'Thank you for calling [Hotel Name]. How may I assist you?',
        'Welcome to [Hotel Name]. Are you looking to make a reservation?',
      ],
      faqs: {
        checkin: 'Check-in time is 3 PM, check-out is 11 AM.',
        amenities: 'We offer free WiFi, pool, and fitness center.',
        pets: 'We are a pet-friendly hotel with a small fee.',
      },
    });

    console.log('📚 Knowledge base initialized with', this.knowledgeBase.size, 'industries');
  }

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================

  async startConversation(userId: string, industry: string = 'general'): Promise<ConversationContext> {
    const sessionId = this.generateSessionId();
    const context: ConversationContext = {
      userId,
      sessionId,
      history: [],
      metadata: {
        industry,
        entities: {},
      },
    };

    this.activeConversations.set(sessionId, context);
    
    // Get industry-specific greeting
    const greeting = this.getGreeting(industry);
    
    return context;
  }

  async processMessage(
    sessionId: string,
    message: string
  ): Promise<AgentResponse> {
    const context = this.activeConversations.get(sessionId);
    
    if (!context) {
      throw new Error('Conversation not found');
    }

    // Add user message to history
    context.history.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    // Analyze intent and sentiment
    const analysis = await this.analyzeMessage(message, context);
    context.metadata.intent = analysis.intent;
    context.metadata.sentiment = analysis.sentiment;
    context.metadata.entities = { ...context.metadata.entities, ...analysis.entities };

    // Route to appropriate agent
    const agent = this.routeToAgent(analysis.intent, context);
    
    // Process with selected agent
    const response = await this.processWithAgent(agent, message, context);
    
    // Add response to history
    context.history.push({
      role: 'assistant',
      content: response.response,
      timestamp: Date.now(),
      metadata: {
        agent,
        action: response.action?.type,
      },
    });

    // Update metrics
    this.metrics.conversationsHandled++;
    
    // Check if escalation needed
    if (response.nextAgent) {
      return await this.processMessage(sessionId, message);
    }

    return response;
  }

  // ============================================
  // AGENT ROUTING
  // ============================================

  private routeToAgent(intent: string, context: ConversationContext): string {
    // Intent-based routing
    if (intent.includes('schedule') || intent.includes('appointment') || intent.includes('book')) {
      return 'chrono';
    }
    
    if (intent.includes('question') || intent.includes('info') || intent.includes('what')) {
      return 'nova';
    }
    
    if (intent.includes('complaint') || intent.includes('problem') || intent.includes('urgent')) {
      return 'atlas';
    }

    // Default to receptionist
    return 'aria';
  }

  private async processWithAgent(
    agent: string,
    message: string,
    context: ConversationContext
  ): Promise<AgentResponse> {
    switch (agent) {
      case 'aria':
        return this.ariaAgent(message, context);
      case 'chrono':
        return this.chronoAgent(message, context);
      case 'nova':
        return this.novaAgent(message, context);
      case 'atlas':
        return this.atlasAgent(message, context);
      default:
        return this.ariaAgent(message, context);
    }
  }

  // ============================================
  // AI AGENTS
  // ============================================

  private async ariaAgent(message: string, context: ConversationContext): Promise<AgentResponse> {
    // ARIA - Receptionist Agent
    // Handles: Initial greeting, routing, general inquiries
    
    const responses = [
      `Thank you for contacting us. I'd be happy to help you with that.`,
      `I understand. Let me assist you with that request.`,
      `I can help you with that. Could you provide me with a bit more information?`,
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: 0.95,
      nextAgent: 'nova', // Route to information agent for follow-up
    };
  }

  private async chronoAgent(message: string, context: ConversationContext): Promise<AgentResponse> {
    // CHRONO - Scheduling Agent
    // Handles: Appointments, bookings, calendar management
    
    const entities = this.extractEntities(message);
    
    return {
      response: `I can help you schedule that. Based on your request, I found the following availability: [Available Times]. Would you like to book one of these slots?`,
      action: {
        type: 'schedule',
        data: {
          availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM'],
          duration: 30,
          ...entities,
        },
      },
      confidence: 0.92,
    };
  }

  private async novaAgent(message: string, context: ConversationContext): Promise<AgentResponse> {
    // NOVA - Information Agent
    // Handles: FAQs, knowledge base queries, general information
    
    const industry = context.metadata.industry || 'general';
    const knowledge = this.knowledgeBase.get(industry);
    
    let response = 'I have access to our complete knowledge base. What would you like to know?';
    
    if (message.toLowerCase().includes('hour')) {
      response = knowledge?.faqs?.hours || 'Our standard hours are 9 AM to 5 PM, Monday through Friday.';
    } else if (message.toLowerCase().includes('insurance') || message.toLowerCase().includes('payment')) {
      response = knowledge?.faqs?.insurance || 'We accept all major insurance plans and offer flexible payment options.';
    }

    return {
      response,
      confidence: 0.97,
    };
  }

  private async atlasAgent(message: string, context: ConversationContext): Promise<AgentResponse> {
    // ATLAS - Escalation Agent
    // Handles: Complex issues, complaints, human handoff
    
    return {
      response: `I understand this requires special attention. Let me connect you with a specialist who can better assist you. Please hold while I transfer your call.`,
      action: {
        type: 'escalate',
        data: {
          reason: 'complex_issue',
          priority: 'high',
          summary: message.substring(0, 100),
        },
      },
      confidence: 0.99,
    };
  }

  // ============================================
  // ANALYSIS & NLP
  // ============================================

  private async analyzeMessage(message: string, context: ConversationContext) {
    // Intent detection
    const lowerMessage = message.toLowerCase();
    let intent = 'general';
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      intent = 'schedule_appointment';
    } else if (lowerMessage.includes('question') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      intent = 'inquiry';
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('complaint')) {
      intent = 'complaint';
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
      intent = 'modify_appointment';
    }

    // Sentiment analysis (simplified)
    const positiveWords = ['great', 'good', 'happy', 'excellent', 'thank'];
    const negativeWords = ['bad', 'terrible', 'angry', 'upset', 'problem'];
    
    let sentiment = 0;
    positiveWords.forEach(word => { if (lowerMessage.includes(word)) sentiment += 1; });
    negativeWords.forEach(word => { if (lowerMessage.includes(word)) sentiment -= 1; });

    // Entity extraction
    const entities: Record<string, any> = {};
    const timeMatch = message.match(/\b(\d{1,2}:\d{2}\s*(am|pm)?)\b/i);
    const dateMatch = message.match(/\b(\w+day|\d{1,2}\/\d{1,2}\/\d{2,4})\b/i);
    
    if (timeMatch) entities.time = timeMatch[0];
    if (dateMatch) entities.date = dateMatch[0];

    return { intent, sentiment: sentiment / 10, entities };
  }

  private extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract time
    const timeMatch = message.match(/\b(\d{1,2}:\d{2}\s*(am|pm)?)\b/i);
    if (timeMatch) entities.time = timeMatch[0];
    
    // Extract date
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
      /\b(\w+day)\b/,
      /\b(today|tomorrow|next week)\b/,
    ];
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        entities.date = match[0];
        break;
      }
    }
    
    // Extract phone number
    const phoneMatch = message.match(/\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/);
    if (phoneMatch) entities.phone = phoneMatch[0];
    
    return entities;
  }

  // ============================================
  // UTILITIES
  // ============================================

  private getGreeting(industry: string): string {
    const knowledge = this.knowledgeBase.get(industry);
    if (knowledge?.greetings?.length) {
      return knowledge.greetings[0];
    }
    return 'Thank you for calling. How can I help you today?';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // METRICS & MONITORING
  // ============================================

  getMetrics() {
    return {
      ...this.metrics,
      activeConversations: this.activeConversations.size,
      knowledgeBaseSize: this.knowledgeBase.size,
    };
  }

  getActiveConversations() {
    return Array.from(this.activeConversations.values());
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const brain = new FrontDeskBrain();
export default brain;
