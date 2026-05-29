// Real-time Voice Pipeline for AI Receptionist
// Integrates Deepgram STT and ElevenLabs TTS with LiveKit

export interface VoiceConfig {
  sttProvider: 'deepgram' | 'openai' | 'whisper'
  ttsProvider: 'elevenlabs' | 'openai' | 'playht'
  ttsVoiceId: string
  language: string
  sampleRate: number
}

const defaultConfig: VoiceConfig = {
  sttProvider: 'deepgram',
  ttsProvider: 'elevenlabs',
  ttsVoiceId: 'EXAVITQ4Xr0qNpCNUk1j',
  language: 'en-US',
  sampleRate: 16000
}

// ============================================
// SPEECH TO TEXT (STT)
// ============================================

export class SpeechToText {
  private config: VoiceConfig
  
  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
  
  // Stream audio chunks for real-time transcription
  async transcribeStream(audioChunk: Buffer): Promise<{
    text: string
    confidence: number
    isFinal: boolean
    language: string
  }> {
    // In production, use Deepgram's streaming API
    // This is a mock implementation
    return {
      text: '',
      confidence: 0,
      isFinal: false,
      language: this.config.language
    }
  }
  
  // Transcribe audio file (for voicemail, etc.)
  async transcribeFile(audioUrl: string): Promise<{
    text: string
    language: string
    confidence: number
    words: Array<{ word: string; start: number; end: number }>
  }> {
    // In production, use Deepgram's file transcription API
    return {
      text: '',
      language: this.config.language,
      confidence: 0,
      words: []
    }
  }
  
  // Get interim results for real-time display
  async getInterimResult(audioChunk: Buffer): Promise<string> {
    const result = await this.transcribeStream(audioChunk)
    return result.text
  }
}

// ============================================
// TEXT TO SPEECH (TTS)
// ============================================

export class TextToSpeech {
  private config: VoiceConfig
  private audioCache: Map<string, string> = new Map()
  
  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
  
  // Generate speech from text
  async synthesize(text: string, voiceId?: string): Promise<{
    audioUrl: string
    durationMs: number
    transcript: string
  }> {
    // In production, use ElevenLabs API
    // This returns a URL to the generated audio
    
    const cacheKey = `${voiceId || this.config.ttsVoiceId}:${text.slice(0, 50)}`
    
    if (this.audioCache.has(cacheKey)) {
      return {
        audioUrl: this.audioCache.get(cacheKey)!,
        durationMs: text.length * 50,
        transcript: text
      }
    }
    
    // Mock response - in production call ElevenLabs API
    const audioUrl = `data:audio/mp3;base64,_mock_audio_${Date.now()}`
    
    return {
      audioUrl,
      durationMs: text.length * 50,
      transcript: text
    }
  }
  
  // Stream speech for real-time response
  async *synthesizeStream(text: string, voiceId?: string): AsyncGenerator<Buffer> {
    // In production, use ElevenLabs streaming API
    // This yields audio chunks as they become available
    const words = text.split(' ')
    
    for (const word of words) {
      // Mock chunk generation
      await new Promise(resolve => setTimeout(resolve, 100))
      yield Buffer.from(`chunk_${word}_`)
    }
  }
  
  // Get available voices
  async getVoices(): Promise<Array<{
    voice_id: string
    name: string
    language: string
    gender: string
  }>> {
    // Return list of available ElevenLabs voices
    return [
      { voice_id: 'EXAVITQ4Xr0qNpCNUk1j', name: 'Bella', language: 'en-US', gender: 'female' },
      { voice_id: 'VR6AewLTigWG4GxSO2jM', name: 'James', language: 'en-US', gender: 'male' },
      { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Charlie', language: 'en-US', gender: 'male' },
      { voice_id: 'TX3LPaxmHKhefIT4e4wy', name: 'Luna', language: 'en-US', gender: 'female' }
    ]
  }
}

// ============================================
// VOICE ACTIVITY DETECTION (VAD)
// ============================================

export class VoiceActivityDetector {
  private silenceThreshold = 0.01
  private speechTimeoutMs = 300
  
