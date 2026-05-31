import { NextRequest, NextResponse } from 'next/server'
import { signInCustomer } from '@/lib/customer-auth'
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
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await signInCustomer(email, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: result.session?.email,
        id: result.session?.customerId,
        businessName: result.session?.businessName,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
