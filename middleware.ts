import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      return NextResponse.next()
    }

    const adminCookie = request.cookies.get('adminAuthenticated')
    const isAuthenticated = adminCookie?.value === 'true'
    
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', path)
      loginUrl.searchParams.set('reason', 'unauthenticated')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 