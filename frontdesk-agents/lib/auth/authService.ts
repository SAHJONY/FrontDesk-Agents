// Owner Authentication Service
// Secure login and session management for platform owner

import { cookies } from 'next/headers';

const OWNER_PASSWORD_HASH = process.env.OWNER_PASSWORD_HASH || 'placeholder_hash_change_in_env';
const SESSION_COOKIE_NAME = 'owner_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export interface OwnerSession {
  id: string;
  authenticated: boolean;
  loginTime: string;
  lastActivity: string;
  permissions: string[];
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Simple hash comparison (in production, use bcrypt or similar)
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'default_salt'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify owner password
  async verifyPassword(password: string): Promise<boolean> {
    const inputHash = await this.hashPassword(password);
    const storedHash = OWNER_PASSWORD_HASH;
    
    // For development, accept 'owner123' as default password
    if (storedHash === 'placeholder_hash_change_in_env') {
      return password === 'owner123';
    }
    
    return inputHash === storedHash;
  }

  // Create session
  async createSession(): Promise<OwnerSession> {
    const session: OwnerSession = {
      id: crypto.randomUUID(),
      authenticated: true,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      permissions: ['all']
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/'
    });

    return session;
  }

  // Get current session
  async getSession(): Promise<OwnerSession | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      
      if (!sessionCookie) {
        return null;
      }

      const session: OwnerSession = JSON.parse(sessionCookie.value);
      
      // Check session expiry
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLogin > 168) { // 7 days
        await this.destroySession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  // Update session activity
  async updateActivity(): Promise<void> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      
      if (sessionCookie) {
        const session: OwnerSession = JSON.parse(sessionCookie.value);
        session.lastActivity = new Date().toISOString();
        cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: SESSION_DURATION,
          path: '/'
        });
      }
    } catch {
      // Ignore errors
    }
  }

  // Destroy session
  async destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session?.authenticated === true;
  }
}

export const authService = AuthService.getInstance();