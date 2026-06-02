// Voicemail API Route
// GET /api/voicemail - Get voicemails for customer

import { NextRequest, NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'

// In-memory voicemail storage
const voicemailStore = new Map<string, Array<{
  id: string
  callerName: string
  callerNumber: string
  duration: number
  transcript: string
  audioUrl: string
  createdAt: string
  read: boolean
}>>()

export async function GET() {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const voicemails = voicemailStore.get(session.customerId) || getMockVoicemails()
    return NextResponse.json({ voicemails })
  } catch (error) {
    console.error('Voicemail GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch voicemails' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { callerName, callerNumber, duration, transcript, audioUrl } = await request.json()

    const customerVoicemails = voicemailStore.get(session.customerId) || []
    const newVoicemail = {
      id: crypto.randomUUID(),
      callerName,
      callerNumber,
      duration: duration || 0,
      transcript: transcript || '',
      audioUrl: audioUrl || '',
      createdAt: new Date().toISOString(),
      read: false
    }
    customerVoicemails.unshift(newVoicemail)
    voicemailStore.set(session.customerId, customerVoicemails)

    return NextResponse.json({ success: true, voicemail: newVoicemail })
  } catch (error) {
    console.error('Voicemail POST error:', error)
    return NextResponse.json({ error: 'Failed to create voicemail' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, read } = await request.json()
    const customerVoicemails = voicemailStore.get(session.customerId) || []
    const voicemail = customerVoicemails.find((v: any) => v.id === id)

    if (voicemail) {
      voicemail.read = read !== undefined ? read : true
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Voicemail PUT error:', error)
    return NextResponse.json({ error: 'Failed to update voicemail' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Voicemail ID is required' }, { status: 400 })
    }

    const customerVoicemails = voicemailStore.get(session.customerId) || []
    const filtered = customerVoicemails.filter((v: any) => v.id !== id)
    voicemailStore.set(session.customerId, filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Voicemail DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete voicemail' }, { status: 500 })
  }
}

function getMockVoicemails() {
  return [
    { id: '1', callerName: 'Sarah Johnson', callerNumber: '+1 (555) 123-4567', duration: 45, transcript: 'Hi, I would like to schedule an appointment for next week. Please call me back. Thank you!', audioUrl: '', createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: '2', callerName: 'Michael Chen', callerNumber: '+1 (555) 987-6543', duration: 32, transcript: 'Hello, I have a question about your services. Can you provide more information?', audioUrl: '', createdAt: new Date(Date.now() - 7200000).toISOString(), read: true },
  ]
}