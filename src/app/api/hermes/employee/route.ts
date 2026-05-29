/**
 * Hermes Employee API - Platform Operations
 * Main employee endpoint for frontend and backend operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeHermesCommand, getHermesStatus, HERMES_IDENTITY } from '@/lib/hermes-employee/HermesEmployee'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { command, operation } = body

    if (!command && !operation) {
      return NextResponse.json(
        { error: 'Command or operation is required' },
        { status: 400 }
      )
    }

    // Execute Hermes command
    if (command) {
      const result = await executeHermesCommand(command)
      return NextResponse.json(result)
    }

    // Handle specific operations
    if (operation === 'status') {
      const status = getHermesStatus()
      return NextResponse.json(status)
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Hermes Employee API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Hermes operation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const status = getHermesStatus()
  return NextResponse.json({
    ...status,
    endpoints: {
      POST: {
        command: 'Execute Hermes command',
        operation: 'Get Hermes status (operation: status)'
      }
    },
    routes: {
      frontend: [
        '/customer/dashboard',
        '/owner/dashboard', 
        '/customer/signup',
        '/customer/login',
        '/demo'
      ],
      backend: [
        '/api/hermes/employee',
        '/api/ceo/chat',
        '/api/brain',
        '/api/customer/register',
        '/api/customer/login'
      ]
    }
  })
}