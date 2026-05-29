import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/customer/dashboard', '/customer/settings', '/customer/calls']
const authRoutes = ['/customer/login', '/customer/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Get session from cookie
  const sessionCookie = request.cookies.get('customer_session')
  const hasSession = sessionCookie?.value ? JSON.parse(sessionCookie.value).authenticated : false

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/customer/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/customer/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/api/customer/:path*',
    '/api/voice/:path*',
    '/api/calls/:path*',
    '/api/business/:path*',
    '/api/voicemail/:path*',
    '/api/sms/:path*',
    '/api/dashboard/:path*'
  ]
}