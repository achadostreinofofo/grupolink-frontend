import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Plataforma #1 para afiliados no WhatsApp
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
          Gerencie seus grupos<br />
          <span className="text-brand-600">de forma inteligente</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Um link, centenas de grupos. Distribua automaticamente seus seguidores entre grupos WhatsApp com
          balanceamento inteligente, rastreamento por cookies e analytics em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-brand-200">
              Criar conta grátis
            </Button>
          </Link>
          <a href="#pricing">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Ver planos
            </Button>
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-400">Sem cartão de crédito para começar</p>

        {/* Mockup visual */}
        <div className="mt-16 relative mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-gray-400 font-mono">app.grupolink.com/dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Total de Cliques', value: '12.847', color: 'text-brand-600' },
                { label: 'Grupos Ativos', value: '24', color: 'text-blue-600' },
                { label: 'Membros Hoje', value: '+342', color: 'text-purple-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
