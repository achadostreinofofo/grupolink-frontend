'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/brand/Logo'

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-night-800/80 backdrop-blur border-b border-night-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Redirect Grupo — Início">
          <Logo variant="horizontal" tone="neon" size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-night-100">
          <a href="#features" className="hover:text-brand-500 transition-colors">Recursos</a>
          <a href="#pricing" className="hover:text-brand-500 transition-colors">Preços</a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm">Acessar a plataforma</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Começar grátis</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
