import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { businessName, website, email, password, industry } = await request.json()

    // Validate input
    if (!email || !password || !businessName) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // TODO: Implement actual signup logic with database
    // For now, return success for demo purposes
    console.log('Signup attempt:', { email, businessName, industry })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email,
        businessName,
        website,
        industry,
        id: 'demo-user-id',
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
