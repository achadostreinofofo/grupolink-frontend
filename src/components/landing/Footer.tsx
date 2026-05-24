import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export function Footer() {
  return (
    <footer className="bg-night-900 text-night-100 py-12 border-t border-night-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
          <Logo variant="horizontal" tone="neon" size="md" />

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/termos-de-uso" className="hover:text-brand-500 transition-colors">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="hover:text-brand-500 transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/contato" className="hover:text-brand-500 transition-colors">
              Contato
            </Link>
          </nav>

          <p className="text-xs text-night-200">
            © {new Date().getFullYear()} Redirect Grupo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
