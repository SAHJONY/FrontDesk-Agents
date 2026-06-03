// Shared Owner Session Utilities
// Used by all API routes that need owner authentication

import { cookies } from 'next/headers'

const OWNER_SESSION_COOKIE = 'owner_session'

export interface OwnerSession {
  id: string
  email: string
  name: string
  role: string
  authenticated: boolean
  loginTime: string
}

/**
 * Get the current owner session from the owner_session cookie.
 * Returns null if no session or not authenticated.
 */
export async function getOwnerSession(): Promise<OwnerSession | null> {
  try {
    const store = await cookies()
    const cookie = store.get(OWNER_SESSION_COOKIE)
    if (!cookie) return null
    const session: OwnerSession = JSON.parse(cookie.value)
    return session?.authenticated ? session : null
  } catch {
    return null
  }
}

