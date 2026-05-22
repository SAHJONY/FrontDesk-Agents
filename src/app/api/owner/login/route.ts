// Owner Login API Route
import { NextResponse } from 'next/server'
import { authService } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    const isValid = await authService.verifyPassword(password)

    if (isValid) {
      const session = await authService.createSession()
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        session: {
          id: session.id,
          authenticated: session.authenticated
        }
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}