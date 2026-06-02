// Customer Registration API Route
// POST /api/customer/register

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
    const body = await request.json()
    const { email, password, businessName, ownerName, industry } = body

    // Validation
    if (!email || !password || !businessName || !ownerName) {
      return NextResponse.json(
        { error: 'Email, password, business name, and owner name are required' },
        { status: 400 }
      )
    }

    // Email validation - check for valid format
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Sign up customer
    const result = await signUpCustomer(email, password, businessName, ownerName, industry || 'corporate')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      session: result.session,
      message: 'Account created successfully'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}