import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/session'

const PUBLIC = ['/login', '/register', '/track', '/forgot-password', '/reset-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p))
  const cookie = request.cookies.get('session')

  if (!cookie && !isPublic) return NextResponse.redirect(new URL('/login', request.url))

  if (cookie) {
    const session = await decrypt(cookie.value)
    if (!session && !isPublic) return NextResponse.redirect(new URL('/login', request.url))
    if (session) {
      if (isPublic) return NextResponse.redirect(new URL(session.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', request.url))
      if (pathname.startsWith('/admin') && session.role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', request.url))
      if ((pathname.startsWith('/dashboard') || pathname.startsWith('/orders') || pathname.startsWith('/invoices') || pathname.startsWith('/settings')) && session.role !== 'BUSINESS') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }
