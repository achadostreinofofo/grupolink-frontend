import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-900 text-sm font-black"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)' }}>
            R
          </span>
          <span className="gradient-text">Redirect Grupo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-neon-cyan transition-colors">Recursos</a>
          <a href="#pricing" className="hover:text-neon-cyan transition-colors">Preços</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="btn-ghost-neon px-4 py-1.5 rounded-lg text-sm">Entrar</button>
          </Link>
          <Link href="/signup">
            <button className="btn-neon px-4 py-1.5 rounded-lg text-sm">Começar grátis</button>
          </Link>
        </div>
      </div>
    </header>
  )
}
