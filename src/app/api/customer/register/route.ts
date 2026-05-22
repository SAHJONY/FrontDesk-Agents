import { NextRequest, NextResponse } from 'next/server'
import { customerAuthService } from '@/lib/auth/customerAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, businessName, industry } = body

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create session for new customer
    const token = customerAuthService.createCustomerSession({
      email,
      businessName,
      industry: industry || 'General'
    })

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      customer: {
        email,
        businessName,
        industry: industry || 'General',
        plan: 'Professional'
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('customer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Customer registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}