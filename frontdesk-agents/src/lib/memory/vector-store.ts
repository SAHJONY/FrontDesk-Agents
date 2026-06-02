// Memory and RAG System for AI Receptionist
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { CallerInfo, CallContext } from '../ai/types'

// Embeddings model for semantic search
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small'
})

// Lazy-initialize Supabase client to avoid build-time errors
let supabase: SupabaseClient | null = null
function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      // Return a mock client for build time or return null
      throw new Error('Supabase credentials not configured')
    }
    supabase = createClient(url, key)
  }
  return supabase
}

// ============================================
// CONVERSATION MEMORY (In-Memory)
// ============================================

interface MemoryEntry {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export class ConversationMemory {
  private memories: MemoryEntry[] = []
  
  // Add a conversation turn to memory
  async addMessage(role: 'user' | 'assistant', content: string, metadata?: Record<string, unknown>) {
    this.memories.push({ role, content, timestamp: Date.now(), metadata })
    // Keep only last 100 messages
    if (this.memories.length > 100) {
      this.memories = this.memories.slice(-100)
    }
  }
  
  // Retrieve relevant conversation history (simple keyword matching)
  async retrieve(query: string, limit = 5): Promise<string[]> {
    const queryWords = query.toLowerCase().split('\s')
    const scored = this.memories.map(m => {
      const contentWords = m.content.toLowerCase().split('\s')
      const matches = queryWords.filter(w => contentWords.some(cw => cw.includes(w)))
      return { content: m.content, score: matches.length / queryWords.length }
    })
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.content)
  }
  
  // Get recent conversation context
  async getRecentContext(limit = 10): Promise<string[]> {
    const recent = this.memories.slice(-limit)
    return recent.map(m => `${m.role === 'user' ? 'Caller' : 'AI'}: ${m.content}`)
  }
}

// ============================================
// CALLER KNOWLEDGE BASE
// ============================================

export class CallerKnowledgeBase {
  // Store caller profile and history
  async storeCallerProfile(callerInfo: CallerInfo) {
    const { data, error } = await getSupabase()
      .from('caller_profiles')
      .upsert({
        phone: callerInfo.phone,
        name: callerInfo.name,
        business: callerInfo.business,
        previous_calls: callerInfo.previous_calls,
        last_contact: callerInfo.last_contact,
        preferences: callerInfo.preferences,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
    return data
  }
  
  // Retrieve caller profile
  async getCallerProfile(phone: string): Promise<CallerInfo | null> {
    const { data, error } = await getSupabase()
      .from('caller_profiles')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }
  
  // Update caller preferences
  async updatePreferences(phone: string, preferences: Record<string, unknown>) {
    const { data, error } = await getSupabase()
      .from('caller_profiles')
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq('phone', phone)
    
    if (error) throw error
    return data
  }
}

// ============================================
// BUSINESS KNOWLEDGE BASE
// ============================================

export class BusinessKnowledgeBase {
  private businessId: string
  
  constructor(businessId: string) {
    this.businessId = businessId
  }
  
  // Store business FAQ
  async addFAQ(question: string, answer: string, category = 'general') {
    try {
      const { data, error } = await getSupabase()
        .from('faqs')
        .insert({
          customer_id: this.businessId,
          question,
          answer,
          category
        })
      if (error) throw error
      return data
    } catch (e) {
      console.error('Failed to add FAQ:', e)
      return null
    }
  }
  
  // Search FAQs using semantic search (cosine similarity with embeddings)
  async searchFAQs(query: string, limit = 5) {
    try {
      const { data, error } = await getSupabase()
        .from('faqs')
        .select('question, answer, category')
        .eq('customer_id', this.businessId)
        .eq('is_active', true)
      
      if (error) throw error
      
      const faqs = data || []
      
      // Score using word overlap (database has no embedding column yet)
      const stopWords = new Set(['a', 'an', 'the', 'is', 'it', 'to', 'of', 'in', 'for', 'on', 'and', 'or', 'with', 'at', 'by', 'i', 'my', 'me', 'do', 'does', 'can', 'will', 'would', 'could', 'what', 'when', 'where', 'how', 'who', 'am', 'are', 'be', 'been', 'have', 'has', 'had', 'not', 'no'])
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w))
      const scored = faqs.map(faq => {
        const text = (faq.question + ' ' + faq.answer).toLowerCase()
        const textWords = text.split(/\s+/)
        const matches = queryWords.filter(w => textWords.some(tw => tw.includes(w)))
        const relevance = queryWords.length > 0 ? matches.length / queryWords.length : 0
        return { question: faq.question, answer: faq.answer, category: faq.category, relevance }
      })
      
      return scored
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit)
    } catch (e) {
      console.error('Failed to search FAQs:', e)
      return []
    }
  }
  // Store business services
  async addService(name: string, description: string, duration_minutes: number) {
    try {
      const { data, error } = await getSupabase()
        .from('services')
        .insert({
          customer_id: this.businessId,
          name,
          description,
          duration: duration_minutes
        })
      if (error) throw error
      return data
    } catch (e) {
      console.error('Failed to add service:', e)
      return null
    }
  }
  
  // Get all services
  async getServices() {
    try {
      const { data, error } = await getSupabase()
        .from('services')
        .select('*')
        .eq('customer_id', this.businessId)
        .eq('is_active', true)
      if (error) throw error
      return data || []
    } catch (e) {
      console.error('Failed to get services:', e)
      return []
    }
  }
  

}

// ============================================
// CONTEXT MANAGER
// ============================================

export class ContextManager {
  private memory: ConversationMemory
  private callerKB: CallerKnowledgeBase
  private businessKB: BusinessKnowledgeBase
  private businessId: string
  
  constructor(businessId: string) {
    this.businessId = businessId
    this.memory = new ConversationMemory()
    this.callerKB = new CallerKnowledgeBase()
    this.businessKB = new BusinessKnowledgeBase(businessId)
  }
  
  // Build context for the agent
  async buildContext(phone: string, currentQuery: string) {
    // Get caller history
    const callerProfile = await this.callerKB.getCallerProfile(phone)
    
    // Get recent conversation
    const recentContext = await this.memory.getRecentContext(5)
    
    // Search relevant FAQs
    const relevantFAQs = await this.businessKB.searchFAQs(currentQuery, 3)
    
    // Get services
    const services = await this.businessKB.getServices()
    
    return {
      caller: callerProfile,
      recentConversation: recentContext,
      relevantFAQs,
      services,
      businessId: this.businessId
    }
  }
  
  // Update caller profile after call
  async updateCallerProfile(callerInfo: CallerInfo) {
    await this.callerKB.storeCallerProfile(callerInfo)
  }
  
  // Add to conversation history
  async addToHistory(role: 'user' | 'assistant', content: string, metadata?: Record<string, unknown>) {
    await this.memory.addMessage(role, content, metadata)
  }
}