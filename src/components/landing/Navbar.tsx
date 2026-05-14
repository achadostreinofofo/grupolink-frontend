import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm">G</span>
          GrupoLink
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Recursos</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Preços</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Começar grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
