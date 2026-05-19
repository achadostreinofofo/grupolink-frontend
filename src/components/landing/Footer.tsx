import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-xs">G</span>
            GrupoLink
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/termos-de-uso" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/contato" className="hover:text-white transition-colors">
              Contato
            </Link>
          </nav>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} GrupoLink. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
