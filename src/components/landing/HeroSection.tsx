import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-night-800 pt-20 pb-32">
      {/* Camadas decorativas: grid + glow */}
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-night bg-grid-32 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full bg-brand-500/20 blur-3xl"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-night-700/80 border border-brand-500/30 text-brand-500 text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-neon">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-neon" />
          Plataforma #1 para afiliados no WhatsApp
        </div>

        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 uppercase">
          Redirecione seus<br />
          <span className="text-neon">grupos de afiliados</span>
        </h1>

        <p className="text-xl text-night-100 max-w-2xl mx-auto mb-10">
          Um link, centenas de grupos. Distribua automaticamente seus seguidores entre grupos WhatsApp com
          balanceamento inteligente, rastreamento por cookies e analytics em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto shadow-neon-lg">
              Criar conta grátis
            </Button>
          </Link>
          <a href="#pricing">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Ver planos
            </Button>
          </a>
        </div>

        <p className="mt-4 text-sm text-night-200">Sem cartão de crédito para começar</p>

        {/* Mockup visual */}
        <div className="mt-16 relative mx-auto max-w-3xl">
          <div className="bg-night-900 rounded-2xl shadow-2xl border border-night-700 overflow-hidden">
            <div className="bg-night-700/60 border-b border-night-700 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              <span className="ml-4 text-xs text-night-200 font-mono">app.redirectgrupo.com.br/dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Total de Cliques', value: '12.847', color: 'text-brand-500' },
                { label: 'Grupos Ativos', value: '24', color: 'text-whatsapp-400' },
                { label: 'Membros Hoje', value: '+342', color: 'text-white' },
              ].map((stat) => (
                <div key={stat.label} className="bg-night-800 border border-night-700 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-night-200 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
