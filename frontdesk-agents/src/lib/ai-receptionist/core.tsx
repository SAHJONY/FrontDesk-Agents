/**
 * Ultimate AI Receptionist - Core Agent
 * Combines LiveKit voice, Bland.ai calls, booking system, and intelligent intake
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

// Types
interface CallSession {
  id: string
  status: 'idle' | 'connecting' | 'connected' | 'disconnected'
  caller?: {
    name?: string
    phone?: string
    email?: string
  }
  startTime?: Date
  duration?: number
  transcript: Message[]
  booking?: BookingData
  intake?: IntakeData
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface BookingData {
  date?: string
  time?: string
  service?: string
  notes?: string
  confirmed?: boolean
}

interface IntakeData {
  caseType?: string
  answers: Record<string, any>
  completed?: boolean
}

interface BusinessConfig {
  name: string
  type: string
  timezone: string
  languages: {
    primary: string
    allowed: string[]
  }
  booking: {
    enabled: boolean
    duration: number
    buffer: number
  }
  intake: {
    enabled: boolean
    caseTypes: Array<{
      key: string
      display_name: string
      questions: Array<{
        key: string
        prompt_en: string
        required: boolean
        critical: boolean
      }>
    }>
  }
}

// AI Receptionist Hook
export function useAIReceptionist(config: BusinessConfig) {
  const [session, setSession] = useState<CallSession>({
    id: '',
    status: 'idle',
    transcript: [],
  })
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Initialize call session
  const startCall = useCallback(async (callerInfo?: CallSession['caller']) => {
    try {
      setSession(prev => ({
        ...prev,
        status: 'connecting',
        caller: callerInfo,
        startTime: new Date(),
      }))

      // Connect to LiveKit room
      // This would integrate with LiveKit's WebSocket
      console.log('Connecting to LiveKit room...')
      
      setSession(prev => ({
        ...prev,
        status: 'connected',
      }))

      // Start with greeting
      const greeting = `Thank you for calling ${config.name}. This is your AI receptionist. How can I help you today?`
      addMessage('assistant', greeting)
      await speak(greeting)
    } catch (error) {
      console.error('Failed to start call:', error)
      setSession(prev => ({ ...prev, status: 'disconnected' }))
    }
  }, [config.name])

  // End call
  const endCall = useCallback(() => {
    // Disconnect from LiveKit
    // Save call transcript
    // Send follow-up if needed
    setSession(prev => ({ ...prev, status: 'disconnected' }))
  }, [])

  // Add message to transcript
  const addMessage = useCallback((role: Message['role'], content: string) => {
    setSession(prev => ({
      ...prev,
      transcript: [
        ...prev.transcript,
        { role, content, timestamp: new Date() },
      ],
    }))
  }, [])

  // Text-to-speech
  const speak = useCallback(async (text: string) => {
    setIsSpeaking(true)
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = config.languages.primary
      await window.speechSynthesis.speak(utterance)
    } finally {
      setIsSpeaking(false)
    }
  }, [config.languages.primary])

  // Speech-to-text
  const listen = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = config.languages.primary
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognition.onerror = () => {
        resolve('')
      }

      recognition.start()
    })
  }, [config.languages.primary])

  // Handle user speech
  const handleUserSpeech = useCallback(async () => {
    setIsListening(true)
    try {
      const transcript = await listen()
      if (transcript) {
        addMessage('user', transcript)
        // Process with AI and respond
        const response = await processWithAI(transcript, session)
        addMessage('assistant', response)
        await speak(response)
      }
    } catch (error) {
      console.error('Speech recognition error:', error)
    } finally {
      setIsListening(false)
    }
  }, [listen, addMessage, speak, session])

  // Process with AI (NVIDIA NIM)
  const processWithAI = useCallback(async (userMessage: string, session: CallSession) => {
    try {
      const response = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: session.id,
          context: {
            businessConfig: config,
            session: {
              transcript: session.transcript,
              booking: session.booking,
              intake: session.intake,
            },
          },
        }),
      })

      const data = await response.json()
      return data.response || 'I apologize, but I had trouble processing that. Could you please repeat?'
    } catch (error) {
      console.error('AI processing error:', error)
      return 'I apologize, but I\'m having technical difficulties. Could you please repeat?'
    }
  }, [config])

  // Booking functions
  const checkAvailability = useCallback(async (date: string, time: string) => {
    const response = await fetch('/api/booking/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time }),
    })
    return await response.json()
  }, [])

  const createBooking = useCallback(async (bookingData: BookingData) => {
    const response = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
    return await response.json()
  }, [])

  // Intake functions
  const recordIntakeAnswer = useCallback(async (caseType: string, key: string, value: any) => {
    setSession(prev => ({
      ...prev,
      intake: {
        ...prev.intake,
        caseType,
        answers: {
          ...prev.intake?.answers,
          [key]: value,
        },
      },
    }))
  }, [])

  const finalizeIntake = useCallback(async () => {
    if (!session.intake?.caseType || !session.intake.answers) {
      throw new Error('No intake to finalize')
    }

    // Save intake to database
    const response = await fetch('/api/intake/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session.intake),
    })

    setSession(prev => ({
      ...prev,
      intake: { ...prev.intake, completed: true },
    }))

    return await response.json()
  }, [session.intake])

  return {
    session,
    isSpeaking,
    isListening,
    startCall,
    endCall,
    handleUserSpeech,
    checkAvailability,
    createBooking,
    recordIntakeAnswer,
    finalizeIntake,
  }
}

export default useAIReceptionist
