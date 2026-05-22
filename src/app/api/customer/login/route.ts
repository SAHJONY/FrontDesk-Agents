import { NextRequest, NextResponse } from 'next/server'
import { customerAuthService } from '@/lib/auth/customerAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, accept any business email with a valid password format
    // In production, this would validate against a real database
    const isValidEmail = email.includes('@') && email.includes('.')
    const isValidPassword = password.length >= 6

    if (!isValidEmail || !isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const businessName = email.split('@')[0].split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

    // Create session token using customer auth service
    const token = customerAuthService.createCustomerSession({
      email,
      businessName
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      customer: {
        email,
        businessName,
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
    console.error('Customer login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}