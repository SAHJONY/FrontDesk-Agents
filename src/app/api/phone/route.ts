// API Route: Phone Webhook Handler
import { twilioHandler } from '@/lib/tools/twilio-phone'
import { NextRequest, NextResponse } from 'next/server'

// Handle inbound call
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    // Phone webhook for call status or recording
    const formData = await req.formData()
    const callStatus = formData.get('CallStatus')
    
    if (callStatus) {
      // Handle call status callback
      console.log(`Call status: ${callStatus}`)
      return NextResponse.json({ success: true })
    }
    
    // Handle inbound call
    return twilioHandler.handleInboundCall(req)
  }
  
  // Handle JSON requests
  const { action, ...data } = await req.json()
  
  if (action === 'generate_response') {
    const { text, endCall } = data
    const twiml = twilioHandler.generateResponseTwiML(text, endCall)
    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
  
  return NextResponse.json({ success: false, error: 'Unknown action' })
}

// Handle inbound call (GET for TwiML)
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const callStatus = url.searchParams.get('CallStatus')
  
  if (callStatus) {
    console.log(`Call status callback: ${callStatus}`)
    return NextResponse.json({ success: true })
  }
  
  // Generate TwiML for inbound call
  const twiml = twilioHandler.generateGreeting()
  
  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
}