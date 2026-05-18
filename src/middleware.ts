import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não exigem autenticação
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/contato',
])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite arquivos estáticos, API proxy e rotas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
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
