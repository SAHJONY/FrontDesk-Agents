// Customer Logout API Route
// POST /api/customer/logout

import { NextResponse } from 'next/server'
import { signOutCustomer } from '@/lib/customer-auth'

export async function POST() {
  try {
    await signOutCustomer()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}