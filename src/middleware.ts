import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não exigem autenticação
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/contato',
])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite arquivos estáticos, API proxy, redirects públicos e rotas públicas.
  // /r/ (smart links) e /s/ (shortlinks) são proxied para o backend e devem ser públicos —
  // sem isso o middleware os redireciona para /login antes de chegarem ao rewrite.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/s/') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/billing/')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('gl_token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
