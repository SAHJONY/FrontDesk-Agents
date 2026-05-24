/**
 * LiveKit Token API - Generate tokens for voice rooms
 */

import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

const apiKey = process.env.LIVEKIT_API_KEY || ''
const apiSecret = process.env.LIVEKIT_API_SECRET || ''

export async function POST(request: Request) {
  try {
    const { roomName, participantName } = await request.json()

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Room name and participant name are required' },
        { status: 400 }
      )
    }

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      )
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({
      token,
      roomName,
      wsUrl: process.env.LIVEKIT_WS_URL,
    })
  } catch (error: any) {
    console.error('LiveKit token error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    )
  }
}
