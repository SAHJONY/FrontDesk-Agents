import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authRateLimit, getClientIp } from '@/lib/rate-limit'
import { authService } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const OWNER_EMAIL = process.env.OWNER_EMAIL || ''
const OWNER_PASSWORD_HASH = process.env.OWNER_PASSWORD_HASH || ''
const SESSION_COOKIE_NAME = 'owner_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

interface OwnerSession {
  id: string
  email: string
  name: string
  role: string
  authenticated: boolean
  loginTime: string
}

// POST /api/owner/login - Owner login
export async function POST(request: NextRequest) {
  try {
    // Validate production configuration
    if (!OWNER_EMAIL) {
      console.error('OWNER_EMAIL env var is not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Rate limiting — 5 failed attempts per minute locks out the IP
    const clientIp = getClientIp(request)
    const rateLimitResult = authRateLimit(clientIp)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      )
    }

    const body = await request.json()
    const { email, password } = body

    // Check email matches
    if (email !== OWNER_EMAIL) {
      return NextResponse.json(
        { success: false, error: 'Invalid owner credentials' },
        { status: 401 }
      )
    }

    // Use bcrypt password verification via authService
    const passwordValid = await authService.verifyPassword(password)
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid owner credentials' },
        { status: 401 }
      )
    }

    // Create session
    const session: OwnerSession = {
      id: crypto.randomUUID(),
      email: OWNER_EMAIL,
      name: 'Juan Gonzalez',
      role: 'Platform Owner',
      authenticated: true,
      loginTime: new Date().toISOString()
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      owner: {
        email: session.email,
        name: session.name,
        role: session.role
      }
    })
  } catch (error) {
    console.error('Owner login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}

// GET /api/owner/login - Get current owner session
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return NextResponse.json({ success: false, authenticated: false })
    }

    const session: OwnerSession = JSON.parse(sessionCookie.value)

    if (!session.authenticated) {
      return NextResponse.json({ success: false, authenticated: false })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      owner: {
        email: session.email,
        name: session.name,
        role: session.role
      }
    })
  } catch {
    return NextResponse.json({ success: false, authenticated: false })
  }
}

// DELETE /api/owner/login - Owner logout
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 })
  }
}