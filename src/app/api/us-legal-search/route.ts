import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { query, state, docType } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 })
    }

    // Initialize clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // 1. Generate Embedding for the Search Query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
      dimensions: 1536,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // 2. Search Database using the RPC function
    const { data: results, error } = await supabase.rpc('match_us_legal_docs', {
      query_embedding: queryEmbedding,
      match_count: 10,
      filter_state: state || null,
      filter_type: docType || null
    })

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      results: results || [],
      count: results?.length || 0
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
