// API Route: Voice Synthesis Endpoint
import { tts } from '@/lib/tools/voice'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, voice_id } = await req.json()
    
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      )
    }
    
    const result = await tts.synthesize(text, voice_id)
    
    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      durationMs: result.durationMs,
      transcript: result.transcript
    })
  } catch (error) {
    console.error('Voice synthesis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to synthesize speech' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Get available voices
  const voices = await tts.getVoices()
  
  return NextResponse.json({
    success: true,
    voices
  })
}