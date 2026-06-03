// Owner Session Check API Route
import { NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/owner-session'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      owner: {
        email: session.email,
        name: session.name,
        role: session.role,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}