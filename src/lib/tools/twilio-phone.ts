// Phone Integration for AI Receptionist
import twilio from 'twilio'
import { SpeechToText, TextToSpeech } from './voice'
import { handleReceptionistCall } from '../agents/receptionist'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+10000000000'

const client = twilio(accountSid, authToken)
const stt = new SpeechToText()
const tts = new TextToSpeech()

// ============================================
// INBOUND CALL HANDLER
// ============================================

export interface InboundCallEvent {
  CallSid: string
  From: string
  To: string
  CallStatus: 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed'
  Direction: 'inbound' | 'outbound'
  Timestamp: string
}

export class TwilioCallHandler {
  // Generate TwiML for inbound call greeting
  generateGreeting(): string {
    const response = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Start>
    <Stream url=\"wss://${process.env.NEXT_PUBLIC_APP_URL}/api/voice/stream\" />
  </Start>
  <Say voice=\"alice\" language=\"en-US\">
    Thank you for calling. Please hold while I connect you with our AI receptionist.
  </Say>
  <Pause length=\"1\" />
  <Say voice=\"alice\" language=\"en-US\">
    Hello, I'm FRONT, your AI receptionist. How may I help you today?
  </Say>
</Response>`

    return response
  }
  
  // Handle incoming call webhook
  async handleInboundCall(req: Request): Promise<Response> {
    const formData = await req.formData()
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string
    
    console.log(`Incoming call from ${from}, CallSid: ${callSid}`)
    
    // Generate TwiML response
    const twiml = this.generateGreeting()
    
    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
  
  // Generate response TwiML after agent processes input
  generateResponseTwiML(text: string, endCall = false): string {
    if (endCall) {
      return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say voice=\"alice\" language=\"en-US\">
    ${text}
  </Say>
  <Hangup />
</Response>`
    }
    
    return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say voice=\"alice\" language=\"en-US\">
    ${text}
  </Say>
</Response>`
  }
  
  // Handle voice stream webhook (for real-time audio)
  async handleVoiceStream(req: Request): Promise<Response> {
    // Upgrade to WebSocket for real-time audio streaming
    const url = new URL(req.url)
    
    return new Response(null, {
      status: 426,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'upgrade'
      }
    })
  }
}

// ============================================
// OUTBOUND CALL HANDLER
// ============================================

export class OutboundCallHandler {
  private callSid: string | null = null
  
  // Initiate an outbound call
  async initiateCall(to: string, agentMessage: string): Promise<{
    success: boolean
    callSid?: string
    error?: string
  }> {
    try {
      const call = await client.calls.create({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/twiml/outbound`,
        to,
        from: twilioNumber,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/phone/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      })
      
      this.callSid = call.sid
      
      console.log(`Outbound call initiated: ${call.sid} to ${to}`)
      
      return { success: true, callSid: call.sid }
    } catch (error) {
      console.error('Outbound call failed:', error)
      return { success: false, error: String(error) }
    }
  }
  
  // Make appointment reminder call
  async makeReminderCall(
    to: string,
    patientName: string,
    appointmentTime: string,
    businessName: string
  ): Promise<{ success: boolean; callSid?: string; error?: string }> {
    const message = `Hello ${patientName}, this is an appointment reminder from ${businessName}. Your appointment is scheduled for ${appointmentTime}. If you need to reschedule, please call us back. Thank you.`
    
    return this.initiateCall(to, message)
  }
  
  // Get call status
  async getCallStatus(callSid: string): Promise<{
    status: string
    duration: number
    recordingUrl: string | null
  }> {
    const call = await client.calls(callSid).fetch()
    
    return {
      status: call.status,
      duration: typeof call.duration === 'number' ? call.duration : parseInt(String(call.duration)) || 0,
      recordingUrl: (call as any).recordingUrl || null
    }
  }
}

// ============================================
// CALL RECORDING & TRANSCRIPTION
// ============================================

export class CallRecorder {
  // Start recording a call
  async startRecording(callSid: string): Promise<string> {
    const recording = await client.calls(callSid)
      .recordings
      .create({
        recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/phone/recording-status`,
        recordingStatusCallbackEvent: ['completed']
      })
    
    return recording.sid
  }
  
  // Transcribe a completed recording
  async transcribeRecording(recordingSid: string): Promise<{
    transcription: string
    duration: number
  }> {
    const recording = await client.recordings(recordingSid).fetch()
    
    // Use STT to transcribe
    const result = await stt.transcribeFile(recording.uri)
    
    return {
      transcription: result.text,
      duration: typeof recording.duration === 'number' ? recording.duration : parseInt(String(recording.duration)) || 0
    }
  }
  
  // Get recording URL
  async getRecordingUrl(recordingSid: string): Promise<string> {
    return `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}.mp3`
  }
}

// ============================================
// CALL LOGS & ANALYTICS
// ============================================

export interface CallLog {
  callSid: string
  from: string
  to: string
  duration: number
  status: string
  recordingUrl: string | null
  transcription: string | null
  sentiment: 'positive' | 'neutral' | 'negative'
  agent_response: string
  timestamp: string
}

export class CallAnalytics {
  private callLogs: Map<string, CallLog> = new Map()
  
  // Log a call
  async logCall(callLog: CallLog): Promise<void> {
    this.callLogs.set(callLog.callSid, callLog)
    
    // In production, save to database
    console.log(`Call logged: ${callLog.callSid}`)
  }
  
  // Get call statistics
  async getStats(dateRange?: { start: Date; end: Date }): Promise<{
    totalCalls: number
    avgDuration: number
    answeredCalls: number
    missedCalls: number
    topIntents: Array<{ intent: string; count: number }>
    sentimentBreakdown: { positive: number; neutral: number; negative: number }
  }> {
    const logs = Array.from(this.callLogs.values())
    
    const totalCalls = logs.length
    const avgDuration = logs.reduce((sum, l) => sum + l.duration, 0) / (totalCalls || 1)
    
    const answeredCalls = logs.filter(l => l.status === 'completed').length
    const missedCalls = logs.filter(l => l.status === 'busy' || l.status === 'failed').length
    
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
    logs.forEach(l => sentimentCounts[l.sentiment]++)
    
    return {
      totalCalls,
      avgDuration,
      answeredCalls,
      missedCalls,
      topIntents: [],
      sentimentBreakdown: sentimentCounts
    }
  }
}

// Export singleton instances
export const twilioHandler = new TwilioCallHandler()
export const outboundHandler = new OutboundCallHandler()
export const callRecorder = new CallRecorder()
export const callAnalytics = new CallAnalytics()