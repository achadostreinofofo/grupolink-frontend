import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-gray-400">Configuração em menos de 5 minutos</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Pronto para{' '}
          <span className="gradient-text">automatizar</span>
          <br />seus grupos?
        </h2>

        <p className="text-gray-400 text-lg mb-10">
          Sem contrato, sem burocracia. Cancele quando quiser.
        </p>

        <Link href="/signup">
          <button className="btn-neon px-10 py-4 rounded-xl text-base font-bold glow-cyan">
            Criar conta grátis agora
          </button>
        </Link>
      </div>
    </section>
  )
}
