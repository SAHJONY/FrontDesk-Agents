import { Agent, AgentType, InteractionContext, AIResponse, IndustryType } from './types'

// Agent Coordinator - orchestrates multiple AI agents
export class AgentCoordinator {
  private agents: Map<AgentType, Agent[]> = new Map()
  private activeInteractions: Map<string, Agent> = new Map()
  
  constructor() {
    this.initializeAgents()
  }

  private initializeAgents() {
    const agentConfigs: { type: AgentType; count: number }[] = [
      { type: 'greeting', count: 3 },
      { type: 'scheduling', count: 2 },
      { type: 'information', count: 4 },
      { type: 'escalation', count: 2 },
      { type: 'multilingual', count: 3 }
    ]

    agentConfigs.forEach(({ type, count }) => {
      const agents: Agent[] = []
      for (let i = 0; i < count; i++) {
        agents.push(this.createAgent(type, i))
      }
      this.agents.set(type, agents)
    })
  }

  private createAgent(type: AgentType, index: number): Agent {
    const agentNames: Record<AgentType, string[]> = {
      greeting: ['ARIA', 'NOVA', 'LUNA'],
      scheduling: ['CHRONOS', 'CALENDAR', 'SCHEDULE'],
      information: ['KNOWLEDGE', 'WIKI', 'INFO'],
      escalation: ['ESCALATE', 'CONNECT', 'DIRECT'],
      multilingual: ['GLOBAL', 'POLY', 'LINGUA']
    }

    return {
      id: `${type}-${index}-${Date.now()}`,
      name: `${agentNames[type][index % agentNames[type].length]} ${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
      type,
      status: 'online',
      avatar: this.getAgentAvatar(type, index),
      capabilities: this.getAgentCapabilities(type),
      languages: this.getAgentLanguages(type),
      confidenceThreshold: type === 'escalation' ? 0.7 : 0.85,
      maxConcurrentInteractions: type === 'information' ? 10 : 5,
      currentLoad: 0,
      specialties: this.getAgentSpecialties(type),
      createdAt: new Date(),
      lastActiveAt: new Date()
    }
  }

  private getAgentAvatar(type: AgentType, index: number): string {
    const avatars: Record<AgentType, string[]> = {
      greeting: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80',
        'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80'
      ],
      scheduling: [
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=80'
      ],
      information: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80'
      ],
      escalation: [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80'
      ],
      multilingual: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80'
      ]
    }
    return avatars[type][index % avatars[type].length]
  }

  private getAgentCapabilities(type: AgentType): string[] {
    const capabilities: Record<AgentType, string[]> = {
      greeting: ['Warm Welcome', 'Company Overview', 'Visitor Registration', 'Wayfinding', 'Security Check-in'],
      scheduling: ['Appointment Booking', 'Calendar Management', 'Rescheduling', 'Cancellation Handling', 'Reminder Setup'],
      information: ['FAQ Answers', 'Product Info', 'Service Details', 'Direction Guidance', 'Policy Explanation'],
      escalation: ['Complex Issue Resolution', 'Complaint Handling', 'Special Request Routing', 'Manager Connection'],
      multilingual: ['Language Detection', 'Real-time Translation', 'Cultural Context', 'International Visitors']
    }
    return capabilities[type]
  }

  private getAgentLanguages(type: AgentType): string[] {
    const baseLanguages = ['English', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Portuguese', 'German', 'Japanese', 'Korean', 'Hindi']
    
    if (type === 'multilingual') {
      return baseLanguages
    }
    return baseLanguages.slice(0, 5)
  }

  private getAgentSpecialties(type: AgentType): string[] {
    const specialties: Record<AgentType, string[]> = {
      greeting: ['Customer Experience', 'First Impressions', 'Hospitality'],
      scheduling: ['Time Management', 'Calendar Optimization', 'Resource Allocation'],
      information: ['Knowledge Retrieval', 'Data Synthesis', 'Clear Communication'],
      escalation: ['Conflict Resolution', 'Empathy', 'Problem Solving'],
      multilingual: ['Cross-cultural Communication', 'Localization', 'International Business']
    }
    return specialties[type]
  }

  // Select the best agent for a given context
  public selectBestAgent(context: InteractionContext): Agent {
    let selectedAgent: Agent | null = null
    let highestScore = 0

    // Determine primary agent type based on context
    const primaryType = this.determineAgentType(context)
    const agents = this.agents.get(primaryType) || []

    for (const agent of agents) {
      if (agent.status !== 'online') continue
      if (agent.currentLoad >= agent.maxConcurrentInteractions) continue

      // Calculate score based on load and capabilities
      const score = this.calculateAgentScore(agent, context)
      
      if (score > highestScore) {
        highestScore = score
        selectedAgent = agent
      }
    }

    // Fallback to any available agent
    if (!selectedAgent) {
      for (const [, agentList] of this.agents) {
        selectedAgent = agentList.find(a => a.status === 'online' && a.currentLoad < a.maxConcurrentInteractions) || null
        if (selectedAgent) break
      }
    }

    return selectedAgent || this.createAgent('greeting', 0)
  }

  private determineAgentType(context: InteractionContext): AgentType {
    const purpose = context.purpose.toLowerCase()

    if (purpose.includes('appointment') || purpose.includes('schedule') || purpose.includes('book')) {
      return 'scheduling'
    }
    if (purpose.includes('speak') || purpose.includes('human') || purpose.includes('real') || context.sentiment === 'frustrated') {
      return 'escalation'
    }
    if (context.visitorLanguage !== 'English' && !this.isCommonLanguage(context.visitorLanguage)) {
      return 'multilingual'
    }
    if (purpose.includes('info') || purpose.includes('know') || purpose.includes('what') || purpose.includes('how')) {
      return 'information'
    }
    return 'greeting'
  }

  private isCommonLanguage(lang: string): boolean {
    return ['English', 'Spanish', 'French', 'Mandarin'].includes(lang)
  }

  private calculateAgentScore(agent: Agent, context: InteractionContext): number {
    let score = 100 - (agent.currentLoad * 10)
    
    // Boost score for matching specialties
    if (agent.specialties.some(s => context.purpose.toLowerCase().includes(s.toLowerCase()))) {
      score += 20
    }

    // Boost for language match
    if (agent.languages.includes(context.visitorLanguage)) {
      score += 15
    }

    // Reduce for high urgency if agent has capacity
    if (context.urgency === 'high' || context.urgency === 'emergency') {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  // Route interaction to appropriate agent
  public async routeInteraction(context: InteractionContext): Promise<Agent> {
    const agent = this.selectBestAgent(context)
    agent.currentLoad++
    agent.lastActiveAt = new Date()
    this.activeInteractions.set(context.visitorId || Date.now().toString(), agent)
    return agent
  }

  // Release agent after interaction
  public releaseAgent(agentId: string): void {
    for (const [interactionId, agent] of this.activeInteractions) {
      if (agent.id === agentId) {
        agent.currentLoad = Math.max(0, agent.currentLoad - 1)
        this.activeInteractions.delete(interactionId)
        break
      }
    }
  }

  // Get all agents
  public getAllAgents(): Agent[] {
    const allAgents: Agent[] = []
    for (const [, agents] of this.agents) {
      allAgents.push(...agents)
    }
    return allAgents
  }

  // Get agents by type
  public getAgentsByType(type: AgentType): Agent[] {
    return this.agents.get(type) || []
  }

  // Get system health
  public getSystemHealth() {
    const allAgents = this.getAllAgents()
    const onlineAgents = allAgents.filter(a => a.status === 'online')
    const totalLoad = allAgents.reduce((sum, a) => sum + a.currentLoad, 0)
    const maxLoad = allAgents.reduce((sum, a) => sum + a.maxConcurrentInteractions, 0)

    return {
      status: onlineAgents.length > 0 ? 'operational' : 'degraded',
      activeAgents: onlineAgents.length,
      totalAgents: allAgents.length,
      totalLoad,
      maxLoad,
      utilizationPercentage: maxLoad > 0 ? (totalLoad / maxLoad) * 100 : 0
    }
  }
}

// Singleton instance
export const agentCoordinator = new AgentCoordinator()

// Industry-specific configurations
export const industryConfigs: Record<IndustryType, any> = {
  healthcare: {
    type: 'healthcare',
    name: 'Healthcare & Medical',
    icon: '🏥',
    greetingMessage: 'Welcome to our medical facility. How may I assist you today?',
    commonServices: ['Appointment Scheduling', 'Patient Registration', 'Insurance Verification', 'Lab Results', 'Prescription Refills'],
    faqTopics: ['Parking', 'What to Bring', 'Insurance', 'Services', 'Emergency']
  },
  legal: {
    type: 'legal',
    name: 'Legal & Law Firms',
    icon: '⚖️',
    greetingMessage: 'Welcome to our law office. How may I assist you with your legal matters?',
    commonServices: ['Consultation Booking', 'Case Inquiries', 'Document Review', 'Legal Aid Information'],
    faqTopics: ['Consultation', 'Fees', 'Areas of Practice', 'Appointment Preparation']
  },
  family_law: {
    type: 'family_law',
    name: 'Family Law',
    icon: '👨‍👩‍👧‍👦',
    greetingMessage: 'Welcome to our family law practice. How may I help you today?',
    commonServices: ['Divorce Consultation', 'Child Custody', 'Spousal Support', 'Adoption', 'Prenuptial Agreements', 'Domestic Violence Resources'],
    faqTopics: ['Filing Process', 'Custody Procedures', 'Support Guidelines', 'Mediation', 'Court Dates', 'Emergency Orders']
  },
  immigration: {
    type: 'immigration',
    name: 'Immigration Law',
    icon: '🌍',
    greetingMessage: 'Welcome to our immigration law practice. We are here to help with your immigration matters.',
    commonServices: ['Visa Applications', 'Green Card Processing', 'Citizenship', 'Deportation Defense', 'Work Authorization', 'Asylum'],
    faqTopics: ['Processing Times', 'Required Documents', 'Fee Schedules', 'Interview Preparation', 'Status Checks', 'Appeals']
  },
  bankruptcy: {
    type: 'bankruptcy',
    name: 'Bankruptcy Law',
    icon: '📊',
    greetingMessage: 'Welcome to our bankruptcy law practice. How may I assist you with your financial relief options?',
    commonServices: ['Chapter 7 Filing', 'Chapter 13 Filing', 'Debt Counseling', 'Creditor Negotiations', 'Asset Protection', 'Discharge Verification'],
    faqTopics: ['Eligibility', 'Filing Fees', 'Required Documents', 'Exemptions', 'Automatic Stay', 'Trustee Meeting']
  },
  ip_law: {
    type: 'ip_law',
    name: 'Intellectual Property Law',
    icon: '💡',
    greetingMessage: 'Welcome to our intellectual property law practice. How may I help protect your innovations?',
    commonServices: ['Trademark Registration', 'Copyright Filing', 'Patent Search', 'IP Licensing', 'Trade Secret Protection', 'Cease & Desist'],
    faqTopics: ['Search Process', 'Filing Requirements', 'Timeline', 'Costs', 'Enforcement', 'International Protection']
  },
  realestate: {
    type: 'realestate',
    name: 'Real Estate',
    icon: '🏠',
    greetingMessage: 'Welcome to our real estate office. How may I help you find your dream property?',
    commonServices: ['Property Showings', 'Listing Information', 'Buyer Consultation', 'Market Analysis'],
    faqTopics: ['Listings', 'Financing', 'Viewing Schedule', 'Agent Availability']
  },
  hospitality: {
    type: 'hospitality',
    name: 'Hospitality & Hotels',
    icon: '🏨',
    greetingMessage: 'Welcome to our hotel. How may I enhance your stay today?',
    commonServices: ['Reservation', 'Concierge', 'Room Service', 'Event Booking', 'Spa Appointments'],
    faqTopics: ['Check-in', 'Amenities', 'Dining', 'Local Attractions', 'Transportation']
  },
  corporate: {
    type: 'corporate',
    name: 'Corporate & Enterprise',
    icon: '🏢',
    greetingMessage: 'Welcome to our corporate office. How may I assist you today?',
    commonServices: ['Visitor Registration', 'Meeting Rooms', 'Employee Services', 'Security Clearances'],
    faqTopics: ['Directions', 'Meeting Schedule', 'Building Access', 'Parking', 'Cafeteria']
  },
  retail: {
    type: 'retail',
    name: 'Retail & E-commerce',
    icon: '🛍️',
    greetingMessage: 'Welcome! How may I assist you with your shopping experience today?',
    commonServices: ['Product Information', 'Order Status', 'Returns', 'Size Availability', 'Promotions'],
    faqTopics: ['Shipping', 'Returns', 'Sizing', 'Promotions', 'Loyalty Program']
  },
  education: {
    type: 'education',
    name: 'Education & Universities',
    icon: '🎓',
    greetingMessage: 'Welcome to our academic institution. How may I assist you today?',
    commonServices: ['Admissions Inquiry', 'Course Information', 'Campus Tours', 'Student Services'],
    faqTopics: ['Admissions', 'Programs', 'Campus Life', 'Financial Aid', 'Calendar']
  },
  government: {
    type: 'government',
    name: 'Government & Public Services',
    icon: '🏛️',
    greetingMessage: 'Welcome to our government office. How may I serve you today?',
    commonServices: ['Service Information', 'Appointment Booking', 'Document Processing', 'Permit Applications'],
    faqTopics: ['Services', 'Documents Required', 'Wait Times', 'Online Services', 'Locations']
  }
}

export type { IndustryType }