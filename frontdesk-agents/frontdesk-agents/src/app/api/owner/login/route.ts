import { NextRequest, NextResponse } from 'next/server'

// Hardcoded admin credentials for full platform access
const ADMIN_EMAIL = 'sahjonycapitalllc@outlook.com'
const ADMIN_PASSWORD = 'OwnerAdmin123!' // Master password for full access
const ADMIN_NAME = 'Owner Administrator'

// Platform-wide stats (mock data - in production would come from database)
const PLATFORM_STATS = {
  totalCustomers: 127,
  activeCustomers: 98,
  totalCalls: 45892,
  totalRevenue: 1245890,
  monthlyRecurringRevenue: 87450,
  growthRate: 23.5,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Verify admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create admin session token
      const sessionToken = Buffer.from(JSON.stringify({
        isOwner: true,
        ownerId: 'owner_001',
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        permissions: ['all'],
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      })).toString('base64')

      const response = NextResponse.json({
        success: true,
        owner: {
          id: 'owner_001',
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          role: 'owner',
          permissions: ['all'],
        },
        platformStats: PLATFORM_STATS,
      })

      // Set owner session cookie
      response.cookies.set('owner_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid owner credentials' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Owner login error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify owner session and get platform stats
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('owner_session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      
      // Check if expired
      if (sessionData.exp < Date.now()) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        )
      }

      // Verify this is an owner session
      if (!sessionData.isOwner) {
        return NextResponse.json(
          { error: 'Not an owner session' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        authenticated: true,
        owner: {
          id: sessionData.ownerId,
          email: sessionData.email,
          name: sessionData.name,
          role: 'owner',
          permissions: sessionData.permissions,
        },
        platformStats: PLATFORM_STATS,
      })
    } catch {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    )
  }
}