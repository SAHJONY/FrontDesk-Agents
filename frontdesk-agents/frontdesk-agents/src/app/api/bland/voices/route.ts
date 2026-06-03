import { NextRequest, NextResponse } from 'next/server'
import { getBlandAPIClient, BLAND_VOICES, DEFAULT_VOICE_ID } from '@/lib/bland'

// GET /api/bland/voices - List available voices and custom prompts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCustom = searchParams.get('include_custom') !== 'false'

    // Return built-in voices from Bland AI
    const voices = [...BLAND_VOICES]

    // If user has custom voice configured, add it
    const customVoiceId = process.env.BLAND_DEFAULT_VOICE
    if (customVoiceId && customVoiceId !== DEFAULT_VOICE_ID) {
      const existingCustom = voices.find(v => v.id === customVoiceId)
      if (!existingCustom) {
        voices.push({
          id: customVoiceId,
          name: 'Custom Voice',
          description: 'Your custom voice from Bland AI dashboard',
        })
      }
    }

    // Return voice settings
    return NextResponse.json({
      success: true,
      voices,
      defaultVoice: process.env.BLAND_DEFAULT_VOICE || DEFAULT_VOICE_ID,
      defaultLanguage: process.env.BLAND_DEFAULT_LANGUAGE || 'en',
    })
  } catch (error) {
    console.error('Error fetching voices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voice options' },
      { status: 500 }
    )
  }
}

// POST /api/bland/voices - Create custom prompt/voice configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, prompt, voiceId, language, variables, businessType } = body

    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'name and prompt are required' },
        { status: 400 }
      )
    }

    // Create a custom prompt configuration
    const promptConfig = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      prompt,
      voiceId: voiceId || process.env.BLAND_DEFAULT_VOICE || DEFAULT_VOICE_ID,
      language: language || 'en',
      variables: variables || [],
      businessType: businessType || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production, save to database
    // For now, return the config with a note
    return NextResponse.json({
      success: true,
      promptConfig,
      message: 'Prompt configuration created. In production, save to database.',
    })
  } catch (error) {
    console.error('Error creating voice prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt configuration' },
      { status: 500 }
    )
  }
}