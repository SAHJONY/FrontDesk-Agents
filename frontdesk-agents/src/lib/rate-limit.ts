// Simple in-memory rate limiter for API protection
// For production, use Redis or a cloud rate limiting service

import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

export function getClientIp(request: NextRequest): string {
  try {
    const headers = request.headers
    const forwarded = headers?.get('x-forwarded-for')
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    return headers?.get('x-real-ip') || 'unknown'
  } catch {
    return 'unknown'
  }
}

export const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now)
  }

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  }
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Resets the in-memory rate limit store — use only in tests
export function resetRateLimitStore(): void {
  rateLimitStore.clear()
}

// Auth-specific rate limiter (stricter)
export function authRateLimit(ip: string): { success: boolean; retryAfter?: number } {
  const key = `auth:${ip}`
  const config = { maxRequests: 5, windowMs: 60000 } // 5 attempts per minute
  const result = rateLimit(key, config)
  
  if (!result.success) {
    return { success: false, retryAfter: Math.ceil(result.resetIn / 1000) }
  }
  return { success: true }
}