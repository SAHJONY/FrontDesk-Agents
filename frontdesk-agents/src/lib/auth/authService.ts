// Owner Authentication Service
// Secure login and session management for platform owner

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const OWNER_PASSWORD_HASH = process.env.OWNER_PASSWORD_HASH || ''
const PASSWORD_SALT = process.env.PASSWORD_SALT || ''
const SESSION_COOKIE_NAME = 'owner_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

export interface OwnerSession {
  id: string
  authenticated: boolean
  loginTime: string
  lastActivity: string
  permissions: string[]
}

export class AuthService {
  private static instance: AuthService

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      // Detect legacy SHA-256 hashes at startup — fail loud rather than silent login failure
      if (OWNER_PASSWORD_HASH && !OWNER_PASSWORD_HASH.startsWith('$2')) {
        console.error('FATAL: OWNER_PASSWORD_HASH appears to be a SHA-256 hash (does not start with $2).')
        console.error('The password hashing algorithm was upgraded to bcrypt. Migrate with:')
        console.error('  node -e "const b=require(\'bcryptjs\'); console.log(b.hashSync(\'YOUR_PASSWORD\' + process.env.PASSWORD_SALT, 12))"')
        console.error('Set PASSWORD_SALT first, then set the resulting hash as OWNER_PASSWORD_HASH.')
      }
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Verify owner password using bcrypt comparison
  // OWNER_PASSWORD_HASH must be set to a bcrypt hash of (password + PASSWORD_SALT)
  async verifyPassword(password: string): Promise<boolean> {
    // Fail secure: both env vars must be set in all environments
    if (!OWNER_PASSWORD_HASH || !PASSWORD_SALT) {
      console.error('FATAL: OWNER_PASSWORD_HASH or PASSWORD_SALT is not configured!')
      return false
    }

    // Combine password with salt exactly as was done when hashing for storage
    const saltedPassword = password + PASSWORD_SALT

    try {
      const valid = await bcrypt.compare(saltedPassword, OWNER_PASSWORD_HASH)
      return valid
    } catch (err) {
      console.error('Password verification error:', err)
      return false
    }
  }

  // Create session
  async createSession(): Promise<OwnerSession> {
    const session: OwnerSession = {
      id: crypto.randomUUID(),
      authenticated: true,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      permissions: ['all']
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/'
    })

    return session
  }

  // Get current session
  async getSession(): Promise<OwnerSession | null> {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

      if (!sessionCookie) {
        return null
      }

      const session: OwnerSession = JSON.parse(sessionCookie.value)

      // Check session expiry (7 days)
      const loginTime = new Date(session.loginTime)
      const now = new Date()
      const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLogin > 168) {
        await this.destroySession()
        return null
      }

      return session
    } catch {
      return null
    }
  }

  // Update session activity
  async updateActivity(): Promise<void> {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

      if (sessionCookie) {
        const session: OwnerSession = JSON.parse(sessionCookie.value)
        session.lastActivity = new Date().toISOString()
        cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: SESSION_DURATION,
          path: '/'
        })
      }
    } catch {
      // Ignore errors
    }
  }

  // Destroy session
  async destroySession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return session?.authenticated === true
  }
}

export const authService = AuthService.getInstance()