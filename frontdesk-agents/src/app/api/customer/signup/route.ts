import { NextRequest, NextResponse } from 'next/server'
import { signUpCustomer } from '@/lib/customer-auth'
import { authRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request)
  const rateLimitResult = authRateLimit(clientIp)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    )
  }

  try {
    const { businessName, website, email, password, industry } = await request.json()

    // Validate input
    if (!email || !password || !businessName) {
      return NextResponse.json(
        { success: false, message: 'Business name, email, and password are required' },
        { status: 400 }
      )
    }

    // Email validation
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const result = await signUpCustomer(email, password, businessName, '', industry || 'corporate')

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Registration failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email: result.session?.email,
        businessName: result.session?.businessName,
        id: result.session?.customerId,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
