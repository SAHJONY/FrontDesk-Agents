import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-client'
import { getOwnerSession } from '@/lib/owner-session'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Verify owner auth
    const session = await getOwnerSession()
    if (!session?.authenticated) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { email, password, userMetadata } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'email and password required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Use GoTrue admin API via service role client to create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirmed: true,
      user_metadata: userMetadata || {}
    })

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.id,
        email: authData.email
      }
    })
  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}