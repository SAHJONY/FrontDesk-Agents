import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { phone_number, task } = await request.json()
  
  if (!phone_number) {
    return NextResponse.json({ error: 'phone_number required' }, { status: 400 })
  }

  const BLAND_API_KEY = process.env.BLANDAI_API_KEY
  
  if (!BLAND_API_KEY) {
    return NextResponse.json({ error: 'BLANDAI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number,
        task: task || 'Hello, this is a test call from FrontDesk Agents AI Receptionist.',
        model: 'enhanced',
        voice: 'sarah',
        max_duration: 120,
        language: 'en',
        from: process.env.BLANDAI_CALLER_ID || undefined
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Call failed', details: data }, { status: response.status })
    }

    return NextResponse.json({ success: true, call_id: data.id, status: data.status || 'initiated' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
