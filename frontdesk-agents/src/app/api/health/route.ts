// Health Check API Route
// GET /api/health

import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      blandai: !!process.env.BLANDAI_API_KEY,
    }
  }

  return NextResponse.json(health)
}