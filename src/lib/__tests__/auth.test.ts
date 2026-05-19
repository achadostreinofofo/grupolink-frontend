import { saveAuth, clearAuth, isAuthenticated } from '../auth'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

const cookieSetSpy = jest.spyOn(document, 'cookie', 'set')

beforeEach(() => {
  mockLocalStorage.clear()
  jest.clearAllMocks()
})

describe('saveAuth', () => {
  it('saves token to localStorage', () => {
    saveAuth('my-token')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'my-token')
  })

  it('sets gl_token cookie with correct attributes', () => {
    saveAuth('abc123')
    expect(cookieSetSpy).toHaveBeenCalledWith(
      expect.stringContaining('gl_token=abc123')
    )
    expect(cookieSetSpy).toHaveBeenCalledWith(
      expect.stringContaining('path=/')
    )
    expect(cookieSetSpy).toHaveBeenCalledWith(
      expect.stringContaining('SameSite=Lax')
    )
  })
})

describe('clearAuth', () => {
  it('removes token from localStorage', () => {
    clearAuth()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('clears gl_token cookie by setting max-age=0', () => {
    clearAuth()
    expect(cookieSetSpy).toHaveBeenCalledWith(
      expect.stringContaining('gl_token=')
    )
    expect(cookieSetSpy).toHaveBeenCalledWith(
      expect.stringContaining('max-age=0')
    )
  })
})

describe('isAuthenticated', () => {
  it('returns true when token exists in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('some-token')
    expect(isAuthenticated()).toBe(true)
  })

  it('returns false when no token in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null)
    expect(isAuthenticated()).toBe(false)
  })

  it('returns false when token is empty string', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('')
    expect(isAuthenticated()).toBe(false)
  })
})