  // Detect if audio contains speech
  detectSpeech(audioBuffer: Buffer): {
    hasSpeech: boolean
    energy: number
    silenceDurationMs: number
  } {
    // Calculate RMS energy
    const samples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / 2)
    let sum = 0
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i]
    }
    const rms = Math.sqrt(sum / samples.length) / 32768
    
    return {
      hasSpeech: rms > this.silenceThreshold,
      energy: rms,
      silenceDurationMs: rms < this.silenceThreshold ? this.speechTimeoutMs : 0
    }
  }
  
  // Check if speaker has stopped speaking (for end of utterance detection)
  hasUtteranceEnded(audioBuffer: Buffer, silenceThresholdMs = 500): boolean {
    const { silenceDurationMs } = this.detectSpeech(audioBuffer)
    return silenceDurationMs >= silenceThresholdMs
  }
}

// ============================================
// REAL-TIME VOICE PIPELINE
// ============================================

export class VoicePipeline {
  private stt: SpeechToText
  private tts: TextToSpeech
  private vad: VoiceActivityDetector
  private config: VoiceConfig
  
  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.stt = new SpeechToText(config)
    this.tts = new TextToSpeech(config)
    this.vad = new VoiceActivityDetector()
  }
  
  // Process incoming audio and return transcription
  async processIncomingAudio(audioChunk: Buffer): Promise<string> {
    // First check for voice activity
    const { hasSpeech } = this.vad.detectSpeech(audioChunk)
    
    if (!hasSpeech) {
      return ''
    }
    
    // Get interim transcription
    const interim = await this.stt.getInterimResult(audioChunk)
    
    return interim
  }
  
  // Generate response audio for given text
  async generateResponse(text: string): Promise<{
    audioUrl: string
    durationMs: number
  }> {
    const result = await this.tts.synthesize(text)
    return {
      audioUrl: result.audioUrl,
      durationMs: result.durationMs
    }
  }
  
  // Full duplex: process audio and generate response concurrently
  async *runFullDuplex(
    audioStream: AsyncGenerator<Buffer>,
    responseText: string
  ): AsyncGenerator<{
    transcription: string
    audioChunk: Buffer
    isFinal: boolean
  }> {
    const audioGenerator = this.tts.synthesizeStream(responseText)
    
    for await (const audioChunk of audioStream) {
      const transcription = await this.processIncomingAudio(audioChunk)
      const audioOut = await audioGenerator.next()
      
      yield {
        transcription,
        audioChunk: audioOut.value || Buffer.from([]),
        isFinal: false
      }
    }
  }
}

// ============================================
// LIVEKIT INTEGRATION
// ============================================

export class LiveKitVoiceHandler {
  private pipeline: VoicePipeline
  
  constructor(config?: Partial<VoiceConfig>) {
    this.pipeline = new VoicePipeline(config)
  }
  
  // Handle incoming audio from LiveKit room
  async handleAudioInput(
    roomId: string,
    participantId: string,
    audioBuffer: Buffer
  ): Promise<string> {
    // Process audio through the pipeline
    const transcription = await this.pipeline.processIncomingAudio(audioBuffer)
    return transcription
  }
  
  // Send audio response through LiveKit
  async sendAudioResponse(
    roomId: string,
    text: string
  ): Promise<void> {
    const { audioUrl, durationMs } = await this.pipeline.generateResponse(text)
    
    // In production, this would:
    // 1. Convert audioUrl to a ReadableStream
    // 2. Publish to LiveKit room
    console.log(`Sending audio response: ${text.slice(0, 30)}... (${durationMs}ms)`)
  }
}

// Export singleton instances
export const voicePipeline = new VoicePipeline()
export const stt = new SpeechToText()
export const tts = new TextToSpeech()
export const vad = new VoiceActivityDetector()
export const liveKitHandler = new LiveKitVoiceHandler()