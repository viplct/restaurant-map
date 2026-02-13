import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAuthCookie = request.cookies.has('access_token')

  // Redirect authenticated users away from /login
  if (pathname.startsWith('/login') && hasAuthCookie) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Redirect unauthenticated users to /login
  if (pathname.startsWith('/admin') && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
}
