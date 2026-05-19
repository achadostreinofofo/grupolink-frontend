import { middleware } from './middleware'

const mockNext = jest.fn(() => ({ type: 'next' }))
const mockRedirect = jest.fn((url: URL) => ({ type: 'redirect', url: url.toString() }))

jest.mock('next/server', () => ({
  NextResponse: {
    next: () => mockNext(),
    redirect: (url: URL) => mockRedirect(url),
  },
}))

function makeRequest(pathname: string, token?: string) {
  const url = new URL(`http://localhost${pathname}`)
  const cookiesGet = jest.fn((name: string) =>
    name === 'gl_token' && token ? { value: token } : undefined
  )
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: { get: cookiesGet },
  } as unknown as import('next/server').NextRequest
}

beforeEach(() => {
  mockNext.mockClear()
  mockRedirect.mockClear()
})

describe('middleware – public paths', () => {
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/politica-de-privacidade',
    '/termos-de-uso',
    '/contato',
  ]

  it.each(publicPaths)('allows %s without token', (path) => {
    middleware(makeRequest(path))
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

describe('middleware – static and special paths', () => {
  it('allows /_next/* paths', () => {
    middleware(makeRequest('/_next/static/chunk.js'))
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows /api/* paths', () => {
    middleware(makeRequest('/api/auth/me'))
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows paths with file extension', () => {
    middleware(makeRequest('/favicon.ico'))
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows /billing/* paths', () => {
    middleware(makeRequest('/billing/success'))
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

describe('middleware – protected paths', () => {
  it('redirects to /login when no token on /dashboard', () => {
    middleware(makeRequest('/dashboard'))
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/login' })
    )
  })

  it('adds redirect search param with original pathname', () => {
    middleware(makeRequest('/dashboard/structures'))
    const [url] = mockRedirect.mock.calls[0] as [URL]
    expect(url.searchParams.get('redirect')).toBe('/dashboard/structures')
  })

  it('calls NextResponse.next() when valid token present', () => {
    middleware(makeRequest('/dashboard', 'valid-token'))
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects nested protected routes without token', () => {
    middleware(makeRequest('/dashboard/analytics'))
    expect(mockRedirect).toHaveBeenCalled()
  })

  it('redirects /dashboard/settings without token', () => {
    middleware(makeRequest('/dashboard/settings'))
    expect(mockRedirect).toHaveBeenCalled()
  })
})
