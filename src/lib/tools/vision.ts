// Vision Analysis Module for Document and Image Processing
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface VisionAnalysisResult {
  description: string
  extracted_text: string[]
  document_type: 'id' | 'document' | 'image' | 'unknown'
  key_data: Record<string, string>
  confidence: number
  suggestions: string[]
}

export class VisionAnalyzer {
  // Analyze an image or document
  async analyzeImage(imageUrl: string, context?: string): Promise<VisionAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert document and image analyzer for an AI receptionist system.
            
You analyze images/documents and extract relevant information. Your output should be structured and helpful.

For IDs: Extract name, DOB, expiration date, document number
For documents: Extract key information, dates, names, amounts
For general images: Describe what's happening and any relevant details

Return a JSON object with:
- description: Brief description of the image
- extracted_text: Array of key text found
- document_type: 'id', 'document', 'image', or 'unknown'
- key_data: Object with extracted key-value pairs
- confidence: 0-1 score of analysis confidence
- suggestions: Array of suggested next actions`
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: context ? `Context: ${context}` : 'Analyze this image/document' }
            ]
          }
        ],
        max_tokens: 500
      })
      
      const content = response.choices[0].message.content || '{}'
      return JSON.parse(content)
    } catch (error) {
      console.error('Vision analysis error:', error)
      return {
        description: 'Unable to analyze image',
        extracted_text: [],
        document_type: 'unknown',
        key_data: {},
        confidence: 0,
        suggestions: ['Please try again or upload a clearer image']
      }
    }
  }
  
  // Analyze ID document specifically
  async analyzeID(imageUrl: string): Promise<{
    name: string | null
    dob: string | null
    expiry: string | null
    document_number: string | null
  }> {
    const result = await this.analyzeImage(imageUrl, 'This is an ID document (driver license, passport, etc.)')
    
    return {
      name: result.key_data['name'] || result.extracted_text.find(t => t.includes('Name')) || null,
      dob: result.key_data['date of birth'] || result.key_data['dob'] || null,
      expiry: result.key_data['expiration'] || result.key_data['expiry'] || null,
      document_number: result.key_data['document number'] || result.key_data['id number'] || null
    }
  }
  
  // Analyze insurance card
  async analyzeInsuranceCard(imageUrl: string): Promise<{
    member_id: string | null
    group_number: string | null
    provider: string | null
    member_name: string | null
  }> {
    const result = await this.analyzeImage(imageUrl, 'This is an insurance card')
    
    return {
      member_id: result.key_data['member id'] || result.key_data['member ID'] || null,
      group_number: result.key_data['group'] || result.key_data['group number'] || null,
      provider: result.key_data['insurance'] || result.key_data['provider'] || null,
      member_name: result.key_data['name'] || null
    }
  }
  
  // Analyze business card
  async analyzeBusinessCard(imageUrl: string): Promise<{
    name: string | null
    title: string | null
    company: string | null
    phone: string | null
    email: string | null
    website: string | null
  }> {
    const result = await this.analyzeImage(imageUrl, 'This is a business card')
    
    return {
      name: result.key_data['name'] || null,
      title: result.key_data['title'] || result.key_data['position'] || null,
      company: result.key_data['company'] || result.key_data['organization'] || null,
      phone: result.key_data['phone'] || result.extracted_text.find(t => /\\d{3}[-.\/]?\\d{3}[-.\/]?\\d{4}/.test(t)) || null,
      email: result.key_data['email'] || result.extracted_text.find(t => t.includes('@')) || null,
      website: result.key_data['website'] || result.extracted_text.find(t => t.includes('.com')) || null
    }
  }
}

// OCR for text extraction from images
export class OCRProcessor {
  async extractText(imageUrl: string): Promise<{
    text: string
    language: string
    confidence: number
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an OCR system. Extract ALL text visible in this image. Return a JSON with: text (the full extracted text), language (detected language code), confidence (0-1 score).'
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: 'Extract all text from this image exactly as shown.' }
            ]
          }
        ],
        max_tokens: 1000
      })
      
      const content = response.choices[0].message.content || '{}'
      return JSON.parse(content)
    } catch (error) {
      console.error('OCR error:', error)
      return { text: '', language: 'en', confidence: 0 }
    }
  }
}

// Document classification
export class DocumentClassifier {
  async classify(imageUrl: string): Promise<{
    type: 'id' | 'insurance' | 'business_card' | 'medical' | 'invoice' | 'other'
    subtype: string | null
    confidence: number
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Classify this document image. Return JSON: type (id, insurance, business_card, medical, invoice, other), subtype (specific type), confidence (0-1).'
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: 'What type of document is this?' }
            ]
          }
        ],
        max_tokens: 100
      })
      
      const content = response.choices[0].message.content || '{}'
      return JSON.parse(content)
    } catch (error) {
      return { type: 'other', subtype: null, confidence: 0 }
    }
  }
}

export const visionAnalyzer = new VisionAnalyzer()
export const ocrProcessor = new OCRProcessor()
export const documentClassifier = new DocumentClassifier()