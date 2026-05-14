'use client'

const COOKIE_NAME = 'gl_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export function saveAuth(token: string) {
  localStorage.setItem('token', token)
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearAuth() {
  localStorage.removeItem('token')
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}
