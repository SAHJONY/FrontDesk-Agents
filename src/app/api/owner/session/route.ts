// Owner Session Check API Route
import { NextResponse } from 'next/server'
import { authService } from '@/lib/auth'

export async function GET() {
  try {
    const session = await authService.getSession()
    
    if (session?.authenticated) {
      await authService.updateActivity()
      return NextResponse.json({
        authenticated: true,
        session
      })
    } else {
      return NextResponse.json({
        authenticated: false
      })
    }
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Server error' },
      { status: 500 }
    )
  }
}