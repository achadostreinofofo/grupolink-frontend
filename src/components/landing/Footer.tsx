import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="w-6 h-6 rounded flex items-center justify-center text-dark-900 text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)' }}>
              R
            </span>
            <span className="gradient-text">Redirect Grupo</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/termos-de-uso" className="text-gray-600 hover:text-neon-cyan transition-colors">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="text-gray-600 hover:text-neon-cyan transition-colors">
              Política de Privacidade
            </Link>
            <a href="mailto:suporte@redirectgrupo.com.br" className="text-gray-600 hover:text-neon-cyan transition-colors">
              Contato
            </a>
          </nav>

          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} Redirect Grupo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
