import { NextRequest, NextResponse } from 'next/server'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret'
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/connect/google/calendar/callback'

// Scopes for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ')

export async function GET(request: NextRequest) {
  try {
    // Generate state token for CSRF protection
    const state = Buffer.from(Math.random().toString()).toString('base64')
    
    // Build OAuth URL
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    oauthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    oauthUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
    oauthUrl.searchParams.set('response_type', 'code')
    oauthUrl.searchParams.set('scope', SCOPES)
    oauthUrl.searchParams.set('access_type', 'offline')
    oauthUrl.searchParams.set('prompt', 'consent')
    oauthUrl.searchParams.set('state', state)

    // In production, store state in session
    return NextResponse.redirect(oauthUrl.toString())
  } catch (error: any) {
    console.error('Google OAuth error:', error)
    return NextResponse.json({ error: 'OAuth initiation failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, customerId } = body

    // Verify customer session
    const sessionCookie = request.cookies.get('customer_session')
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'disconnect') {
      // In production, revoke the token and remove from database
      return NextResponse.json({
        success: true,
        message: 'Google Calendar disconnected successfully'
      })
    }

    if (action === 'sync') {
      // In production, trigger a calendar sync
      return NextResponse.json({
        success: true,
        message: 'Calendar sync initiated',
        lastSync: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Google Calendar API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}