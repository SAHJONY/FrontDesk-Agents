import { NextRequest, NextResponse } from 'next/server'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret'
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/connect/google/calendar/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(`/customer/dashboard?integration=error&message=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return NextResponse.redirect('/customer/dashboard?integration=error&message=No authorization code received')
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect('/customer/dashboard?integration=error&message=Token exchange failed')
    }

    const tokens = await tokenResponse.json()

    // In production:
    // 1. Store tokens securely in database linked to customer
    // 2. Verify state parameter for CSRF protection
    // 3. Store refresh token for future access

    console.log('Google Calendar connected successfully')
    
    return NextResponse.redirect('/customer/dashboard?integration=success&app=google_calendar')
  } catch (error: any) {
    console.error('Google Calendar callback error:', error)
    return NextResponse.redirect('/customer/dashboard?integration=error&message=Connection failed')
  }
}