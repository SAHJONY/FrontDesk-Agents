// Rate limiter for API protection
// Provides in-memory rate limiting for single-instance deployments.
// For production serverless (Vercel) or multi-instance, replace with
// Upstash Redis or Vercel's Edge Config rate limiting.
// See PRODUCTION.md §Rate-Limiting for migration guide.

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

// In-memory store — resets on every cold start on Vercel serverless.
// For production with multiple instances, use a distributed store.
const rateLimitStore = new Map<string, RateLimitEntry>()

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

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

// Auth-specific rate limiter: 5 attempts per minute per IP
// Uses a separate namespace from general rate limiting
const authRateLimitStore = new Map<string, RateLimitEntry>()

export function authRateLimit(ip: string): { success: boolean; retryAfter?: number } {
  const key = `auth:${ip}`
  const windowMs = 60_000
  const maxRequests = 5
  const now = Date.now()
  const entry = authRateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    authRateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { success: true }
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  entry.count++
  return { success: true }
}

// Resets the in-memory store — use ONLY in tests
export function resetRateLimitStore(): void {
  rateLimitStore.clear()
  authRateLimitStore.clear()
}

// ─── Serverless-compatible note ─────────────────────────────────────────────
// Vercel serverless functions are stateless — each cold start gets a fresh
// in-memory Map. For production on Vercel:
//   Option A: Upstash Redis (free tier: 10k req/day)
//     import { Redis } from '@upstash/redis'
//   Option B: Vercel Edge Config (rate limiting via KV store)
//   Option C: Self-host on Railway/Render with persistent Redis
//
// To migrate: replace rateLimitStore.get/set with Redis.incr() and TTL.
// See PRODUCTION.md §Rate-Limiting for step-by-step instructions.