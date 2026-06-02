import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const customerProtectedRoutes = ['/customer/dashboard', '/customer/settings', '/customer/calls']
const ownerProtectedRoutes = ['/owner/dashboard', '/owner/settings', '/owner/harness']
const authRoutes = ['/customer/login', '/customer/signup']
const ownerAuthRoutes = ['/owner/login']

function getSessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false
  try {
    const parsed = JSON.parse(cookieValue)
    return parsed?.authenticated === true
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires auth
  const isCustomerProtected = customerProtectedRoutes.some(route => pathname.startsWith(route))
  const isOwnerProtected = ownerProtectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isOwnerAuthRoute = ownerAuthRoutes.some(route => pathname.startsWith(route))

  // Get sessions from cookies (crash-safe)
  const customerSession = getSessionCookie(request.cookies.get('customer_session')?.value)
  const ownerSession = getSessionCookie(request.cookies.get('owner_session')?.value)

  // Redirect to login if accessing customer protected route without session
  if (isCustomerProtected && !customerSession) {
    const loginUrl = new URL('/customer/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to login if accessing owner protected route without session
  if (isOwnerProtected && !ownerSession) {
    const loginUrl = new URL('/owner/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing customer auth routes while logged in
  if (isAuthRoute && customerSession) {
    return NextResponse.redirect(new URL('/customer/dashboard', request.url))
  }

  // Redirect to dashboard if accessing owner auth routes while logged in
  if (isOwnerAuthRoute && ownerSession) {
    return NextResponse.redirect(new URL('/owner/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/owner/:path*',
    '/api/customer/:path*',
    '/api/owner/:path*',
    '/api/voice/:path*',
    '/api/calls/:path*',
    '/api/business/:path*',
    '/api/voicemail/:path*',
    '/api/sms/:path*',
    '/api/dashboard/:path*',
    '/api/phone/:path*',
    '/api/phone/:path*'
  ]
}