import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-dark-950 min-h-screen flex items-center">
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-50" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00E5FF, transparent)' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-neon-cyan font-medium">Plataforma #1 para afiliados no WhatsApp</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight mb-6">
          <span className="text-white">Um link.</span>
          <br />
          <span className="gradient-text">Grupos ilimitados.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Distribua membros automaticamente entre centenas de grupos WhatsApp
          com balanceamento inteligente, rastreamento por cookie e analytics em tempo real.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/signup">
            <button className="btn-neon px-8 py-3.5 rounded-xl text-base font-bold glow-cyan">
              Criar conta grátis
            </button>
          </Link>
          <a href="#pricing">
            <button className="btn-ghost-neon px-8 py-3.5 rounded-xl text-base">
              Ver planos →
            </button>
          </a>
        </div>
        <p className="text-xs text-gray-600">Sem cartão de crédito para começar</p>

        {/* Dashboard mockup */}
        <div className="mt-20 relative mx-auto max-w-3xl animate-float">
          <div className="absolute -inset-1 rounded-2xl opacity-30 blur-lg"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)' }} />
          <div className="relative glass-card rounded-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="bg-dark-700/80 border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-4 text-xs text-gray-500 font-mono">app.redirectgrupo.com.br/dashboard</span>
            </div>
            {/* Stats */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Total de Cliques', value: '12.847', color: 'text-neon-cyan' },
                { label: 'Grupos Ativos',    value: '24',     color: 'text-neon-purple' },
                { label: 'Membros Hoje',     value: '+342',   color: 'text-neon-green' },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Fake chart bar */}
            <div className="px-6 pb-6">
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">Cliques — últimos 7 dias</p>
                <div className="flex items-end gap-2 h-16">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: i === 5
                          ? 'linear-gradient(to top, #00E5FF, #A855F7)'
                          : 'rgba(0,229,255,0.2)',
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
