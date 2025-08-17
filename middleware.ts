import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Define protected routes - following video best practices
  const protectedPaths = [
    '/dashboard',        // All dashboard routes
    '/api/habits',      // Habit CRUD operations
    '/api/entries',     // Entry operations
    '/api/user',        // User profile operations
    '/api/stripe/checkout', // Billing operations
    '/api/stripe/portal',   // Billing management
  ]
  
  // Check if current path needs protection
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  // Public API routes that don't need auth
  const publicApiPaths = [
    '/api/auth',        // NextAuth routes
    '/api/public',      // Public embed routes
    '/api/stripe/webhook', // Stripe webhooks (verified differently)
    '/api/create-test-user', // Test endpoints
    '/api/create-fast-test-user',
    '/api/test-login',
  ]
  
  const isPublicApiPath = publicApiPaths.some(path =>
    pathname.startsWith(path)
  )

  // Only check auth for protected paths that aren't public
  if (isProtectedPath && !isPublicApiPath) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // For pages, redirect to login
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/habits/:path*',
    '/api/entries/:path*',
    '/api/user/:path*',
  ],
}